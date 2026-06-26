import { NextResponse, type NextRequest } from "next/server";
import { createSessionToken, sessionCookieName } from "@/lib/server/auth";
import { loginUser } from "@/lib/server/store";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string };
    if (!body.username || !body.password) {
      return NextResponse.json({ error: "아이디와 비밀번호가 필요합니다." }, { status: 400 });
    }

    const user = await loginUser({ username: body.username, password: body.password });
    const response = NextResponse.json({ user });
    response.cookies.set(sessionCookieName, createSessionToken({ userId: user.id, username: user.username, email: user.email, name: user.name }), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/"
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "로그인 실패" }, { status: 401 });
  }
}
