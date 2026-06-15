const STORAGE_KEY = "qoomlee:session:token";

/**
 * Returns a stable, opaque identifier for this browser, generating and
 * persisting one on first use. Sent as a bearer token so the backend can
 * track an anonymous user's bookings across requests.
 */
export function getSessionToken(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const token = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, token);
  return token;
}

export function authHeaders(): Record<string, string> {
  return { Authorization: `Bearer ${getSessionToken()}` };
}
