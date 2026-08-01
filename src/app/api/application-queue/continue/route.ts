import { execFile } from "child_process";
import { existsSync } from "fs";
import path from "path";
import { promisify } from "util";
import { NextRequest, NextResponse } from "next/server";

const execFileAsync = promisify(execFile);

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

    const assistantDir = resolveAssistantDir();
    const mode = shouldUseLinkedinEasyApply(body)
      ? "auto-apply"
      : "prepare-company-portal";

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
    };

    const args = [
      "application_assistant.py",
      "--mode",
      mode,
      "--job-id",
      body.job_id,
      "--limit",
      "1",
      "--min-score",
      "0",
      "--provider",
      mode === "auto-apply" ? "linkedin" : "all",
      "--headless",
      "--allow-submit",
      "--allow-login",
      "--allow-register",
    ];
    const pythonExecutable = resolvePythonExecutable(assistantDir);

    const { stdout, stderr } = await execFileAsync(pythonExecutable, args, {
      cwd: assistantDir,
      env,
      timeout: 10 * 60 * 1000,
      maxBuffer: 1024 * 1024 * 4,
    });

    return NextResponse.json({
      ok: true,
      mode,
      stdout,
      stderr,
    });
  } catch (error) {
    const execError = error as {
      message?: string;
      stdout?: string;
      stderr?: string;
      code?: number | string;
    };

    return NextResponse.json(
      {
        ok: false,
        error: execError.message ?? "Could not continue application.",
        stdout: execError.stdout ?? "",
        stderr: execError.stderr ?? "",
        code: execError.code,
      },
      { status: 500 }
    );
  }
}

function shouldUseLinkedinEasyApply(body: {
  portal?: string;
  application_type?: string;
}) {
  return (
    body.portal === "linkedin" ||
    body.application_type === "linkedin_easy_apply" ||
    body.application_type === "easy_apply"
  );
}

function resolveAssistantDir() {
  if (process.env.APPLICATION_ASSISTANT_DIR) {
    return process.env.APPLICATION_ASSISTANT_DIR;
  }

  const cwd = process.cwd();
  const candidates = [
    path.resolve(cwd, ".."),
    path.resolve(cwd, "..", "job-scraper"),
    "/home/venkat/linkedin-jobs-scrapper",
    "/mnt/c/Users/venka/repos/job-scraper",
  ];

  return candidates.find((candidate) => {
    return existsSync(path.join(candidate, "application_assistant.py"));
  }) ?? candidates[0];
}

function resolvePythonExecutable(assistantDir: string) {
  if (process.env.APPLICATION_ASSISTANT_PYTHON) {
    return process.env.APPLICATION_ASSISTANT_PYTHON;
  }

  const candidates = [
    path.join(assistantDir, ".venv", "Scripts", "python.exe"),
    path.join(assistantDir, ".venv", "bin", "python"),
    path.join(assistantDir, ".venv", "bin", "python3"),
  ];
  const venvPython = candidates.find((candidate) => existsSync(candidate));
  return venvPython ?? (process.platform === "win32" ? "python" : "python3");
}
