import React from "react";
import { getCustomResumeJobs } from "@/lib/supabase/queries";
import JobDetailsClient from "@/components/jobs/JobDetailsClient";

export default async function CustomResumesPage() {
  // Fetch jobs with a custom resume
  const jobs = await getCustomResumeJobs();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Jobs with Custom Resumes</h1>
      {jobs.length === 0 ? (
        <div className="text-gray-500">No jobs with custom resumes found.</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job: any) => (
            <JobDetailsClient key={job.id} initialJob={job} />
          ))}
        </div>
      )}
    </div>
  );
}
