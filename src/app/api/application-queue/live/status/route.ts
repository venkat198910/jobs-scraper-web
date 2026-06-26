import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { liveSessionFile } from "../shared";

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId") || "";
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(readFileSync(liveSessionFile(sessionId), "utf-8"));
    return NextResponse.json({ ok: true, session: payload });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Live session was not found.",
      },
      { status: 404 }
    );
  }
}
