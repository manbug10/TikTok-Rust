//! StreamLabs TikTok Stream Key Generator — Tauri v2 rebuild.
//!
//! Original Python/PySide6 app by Loukious, rebuilt as a native desktop app
//! with a Rust backend and a React + Tailwind CSS frontend.

mod commands;
mod config;
mod local_token;
mod stream;
mod token_retriever;
mod updater;

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .invoke_handler(tauri::generate_handler![
            commands::load_config,
            commands::save_config,
            commands::find_local_token,
            commands::login_web,
            commands::exchange_code,
            commands::account_info,
            commands::search_categories,
            commands::start_stream,
            commands::end_stream,
            commands::check_update,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
