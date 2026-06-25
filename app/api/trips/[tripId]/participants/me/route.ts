import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getUserById, updateMyParticipant } from "@/lib/server/store";
import type { Participant } from "@/types/participant";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const session = getSession(request);
  const user = session ? await getUserById(session.userId) : null;
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { tripId } = await params;
  const body = (await request.json()) as Partial<Participant>;
  const participant = await updateMyParticipant(tripId, user, body);
  if (!participant) return NextResponse.json({ error: "구성원만 참여자 정보를 수정할 수 있습니다." }, { status: 403 });

  return NextResponse.json({ participant });
}
