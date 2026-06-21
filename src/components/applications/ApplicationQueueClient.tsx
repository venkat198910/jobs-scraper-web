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
    const ready = items.filter((item) => item.status === "application_ready").length;
    const inReview = items.filter((item) => item.status === "review_started").length;
    const planned = items.filter((item) => item.status === "planned").length;
    const submitted = items.filter((item) => item.status === "submitted").length;

    return { ready, inReview, planned, submitted };
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!activeFilter.key || !activeFilter.value) return items;

    return items.filter((item) => item[activeFilter.key!] === activeFilter.value);
  }, [activeFilter, items]);

  const resultLabel = isLoading
    ? "Loading..."
    : `${filteredItems.length} of ${items.length} result${
        items.length === 1 ? "" : "s"
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
            active={activeFilter.key === "status" && activeFilter.value === "application_ready"}
            onClick={() => applyFilter("status", "application_ready")}
          />
          <Metric
            label="In Review"
            value={summary.inReview}
            active={activeFilter.key === "status" && activeFilter.value === "review_started"}
            onClick={() => applyFilter("status", "review_started")}
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
            active={activeFilter.key === "status" && activeFilter.value === "submitted"}
            onClick={() => applyFilter("status", "submitted")}
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
      {missingQuestions.length > 0 && <MissingQuestionsPanel questions={missingQuestions} />}
    </article>
  );
}

function MissingQuestionsPanel({ questions }: { questions: MissingQuestion[] }) {
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      questions.map((question) => [
        question.key || normalizeQuestionKey(question.label),
        question.suggestedAnswer || "",
      ])
    )
  );
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

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
      Object.entries(answers).forEach(([key, answer]) => {
        const normalizedKey = normalizeQuestionKey(key);
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

      setMessage("Saved for future auto-apply runs.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save answers.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-amber-950">
        <MessageSquareText className="h-4 w-4" />
        Missing application details
      </div>
      <div className="mt-3 grid gap-3">
        {questions.map((question) => {
          const key = question.key || normalizeQuestionKey(question.label);
          return (
            <label key={key} className="grid gap-1 text-sm">
              <span className="font-medium text-slate-800">{question.label}</span>
              <input
                value={answers[key] ?? ""}
                onChange={(event) =>
                  setAnswers((current) => ({ ...current, [key]: event.target.value }))
                }
                placeholder="Answer once and save"
                className="h-10 rounded-lg border border-amber-200 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </label>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void saveAnswers()}
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? "Saving..." : "Save Answers"}
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
