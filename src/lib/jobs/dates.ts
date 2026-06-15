import { Job } from "@/types";

export function getJobPostingDate(job: Job): string | null {
  return job.posted_at || job.posted_date || job.published_at || job.scraped_at || null;
}

export function formatJobDate(dateString: string | null | undefined): string {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
    timeZoneName: "short",
  }).format(date);
}
