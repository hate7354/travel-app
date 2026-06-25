import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getUserById, inviteMember } from "@/lib/server/store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const session = getSession(request);
  const user = session ? await getUserById(session.userId) : null;
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const body = (await request.json()) as { email?: string };
  if (!body.email) return NextResponse.json({ error: "초대할 이메일이 필요합니다." }, { status: 400 });

  const { tripId } = await params;
  const member = await inviteMember(tripId, user, body.email);
  if (!member) return NextResponse.json({ error: "구성원만 초대할 수 있습니다." }, { status: 403 });

  return NextResponse.json({ member });
}
