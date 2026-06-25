import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { getUserById } from "@/lib/server/store";

export async function GET(request: NextRequest) {
  const session = getSession(request);
  if (!session) return NextResponse.json({ user: null });

  const user = await getUserById(session.userId);
  return NextResponse.json({ user });
}
