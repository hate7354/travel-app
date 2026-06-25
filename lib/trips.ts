import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { sampleTrip } from "./sampleData";
import type { Trip } from "@/types/trip";

export async function getTrips(): Promise<Trip[]> {
  if (!isFirebaseConfigured() || !db) return [sampleTrip];

  const snapshot = await getDocs(collection(db, "trips"));
  if (snapshot.empty) return [sampleTrip];

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Trip);
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  if (!isFirebaseConfigured() || !db) return tripId === sampleTrip.id ? sampleTrip : null;

  const snapshot = await getDoc(doc(db, "trips", tripId));
  if (!snapshot.exists()) return tripId === sampleTrip.id ? sampleTrip : null;

  return { id: snapshot.id, ...snapshot.data() } as Trip;
}

export async function createTrip(data: Omit<Trip, "createdAt" | "updatedAt">) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  await setDoc(doc(db, "trips", data.id), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateTrip(tripId: string, data: Partial<Trip>) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  await updateDoc(doc(db, "trips", tripId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}
