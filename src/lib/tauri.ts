import { invoke } from "@tauri-apps/api/core";
import { writeText } from "@tauri-apps/plugin-clipboard-manager";
import { openUrl } from "@tauri-apps/plugin-opener";
import type { AccountInfo, AppConfig, Category, StartResult, UpdateInfo } from "../types";

export const BUY_ME_A_COFFEE_URL = "https://buymeacoffee.com/loukious";
export const LIVE_MONITOR_URL = "https://livecenter.tiktok.com/live_monitor?lang=en-US";

/**
 * Backend commands reject with a plain string message. Normalize any rejection
 * (string / Error / arbitrary value) into a human-readable message.
 */
export function toMessage(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

/** Reads config.json from the app data dir. */
export function loadConfig(): Promise<AppConfig> {
  return invoke<AppConfig>("load_config");
}

export function saveConfig(config: AppConfig): Promise<void> {
  return invoke<void>("save_config", { config });
}

/**
 * Scans the Streamlabs Desktop LevelDB for the API token.
 * Resolves null when not found; throws on unsupported OS / IO errors.
 */
export function findLocalToken(): Promise<string | null> {
  return invoke<string | null>("find_local_token");
}

/**
 * Opens the system browser, runs the local PKCE callback server and returns
 * the oauth token. Can take minutes (timeout after `timeoutSecs`).
 */
export function loginWeb(timeoutSecs = 300): Promise<string> {
  return invoke<string>("login_web", { timeoutSecs });
}

/** Manual PKCE code exchange fallback. */
export function exchangeCode(code: string, verifier: string): Promise<string> {
  return invoke<string>("exchange_code", { code, verifier });
}

export function accountInfo(token: string): Promise<AccountInfo> {
  return invoke<AccountInfo>("account_info", { token });
}

/** Empty query resolves to []. */
export function searchCategories(token: string, query: string): Promise<Category[]> {
  return invoke<Category[]>("search_categories", { token, query });
}

export interface StartStreamArgs {
  token: string;
  title: string;
  /** game_mask_id of the selected category ("" is allowed and means "Other"). */
  category: string;
  audienceType: string;
}

export function startStream(args: StartStreamArgs): Promise<StartResult> {
  return invoke<StartResult>("start_stream", { ...args });
}

export function endStream(token: string, streamId: string): Promise<boolean> {
  return invoke<boolean>("end_stream", { token, streamId });
}

/** Resolves null when up to date or when the check failed (silent). */
export function checkUpdate(): Promise<UpdateInfo | null> {
  return invoke<UpdateInfo | null>("check_update");
}

export async function copyToClipboard(text: string): Promise<void> {
  await writeText(text);
}

export async function openExternal(url: string): Promise<void> {
  await openUrl(url);
}
