import { Job } from "@/types";

const KNOWN_DIRECT_JOB_URLS = new Map([
  [
    "synopsys|senior staff site reliability engineer",
    "https://synopsys.avature.net/careers/Login?formValues=&jobId=17592&source=&tags=&user=",
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
  const knownUrl =
    KNOWN_DIRECT_JOB_URLS.get(
      `${normalizeCompany(company)}|${normalizeLookupText(jobTitle)}`
    ) ?? null;
  if (!knownUrl || !currentUrl) {
    return knownUrl;
  }

  try {
    const parsed = new URL(currentUrl);
    return parsed.hostname.toLowerCase() === "careers.synopsys.com"
      ? knownUrl
      : null;
  } catch {
    return null;
  }
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
