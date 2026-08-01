import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { getDynamicCompanyMetadata } from "@/lib/companyMetadata";
import { getKnownDirectJobUrl } from "@/lib/jobUrls";

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
  cover_letter_path?: string;
  cover_letter_status?: string;
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
        const items = await enrichQueueItemsWithCompanyMetadata(
          await getStorageQueueItems(supabase)
        );
        return NextResponse.json({
          items,
          source: "storage",
          storageFallback: true,
        });
      }

      throw error;
    }

    const itemsWithUrls = await enrichQueueItemsWithJobUrls(supabase, data ?? []);
    const items = await enrichQueueItemsWithCompanyMetadata(
      itemsWithUrls.map((item) => normalizeItem(item, "table"))
    );

    return NextResponse.json({
      items,
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
  const portal = asString(item.portal);
  const jobId = asString(item.job_id);
  const storedApplyUrl = asString(item.apply_url) ?? noteApplyUrl;
  const knownDirectUrl = getKnownDirectJobUrl(
    asString(notes.company),
    asString(notes.job_title),
    storedApplyUrl
  );

  return {
    id: asString(item.id),
    job_id: jobId,
    customized_resume_id: asString(item.customized_resume_id),
    application_type: asString(item.application_type),
    portal,
    status: asString(item.status),
    run_mode: asString(item.run_mode),
    apply_url:
      knownDirectUrl ??
      storedApplyUrl ??
      deriveProviderJobUrl(jobId, portal),
    resume_path: asString(item.resume_path),
    cover_letter_path:
      asString(item.cover_letter_path) ?? asString(notes.cover_letter_path),
    cover_letter_status:
      asString(item.cover_letter_status) ?? asString(notes.cover_letter_status),
    score: asNumber(item.score),
    notes,
    created_at: asString(item.created_at),
    updated_at: asString(item.updated_at),
    source,
  };
}

async function enrichQueueItemsWithCompanyMetadata(items: ApplicationQueueItem[]) {
  const uniqueCompanies = Array.from(
    new Set(
      items
        .map((item) => asString(item.notes?.company))
        .filter((company): company is string => Boolean(company))
    )
  );

  const metadataEntries = await Promise.all(
    uniqueCompanies.map(async (company) => [
      company,
      await getDynamicCompanyMetadata(company),
    ] as const)
  );
  const metadataByCompany = new Map(metadataEntries);

  return items.map((item) => {
    const company = asString(item.notes?.company);
    const companyMetadata = company ? metadataByCompany.get(company) : undefined;
    if (!companyMetadata) return item;

    return {
      ...item,
      notes: {
        ...(item.notes ?? {}),
        company_metadata: companyMetadata,
      },
    };
  });
}

function deriveProviderJobUrl(jobId?: string, portal?: string) {
  const provider = (portal ?? "").toLowerCase();
  if (!jobId || !["naukri", "naukri_gulf"].includes(provider)) {
    return undefined;
  }

  const match = jobId.match(/(\d{8,})/);
  if (!match) return undefined;

  const host =
    provider === "naukri_gulf" ? "www.naukrigulf.com" : "www.naukri.com";
  return `https://${host}/job-listings-${match[1]}`;
}

async function enrichQueueItemsWithJobUrls(
  supabase: SupabaseClient,
  items: Record<string, unknown>[]
) {
  const missingUrlJobIds = Array.from(
    new Set(
      items
        .filter(
          (item) => {
            const applyUrl = asString(item.apply_url);
            return (
              (!applyUrl &&
                !deriveProviderJobUrl(
                  asString(item.job_id),
                  asString(item.portal)
                )) ||
              isWeakApplicationUrl(
                applyUrl,
                asString(item.portal),
                asString(item.job_id)
              )
            );
          }
        )
        .map((item) => asString(item.job_id))
        .filter((jobId): jobId is string => Boolean(jobId))
    )
  );

  if (missingUrlJobIds.length === 0) return items;

  let { data, error }: {
    data: Record<string, unknown>[] | null;
    error: { code?: string; message?: string } | null;
  } = await supabase
    .from(JOBS_TABLE)
    .select("job_id,company,job_title,apply_url,job_url,career_url")
    .in("job_id", missingUrlJobIds);

  if (isMissingColumnError(error, "apply_url")) {
    const fallback = await supabase
      .from(JOBS_TABLE)
      .select("job_id,company,job_title,job_url,career_url")
      .in("job_id", missingUrlJobIds);
    data = fallback.data;
    error = fallback.error;
  }

  if (error) {
    console.error("Error enriching queue job URLs:", error);
    return items;
  }

  const urlsByJobId = new Map(
    (data ?? [])
      .map((job) => {
        const jobId = asString(job.job_id);
        const url =
          getKnownDirectJobUrl(
            asString(job.company),
            asString(job.job_title),
            asString(job.apply_url) ??
              asString(job.job_url) ??
              asString(job.career_url)
          ) ??
          asString(job.apply_url) ??
          asString(job.job_url) ??
          asString(job.career_url);
        return jobId && url ? [jobId, url] : null;
      })
      .filter((entry): entry is [string, string] => Boolean(entry))
  );

  const resolvedWeakUrls = new Map(
    (
      await Promise.all(
        items.map(async (item) => {
          const jobId = asString(item.job_id);
          if (!jobId) return null;
          const currentUrl = urlsByJobId.get(jobId) ?? asString(item.apply_url);
          const resolvedUrl = await resolveKnownAtsJobUrl(item, currentUrl);
          return resolvedUrl ? [jobId, resolvedUrl] : null;
        })
      )
    ).filter((entry): entry is [string, string] => Boolean(entry))
  );

  return items.map((item) => {
    const jobId = asString(item.job_id);
    const applyUrl = jobId ? resolvedWeakUrls.get(jobId) ?? urlsByJobId.get(jobId) : undefined;
    return applyUrl ? { ...item, apply_url: applyUrl } : item;
  });
}

function isWeakApplicationUrl(value?: string, portal?: string, jobId?: string) {
  if (!value) return false;
  try {
    const parsed = new URL(value);
    const host = parsed.hostname.toLowerCase();
    const path = parsed.pathname.replace(/\/+$/, "");
    if (host === "careers.synopsys.com" && path === "") return true;
    if ((portal ?? "").toLowerCase() === "workday" || (jobId ?? "").startsWith("workday-")) {
      return path === "" || /^\/[^/]+$/.test(path);
    }
    return false;
  } catch {
    return false;
  }
}

async function resolveKnownAtsJobUrl(item: Record<string, unknown>, currentUrl?: string) {
  const jobId = asString(item.job_id);
  if (!jobId || !currentUrl || !isWeakApplicationUrl(currentUrl, asString(item.portal), jobId)) {
    return undefined;
  }

  return resolveWorkdayJobUrl(jobId, currentUrl);
}

async function resolveWorkdayJobUrl(jobId: string, currentUrl: string) {
  const match = jobId.match(/^workday-([^-]+)-(.+)$/i);
  if (!match) return undefined;

  const tenant = match[1];
  const siteAndRequisition = match[2];

  let parsedCurrentUrl: URL;
  try {
    parsedCurrentUrl = new URL(currentUrl);
  } catch {
    return undefined;
  }

  if (!/\.myworkdayjobs\.com$/i.test(parsedCurrentUrl.hostname)) {
    return undefined;
  }

  const currentSite = parsedCurrentUrl.pathname.split("/").filter(Boolean)[0];
  const site =
    currentSite && siteAndRequisition.toLowerCase().startsWith(`${currentSite.toLowerCase()}-`)
      ? currentSite
      : siteAndRequisition.replace(/-[^-]+$/, "");
  const requisitionId = siteAndRequisition.slice(site.length + 1);
  if (!site || !requisitionId) return undefined;

  const listUrl = `https://${parsedCurrentUrl.hostname}/wday/cxs/${tenant}/${site}/jobs`;
  try {
    const response = await fetch(listUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        appliedFacets: {},
        limit: 50,
        offset: 0,
        searchText: requisitionId.toUpperCase(),
      }),
      next: { revalidate: 60 * 60 * 24 },
    });
    if (!response.ok) return undefined;
    const json = (await response.json()) as {
      jobPostings?: Array<{ externalPath?: string; title?: string; bulletFields?: string[] }>;
    };
    const normalizedReq = requisitionId.toLowerCase();
    const posting = (json.jobPostings ?? []).find((candidate) => {
      const text = `${candidate.externalPath ?? ""} ${candidate.title ?? ""} ${(candidate.bulletFields ?? []).join(" ")}`.toLowerCase();
      return text.includes(normalizedReq);
    });
    const externalPath = posting?.externalPath;
    if (!externalPath) return undefined;
    if (externalPath.startsWith("http")) return externalPath;
    if (externalPath.startsWith("/job/")) {
      return `https://${parsedCurrentUrl.hostname}/${site}${externalPath}`;
    }
    return `https://${parsedCurrentUrl.hostname}${externalPath}`;
  } catch {
    return undefined;
  }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function isMissingColumnError(
  error: { code?: string; message?: string } | null,
  columnName: string
) {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "42703" ||
    message.includes(`column jobs.${columnName}`) ||
    message.includes(`'${columnName}' column`)
  );
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
