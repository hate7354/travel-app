import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/server/auth";
import { addTodoForUser, getUserById } from "@/lib/server/store";
import type { TripTodo } from "@/types/todo";

export async function POST(request: NextRequest, { params }: { params: Promise<{ tripId: string }> }) {
  const session = getSession(request);
  const user = session ? await getUserById(session.userId) : null;
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const { tripId } = await params;
  const body = (await request.json()) as Partial<TripTodo>;
  const todo = await addTodoForUser(tripId, user, body);
  if (!todo) return NextResponse.json({ error: "구성원만 일정을 추가할 수 있습니다." }, { status: 403 });

  return NextResponse.json({ todo });
}
