//! Streamlabs TikTok API client.
//!
//! Mirrors the original Python `Stream.py`:
//!   GET  /api/v5/slobs/tiktok/info                     -> account info
//!   GET  /api/v5/slobs/tiktok/info?category=<q>        -> category search
//!   POST /api/v5/slobs/tiktok/stream/start (multipart) -> { id, rtmp, key }
//!   POST /api/v5/slobs/tiktok/stream/{id}/end          -> { success }

use serde::{Deserialize, Serialize};
use std::time::Duration;

/// User-Agent used by the Streamlabs Desktop app (required by the API).
pub const API_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.17.0 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36";

const BASE_URL: &str = "https://streamlabs.com/api/v5/slobs";
const REQUEST_TIMEOUT: Duration = Duration::from_secs(30);

/// Clean account information returned to the frontend.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AccountInfo {
    pub username: String,
    pub status: String,
    pub can_be_live: bool,
}

/// A game/category suggestion (same shape as the upstream API).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Category {
    pub full_name: String,
    pub game_mask_id: String,
}

/// Result of starting a stream.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StartResult {
    pub id: String,
    pub rtmp: String,
    pub key: String,
}

pub struct StreamClient {
    http: reqwest::Client,
    token: String,
}

impl StreamClient {
    pub fn new(token: &str) -> Result<Self, String> {
        let http = reqwest::Client::builder()
            .user_agent(API_USER_AGENT)
            .timeout(REQUEST_TIMEOUT)
            .build()
            .map_err(|e| format!("Failed to build HTTP client: {e}"))?;
        Ok(Self {
            http,
            token: token.to_string(),
        })
    }

    fn value_to_string(v: &serde_json::Value) -> String {
        match v {
            serde_json::Value::String(s) => s.clone(),
            other => other.to_string(),
        }
    }

    /// GET /tiktok/info — account information.
    pub async fn info(&self) -> Result<AccountInfo, String> {
        let resp = self
            .http
            .get(format!("{BASE_URL}/tiktok/info"))
            .bearer_auth(&self.token)
            .send()
            .await
            .map_err(|e| format!("Network error: {e}"))?;

        let status = resp.status();
        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Invalid response from Streamlabs: {e}"))?;

        if !status.is_success() {
            return Err(format!(
                "Streamlabs API error (HTTP {status}): {}",
                truncate(&json.to_string(), 300)
            ));
        }

        Ok(AccountInfo {
            username: json
                .pointer("/user/username")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown")
                .to_string(),
            status: json
                .pointer("/application_status/status")
                .and_then(|v| v.as_str())
                .unwrap_or("Unknown")
                .to_string(),
            can_be_live: json
                .get("can_be_live")
                .and_then(|v| v.as_bool())
                .unwrap_or(false),
        })
    }

    /// GET /tiktok/info?category=<q> — game/category search.
    /// Names longer than 25 characters make the API return error 500,
    /// so the query is truncated the same way the Python app does.
    pub async fn search(&self, game: &str) -> Result<Vec<Category>, String> {
        let game = game.trim();
        if game.is_empty() {
            return Ok(Vec::new());
        }
        let truncated = truncate_chars(game, 25);

        let resp = self
            .http
            .get(format!("{BASE_URL}/tiktok/info"))
            .bearer_auth(&self.token)
            .query(&[("category", truncated)])
            .send()
            .await
            .map_err(|e| format!("Network error: {e}"))?;

        let status = resp.status();
        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Invalid response from Streamlabs: {e}"))?;

        if !status.is_success() {
            return Err(format!(
                "Failed to search games (HTTP {status}): {}",
                truncate(&json.to_string(), 300)
            ));
        }

        let mut categories: Vec<Category> = json
            .get("categories")
            .cloned()
            .map(serde_json::from_value::<Vec<Category>>)
            .transpose()
            .map_err(|e| format!("Unexpected categories payload: {e}"))?
            .unwrap_or_default();

        // The Python app always appends an "Other" option with an empty id.
        categories.push(Category {
            full_name: "Other".to_string(),
            game_mask_id: String::new(),
        });
        Ok(categories)
    }

    /// POST /tiktok/stream/start — begin a live stream, returns RTMP + key.
    pub async fn start(
        &self,
        title: &str,
        category: &str,
        audience_type: &str,
    ) -> Result<StartResult, String> {
        let form = reqwest::multipart::Form::new()
            .text("title", title.to_string())
            .text("device_platform", "win32")
            .text("category", category.to_string())
            .text("audience_type", audience_type.to_string());

        let resp = self
            .http
            .post(format!("{BASE_URL}/tiktok/stream/start"))
            .bearer_auth(&self.token)
            .multipart(form)
            .send()
            .await
            .map_err(|e| format!("Network error: {e}"))?;

        let status = resp.status();
        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Invalid response from Streamlabs: {e}"))?;

        let has = |k: &str| {
            json.get(k)
                .map(|v| !v.is_null())
                .unwrap_or(false)
        };

        if status.is_success() && has("id") && has("rtmp") && has("key") {
            Ok(StartResult {
                id: json
                    .get("id")
                    .map(Self::value_to_string)
                    .unwrap_or_default(),
                rtmp: json
                    .get("rtmp")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string(),
                key: json
                    .get("key")
                    .and_then(|v| v.as_str())
                    .unwrap_or_default()
                    .to_string(),
            })
        } else {
            Err(format!(
                "Failed to start stream: {}",
                truncate(&json.to_string(), 300)
            ))
        }
    }

    /// POST /tiktok/stream/{id}/end — end the live stream.
    pub async fn end(&self, stream_id: &str) -> Result<bool, String> {
        let resp = self
            .http
            .post(format!("{BASE_URL}/tiktok/stream/{stream_id}/end"))
            .bearer_auth(&self.token)
            .send()
            .await
            .map_err(|e| format!("Network error: {e}"))?;

        let status = resp.status();
        let json: serde_json::Value = resp
            .json()
            .await
            .map_err(|e| format!("Invalid response from Streamlabs: {e}"))?;

        if !status.is_success() {
            return Err(format!(
                "Failed to end stream (HTTP {status}): {}",
                truncate(&json.to_string(), 300)
            ));
        }

        Ok(json
            .get("success")
            .and_then(|v| v.as_bool())
            .unwrap_or(false))
    }
}

/// Truncate a string to `n` characters (char-safe, unlike byte slicing).
pub fn truncate_chars(s: &str, n: usize) -> &str {
    match s.char_indices().nth(n) {
        Some((idx, _)) => &s[..idx],
        None => s,
    }
}

/// Truncate a string to `n` chars appending an ellipsis when cut.
pub fn truncate(s: &str, n: usize) -> String {
    let cut = truncate_chars(s, n);
    if cut.len() < s.len() {
        format!("{cut}…")
    } else {
        cut.to_string()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn truncate_chars_is_char_safe() {
        assert_eq!(truncate_chars("hello", 25), "hello");
        assert_eq!(truncate_chars("áéíóúáéíóúáéíóúáéíóúáéíóúXX", 25).chars().count(), 25);
    }
}
