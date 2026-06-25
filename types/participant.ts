import type { FirestoreDate } from "./trip";

export type ParticipantRole = "owner" | "member";

export type Participant = {
  id: string;
  tripId: string;
  name: string;
  nameKey: string;
  pinHash: string;
  pinSalt: string;
  startLocation?: {
    name?: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  departureTime?: string;
  markerLabel: string;
  markerColor: string;
  profileImageUrl?: string;
  memo?: string;
  role: ParticipantRole;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
  lastLoginAt?: FirestoreDate;
};
