import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";

const QUEUE_TABLE = "application_queue";
const JOBS_TABLE = "jobs";
const QUEUE_BUCKET = "resumes";
const QUEUE_PREFIX = "application_queue";
const DELETED_STATUS = "deleted";
const SUBMITTED_STATUS = "submitted";

type SupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

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
  updated_at?: string;
  source?: "table" | "storage";
};

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(QUEUE_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      if (isMissingTableError(error)) {
        const items = await getStorageQueueItems(supabase);
        return NextResponse.json({
          items,
          source: "storage",
          storageFallback: true,
        });
      }

      throw error;
    }

    return NextResponse.json({
      items: (data ?? []).map((item) => normalizeItem(item, "table")),
      source: "table",
      storageFallback: false,
    });
  } catch (error) {
    console.error("Error loading application queue:", error);
    return NextResponse.json(
      {
        items: [],
        error:
          error instanceof Error
            ? error.message
            : "Failed to load application queue",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      status?: string;
      run_mode?: string;
    };

    if (!body.id) {
      return NextResponse.json(
        { error: "Application queue ID is required" },
        { status: 400 }
      );
    }

    const updates: Record<string, string> = {};
    if (body.status) updates.status = body.status;
    if (body.run_mode) updates.run_mode = body.run_mode;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No supported updates were provided" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(QUEUE_TABLE)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", body.id)
      .select("*")
      .single();

    if (error) throw error;

    if (updates.status === SUBMITTED_STATUS && data?.job_id) {
      const { error: jobUpdateError } = await supabase
        .from(JOBS_TABLE)
        .update({
          status: "applied",
          application_date: new Date().toISOString(),
          job_state: "new",
          is_active: true,
        })
        .eq("job_id", data.job_id);

      if (jobUpdateError) {
        console.error("Error marking submitted queue job as applied:", jobUpdateError);
      }
    }

    return NextResponse.json({
      item: normalizeItem(data, "table"),
    });
  } catch (error) {
    console.error("Error updating application queue:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update application queue",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      id?: string;
      job_id?: string;
      application_type?: string;
      source?: "table" | "storage";
    };

    const supabase = await createSupabaseServerClient();

    if (body.source === "storage") {
      if (!body.job_id || !body.application_type) {
        return NextResponse.json(
          { error: "job_id and application_type are required for storage deletes" },
          { status: 400 }
        );
      }

      const path = `${QUEUE_PREFIX}/${body.job_id}_${body.application_type}.json`;
      const { error } = await supabase.storage.from(QUEUE_BUCKET).remove([path]);

      if (error) throw error;

      return NextResponse.json({ ok: true });
    }

    if (!body.id) {
      return NextResponse.json(
        { error: "Application queue ID is required" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from(QUEUE_TABLE)
      .update({
        status: DELETED_STATUS,
        run_mode: "dismissed",
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id);

    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting application queue item:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to delete application queue item",
      },
      { status: 500 }
    );
  }
}

function isMissingTableError(error: { code?: string; message?: string }) {
  return (
    error.code === "42P01" ||
    /application_queue|schema cache|does not exist/i.test(error.message || "")
  );
}

async function getStorageQueueItems(supabase: SupabaseClient) {
  const { data, error } = await supabase.storage
    .from(QUEUE_BUCKET)
    .list(QUEUE_PREFIX, {
      limit: 100,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (error || !data?.length) return [];

  const items = await Promise.all(
    data
      .filter((file) => file.name.endsWith(".json"))
      .map(async (file) => {
        try {
          const { data: blob, error: downloadError } = await supabase.storage
            .from(QUEUE_BUCKET)
            .download(`${QUEUE_PREFIX}/${file.name}`);

          if (downloadError || !blob) return null;

          const parsed = JSON.parse(await blob.text());
          return normalizeItem(
            {
              ...parsed,
              created_at: parsed.created_at ?? file.created_at,
              updated_at: parsed.updated_at ?? file.updated_at,
            },
            "storage"
          );
        } catch {
          return null;
        }
      })
  );

  return items
    .filter((item): item is ApplicationQueueItem => item !== null)
    .sort((a, b) => {
      const aTime = new Date(a.created_at ?? 0).getTime();
      const bTime = new Date(b.created_at ?? 0).getTime();
      return bTime - aTime;
    });
}

function normalizeItem(
  item: Record<string, unknown>,
  source: "table" | "storage"
): ApplicationQueueItem {
  const notes = asRecord(item.notes) ?? {};
  const noteApplyUrl =
    asString(notes.resolved_apply_url) ??
    asString(notes.backfilled_apply_url) ??
    asString(notes.apply_url);

  return {
    id: asString(item.id),
    job_id: asString(item.job_id),
    customized_resume_id: asString(item.customized_resume_id),
    application_type: asString(item.application_type),
    portal: asString(item.portal),
    status: asString(item.status),
    run_mode: asString(item.run_mode),
    apply_url: asString(item.apply_url) ?? noteApplyUrl,
    resume_path: asString(item.resume_path),
    score: asNumber(item.score),
    notes,
    created_at: asString(item.created_at),
    updated_at: asString(item.updated_at),
    source,
  };
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown) {
  return typeof value === "number" ? value : undefined;
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as Record<string, unknown>;
}
