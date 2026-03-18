/// VOICEVOX Engine management for NihongoMaster.
///
/// Handles downloading (with streaming progress), extracting (via OS tools),
/// starting, and stopping the VOICEVOX Engine process entirely from within the app.
use futures_util::StreamExt;
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager};

// ── Constants ─────────────────────────────────────────────────

pub const VOICEVOX_VERSION: &str = "0.25.1";
const VOICEVOX_PORT: u16 = 50021;

// ── Global state ──────────────────────────────────────────────

/// PID of the running VOICEVOX engine, if any.
static ENGINE_PID: Mutex<Option<u32>> = Mutex::new(None);

// ── Platform helpers ──────────────────────────────────────────

fn platform_key() -> &'static str {
    if cfg!(target_os = "windows") {
        "windows-cpu"
    } else if cfg!(target_os = "macos") {
        if cfg!(target_arch = "aarch64") {
            "macos-arm64"
        } else {
            "macos-x64"
        }
    } else if cfg!(target_arch = "aarch64") {
        "linux-cpu-arm64"
    } else {
        "linux-cpu-x64"
    }
}

const GITHUB_RELEASE_BASE: &str =
    "https://github.com/joppe2001/NihongoMaster/releases/download/voicevox-engine-v0.25.1";

fn engine_core_url() -> String {
    let key = platform_key();
    format!("{}/engine-core-{}.zip", GITHUB_RELEASE_BASE, key)
}

fn vvm_url(filename: &str) -> String {
    format!("{}/{}", GITHUB_RELEASE_BASE, filename)
}

// ── Paths ─────────────────────────────────────────────────────

fn app_data(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().expect("app data dir")
}

fn engine_dir(app: &AppHandle) -> PathBuf {
    app_data(app).join("voicevox_engine")
}

/// Find the `run` / `run.exe` executable inside the engine directory.
/// The zip may extract either flat or inside a subdirectory.
fn find_executable(dir: &Path) -> Option<PathBuf> {
    let exe_name = if cfg!(target_os = "windows") {
        "run.exe"
    } else {
        "run"
    };

    // Check flat (files at root of engine_dir)
    let flat = dir.join(exe_name);
    if flat.exists() {
        return Some(flat);
    }

    // Check one level deep (zip extracted a subfolder)
    if let Ok(entries) = std::fs::read_dir(dir) {
        for entry in entries.flatten() {
            let candidate = entry.path().join(exe_name);
            if candidate.exists() {
                return Some(candidate);
            }
        }
    }

    None
}

// ── Status ────────────────────────────────────────────────────

#[derive(serde::Serialize, Clone)]
pub struct VoicevoxStatus {
    pub installed: bool,
    /// True if the engine directory exists on disk (even if executable not found / corrupt).
    /// Used to show the Delete button even when the install is broken.
    pub dir_exists: bool,
    pub running: bool,
    pub pid: Option<u32>,
    pub version: &'static str,
    pub platform: &'static str,
}

#[tauri::command]
pub fn voicevox_get_status(app: AppHandle) -> VoicevoxStatus {
    let dir = engine_dir(&app);
    let exe = find_executable(&dir);
    let installed = exe.is_some();
    let dir_exists = dir.exists();

    let pid = ENGINE_PID.lock().unwrap().clone();
    let running = if let Some(pid) = pid {
        is_pid_alive(pid)
    } else {
        false
    };

    // Clean up stale PID
    if !running {
        *ENGINE_PID.lock().unwrap() = None;
    }

    VoicevoxStatus {
        installed,
        dir_exists,
        running,
        pid: *ENGINE_PID.lock().unwrap(),
        version: VOICEVOX_VERSION,
        platform: platform_key(),
    }
}

fn is_pid_alive(pid: u32) -> bool {
    #[cfg(unix)]
    {
        unsafe { libc::kill(pid as libc::pid_t, 0) == 0 }
    }
    #[cfg(windows)]
    {
        std::process::Command::new("tasklist")
            .args(["/FI", &format!("PID eq {}", pid), "/NH"])
            .output()
            .map(|o| String::from_utf8_lossy(&o.stdout).contains(&pid.to_string()))
            .unwrap_or(false)
    }
    #[cfg(not(any(unix, windows)))]
    {
        false
    }
}

// ── Download ──────────────────────────────────────────────────

#[derive(serde::Serialize, Clone)]
struct DownloadProgress {
    downloaded_bytes: u64,
    total_bytes: u64,
    percentage: f32,
    label: String,
}

/// Helper: stream-download a single file from a URL to a local path.
async fn download_file(
    client: &reqwest::Client,
    url: &str,
    dest: &std::path::Path,
    app: &AppHandle,
    label: &str,
    global_downloaded: &mut u64,
    global_total: u64,
) -> Result<(), String> {
    if dest.exists() {
        // Skip re-downloading files that already exist
        let size = std::fs::metadata(dest).map(|m| m.len()).unwrap_or(0);
        *global_downloaded += size;
        return Ok(());
    }

    let response = client
        .get(url)
        .header("User-Agent", "NihongoMaster/1.0")
        .send()
        .await
        .map_err(|e| format!("Download failed for {}: {}", label, e))?;

    if !response.status().is_success() {
        return Err(format!("HTTP {} for {}", response.status(), label));
    }

    let mut file = std::fs::File::create(dest).map_err(|e| e.to_string())?;
    let mut stream = response.bytes_stream();

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| format!("Stream error: {}", e))?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        *global_downloaded += chunk.len() as u64;

        if *global_downloaded % (2 * 1024 * 1024) < chunk.len() as u64 {
            let _ = app.emit(
                "voicevox://download-progress",
                DownloadProgress {
                    downloaded_bytes: *global_downloaded,
                    total_bytes: global_total,
                    percentage: (*global_downloaded as f32 / global_total as f32) * 100.0,
                    label: label.to_string(),
                },
            );
        }
    }

    file.flush().map_err(|e| e.to_string())?;
    Ok(())
}

/// Download the VOICEVOX Engine core + selected voice models.
///
/// Downloads from self-hosted split files on GitHub:
///   - engine-core-{platform}.zip (~270 MB)
///   - {name}.vvm for each selected voice (~55 MB each)
///
/// Emits `voicevox://download-progress` events with global progress across all files.
#[tauri::command]
pub async fn voicevox_download(app: AppHandle, selected_vvm_files: Vec<String>) -> Result<(), String> {
    let data_dir = app_data(&app);
    let downloads_dir = data_dir.join("voicevox_downloads");
    std::fs::create_dir_all(&downloads_dir).map_err(|e| e.to_string())?;

    let client = reqwest::Client::builder()
        .read_timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    // Estimate total download size: core (~270MB) + ~57MB per VVM
    let estimated_total = 270_000_000u64 + (selected_vvm_files.len() as u64 * 57_000_000);
    let mut global_downloaded = 0u64;

    // 1. Download engine core
    let core_dest = downloads_dir.join("engine-core.zip");
    download_file(
        &client,
        &engine_core_url(),
        &core_dest,
        &app,
        "Engine core",
        &mut global_downloaded,
        estimated_total,
    )
    .await?;

    // 2. Download selected VVM files
    for (i, vvm_name) in selected_vvm_files.iter().enumerate() {
        let vvm_dest = downloads_dir.join(vvm_name);
        let label = format!("Voice model {}/{}", i + 1, selected_vvm_files.len());
        download_file(
            &client,
            &vvm_url(vvm_name),
            &vvm_dest,
            &app,
            &label,
            &mut global_downloaded,
            estimated_total,
        )
        .await?;
    }

    // Final progress
    let _ = app.emit(
        "voicevox://download-progress",
        DownloadProgress {
            downloaded_bytes: global_downloaded,
            total_bytes: global_downloaded,
            percentage: 100.0,
            label: "Complete".to_string(),
        },
    );

    Ok(())
}

// ── Install (extract core + copy VVMs) ────────────────────────

/// Install the engine from previously downloaded split files.
///
/// 1. Extracts engine-core.zip using OS-native tools (ditto on macOS)
/// 2. Creates model/ directory and copies selected .vvm files into it
/// 3. Cleans up the downloads directory
#[tauri::command]
pub fn voicevox_extract(app: AppHandle, selected_vvm_files: Vec<String>) -> Result<(), String> {
    let data_dir = app_data(&app);
    let downloads_dir = data_dir.join("voicevox_downloads");
    let out_dir = engine_dir(&app);
    let core_zip = downloads_dir.join("engine-core.zip");

    if !core_zip.exists() {
        return Err("Engine core not downloaded yet".to_string());
    }

    // Clean any previous engine directory
    if out_dir.exists() {
        std::fs::remove_dir_all(&out_dir).map_err(|e| e.to_string())?;
    }
    std::fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;

    let core_str = core_zip.to_str().ok_or("Invalid path")?;
    let out_str = out_dir.to_str().ok_or("Invalid path")?;

    // Step 1: Extract engine core ZIP
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("ditto")
            .args(["-x", "-k", "--sequesterRsrc", core_str, out_str])
            .output()
            .map_err(|e| format!("Failed to run ditto: {}", e))?;
        if !output.status.success() {
            return Err(format!("ditto failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        std::process::Command::new("xattr")
            .args(["-rd", "com.apple.quarantine", out_str])
            .output()
            .ok();
    }

    #[cfg(target_os = "linux")]
    {
        let output = std::process::Command::new("unzip")
            .args(["-o", core_str, "-d", out_str])
            .output()
            .map_err(|e| format!("Failed to run unzip: {}", e))?;
        if !output.status.success() {
            return Err(format!("unzip failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        if let Some(exe) = find_executable(&out_dir) {
            use std::os::unix::fs::PermissionsExt;
            std::fs::set_permissions(&exe, std::fs::Permissions::from_mode(0o755)).ok();
        }
    }

    #[cfg(target_os = "windows")]
    {
        let output = std::process::Command::new("powershell")
            .args(["-NoProfile", "-Command",
                &format!("Expand-Archive -LiteralPath '{}' -DestinationPath '{}' -Force", core_str, out_str)])
            .output()
            .map_err(|e| format!("Failed to run PowerShell: {}", e))?;
        if !output.status.success() {
            return Err(format!("Expand-Archive failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
    }

    // Step 2: Create model/ and copy selected VVM files
    let model_dir = out_dir.join("model");
    std::fs::create_dir_all(&model_dir).map_err(|e| e.to_string())?;

    for vvm_name in &selected_vvm_files {
        let src = downloads_dir.join(vvm_name);
        let dest = model_dir.join(vvm_name);
        if src.exists() {
            std::fs::rename(&src, &dest)
                .or_else(|_| std::fs::copy(&src, &dest).map(|_| ()))
                .map_err(|e| format!("Failed to install {}: {}", vvm_name, e))?;
        }
    }

    // Step 3: Clean up downloads directory
    let _ = std::fs::remove_dir_all(&downloads_dir);

    eprintln!(
        "VOICEVOX: installed engine core + {} voice model(s)",
        selected_vvm_files.len()
    );

    Ok(())
}

// ── Start / Stop ──────────────────────────────────────────────

/// Start the VOICEVOX Engine process.
/// Returns once the engine is responsive on port 50021 (up to 30s).
#[tauri::command]
pub async fn voicevox_start(app: AppHandle) -> Result<(), String> {
    // Already running?
    {
        let pid = ENGINE_PID.lock().unwrap().clone();
        if let Some(pid) = pid {
            if is_pid_alive(pid) {
                return Ok(());
            }
        }
    }

    let exe = find_executable(&engine_dir(&app))
        .ok_or("VOICEVOX Engine executable not found. Please install first.")?;

    let mut cmd = std::process::Command::new(&exe);
    cmd.arg("--host").arg("127.0.0.1");
    cmd.arg("--port").arg(VOICEVOX_PORT.to_string());

    // Hide console window on Windows
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        cmd.creation_flags(0x08000000); // CREATE_NO_WINDOW
    }

    let child = cmd
        .spawn()
        .map_err(|e| format!("Failed to start VOICEVOX Engine: {}", e))?;

    let pid = child.id();
    *ENGINE_PID.lock().unwrap() = Some(pid);

    // Don't call child.wait() — we want it to keep running. Leak the handle.
    std::mem::forget(child);

    // Poll until the engine is responsive (up to 30 seconds)
    let url = format!("http://127.0.0.1:{}/version", VOICEVOX_PORT);
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(2))
        .build()
        .unwrap();

    for _ in 0..30 {
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        if client.get(&url).send().await.is_ok() {
            let _ = app.emit("voicevox://engine-started", ());
            return Ok(());
        }
    }

    Err("VOICEVOX Engine started but did not respond within 30 seconds".to_string())
}

/// Stop the VOICEVOX Engine process.
#[tauri::command]
pub fn voicevox_stop() -> Result<(), String> {
    let pid = ENGINE_PID.lock().unwrap().take();
    if let Some(pid) = pid {
        kill_process(pid);
    }
    Ok(())
}

/// Delete the installed engine files (keeps settings).
/// Also deletes any leftover .vvpp archive.
#[tauri::command]
pub fn voicevox_uninstall(app: AppHandle) -> Result<(), String> {
    // Kill engine first if running
    voicevox_stop().ok();
    // Give the process a moment to die so it releases file handles
    std::thread::sleep(std::time::Duration::from_millis(500));

    let dir = engine_dir(&app);
    let downloads_dir = app_data(&app).join("voicevox_downloads");

    // Delete engine directory
    for d in [&dir, &downloads_dir] {
        if d.exists() {
            #[cfg(target_family = "unix")]
            {
                let output = std::process::Command::new("rm")
                    .args(["-rf", d.to_str().unwrap_or("")])
                    .output()
                    .map_err(|e| format!("Failed to run rm: {}", e))?;
                if !output.status.success() {
                    return Err(format!("Failed to delete: {}", String::from_utf8_lossy(&output.stderr)));
                }
            }
            #[cfg(target_os = "windows")]
            {
                std::fs::remove_dir_all(d)
                    .map_err(|e| format!("Failed to delete: {}", e))?;
            }
        }
    }

    // Also remove any leftover .vvpp from old download system
    let old_archive = app_data(&app).join("voicevox_engine.vvpp");
    if old_archive.exists() {
        let _ = std::fs::remove_file(&old_archive);
    }

    Ok(())
}

fn kill_process(pid: u32) {
    #[cfg(target_family = "unix")]
    unsafe {
        libc::kill(pid as libc::pid_t, libc::SIGTERM);
    }
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("taskkill")
            .args(["/PID", &pid.to_string(), "/F"])
            .output()
            .ok();
    }
}

/// Called on app shutdown to ensure the engine process is cleaned up.
pub fn shutdown() {
    let pid = ENGINE_PID.lock().unwrap().take();
    if let Some(pid) = pid {
        kill_process(pid);
    }
}
