mod commands;
mod srs;
mod voicevox;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            commands::cards::get_due_cards,
            commands::cards::create_card,
            commands::review::submit_review,
            commands::review::get_review_stats,
            commands::progress::get_user_progress,
            commands::progress::update_streak,
            // VOICEVOX Engine management
            voicevox::voicevox_get_status,
            voicevox::voicevox_download,
            voicevox::voicevox_extract,
            voicevox::voicevox_start,
            voicevox::voicevox_stop,
            voicevox::voicevox_uninstall,
        ])
        .setup(|_app| Ok(()))
        .on_window_event(|_window, event| {
            // Kill the VOICEVOX engine when the app window is destroyed
            if let tauri::WindowEvent::Destroyed = event {
                voicevox::shutdown();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
