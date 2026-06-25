import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getTripForUser, getUserById, updateTripForUser } from "@/lib/server/store";
import type { Trip } from "@/types/trip";

async function currentUser(request: NextRequest) {
  const session = getSession(request);
  return session ? getUserById(session.userId) : null;
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { tripId } = await params;
  const data = await getTripForUser(tripId, user);
  if (!data) return NextResponse.json({ error: "초대된 구성원만 볼 수 있습니다." }, { status: 403 });

  return NextResponse.json(data);
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const user = await currentUser(request);
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { tripId } = await params;
  const body = (await request.json()) as Partial<Trip>;
  const trip = await updateTripForUser(tripId, user, body);
  if (!trip) return NextResponse.json({ error: "초대된 구성원만 수정할 수 있습니다." }, { status: 403 });

  return NextResponse.json({ trip });
}
