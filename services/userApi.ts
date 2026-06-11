// Client helpers for the per-user persistence endpoints (Next.js API routes
// backed by Neon). These require an authenticated session; the routes return
// 401 otherwise, which these helpers surface as a thrown error.

export interface MochiSettings {
  mochiApiKey: string;
  mochiDeckId: string;
}

export interface SearchHistoryEntry {
  id: number;
  word: string;
  direction: string;
  searched_at: string;
}

export const getMochiSettings = async (): Promise<MochiSettings | null> => {
  const response = await fetch("/api/mochi-settings");
  if (response.status === 401) return null;
  if (!response.ok) throw new Error("Failed to load Mochi settings");
  return response.json();
};

export const saveMochiSettings = async (
  settings: MochiSettings,
): Promise<void> => {
  const response = await fetch("/api/mochi-settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  });
  if (response.status === 401) return;
  if (!response.ok) throw new Error("Failed to save Mochi settings");
};

export const getSearchHistory = async (): Promise<SearchHistoryEntry[]> => {
  const response = await fetch("/api/history");
  if (response.status === 401) return [];
  if (!response.ok) throw new Error("Failed to load search history");
  return response.json().then((json) => json.history);
};

export const recordSearch = async (
  word: string,
  direction: string,
): Promise<void> => {
  await fetch("/api/history", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ word, direction }),
  }).catch(() => {
    // History recording is best-effort; never block search on it.
  });
};
