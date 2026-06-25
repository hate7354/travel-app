import type { TripSession } from "@/types/auth";

function key(tripId: string) {
  return `trip-session:${tripId}`;
}

export function saveTripSession(session: TripSession) {
  localStorage.setItem(key(session.tripId), JSON.stringify(session));
}

export function getTripSession(tripId: string): TripSession | null {
  const raw = localStorage.getItem(key(tripId));
  if (!raw) return null;

  try {
    return JSON.parse(raw) as TripSession;
  } catch {
    return null;
  }
}

export function clearTripSession(tripId: string) {
  localStorage.removeItem(key(tripId));
}
