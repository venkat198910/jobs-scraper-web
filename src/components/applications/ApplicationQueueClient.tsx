"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  FileText,
  MessageSquareText,
  Play,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { normalizeQuestionKey, normalizeSettings } from "@/lib/settings";

type ApplicationQueueItem = {
  id?: string;
  job_id?: string;
  customized_resume_id?: string;
  application_type?: string;
  portal?: string;
  status?: string;
  run_mode?: string;
  apply_url?: string;
  resume_path?: string;
  score?: number;
  notes?: Record<string, unknown>;
  created_at?: string;
  source?: "table" | "storage";
};

type QueueResponse = {
  items?: ApplicationQueueItem[];
  source?: "table" | "storage";
  storageFallback?: boolean;
  error?: string;
};

type QueueUpdateResponse = {
  item?: ApplicationQueueItem;
  error?: string;
};

type QueueDeleteResponse = {
  ok?: boolean;
  error?: string;
};

type MissingQuestion = {
  label: string;
  key: string;
  suggestedAnswer: string;
  known: boolean;
};

type LiveSessionPayload = {
  status?: string;
  questions?: MissingQuestion[];
  messages?: string[];
};

const SUBMITTED_STATUS = "submitted";
const DELETED_STATUS = "deleted";
const READY_FILTER = "__ready_queue__";
const REVIEW_FILTER = "__review_statuses__";
const REVIEW_STATUSES = new Set([
  "review_started",
  "manual_review_required",
  "portal_auth_required",
  "company_portal_review",
  "external_apply_unresolved",
  "captcha_required",
]);

export default function ApplicationQueueClient() {
  const [items, setItems] = useState<ApplicationQueueItem[]>([]);
  const [source, setSource] = useState<"table" | "storage" | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<{
    key: "status" | "portal" | "run_mode" | null;
    value: string | null;
  }>({ key: null, value: null });

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/application-queue", {
        cache: "no-store",
      });
      const payload = (await response.json()) as QueueResponse;

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load applications");
      }

      setItems(payload.items ?? []);
      setSource(payload.source);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Failed to load applications"
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue]);

  const summary = useMemo(() => {
    const ready = items.filter(
      (item) => item.status !== SUBMITTED_STATUS && item.status !== DELETED_STATUS
    ).length;
    const inReview = items.filter((item) =>
      REVIEW_STATUSES.has(item.status ?? "")
    ).length;
    const planned = items.filter((item) => item.status === "planned").length;
    const submitted = items.filter((item) => item.status === SUBMITTED_STATUS).length;

    return { ready, inReview, planned, submitted };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!activeFilter.key || !activeFilter.value) {
      return items.filter(
        (item) => item.status !== SUBMITTED_STATUS && item.status !== DELETED_STATUS
      );
    }

    if (activeFilter.key === "status" && activeFilter.value === READY_FILTER) {
      return items.filter(
        (item) => item.status !== SUBMITTED_STATUS && item.status !== DELETED_STATUS
      );
    }

    if (activeFilter.key === "status" && activeFilter.value === REVIEW_FILTER) {
      return items.filter((item) => REVIEW_STATUSES.has(item.status ?? ""));
    }

    return items.filter((item) => item[activeFilter.key!] === activeFilter.value);
  }, [activeFilter, items]);

  const defaultQueueItems = useMemo(
    () =>
      items.filter(
        (item) => item.status !== SUBMITTED_STATUS && item.status !== DELETED_STATUS
      ),
    [items]
  );

  const resultTotal =
    !activeFilter.key || activeFilter.value === READY_FILTER
      ? defaultQueueItems.length
      : items.length;

  const resultLabel = isLoading
    ? "Loading..."
    : `${filteredItems.length} of ${resultTotal} result${
        resultTotal === 1 ? "" : "s"
      } shown`;

  const applyFilter = (
    key: "status" | "portal" | "run_mode",
    value?: string
  ) => {
    if (!value) return;

    setActiveFilter((current) =>
      current.key === key && current.value === value
        ? { key: null, value: null }
        : { key, value }
    );
  };

  const updateQueueItem = async (
    item: ApplicationQueueItem,
    updates: { status?: string; run_mode?: string }
  ) => {
    if (!item.id) {
      alert("This row is missing its application queue ID.");
      return;
    }

    setUpdatingId(item.id);
    setError(null);

    try {
      const response = await fetch("/api/application-queue", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...updates }),
      });
      const payload = (await response.json()) as QueueUpdateResponse;

      if (!response.ok || !payload.item) {
        throw new Error(payload.error ?? "Failed to update application");
      }

      const updatedItem = payload.item;

      setItems((current) =>
        current.map((currentItem) =>
          currentItem.id === updatedItem.id ? updatedItem : currentItem
        )
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Failed to update application"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteQueueItem = async (item: ApplicationQueueItem) => {
    const deleteKey = item.id ?? `${item.job_id}-${item.application_type}`;
    if (!deleteKey) {
      alert("This row is missing the information needed to delete it.");
      return;
    }

    setDeletingId(deleteKey);
    setError(null);

    try {
      const response = await fetch("/api/application-queue", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: item.id,
          job_id: item.job_id,
          application_type: item.application_type,
          source: item.source,
        }),
      });
      const payload = (await response.json()) as QueueDeleteResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "Failed to delete application");
      }

      setItems((current) =>
        current.filter((currentItem) => {
          const currentKey =
            currentItem.id ?? `${currentItem.job_id}-${currentItem.application_type}`;
          return currentKey !== deleteKey;
        })
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Failed to delete application"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-950">
              Applications
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Prepared Easy Apply and company portal application runs.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadQueue()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {source === "storage" && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>
              Showing storage fallback results. Once the application_queue table
              is active and populated, this page will read from the table.
            </p>
          </div>
        )}

        {error && (
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-4">
          <Metric
            label="Ready"
            value={summary.ready}
            active={
              !activeFilter.key ||
              (activeFilter.key === "status" && activeFilter.value === READY_FILTER)
            }
            onClick={() => applyFilter("status", READY_FILTER)}
          />
          <Metric
            label="In Review"
            value={summary.inReview}
            active={activeFilter.key === "status" && activeFilter.value === REVIEW_FILTER}
            onClick={() => applyFilter("status", REVIEW_FILTER)}
          />
          <Metric
            label="Planned"
            value={summary.planned}
            active={activeFilter.key === "status" && activeFilter.value === "planned"}
            onClick={() => applyFilter("status", "planned")}
          />
          <Metric
            label="Submitted"
            value={summary.submitted}
            active={activeFilter.key === "status" && activeFilter.value === SUBMITTED_STATUS}
            onClick={() => applyFilter("status", SUBMITTED_STATUS)}
          />
        </section>

        <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Application Queue
              </h2>
              <p className="mt-1 text-sm text-slate-500">{resultLabel}</p>
            </div>
            {activeFilter.key && activeFilter.value && (
              <button
                type="button"
                onClick={() => setActiveFilter({ key: null, value: null })}
                className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Clear filter
              </button>
            )}
          </div>

          {filteredItems.length === 0 && !isLoading ? (
            <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
              <div className="rounded-full bg-slate-100 p-5">
                <ClipboardCheck className="h-10 w-10 text-slate-400" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-950">
                No application runs yet
              </h3>
              <p className="mt-2 max-w-md text-sm text-slate-500">
                Run application_assistant.py in queue or prepare mode, then
                refresh this page to see planned and ready applications.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <ApplicationRow
                  key={item.id ?? `${item.job_id}-${item.created_at}`}
                  item={item}
                  activeFilter={activeFilter}
                  onFilter={applyFilter}
                  onUpdate={updateQueueItem}
                  onDelete={deleteQueueItem}
                  isUpdating={updatingId === item.id}
                  isDeleting={
                    deletingId === (item.id ?? `${item.job_id}-${item.application_type}`)
                  }
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function Metric({
  label,
  value,
  active,
  onClick,
}: {
  label: string;
  value: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border bg-white px-5 py-4 text-left shadow-sm transition hover:border-slate-300 hover:bg-slate-50 ${
        active ? "border-blue-300 ring-2 ring-blue-100" : "border-slate-200"
      }`}
    >
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-semibold text-slate-950">{value}</p>
    </button>
  );
}

function ApplicationRow({
  item,
  activeFilter,
  onFilter,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}: {
  item: ApplicationQueueItem;
  activeFilter: {
    key: "status" | "portal" | "run_mode" | null;
    value: string | null;
  };
  onFilter: (key: "status" | "portal" | "run_mode", value?: string) => void;
  onUpdate: (
    item: ApplicationQueueItem,
    updates: { status?: string; run_mode?: string }
  ) => Promise<void>;
  onDelete: (item: ApplicationQueueItem) => Promise<void>;
  isUpdating: boolean;
  isDeleting: boolean;
}) {
  const title = getNoteText(item, "job_title") ?? "Untitled job";
  const company = getNoteText(item, "company") ?? "Unknown company";
  const location = getNoteText(item, "location");
  const createdAt = formatDateTime(item.created_at);
  const missingQuestions = getMissingQuestions(item);
  const showAnswerAgent =
    missingQuestions.length > 0 ||
    ["manual_review_required", "review_started", "portal_auth_required", "company_portal_review"].includes(
      item.status ?? ""
    );
  const [isAnswerAgentOpen, setIsAnswerAgentOpen] = useState(showAnswerAgent);

  return (
    <article className="px-5 py-4">
      <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-base font-semibold text-slate-950">
              {title}
            </h3>
            {typeof item.score === "number" && (
              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                {item.score}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-slate-500">
            <span>{company}</span>
            {location && <span>{location}</span>}
            {createdAt && <span>{createdAt}</span>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <FilterBadge
              active={activeFilter.key === "status" && activeFilter.value === item.status}
              onClick={() => onFilter("status", item.status)}
            >
              {item.status ?? "unknown"}
            </FilterBadge>
            <FilterBadge
              active={activeFilter.key === "portal" && activeFilter.value === item.portal}
              onClick={() => onFilter("portal", item.portal)}
            >
              {item.portal ?? item.application_type ?? "portal"}
            </FilterBadge>
            <FilterBadge
              active={activeFilter.key === "run_mode" && activeFilter.value === item.run_mode}
              onClick={() => onFilter("run_mode", item.run_mode)}
            >
              {item.run_mode ?? "review"}
            </FilterBadge>
            {missingQuestions.length > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-amber-800 ring-1 ring-amber-200">
                <MessageSquareText className="h-3.5 w-3.5" />
                {missingQuestions.length} missing
              </span>
            )}
            {showAnswerAgent && missingQuestions.length === 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-blue-800 ring-1 ring-blue-200">
                <MessageSquareText className="h-3.5 w-3.5" />
                answer agent
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2 lg:justify-end">
          {item.status !== "review_started" && item.status !== "submitted" && (
            <button
              type="button"
              onClick={() =>
                void onUpdate(item, { status: "review_started", run_mode: "review" })
              }
              disabled={isUpdating}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="h-4 w-4" />
              Start Review
            </button>
          )}
          {item.resume_path && (
            <button
              type="button"
              onClick={() => void openResume(item)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
            >
              <FileText className="h-4 w-4" />
              Open Resume
            </button>
          )}
          {item.apply_url && (
            <a
              href={item.apply_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-950 px-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Open Job
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsAnswerAgentOpen((current) => !current)}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-800 transition hover:bg-amber-100"
          >
            <MessageSquareText className="h-4 w-4" />
            Answer Agent
          </button>
          {item.status !== "submitted" && (
            <button
              type="button"
              onClick={() => void onUpdate(item, { status: "submitted" })}
              disabled={isUpdating}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <CheckCircle2 className="h-4 w-4" />
              Mark Submitted
            </button>
          )}
          <button
            type="button"
            onClick={() => void onDelete(item)}
            disabled={isDeleting}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            title="Delete from queue"
            aria-label="Delete from queue"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
      {isAnswerAgentOpen && (
        <AnswerAgentPanel
          item={item}
          questions={missingQuestions}
          messages={getLastMessages(item)}
          status={item.status}
        />
      )}
    </article>
  );
}

function AnswerAgentPanel({
  item,
  questions,
  messages,
  status,
}: {
  item: ApplicationQueueItem;
  questions: MissingQuestion[];
  messages: string[];
  status?: string;
}) {
  const initialQuestions =
    questions.length > 0
      ? questions
      : [{ label: "", key: "new-question", suggestedAnswer: "", known: false }];
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      initialQuestions.map((question) => [
        question.key || normalizeQuestionKey(question.label),
        question.suggestedAnswer || "",
      ])
    )
  );
  const [customQuestions, setCustomQuestions] = useState<MissingQuestion[]>(initialQuestions);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingLiveAnswer, setIsSendingLiveAnswer] = useState(false);
  const [isLiveStarting, setIsLiveStarting] = useState(false);
  const [liveSessionId, setLiveSessionId] = useState("");
  const [liveSession, setLiveSession] = useState<LiveSessionPayload | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!liveSessionId) return;

    let stopped = false;
    const interval = window.setInterval(async () => {
      try {
        const response = await fetch(
          `/api/application-queue/live/status?sessionId=${encodeURIComponent(liveSessionId)}`,
          { cache: "no-store" }
        );
        const payload = await response.json();
        if (!response.ok || !payload.session || stopped) return;

        const session = payload.session as LiveSessionPayload;
        setLiveSession(session);
        if (session.status === "waiting_for_answers" && Array.isArray(session.questions)) {
          const nextQuestions = session.questions.map((question) => ({
            label: String(question.label || ""),
            key: String(question.key || normalizeQuestionKey(question.label || "")),
            suggestedAnswer: String(question.suggestedAnswer || ""),
            known: Boolean(question.known),
          }));
          if (nextQuestions.length > 0) {
            setCustomQuestions(nextQuestions);
          }
          setAnswers((current) => ({
            ...current,
            ...Object.fromEntries(
              nextQuestions.map((question) => [
                question.key,
                current[question.key] ?? question.suggestedAnswer ?? "",
              ])
            ),
          }));
          setMessage("Live agent is waiting for your answer.");
        }
        if (["submitted", "completed", "manual_review_required", "timeout", "captcha_required", "portal_auth_required", "otp_or_mfa_required", "llm_error", "agent_error", "max_steps_reached"].includes(session.status || "")) {
          setMessage(`Live agent status: ${session.status}`);
        }
      } catch {
        // Keep polling; the process may still be starting.
      }
    }, 1500);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, [liveSessionId]);

  async function saveAnswers() {
    setIsSaving(true);
    setMessage("");

    try {
      const currentResponse = await fetch("/api/settings", { cache: "no-store" });
      const currentPayload = await currentResponse.json();
      if (!currentResponse.ok) {
        throw new Error(currentPayload.error || "Could not load settings.");
      }

      const currentSettings = normalizeSettings(currentPayload.settings);
      const nextQuestionAnswers = { ...currentSettings.applicationQuestionAnswers };
      customQuestions.forEach((question) => {
        const questionKey = question.label.trim() ? question.label : question.key;
        const normalizedKey = normalizeQuestionKey(questionKey);
        const answer = answers[question.key] ?? "";
        const trimmedAnswer = answer.trim();
        if (normalizedKey && trimmedAnswer) nextQuestionAnswers[normalizedKey] = trimmedAnswer;
      });

      const saveResponse = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          settings: {
            ...currentSettings,
            applicationQuestionAnswers: nextQuestionAnswers,
          },
        }),
      });
      const savePayload = await saveResponse.json();
      if (!saveResponse.ok) {
        throw new Error(savePayload.error || "Could not save answers.");
      }

      setMessage("Saved. The next auto-apply run will reuse these answers.");
      return true;
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save answers.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function startLiveAgent() {
    if (!item.job_id) {
      setMessage("This application row is missing job_id.");
      return;
    }

    setIsLiveStarting(true);
      setMessage("Starting LLM apply agent...");
    try {
      const response = await fetch("/api/application-queue/live/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          job_id: item.job_id,
          portal: item.portal,
          application_type: item.application_type,
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok || !payload.sessionId) {
        throw new Error(payload.error || "Could not start live agent.");
      }
      setLiveSessionId(payload.sessionId);
      setLiveSession({ status: "starting" });
      setMessage("LLM apply agent started. It will fill/click automatically and ask only when it needs your input.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not start live agent.");
    } finally {
      setIsLiveStarting(false);
    }
  }

  async function sendLiveAnswers() {
    if (!liveSessionId) {
      setMessage("Start live agent first.");
      return;
    }

    setIsSendingLiveAnswer(true);
    setMessage("Sending answer to the live agent...");
    try {
      const response = await fetch("/api/application-queue/live/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: liveSessionId,
          answers: customQuestions.map((question) => ({
            key: question.key,
            label: question.label,
            answer: answers[question.key] ?? "",
          })),
        }),
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Could not send live answer.");
      }
      setMessage("Answer sent. Live agent is continuing this application now.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not send live answer.");
    } finally {
      setIsSendingLiveAnswer(false);
    }
  }

  const liveQuestions =
    liveSession?.status === "waiting_for_answers"
      ? customQuestions.filter((question) => question.label.trim())
      : [];
  const isLiveFinished = ["submitted", "completed", "manual_review_required", "timeout", "captcha_required", "portal_auth_required", "otp_or_mfa_required", "llm_error", "agent_error", "max_steps_reached"].includes(
    liveSession?.status || ""
  );

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
          <MessageSquareText className="h-4 w-4" />
          LLM apply agent
        </div>
        {status && (
          <span className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200">
            {status}
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-amber-900">
        Starts a real LLM browser agent for this job. It reads the page, fills known fields, uploads the resume, clicks through the application, and asks you only when an answer is genuinely missing.
      </p>

      <div className="mt-3 space-y-3 rounded-lg border border-amber-200 bg-white p-3">
        <div className="flex justify-start">
          <div className="max-w-3xl rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-800">
            {liveSession
              ? `Live status: ${liveSession.status || "starting"}`
              : "Ready. Click Start LLM Apply Agent. It will drive the application and pause here only for unknown answers."}
          </div>
        </div>

        {liveQuestions.map((question, index) => {
          const key = question.key || normalizeQuestionKey(question.label);
          return (
            <div key={`${key}-${index}`} className="space-y-2">
              <div className="flex justify-start">
                <div className="max-w-3xl rounded-lg bg-blue-50 px-3 py-2 text-sm font-medium text-blue-950 ring-1 ring-blue-100">
                  {question.label}
                </div>
              </div>
              <label className="grid gap-1">
                <span className="sr-only">Answer</span>
              <input
                value={answers[key] ?? ""}
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [key]: event.target.value }))
                }
                placeholder="Type the answer and click Send Answer & Continue"
                className="h-11 rounded-lg border border-blue-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
            </div>
          );
        })}

        {liveSession?.messages && liveSession.messages.length > 0 && (
          <details className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-800">Automation notes</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {liveSession.messages.slice(-6).map((lastMessage, index) => (
                <li key={`${lastMessage}-${index}`}>{lastMessage}</li>
              ))}
            </ul>
          </details>
        )}

        {!liveSession && messages.length > 0 && (
          <details className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
            <summary className="cursor-pointer font-semibold text-slate-800">Last automation notes</summary>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              {messages.slice(-4).map((lastMessage, index) => (
                <li key={`${lastMessage}-${index}`}>{lastMessage}</li>
              ))}
            </ul>
          </details>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void startLiveAgent()}
          disabled={isLiveStarting || Boolean(liveSessionId && !isLiveFinished)}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLiveStarting ? "Starting..." : liveSessionId && !isLiveFinished ? "LLM Agent Running" : "Start LLM Apply Agent"}
        </button>
        <button
          type="button"
          onClick={() => void sendLiveAnswers()}
          disabled={!liveSessionId || liveQuestions.length === 0 || isSendingLiveAnswer}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSendingLiveAnswer ? "Sending..." : "Send Answer & Continue"}
        </button>
        <button
          type="button"
          onClick={() => void saveAnswers()}
          disabled={liveQuestions.length === 0 || isSaving || isSendingLiveAnswer}
          className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save for Future"}
        </button>
        {message && <span className="text-sm text-amber-900">{message}</span>}
      </div>
    </div>
  );
}

function FilterBadge({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-2.5 py-1 transition ${
        active
          ? "bg-blue-100 text-blue-800 ring-1 ring-blue-200"
          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}

async function openResume(item: ApplicationQueueItem) {
  if (!item.customized_resume_id) {
    alert("Resume ID is missing for this queued application.");
    return;
  }

  const response = await fetch(
    `/api/customized_resumes/${item.customized_resume_id}/signed-url`,
    { cache: "no-store" }
  );
  const payload = (await response.json()) as {
    signedUrl?: string;
    error?: string;
    details?: string;
  };

  if (!response.ok || !payload.signedUrl) {
    alert(payload.details ?? payload.error ?? "Could not open resume.");
    return;
  }

  window.open(payload.signedUrl, "_blank", "noopener,noreferrer");
}

function getNoteText(item: ApplicationQueueItem, key: string) {
  const value = item.notes?.[key];
  return typeof value === "string" && value.trim() ? value : undefined;
}

function getMissingQuestions(item: ApplicationQueueItem): MissingQuestion[] {
  const value = item.notes?.missing_questions;
  if (!Array.isArray(value)) return [];

  return value
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const record = entry as Record<string, unknown>;
      const label = typeof record.label === "string" ? record.label.trim() : "";
      const key =
        typeof record.key === "string" && record.key.trim()
          ? record.key.trim()
          : normalizeQuestionKey(label);
      if (!label || !key) return null;
      return {
        label,
        key,
        suggestedAnswer:
          typeof record.suggestedAnswer === "string" ? record.suggestedAnswer : "",
        known: Boolean(record.known),
      };
    })
    .filter((question): question is MissingQuestion => Boolean(question));
}

function getLastMessages(item: ApplicationQueueItem) {
  const value = item.notes?.last_messages;
  if (!Array.isArray(value)) return [];
  return value
    .map((message) => (typeof message === "string" ? message.trim() : ""))
    .filter(Boolean);
}

function formatDateTime(value?: string) {
  if (!value) return undefined;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
    hour12: true,
  }).format(date);
}
