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
    SELECT mochi_api_key, mochi_deck_id
    FROM user_mochi_settings
    WHERE user_id = ${session.user.id}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ mochiApiKey: "", mochiDeckId: "" });
  }

  return NextResponse.json({
    mochiApiKey: rows[0].mochi_api_key ?? "",
    mochiDeckId: rows[0].mochi_deck_id ?? "",
  });
}

export async function PUT(request: Request) {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const mochiApiKey = typeof body.mochiApiKey === "string" ? body.mochiApiKey : "";
  const mochiDeckId = typeof body.mochiDeckId === "string" ? body.mochiDeckId : "";

  const sql = getSql();
  await sql`
    INSERT INTO user_mochi_settings (user_id, mochi_api_key, mochi_deck_id, updated_at)
    VALUES (${session.user.id}, ${mochiApiKey}, ${mochiDeckId}, NOW())
    ON CONFLICT (user_id) DO UPDATE
      SET mochi_api_key = EXCLUDED.mochi_api_key,
          mochi_deck_id = EXCLUDED.mochi_deck_id,
          updated_at = NOW()
  `;

  return NextResponse.json({ ok: true });
}
