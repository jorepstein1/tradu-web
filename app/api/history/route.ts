import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/server";
import { getSql } from "@/lib/db";

export async function GET() {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sql = getSql();
  const rows = await sql`
    SELECT id, word, direction, searched_at
    FROM search_history
    WHERE user_id = ${session.user.id}
    ORDER BY searched_at DESC
    LIMIT 20
  `;

  return NextResponse.json({ history: rows });
}

export async function POST(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const word = typeof body.word === "string" ? body.word.trim() : "";
  const direction = body.direction === "enes" ? "enes" : "esen";

  if (!word) {
    return NextResponse.json({ error: "Missing word" }, { status: 400 });
  }

  const sql = getSql();
  await sql`
    INSERT INTO search_history (user_id, word, direction)
    VALUES (${session.user.id}, ${word}, ${direction})
  `;

  return NextResponse.json({ ok: true });
}
