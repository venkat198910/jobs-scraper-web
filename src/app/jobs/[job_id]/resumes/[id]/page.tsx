import CustomPdfViewer from "@/components/CustomPdfViewer";
import { getCustomizedResumeById, getJobById } from "@/lib/supabase/queries";
import { getSignedUrl } from "@/lib/supabase/storage";
import { Resume } from "@/types";
import { notFound } from "next/navigation";

type Params = {
  params: Promise<{ job_id: string; id: string }>;
};

export default async function ResumeView({ params }: Params) {
  const { job_id, id } = await params;

  try {
    let resume_data: Resume | null = await getCustomizedResumeById(id);

    if (!resume_data) {
      const job = await getJobById(job_id);
      const fallbackResumeId = job?.customized_resume_id;
      if (fallbackResumeId && fallbackResumeId !== id) {
        resume_data = await getCustomizedResumeById(fallbackResumeId);
      }
    }

    if (!resume_data) return notFound();

    let signedUrl = "";
    if (resume_data.resume_link) {
      // The resume_link now stores the file name, e.g., 'resume_123.pdf'
      // These are stored in 'personalized_resumes' bucket.
      const storagePath = resume_data.resume_link;
      try {
        signedUrl = await getSignedUrl(storagePath);
      } catch (err) {
        console.error("Failed to get signed URL for resume:", err);
      }
    }

    return <CustomPdfViewer fileUrl={signedUrl} jobId={job_id} />;
  } catch (error) {
    console.error("Error getting resume:", error);
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-xl font-bold text-red-500">Error Loading Resume</h1>
        <p className="text-gray-600">Please try again later.</p>
      </div>
    </div>
  );
}
