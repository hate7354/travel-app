import { randomUUID } from "crypto";
import { getMongoDb } from "./mongo";
import { hashPassword, verifyPassword } from "./auth";
import { defaultMapSettings, sampleParticipants, sampleTodos, sampleTrip } from "@/lib/sampleData";
import type { MapSettings } from "@/types/map";
import type { Participant } from "@/types/participant";
import type { Trip } from "@/types/trip";
import type { TripTodo } from "@/types/todo";
import type { AppUser, TripMember } from "@/types/user";

type StoredUser = AppUser & {
  passwordHash: string;
};

type StoreState = {
  users: StoredUser[];
  trips: Trip[];
  members: TripMember[];
  participants: Participant[];
  todos: TripTodo[];
  mapSettings: Record<string, MapSettings>;
};

const globalForStore = globalThis as typeof globalThis & { travelMemoryStore?: StoreState };

function now() {
  return new Date().toISOString();
}

function memory() {
  globalForStore.travelMemoryStore ??= {
    users: [],
    trips: [sampleTrip],
    members: [],
    participants: sampleParticipants,
    todos: sampleTodos,
    mapSettings: { [sampleTrip.id]: defaultMapSettings }
  };

  return globalForStore.travelMemoryStore;
}

function publicUser(user: StoredUser): AppUser {
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return safeUser;
}

export async function createUser(input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const timestamp = now();
  const db = await getMongoDb();

  if (db) {
    const existing = await db.collection<StoredUser>("users").findOne({ email });
    if (existing) throw new Error("이미 가입된 이메일입니다.");

    const user: StoredUser = {
      id: randomUUID(),
      email,
      name: input.name.trim() || email,
      passwordHash: hashPassword(input.password),
      createdAt: timestamp,
      updatedAt: timestamp
    };
    await db.collection("users").insertOne(user);
    return publicUser(user);
  }

  const store = memory();
  if (store.users.some((user) => user.email === email)) throw new Error("이미 가입된 이메일입니다.");

  const user: StoredUser = {
    id: randomUUID(),
    email,
    name: input.name.trim() || email,
    passwordHash: hashPassword(input.password),
    createdAt: timestamp,
    updatedAt: timestamp
  };
  store.users.push(user);
  return publicUser(user);
}

export async function loginUser(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const db = await getMongoDb();
  const user = db
    ? await db.collection<StoredUser>("users").findOne({ email })
    : memory().users.find((item) => item.email === email);

  if (!user || !verifyPassword(input.password, user.passwordHash)) {
    throw new Error("이메일 또는 비밀번호가 맞지 않습니다.");
  }

  return publicUser(user);
}

export async function getUserById(userId: string) {
  const db = await getMongoDb();
  const user = db
    ? await db.collection<StoredUser>("users").findOne({ id: userId })
    : memory().users.find((item) => item.id === userId);

  return user ? publicUser(user) : null;
}

export async function listTripsForUser(user: AppUser) {
  const db = await getMongoDb();
  if (db) {
    const memberships = await db
      .collection<TripMember>("members")
      .find({ email: user.email, status: "active" })
      .toArray();
    const ids = memberships.map((member) => member.tripId);
    if (ids.length === 0) return [];
    return db.collection<Trip>("trips").find({ id: { $in: ids } }).toArray();
  }

  const store = memory();
  const ids = store.members
    .filter((member) => member.email === user.email && member.status === "active")
    .map((member) => member.tripId);
  return store.trips.filter((trip) => ids.includes(trip.id));
}

export async function createTripForUser(user: AppUser, input: Partial<Trip>) {
  const timestamp = now();
  const tripId =
    input.slug?.trim() ||
    input.title
      ?.trim()
      .toLowerCase()
      .replace(/[^a-z0-9가-힣]+/gi, "-")
      .replace(/^-|-$/g, "") ||
    randomUUID();

  const trip: Trip = {
    id: tripId,
    slug: tripId,
    title: input.title?.trim() || "새 여행",
    description: input.description,
    startDate: input.startDate || timestamp.slice(0, 10),
    endDate: input.endDate,
    meetingTime: input.meetingTime,
    accommodation: input.accommodation || {
      name: "숙소 미정",
      address: "",
      latitude: 37.5665,
      longitude: 126.978
    },
    coverImageUrl: input.coverImageUrl,
    createdAt: timestamp,
    updatedAt: timestamp
  };
  const member: TripMember = {
    id: randomUUID(),
    tripId,
    userId: user.id,
    email: user.email,
    role: "owner",
    status: "active",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const db = await getMongoDb();
  if (db) {
    await db.collection("trips").insertOne(trip);
    await db.collection("members").insertOne(member);
  } else {
    const store = memory();
    store.trips.push(trip);
    store.members.push(member);
    store.mapSettings[tripId] = defaultMapSettings;
  }

  return trip;
}

export async function getTripForUser(tripId: string, user: AppUser) {
  const db = await getMongoDb();
  const member = db
    ? await db.collection<TripMember>("members").findOne({ tripId, email: user.email, status: "active" })
    : memory().members.find((item) => item.tripId === tripId && item.email === user.email && item.status === "active");

  if (!member) return null;

  const trip = db
    ? await db.collection<Trip>("trips").findOne({ id: tripId })
    : memory().trips.find((item) => item.id === tripId);
  if (!trip) return null;

  const participants = db
    ? await db.collection<Participant>("participants").find({ tripId }).toArray()
    : memory().participants.filter((item) => item.tripId === tripId);
  const todos = db
    ? await db.collection<TripTodo>("todos").find({ tripId }).sort({ sortOrder: 1 }).toArray()
    : memory().todos.filter((item) => item.tripId === tripId).sort((a, b) => a.sortOrder - b.sortOrder);
  const settings =
    (db
      ? await db.collection<MapSettings & { tripId: string }>("mapSettings").findOne({ tripId })
      : memory().mapSettings[tripId]) || defaultMapSettings;
  const members = db
    ? await db.collection<TripMember>("members").find({ tripId }).toArray()
    : memory().members.filter((item) => item.tripId === tripId);

  return { trip, participants, todos, settings, members, currentMember: member };
}

export async function updateTripForUser(tripId: string, user: AppUser, input: Partial<Trip>) {
  const data = await getTripForUser(tripId, user);
  if (!data) return null;

  const updated = {
    ...data.trip,
    ...input,
    id: data.trip.id,
    slug: data.trip.slug,
    updatedAt: now()
  } satisfies Trip;

  const db = await getMongoDb();
  if (db) {
    await db.collection("trips").updateOne({ id: tripId }, { $set: updated });
  } else {
    const store = memory();
    store.trips = store.trips.map((trip) => (trip.id === tripId ? updated : trip));
  }

  return updated;
}

export async function deleteTripForUser(tripId: string, user: AppUser) {
  const data = await getTripForUser(tripId, user);
  if (!data) return false;

  const db = await getMongoDb();
  if (db) {
    await Promise.all([
      db.collection("trips").deleteOne({ id: tripId }),
      db.collection("members").deleteMany({ tripId }),
      db.collection("participants").deleteMany({ tripId }),
      db.collection("todos").deleteMany({ tripId }),
      db.collection("mapSettings").deleteMany({ tripId })
    ]);
  } else {
    const store = memory();
    store.trips = store.trips.filter((trip) => trip.id !== tripId);
    store.members = store.members.filter((member) => member.tripId !== tripId);
    store.participants = store.participants.filter((participant) => participant.tripId !== tripId);
    store.todos = store.todos.filter((todo) => todo.tripId !== tripId);
    delete store.mapSettings[tripId];
  }

  return true;
}

export async function inviteMember(tripId: string, user: AppUser, emailInput: string) {
  const data = await getTripForUser(tripId, user);
  if (!data) return null;

  const email = emailInput.trim().toLowerCase();
  const timestamp = now();
  const member: TripMember = {
    id: randomUUID(),
    tripId,
    email,
    role: "member",
    status: "invited",
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const db = await getMongoDb();
  if (db) {
    const existing = await db.collection<TripMember>("members").findOne({ tripId, email });
    if (existing) return existing;
    await db.collection("members").insertOne(member);
  } else {
    const store = memory();
    const existing = store.members.find((item) => item.tripId === tripId && item.email === email);
    if (existing) return existing;
    store.members.push(member);
  }

  return member;
}

export async function joinInvitedTrip(tripId: string, user: AppUser) {
  const db = await getMongoDb();
  const timestamp = now();

  if (db) {
    const member = await db.collection<TripMember>("members").findOne({ tripId, email: user.email });
    if (!member) return null;
    await db
      .collection("members")
      .updateOne({ id: member.id }, { $set: { userId: user.id, status: "active", updatedAt: timestamp } });
    return { ...member, userId: user.id, status: "active" as const, updatedAt: timestamp };
  }

  const store = memory();
  const member = store.members.find((item) => item.tripId === tripId && item.email === user.email);
  if (!member) return null;
  member.userId = user.id;
  member.status = "active";
  member.updatedAt = timestamp;
  return member;
}

export async function addTodoForUser(tripId: string, user: AppUser, input: Partial<TripTodo>) {
  const data = await getTripForUser(tripId, user);
  if (!data) return null;

  const timestamp = now();
  const todo: TripTodo = {
    id: randomUUID(),
    tripId,
    title: input.title || "새 일정",
    time: input.time,
    location: input.location,
    imageUrl: input.imageUrl,
    memo: input.memo,
    sortOrder: input.sortOrder ?? data.todos.length + 1,
    createdAt: timestamp,
    updatedAt: timestamp
  };

  const db = await getMongoDb();
  if (db) await db.collection("todos").insertOne(todo);
  else memory().todos.push(todo);

  return todo;
}

export async function updateMyParticipant(tripId: string, user: AppUser, input: Partial<Participant>) {
  const data = await getTripForUser(tripId, user);
  if (!data) return null;

  const timestamp = now();
  const existing = data.participants.find((participant) => participant.nameKey === user.email);
  const participant: Participant = {
    id: existing?.id || randomUUID(),
    tripId,
    name: user.name,
    nameKey: user.email,
    pinHash: "",
    pinSalt: "",
    markerLabel: user.name.slice(0, 1) || "U",
    markerColor: "#136f63",
    role: data.currentMember.role,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
    ...existing,
    ...input
  };

  const db = await getMongoDb();
  if (db) {
    await db.collection("participants").updateOne({ id: participant.id }, { $set: participant }, { upsert: true });
  } else {
    const store = memory();
    const index = store.participants.findIndex((item) => item.id === participant.id);
    if (index >= 0) store.participants[index] = participant;
    else store.participants.push(participant);
  }

  return participant;
}
