//! Tauri commands exposed to the React frontend.

use crate::config as config_store;
use crate::config::AppConfig;
use crate::local_token;
use crate::stream::{AccountInfo, Category, StartResult, StreamClient};
use crate::token_retriever;
use crate::updater::UpdateInfo;
use std::time::Duration;
use tauri::AppHandle;
use tauri_plugin_opener::OpenerExt;

const LOGIN_TIMEOUT: Duration = Duration::from_secs(300);

/// Load the persisted configuration (config.json in the app-data dir).
#[tauri::command]
pub async fn load_config(app: AppHandle) -> Result<AppConfig, String> {
    Ok(config_store::load(&app))
}

/// Persist the configuration.
#[tauri::command]
pub async fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    config_store::save(&app, &config)
}

/// Scan Streamlabs Desktop local storage for an API token.
#[tauri::command]
pub async fn find_local_token() -> Result<Option<String>, String> {
    tokio::task::spawn_blocking(local_token::find_local_token)
        .await
        .map_err(|e| format!("Worker thread failed: {e}"))?
}

/// Open the browser for the Streamlabs OAuth login and return the token.
#[tauri::command]
pub async fn login_web(app: AppHandle, timeout_secs: Option<u32>) -> Result<String, String> {
    let timeout = timeout_secs
        .map(|s| Duration::from_secs(u64::from(s).max(30)))
        .unwrap_or(LOGIN_TIMEOUT);

    let flow = token_retriever::generate_pkce();
    let port = token_retriever::find_free_port()?;

    let url = token_retriever::login_url(&flow.challenge, port);
    app.opener()
        .open_url(&url, None::<&str>)
        .map_err(|e| format!("Cannot open the browser: {e}"))?;

    let code = token_retriever::wait_for_code(port, timeout).await?;
    token_retriever::exchange_code(&code, &flow.verifier).await
}

/// Manually exchange a PKCE authorization code for a token (fallback path).
#[tauri::command]
pub async fn exchange_code(code: String, verifier: String) -> Result<String, String> {
    token_retriever::exchange_code(&code, &verifier).await
}

/// Fetch account information for the given token.
#[tauri::command]
pub async fn account_info(token: String) -> Result<AccountInfo, String> {
    StreamClient::new(&token)?.info().await
}

/// Search game/category suggestions for the autocomplete box.
#[tauri::command]
pub async fn search_categories(token: String, query: String) -> Result<Vec<Category>, String> {
    StreamClient::new(&token)?.search(&query).await
}

/// Start a live stream, returning { id, rtmp, key }.
#[tauri::command]
pub async fn start_stream(
    token: String,
    title: String,
    category: String,
    audience_type: String,
) -> Result<StartResult, String> {
    StreamClient::new(&token)?
        .start(&title, &category, &audience_type)
        .await
}

/// End the live stream with the given id.
#[tauri::command]
pub async fn end_stream(token: String, stream_id: String) -> Result<bool, String> {
    StreamClient::new(&token)?.end(&stream_id).await
}

/// Check GitHub for a newer release (silent when failing / up to date).
#[tauri::command]
pub async fn check_update() -> Result<Option<UpdateInfo>, String> {
    crate::updater::check_update().await
}
