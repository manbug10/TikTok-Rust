//! Local Streamlabs Desktop token discovery — mirrors the Python
//! `_find_local_token`: scan the Electron LevelDB `.log` files of
//! `slobs-client` and extract the last `"apiToken":"<hex>"` match from the
//! newest file that contains one.

use regex::Regex;
use std::fs;
use std::path::PathBuf;

/// Location of the Streamlabs Desktop LevelDB storage.
pub fn leveldb_dir() -> Result<PathBuf, String> {
    #[cfg(target_os = "windows")]
    {
        let appdata = std::env::var("APPDATA")
            .map_err(|_| "APPDATA environment variable not found.".to_string())?;
        Ok(PathBuf::from(appdata)
            .join("slobs-client")
            .join("Local Storage")
            .join("leveldb"))
    }

    #[cfg(target_os = "macos")]
    {
        let home = dirs::home_dir().ok_or("Cannot resolve home directory.")?;
        Ok(home
            .join("Library")
            .join("Application Support")
            .join("slobs-client")
            .join("Local Storage")
            .join("leveldb"))
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        Err("Unsupported operating system for local token retrieval (Windows/macOS only)."
            .to_string())
    }
}

/// Scan `*.log` files (newest first) and return the last API token found.
pub fn find_local_token() -> Result<Option<String>, String> {
    let dir = leveldb_dir()?;

    let mut files: Vec<PathBuf> = match fs::read_dir(&dir) {
        Ok(entries) => entries
            .filter_map(|e| e.ok())
            .map(|e| e.path())
            .filter(|p| {
                p.is_file()
                    && p.extension()
                        .map(|x| x.eq_ignore_ascii_case("log"))
                        .unwrap_or(false)
            })
            .collect(),
        Err(e) => {
            return Err(format!(
                "Cannot open Streamlabs data folder ({}): {e}. \
                 Make sure Streamlabs Desktop is installed and you are logged in.",
                dir.display()
            ))
        }
    };

    // Newest first, like `sorted(..., key=mtime, reverse=True)` in Python.
    files.sort_by_cached_key(|p| {
        fs::metadata(p)
            .and_then(|m| m.modified())
            .ok()
            .unwrap_or(std::time::SystemTime::UNIX_EPOCH)
    });
    files.reverse();

    let re = Regex::new(r#"(?i)"apiToken":"([a-f0-9]+)""#).expect("valid regex");

    for file in files {
        match fs::read(&file) {
            Ok(bytes) => {
                let content = String::from_utf8_lossy(&bytes).replace('\0', "");
                if let Some(last) = re.captures_iter(&content).last() {
                    return Ok(Some(last[1].to_string()));
                }
            }
            Err(e) => {
                eprintln!("Error reading {}: {e}", file.display());
            }
        }
    }

    Ok(None)
}
