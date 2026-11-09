//! Browser-based OAuth (PKCE) login flow — mirrors the original Python
//! `TokenRetriever.py`:
//!
//! 1. Generate a PKCE code verifier (64 random bytes hex) + challenge
//!    (SHA-256, base64url, no padding).
//! 2. Start a tiny local HTTP callback server on 127.0.0.1:<ephemeral port>.
//! 3. Open the Streamlabs login page in the user's default browser.
//! 4. Capture `?success=true&code=...` from the redirect.
//! 5. Exchange the code for an OAuth token.

use base64::Engine;
use rand::RngCore;
use sha2::{Digest, Sha256};
use std::io::Write;
use std::net::TcpListener;
use std::time::{Duration, Instant};

const AUTH_USER_AGENT: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) StreamlabsDesktop/1.20.4 Chrome/122.0.6261.156 Electron/29.3.1 Safari/537.36";
const AUTH_DATA_URL: &str = "https://streamlabs.com/api/v5/slobs/auth/data";

pub struct PkceFlow {
    pub verifier: String,
    pub challenge: String,
}

/// 64-byte hex verifier (128 hex chars) + its SHA-256 base64url challenge.
pub fn generate_pkce() -> PkceFlow {
    let mut bytes = [0u8; 64];
    rand::rngs::OsRng.fill_bytes(&mut bytes);
    let verifier: String = bytes.iter().map(|b| format!("{b:02x}")).collect();
    let digest = Sha256::digest(verifier.as_bytes());
    let challenge = base64::engine::general_purpose::URL_SAFE_NO_PAD.encode(digest);
    PkceFlow {
        verifier,
        challenge,
    }
}

/// Ask the OS for a free ephemeral port (bind to port 0).
pub fn find_free_port() -> Result<u16, String> {
    let listener = TcpListener::bind(("127.0.0.1", 0)).map_err(|e| e.to_string())?;
    let addr = listener.local_addr().map_err(|e| e.to_string())?;
    Ok(addr.port())
}

/// Login URL for the Streamlabs Desktop flow (same as the Python app).
pub fn login_url(challenge: &str, port: u16) -> String {
    format!(
        "https://streamlabs.com/slobs/login?skip_splash=true&external=electron&tiktok\
&force_verify&origin=slobs&port={port}&code_challenge={challenge}&code_flow=true"
    )
}

/// Run the callback server until the OAuth redirect arrives or `timeout`
/// elapses. Returns the authorization `code`.
pub async fn wait_for_code(port: u16, timeout: Duration) -> Result<String, String> {
    let (tx, rx) = tokio::sync::oneshot::channel::<Result<String, String>>();

    std::thread::spawn(move || {
        let server = match tiny_http::Server::http(("127.0.0.1", port)) {
            Ok(s) => s,
            Err(e) => {
                let _ = tx.send(Err(format!(
                    "Cannot bind callback server on port {port}: {e}"
                )));
                return;
            }
        };

        // Non-blocking polling loop so the thread can time out by itself.
        let _ = server.set_nonblocking(true);
        let deadline = Instant::now() + timeout;

        loop {
            match server.recv() {
                Ok(request) => {
                    let url = request.url().to_string(); // "path?query"
                    let success = url.contains("success=true") && url.contains("code=");
                    let (body, code) = if success {
                        (
                            "<h2>Authentication successful! You can close this tab.</h2>",
                            200u16,
                        )
                    } else {
                        ("<h2>Authentication failed. Please try again.</h2>", 400u16)
                    };

                    let header = tiny_http::Header::from_bytes(&b"Content-Type"[..], &b"text/html; charset=utf-8"[..])
                        .unwrap();
                    let response = tiny_http::Response::from_string(body)
                        .with_status_code(code)
                        .with_header(header);
                    let _ = request.respond(response);
                    let _ = server.flush();

                    let result = if success {
                        parse_query_code(&url)
                            .map(Ok)
                            .unwrap_or_else(|| {
                                Err("Callback received but no auth code was present.".to_string())
                            })
                    } else {
                        Err("Authentication failed: the callback did not report success.".to_string())
                    };
                    let _ = tx.send(result);
                    break;
                }
                Err(_) if Instant::now() >= deadline => {
                    let _ = tx.send(Err(
                        "Timed out waiting for the user to complete login.".to_string()
                    ));
                    break;
                }
                Err(_) => {
                    std::thread::sleep(Duration::from_millis(50));
                }
            }
        }
    });

    match rx.await {
        Ok(result) => result,
        Err(_) => Err("Callback server channel closed unexpectedly.".to_string()),
    }
}

/// Extract the `code` query parameter from a callback URL.
fn parse_query_code(url: &str) -> Option<String> {
    let query = url.split_once('?')?.1;
    for pair in query.split('&') {
        let mut kv = pair.splitn(2, '=');
        if kv.next()? == "code" {
            return kv
                .next()
                .map(|v| v.replace("%3D", "=").replace("%2B", "+").replace("%2F", "/"));
        }
    }
    None
}

/// Exchange the authorization code for an OAuth token.
pub async fn exchange_code(code: &str, verifier: &str) -> Result<String, String> {
    let http = reqwest::Client::builder()
        .user_agent(AUTH_USER_AGENT)
        .timeout(Duration::from_secs(30))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {e}"))?;

    let resp = http
        .get(AUTH_DATA_URL)
        .query(&[("code_verifier", verifier), ("code", code)])
        .header("Accept", "*/*")
        .header("Accept-Language", "en-US")
        .send()
        .await
        .map_err(|e| format!("Network error during token exchange: {e}"))?;

    let status = resp.status();
    let json: serde_json::Value = resp
        .json()
        .await
        .map_err(|_| "Token exchange returned non-JSON response.".to_string())?;

    if !status.is_success() {
        return Err(format!("Token exchange failed: HTTP {status}"));
    }

    if json
        .get("success")
        .and_then(|v| v.as_bool())
        .unwrap_or(false)
    {
        json.pointer("/data/oauth_token")
            .and_then(|v| v.as_str())
            .map(|s| s.to_string())
            .ok_or_else(|| "Missing oauth_token in Streamlabs response.".to_string())
    } else {
        Err(format!(
            "Streamlabs reported failure: {}",
            crate::stream::truncate(&json.to_string(), 300)
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn pkce_shape() {
        let flow = generate_pkce();
        assert_eq!(flow.verifier.len(), 128);
        assert!(!flow.challenge.contains('='));
        assert!(!flow.challenge.contains('+'));
        assert!(!flow.challenge.contains('/'));
    }

    #[test]
    fn parse_code() {
        assert_eq!(
            parse_query_code("/?success=true&code=abc123"),
            Some("abc123".to_string())
        );
        assert_eq!(parse_query_code("/?success=false"), None);
    }
}
