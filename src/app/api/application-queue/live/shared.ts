import { existsSync } from "fs";
import path from "path";

export function liveAgentDir() {
  return process.env.JOBTRACK_LIVE_AGENT_DIR || "/tmp/jobtrack_live_agent";
}

export function liveSessionFile(sessionId: string) {
  return path.join(liveAgentDir(), `${safeSessionId(sessionId)}.json`);
}

export function liveAnswerFile(sessionId: string) {
  return path.join(liveAgentDir(), `${safeSessionId(sessionId)}.answer.json`);
}

export function safeSessionId(sessionId: string) {
  return sessionId.replace(/[^a-zA-Z0-9_.-]+/g, "_");
}

export function resolveAssistantDir() {
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

  return (
    candidates.find((candidate) =>
      existsSync(path.join(candidate, "application_assistant.py"))
    ) ?? candidates[0]
  );
}

export function resolvePythonExecutable(assistantDir: string) {
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

export function shouldUseLinkedinEasyApply(body: {
  portal?: string;
  application_type?: string;
}) {
  return (
    body.portal === "linkedin" ||
    body.application_type === "linkedin_easy_apply" ||
    body.application_type === "easy_apply"
  );
}
