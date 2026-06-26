import { mkdirSync, writeFileSync } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { liveAgentDir, liveAnswerFile } from "../shared";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      sessionId?: string;
      answers?: Array<{ key?: string; label?: string; answer?: string }>;
    };

    if (!body.sessionId) {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    const answers = (body.answers ?? []).filter((item) =>
      String(item.answer || "").trim()
    );
    if (answers.length === 0) {
      return NextResponse.json({ error: "At least one answer is required" }, { status: 400 });
    }

    mkdirSync(liveAgentDir(), { recursive: true });
    writeFileSync(
      liveAnswerFile(body.sessionId),
      JSON.stringify(
        {
          sessionId: body.sessionId,
          answers,
          updated_at: new Date().toISOString(),
        },
        null,
        2
      )
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Could not send live answer.",
      },
      { status: 500 }
    );
  }
}
