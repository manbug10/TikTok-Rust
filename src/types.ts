export interface AppConfig {
  token: string;
  title: string;
  game: string;
  audience_type: "0" | "1"; // "0" normal, "1" mature
  suppress_donation_reminder: boolean;
}

export interface AccountInfo {
  username: string;
  status: string;
  can_be_live: boolean;
}

export interface Category {
  full_name: string;
  game_mask_id: string;
}

export interface StartResult {
  id: string;
  rtmp: string;
  key: string;
}

export interface UpdateInfo {
  current: string;
  latest: string;
  url: string;
  notes: string;
}
