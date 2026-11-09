//! App configuration persistence (config.json in the Tauri app-data dir).
//! Field names are kept identical to the original Python app's config.json
//! so an existing config can be migrated by simply copying the file.

use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::{AppHandle, Manager};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct AppConfig {
    pub token: String,
    pub title: String,
    pub game: String,
    /// "0" = normal audience, "1" = mature content.
    pub audience_type: String,
    pub suppress_donation_reminder: bool,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            token: String::new(),
            title: String::new(),
            game: String::new(),
            audience_type: "0".to_string(),
            suppress_donation_reminder: false,
        }
    }
}

pub fn config_path(app: &AppHandle) -> PathBuf {
    let dir = app
        .path()
        .app_data_dir()
        .unwrap_or_else(|_| PathBuf::from("."));
    let _ = fs::create_dir_all(&dir);
    dir.join("config.json")
}

pub fn load(app: &AppHandle) -> AppConfig {
    fs::read_to_string(config_path(app))
        .ok()
        .and_then(|content| serde_json::from_str(&content).ok())
        .unwrap_or_default()
}

pub fn save(app: &AppHandle, cfg: &AppConfig) -> Result<(), String> {
    let json = serde_json::to_string_pretty(cfg).map_err(|e| e.to_string())?;
    fs::write(config_path(app), json).map_err(|e| format!("Failed to save config: {e}"))
}
