const STORAGE_KEY = "qoomlee:booking:passengerDetails";

export interface StoredPassengerDetails {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export function loadPassengerDetails(): StoredPassengerDetails | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredPassengerDetails) : null;
  } catch {
    return null;
  }
}

export function savePassengerDetails(details: StoredPassengerDetails): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(details));
  } catch {
    // ignore storage errors (e.g. private browsing quota)
  }
}

export function clearPassengerDetails(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
