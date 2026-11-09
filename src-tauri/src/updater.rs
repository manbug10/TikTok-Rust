//! GitHub Releases update check — mirrors the original Python `Updater.py`.

use serde::Serialize;
use std::time::Duration;

const REPO: &str = "Loukious/StreamlabsTikTokStreamKeyGenerator";

#[derive(Debug, Clone, Serialize)]
pub struct UpdateInfo {
    pub current: String,
    pub latest: String,
    pub url: String,
    pub notes: String,
}

/// Check GitHub for a newer release. Returns `Ok(None)` when the app is
/// up to date OR when the check fails (silent, like the Python version).
pub async fn check_update() -> Result<Option<UpdateInfo>, String> {
    let current = env!("CARGO_PKG_VERSION");

    let result = run_check(current).await;
    match result {
        Ok(info) => Ok(info),
        Err(_) => Ok(None), // silent failure, same as the Python app
    }
}

async fn run_check(current: &str) -> Result<Option<UpdateInfo>, String> {
    let http = reqwest::Client::builder()
        .user_agent("StreamlabsTikTokStreamKeyGenerator")
        .timeout(Duration::from_secs(8))
        .build()
        .map_err(|e| e.to_string())?;

    let resp = http
        .get(format!("https://api.github.com/repos/{REPO}/releases/latest"))
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let json: serde_json::Value = resp.json().await.map_err(|e| e.to_string())?;

    let latest_tag = json
        .get("tag_name")
        .and_then(|v| v.as_str())
        .unwrap_or("")
        .trim_start_matches('v')
        .to_string();

    let latest = semver::Version::parse(&latest_tag).map_err(|e| e.to_string())?;
    let current_v = semver::Version::parse(current).map_err(|e| e.to_string())?;

    if latest > current_v {
        Ok(Some(UpdateInfo {
            current: current.to_string(),
            latest: latest_tag,
            url: json
                .get("html_url")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string(),
            notes: json
                .get("body")
                .and_then(|v| v.as_str())
                .unwrap_or_default()
                .to_string(),
        }))
    } else {
        Ok(None)
    }
}
