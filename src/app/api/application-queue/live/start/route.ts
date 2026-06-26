import { mkdirSync, writeFileSync } from "fs";
import { spawn } from "child_process";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  liveAgentDir,
  liveSessionFile,
  resolveAssistantDir,
  resolvePythonExecutable,
} from "../shared";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      job_id?: string;
      portal?: string;
      application_type?: string;
    };

    if (!body.job_id) {
      return NextResponse.json({ error: "job_id is required" }, { status: 400 });
    }

    const sessionId = `${body.job_id}-${Date.now()}-${randomUUID().slice(0, 8)}`;
    mkdirSync(liveAgentDir(), { recursive: true });
    writeFileSync(
      liveSessionFile(sessionId),
      JSON.stringify(
        {
          session_id: sessionId,
          status: "starting",
          job_id: body.job_id,
          updated_at: new Date().toISOString(),
        },
        null,
        2
      )
    );

    const assistantDir = resolveAssistantDir();
    const pythonExecutable = resolvePythonExecutable(assistantDir);

    const env = {
      ...process.env,
      SUPABASE_URL:
        process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      LINKEDIN_STORAGE_STATE_JSON:
        process.env.LINKEDIN_STORAGE_STATE_JSON ??
        process.env.LINKEDIN_STORAGE_STATE ??
        "",
      JOBTRACK_LIVE_SESSION_ID: sessionId,
      JOBTRACK_LIVE_ANSWER_TIMEOUT_SECONDS: "1200",
    };

    const args = [
      "llm_application_agent.py",
      "--job-id",
      body.job_id,
      "--max-steps",
      "25",
      "--headless",
      "--allow-submit",
    ];

    const child = spawn(pythonExecutable, args, {
      cwd: assistantDir,
      env,
      detached: true,
      stdio: "ignore",
    });
    child.unref();

    return NextResponse.json({ ok: true, sessionId, mode: "llm-apply-agent" });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error ? error.message : "Could not start live agent.",
      },
      { status: 500 }
    );
  }
}
