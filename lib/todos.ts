import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";
import { db, isFirebaseConfigured } from "./firebase";
import { sampleTodos } from "./sampleData";
import type { TripTodo } from "@/types/todo";

export async function getTodos(tripId: string): Promise<TripTodo[]> {
  if (!isFirebaseConfigured() || !db) return sampleTodos.filter((todo) => todo.tripId === tripId);

  const snapshot = await getDocs(collection(db, "trips", tripId, "todos"));
  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }) as TripTodo)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

export async function createTodo(tripId: string, data: Omit<TripTodo, "id" | "createdAt" | "updatedAt">) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  await addDoc(collection(db, "trips", tripId, "todos"), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
}

export async function updateTodo(tripId: string, todoId: string, data: Partial<TripTodo>) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  await updateDoc(doc(db, "trips", tripId, "todos", todoId), {
    ...data,
    updatedAt: serverTimestamp()
  });
}

export async function deleteTodo(tripId: string, todoId: string) {
  if (!db) throw new Error("Firebase 설정이 필요합니다.");

  await deleteDoc(doc(db, "trips", tripId, "todos", todoId));
}
