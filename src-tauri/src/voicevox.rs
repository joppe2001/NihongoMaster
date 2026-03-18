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

fn download_url() -> String {
    let key = platform_key();
    format!(
        "https://github.com/VOICEVOX/voicevox_engine/releases/download/{version}/voicevox_engine-{key}-{version}.vvpp",
        version = VOICEVOX_VERSION,
        key = key,
    )
}

/// Approximate download size in bytes per platform (~1.7-1.85 GB).
fn download_size_bytes() -> u64 {
    match platform_key() {
        "macos-arm64" => 1_823_105_551,
        "macos-x64" => 1_826_321_992,
        "windows-cpu" => 1_793_000_000,
        "linux-cpu-arm64" => 1_843_343_711,
        _ => 1_847_590_025,
    }
}

// ── Paths ─────────────────────────────────────────────────────

fn app_data(app: &AppHandle) -> PathBuf {
    app.path().app_data_dir().expect("app data dir")
}

fn archive_path(app: &AppHandle) -> PathBuf {
    app_data(app).join("voicevox_engine.vvpp")
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
    pub download_url: String,
    pub download_size_bytes: u64,
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
        download_url: download_url(),
        download_size_bytes: download_size_bytes(),
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
}

/// Download the VOICEVOX Engine archive.
/// Emits `voicevox://download-progress` events to the window during download.
#[tauri::command]
pub async fn voicevox_download(app: AppHandle) -> Result<(), String> {
    let url = download_url();
    let dest = archive_path(&app);

    // Ensure app data dir exists
    if let Some(parent) = dest.parent() {
        std::fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }

    // If a partial download exists from a previous attempt, remove it
    if dest.exists() {
        std::fs::remove_file(&dest).map_err(|e| e.to_string())?;
    }

    let client = reqwest::Client::builder()
        .connection_verbose(true)
        // No global timeout — large file download can take many minutes
        // Individual read chunks will still time out if the connection stalls
        .read_timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    let response = client
        .get(&url)
        .header("User-Agent", "NihongoMaster/1.0")
        .send()
        .await
        .map_err(|e| {
            // Give a human-readable error — the raw reqwest message is often opaque
            let msg = e.to_string();
            if msg.contains("certificate") || msg.contains("tls") || msg.contains("ssl") {
                format!("TLS/certificate error connecting to GitHub: {}", msg)
            } else if msg.contains("dns") || msg.contains("resolve") {
                format!("DNS error — check your internet connection: {}", msg)
            } else if msg.contains("connect") || msg.contains("refused") {
                format!("Connection refused — check your internet connection: {}", msg)
            } else {
                format!("Network error: {}", msg)
            }
        })?;

    if !response.status().is_success() {
        return Err(format!("HTTP {}", response.status()));
    }

    let total = response.content_length().unwrap_or(download_size_bytes());
    let mut downloaded = 0u64;

    let mut file = std::fs::File::create(&dest).map_err(|e| e.to_string())?;
    let mut stream = response.bytes_stream();

    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| format!("Stream error: {}", e))?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;

        // Emit progress every ~5MB to avoid flooding the frontend
        if downloaded % (5 * 1024 * 1024) < chunk.len() as u64 {
            let _ = app.emit(
                "voicevox://download-progress",
                DownloadProgress {
                    downloaded_bytes: downloaded,
                    total_bytes: total,
                    percentage: (downloaded as f32 / total as f32) * 100.0,
                },
            );
        }
    }

    // Flush and close the file before size check
    file.flush().map_err(|e| e.to_string())?;
    drop(file);

    // Verify the downloaded file is plausibly complete.
    // Minimum threshold: 90% of expected size (handles servers that report wrong Content-Length).
    let expected = download_size_bytes();
    let minimum = expected * 9 / 10;
    if downloaded < minimum {
        // Delete the truncated file so the next attempt starts fresh
        let _ = std::fs::remove_file(&dest);
        return Err(format!(
            "Download appears incomplete: got {} bytes, expected ~{}. \
             Please check your internet connection and try again.",
            downloaded, expected
        ));
    }

    // Final progress event
    let _ = app.emit(
        "voicevox://download-progress",
        DownloadProgress {
            downloaded_bytes: downloaded,
            total_bytes: downloaded,
            percentage: 100.0,
        },
    );

    Ok(())
}

// ── Extract ───────────────────────────────────────────────────

/// Extract the downloaded .vvpp (ZIP) archive into the engine directory.
///
/// `selected_vvm_files`: list of .vvm filenames to keep (e.g. ["0.vvm", "3.vvm"]).
/// If empty, ALL models are extracted (legacy behaviour).
/// Engine core files (everything outside model/) are always extracted.
///
/// Uses OS-native ZIP tools (ditto on macOS) which correctly handle
/// fat Mach-O binaries.
#[tauri::command]
pub fn voicevox_extract(app: AppHandle, selected_vvm_files: Vec<String>) -> Result<(), String> {
    let archive = archive_path(&app);
    let out_dir = engine_dir(&app);

    if !archive.exists() {
        return Err("Archive not downloaded yet".to_string());
    }

    // Clean any previous engine directory
    if out_dir.exists() {
        std::fs::remove_dir_all(&out_dir).map_err(|e| e.to_string())?;
    }
    std::fs::create_dir_all(&out_dir).map_err(|e| e.to_string())?;

    let archive_str = archive.to_str().ok_or("Invalid archive path")?;
    let out_str = out_dir.to_str().ok_or("Invalid output path")?;

    // Step 1: Full extraction with OS tools (handles Mach-O correctly)
    #[cfg(target_os = "macos")]
    {
        let output = std::process::Command::new("ditto")
            .args(["-x", "-k", "--sequesterRsrc", archive_str, out_str])
            .output()
            .map_err(|e| format!("Failed to run ditto: {}", e))?;
        if !output.status.success() {
            return Err(format!("ditto extraction failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
        std::process::Command::new("xattr")
            .args(["-rd", "com.apple.quarantine", out_str])
            .output()
            .ok();
    }

    #[cfg(target_os = "linux")]
    {
        let output = std::process::Command::new("unzip")
            .args(["-o", archive_str, "-d", out_str])
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
                &format!("Expand-Archive -LiteralPath '{}' -DestinationPath '{}' -Force", archive_str, out_str)])
            .output()
            .map_err(|e| format!("Failed to run PowerShell: {}", e))?;
        if !output.status.success() {
            return Err(format!("Expand-Archive failed: {}", String::from_utf8_lossy(&output.stderr)));
        }
    }

    // Step 2: If selected_vvm_files is provided, delete unwanted models to save disk space.
    // The singing model (s0.vvm) is also removed unless explicitly requested.
    if !selected_vvm_files.is_empty() {
        let model_dir = out_dir.join("model");
        if model_dir.exists() {
            let mut removed_count = 0u32;
            let mut saved_bytes = 0u64;
            if let Ok(entries) = std::fs::read_dir(&model_dir) {
                for entry in entries.flatten() {
                    let fname = entry.file_name().to_string_lossy().to_string();
                    if fname.ends_with(".vvm") && !selected_vvm_files.contains(&fname) {
                        if let Ok(meta) = entry.metadata() {
                            saved_bytes += meta.len();
                        }
                        let _ = std::fs::remove_file(entry.path());
                        removed_count += 1;
                    }
                }
            }
            eprintln!(
                "VOICEVOX: kept {} model files, removed {} (saved {:.0} MB)",
                selected_vvm_files.len(),
                removed_count,
                saved_bytes as f64 / 1024.0 / 1024.0
            );
        }

        // Also remove character_info for speakers we don't need
        // (portraits/art — saves ~300MB but requires knowing UUID mapping,
        //  so we skip this for now and just remove unneeded models)
    }

    // Delete archive to free ~1.7 GB
    let _ = std::fs::remove_file(&archive);

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
    let archive = archive_path(&app);

    // Delete engine directory — use `rm -rf` on Unix for robustness
    // (handles locked files, special chars, etc. better than Rust's remove_dir_all)
    if dir.exists() {
        #[cfg(target_family = "unix")]
        {
            let output = std::process::Command::new("rm")
                .args(["-rf", dir.to_str().unwrap_or("")])
                .output()
                .map_err(|e| format!("Failed to run rm: {}", e))?;

            if !output.status.success() {
                let stderr = String::from_utf8_lossy(&output.stderr);
                return Err(format!("Failed to delete engine files: {}", stderr));
            }
        }

        #[cfg(target_os = "windows")]
        {
            std::fs::remove_dir_all(&dir)
                .map_err(|e| format!("Failed to delete engine files: {}", e))?;
        }
    }

    // Also clean up any leftover archive
    if archive.exists() {
        let _ = std::fs::remove_file(&archive);
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
