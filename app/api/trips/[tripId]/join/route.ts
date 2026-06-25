import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getUserById, joinInvitedTrip } from "@/lib/server/store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const session = getSession(request);
  const user = session ? await getUserById(session.userId) : null;
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { tripId } = await params;
  const member = await joinInvitedTrip(tripId, user);
  if (!member) return NextResponse.json({ error: "초대된 이메일이 아닙니다." }, { status: 403 });

  return NextResponse.json({ member });
}
