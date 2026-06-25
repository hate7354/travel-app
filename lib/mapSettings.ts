import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { defaultMapSettings } from "./sampleData";
import type { MapSettings } from "@/types/map";

export async function getMapSettings(tripId: string): Promise<MapSettings> {
  if (!isFirebaseConfigured() || !db) return defaultMapSettings;

  const snapshot = await getDoc(doc(db, "trips", tripId, "mapSettings", "default"));
  return snapshot.exists() ? ({ ...defaultMapSettings, ...snapshot.data() } as MapSettings) : defaultMapSettings;
}

export async function updateMapSettings(tripId: string, data: Partial<MapSettings>) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  await setDoc(doc(db, "trips", tripId, "mapSettings", "default"), data, { merge: true });
}
