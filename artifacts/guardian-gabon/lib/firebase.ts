// Firebase configuration — uses REST API directly, no SDK needed
export const FIREBASE_DB_URL =
  "https://lesailesdebride-f3aca-default-rtdb.firebaseio.com";

export const FIREBASE_STORAGE_BUCKET =
  "lesailesdebride-f3aca.firebasestorage.app";

// API key from Firebase console > Project settings > General > "Clé API Web"
// Starts with "AIzaSy..." — needed for Storage uploads
export const FIREBASE_API_KEY =
  process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "REMPLACER_PAR_VRAIE_CLE";

// ── Realtime Database helpers ──────────────────────────────────────────────

export async function dbGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function dbSet(path: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function dbPatch(path: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function dbDelete(path: string): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ── Storage helpers ─────────────────────────────────────────────────────────

/** Returns the public download URL for a stored file */
export function storagePublicUrl(storagePath: string): string {
  const encoded = encodeURIComponent(storagePath);
  return `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o/${encoded}?alt=media`;
}

/** Upload URL for REST upload (media upload type) */
export function storageUploadUrl(storagePath: string): string {
  const encoded = encodeURIComponent(storagePath);
  return (
    `https://firebasestorage.googleapis.com/v0/b/${FIREBASE_STORAGE_BUCKET}/o` +
    `?name=${encoded}&uploadType=media&key=${FIREBASE_API_KEY}`
  );
}
