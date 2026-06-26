import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getUserById, inviteMember } from "@/lib/server/store";

export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  try {
    const session = getSession(request);
    const user = session ? await getUserById(session.userId) : null;
    if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

    const body = (await request.json()) as { username?: string; role?: "admin" | "member" };
    if (!body.username) return NextResponse.json({ error: "초대할 아이디가 필요합니다." }, { status: 400 });

    const { tripId } = await params;
    const member = await inviteMember(tripId, user, body.username, body.role);
    if (!member) return NextResponse.json({ error: "관리자만 초대할 수 있습니다." }, { status: 403 });

    return NextResponse.json({ member });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "초대 실패" }, { status: 403 });
  }
}
