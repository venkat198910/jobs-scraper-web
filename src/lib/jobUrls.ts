import { Job } from "@/types";

const KNOWN_DIRECT_JOB_URLS = new Map([
  [
    "synopsys|senior staff site reliability engineer",
    "https://careers.synopsys.com/job/bengaluru/senior-staff-site-reliability-engineer/44408/95947919824",
  ],
]);

function normalizeLookupText(value?: string | null) {
  return (value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeCompany(value?: string | null) {
  return normalizeLookupText(value).replace(
    /\s+(?:inc|incorporated|ltd|limited)$/,
    ""
  );
}

export function getKnownDirectJobUrl(
  company?: string | null,
  jobTitle?: string | null,
  currentUrl?: string | null
) {
  if (currentUrl) {
    try {
      const parsed = new URL(currentUrl);
      if (
        parsed.hostname.toLowerCase() === "careers.synopsys.com" &&
        parsed.pathname.replace(/\/+$/, "")
      ) {
        return null;
      }
    } catch {
      return null;
    }
  }

  return (
    KNOWN_DIRECT_JOB_URLS.get(
      `${normalizeCompany(company)}|${normalizeLookupText(jobTitle)}`
    ) ?? null
  );
}

function getGreenhouseUrl(jobId: string) {
  const match = jobId.match(/^greenhouse-(.+)-(\d+)$/);
  if (!match) {
    return null;
  }

  return `https://job-boards.greenhouse.io/${match[1]}/jobs/${match[2]}`;
}

export function getJobListingUrl(job: Job) {
  const storedUrl = job.apply_url || job.job_url || job.career_url;
  const knownDirectUrl = getKnownDirectJobUrl(
    job.company,
    job.job_title,
    storedUrl
  );
  if (knownDirectUrl) {
    return knownDirectUrl;
  }

  if (storedUrl) {
    return storedUrl;
  }

  if (job.provider === "careers_future") {
    return `https://www.mycareersfuture.gov.sg/job/${job.job_id}`;
  }

  if (job.provider === "company_careers_greenhouse") {
    return getGreenhouseUrl(job.job_id) || "#";
  }

  if ((job.provider || "").startsWith("company_careers")) {
    return "#";
  }

  return `https://www.linkedin.com/jobs/view/${job.job_id}`;
}
