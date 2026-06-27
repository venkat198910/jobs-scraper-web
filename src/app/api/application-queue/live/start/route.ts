import { existsSync, mkdirSync, openSync, writeFileSync } from "fs";
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

    const assistantDir = resolveAssistantDir();
    const pythonExecutable = resolvePythonExecutable(assistantDir);
    const defaultLinkedinState = `${assistantDir}/linkedin_storage_state.json`;
    const linkedinStorageState =
      process.env.LINKEDIN_STORAGE_STATE ||
      (existsSync(defaultLinkedinState) ? defaultLinkedinState : "");
    const hasLlmKey = Boolean(
      process.env.GEMINI_API_KEY ||
        process.env.GEMINI_FIRST_API_KEY ||
        process.env.OPENAI_API_KEY ||
        process.env.ANTHROPIC_API_KEY ||
        process.env.GROQ_API_KEY
    );

    if (!hasLlmKey) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "LLM Apply Agent needs at least one local LLM API key in WSL/Next env: GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY, or GROQ_API_KEY.",
        },
        { status: 400 }
      );
    }

    const env = {
      ...process.env,
      SUPABASE_URL:
        process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY:
        process.env.SUPABASE_SERVICE_ROLE_KEY ??
        process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY,
      LINKEDIN_STORAGE_STATE_JSON:
        process.env.LINKEDIN_STORAGE_STATE_JSON ??
        "",
      LINKEDIN_STORAGE_STATE: linkedinStorageState,
      JOBTRACK_LIVE_SESSION_ID: sessionId,
      JOBTRACK_LIVE_ANSWER_TIMEOUT_SECONDS: "1200",
      DISPLAY: process.env.DISPLAY || ":0",
      WAYLAND_DISPLAY: process.env.WAYLAND_DISPLAY || "wayland-0",
      XDG_RUNTIME_DIR: process.env.XDG_RUNTIME_DIR || "/run/user/1000",
    };

    const args = [
      "llm_application_agent.py",
      "--job-id",
      body.job_id,
      "--max-steps",
      "25",
      "--allow-submit",
    ];
    if (process.env.JOBTRACK_LIVE_HEADLESS === "1") {
      args.push("--headless");
    }

    const logPath = `${liveAgentDir()}/${sessionId}.log`;
    const logFd = openSync(logPath, "a");
    writeFileSync(
      liveSessionFile(sessionId),
      JSON.stringify(
        {
          session_id: sessionId,
          status: "starting",
          job_id: body.job_id,
          log_path: logPath,
          updated_at: new Date().toISOString(),
        },
        null,
        2
      )
    );

    const child = spawn(pythonExecutable, args, {
      cwd: assistantDir,
      env,
      detached: true,
      stdio: ["ignore", logFd, logFd],
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
