import { readFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { liveSessionFile } from "../shared";

function readLogTail(logPath?: string) {
  if (!logPath) return [];
  try {
    return readFileSync(logPath, "utf-8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .slice(-12);
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const sessionId = request.nextUrl.searchParams.get("sessionId") || "";
  if (!sessionId) {
    return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(readFileSync(liveSessionFile(sessionId), "utf-8"));
    const logLines = readLogTail(payload.log_path);
    if (logLines.length > 0) {
      payload.messages = [...(payload.messages || []), ...logLines].slice(-12);
    }
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
