export type Profile = {
  // old fields (keep them)
  high?: string; low?: string; goal?: string; strengths?: string;
  values?: string[]; big5?: Record<string, number>;

  // new profile fields
  displayName?: string;
  avatar?: string;       // emoji or URL later
};

const KEY = "ky_profile";

export function saveProfile(p: Profile) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

export function loadProfile(): Profile | undefined {
  try {
    const s = localStorage.getItem(KEY);
    return s ? JSON.parse(s) : undefined;
  } catch { return undefined; }
}
