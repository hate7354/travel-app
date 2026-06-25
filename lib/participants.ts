import {
  addDoc,
  collection,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  updateDoc,
  where
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { sampleParticipants, sampleTrip } from "./sampleData";
import type { Participant } from "@/types/participant";

export async function getParticipants(tripId: string): Promise<Participant[]> {
  if (!isFirebaseConfigured() || !db) {
    return sampleParticipants.filter((participant) => participant.tripId === tripId);
  }

  const snapshot = await getDocs(collection(db, "trips", tripId, "participants"));
  if (snapshot.empty && tripId === sampleTrip.id) {
    return sampleParticipants;
  }

  return snapshot.docs.map((item) => ({ id: item.id, ...item.data() }) as Participant);
}

export async function getParticipantByNameKey(tripId: string, nameKey: string) {
  if (!isFirebaseConfigured() || !db) {
    return sampleParticipants.find((item) => item.tripId === tripId && item.nameKey === nameKey) ?? null;
  }

  const q = query(
    collection(db, "trips", tripId, "participants"),
    where("nameKey", "==", nameKey),
    limit(1)
  );
  const snapshot = await getDocs(q);
  const item = snapshot.docs[0];

  return item ? ({ id: item.id, ...item.data() } as Participant) : null;
}

export async function createParticipant(
  tripId: string,
  data: Omit<Participant, "id" | "createdAt" | "updatedAt">
) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  const ref = await addDoc(collection(db, "trips", tripId, "participants"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastLoginAt: serverTimestamp()
  });

  return ref.id;
}

export async function updateParticipant(
  tripId: string,
  participantId: string,
  data: Partial<Participant>
) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  await updateDoc(doc(db, "trips", tripId, "participants", participantId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function touchParticipantLogin(tripId: string, participantId: string) {
  if (!db) return;

  await updateDoc(doc(db, "trips", tripId, "participants", participantId), {
    lastLoginAt: serverTimestamp()
  });
}
