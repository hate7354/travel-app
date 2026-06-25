import type { FirestoreDate } from "./trip";

export type TripTodo = {
  id: string;
  tripId: string;
  title: string;
  time?: string;
  location?: {
    name?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  imageUrl?: string;
  memo?: string;
  sortOrder: number;
  createdAt: FirestoreDate;
  updatedAt: FirestoreDate;
};
