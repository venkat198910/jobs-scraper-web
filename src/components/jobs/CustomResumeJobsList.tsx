import { getCustomResumeJobs } from "@/lib/supabase/queries";
import JobDetailsClient from "@/components/jobs/JobDetailsClient";

export default async function CustomResumeJobsList() {
  const jobs = await getCustomResumeJobs();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Jobs with Custom Resumes</h1>
      {jobs.length === 0 ? (
        <div className="text-gray-500">No jobs with custom resumes found.</div>
      ) : (
        <div className="grid gap-4">
          {jobs.map((job) => (
            <JobDetailsClient key={job.job_id} initialJob={job} />
          ))}
        </div>
      )}
    </div>
  );
}
