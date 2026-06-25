import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { createTripForUser, getUserById, listTripsForUser } from "@/lib/server/store";
import type { Trip } from "@/types/trip";

async function currentUser(request: NextRequest) {
  const session = getSession(request);
  return session ? getUserById(session.userId) : null;
}

export async function GET(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  return NextResponse.json({ trips: await listTripsForUser(user) });
}

export async function POST(request: NextRequest) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = (await request.json()) as Partial<Trip>;
  const trip = await createTripForUser(user, body);
  return NextResponse.json({ trip });
}
