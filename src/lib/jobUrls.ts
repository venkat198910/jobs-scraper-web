import { Job } from "@/types";

function getGreenhouseUrl(jobId: string) {
  const match = jobId.match(/^greenhouse-(.+)-(\d+)$/);
  if (!match) {
    return null;
  }

  return `https://job-boards.greenhouse.io/${match[1]}/jobs/${match[2]}`;
}

export function getJobListingUrl(job: Job) {
  if (job.apply_url || job.job_url || job.career_url) {
    return job.apply_url || job.job_url || job.career_url || "#";
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
