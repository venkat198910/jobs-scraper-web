import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";
import { getSignedUrl } from "@/lib/supabase/storage";
import { createSupabaseServerClient } from "@/utils/supabase/server";

export const runtime = "nodejs";

const QUEUE_TABLE = "application_queue";
const JOBS_TABLE = "jobs";
const RESUME_TABLE = "customized_resumes";
const COVER_BUCKET = "personalized_resumes";

type RecordValue = Record<string, unknown>;

export async function GET(request: NextRequest) {
  try {
    const path = request.nextUrl.searchParams.get("path")?.trim();
    if (!path) {
      return NextResponse.json(
        { error: "Cover letter path is required" },
        { status: 400 }
      );
    }

    const signedUrl = await getSignedUrl(path, COVER_BUCKET);
    return NextResponse.json({ signedUrl });
  } catch (error) {
    console.error("Error opening cover letter:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to open cover letter",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { id?: string };
    if (!body.id) {
      return NextResponse.json(
        { error: "Application queue ID is required" },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();
    const { data: queueItem, error: queueError } = await supabase
      .from(QUEUE_TABLE)
      .select("*")
      .eq("id", body.id)
      .single();

    if (queueError || !queueItem) {
      throw queueError ?? new Error("Application queue item not found");
    }

    const notes = asRecord(queueItem.notes) ?? {};
    const jobId = asString(queueItem.job_id);
    const resumeId = asString(queueItem.customized_resume_id);

    const [job, resume] = await Promise.all([
      fetchJob(supabase, jobId),
      fetchResume(supabase, resumeId),
    ]);

    const coverLetter = buildCoverLetter({
      queueItem,
      notes,
      job,
      resume,
    });
    const pdf = await renderCoverLetterPdf(coverLetter);
    const path = buildCoverLetterPath(queueItem, notes, job);

    const { error: uploadError } = await supabase.storage
      .from(COVER_BUCKET)
      .upload(path, pdf, {
        contentType: "application/pdf",
        upsert: true,
      });

    if (uploadError) throw uploadError;

    const updatedNotes = {
      ...notes,
      cover_letter_path: path,
      cover_letter_status: "generated",
      cover_letter_generated_at: new Date().toISOString(),
    };

    const { data: updatedItem, error: updateError } = await supabase
      .from(QUEUE_TABLE)
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", body.id)
      .select("*")
      .single();

    if (updateError) throw updateError;

    const signedUrl = await getSignedUrl(path, COVER_BUCKET);

    return NextResponse.json({
      item: {
        ...updatedItem,
        cover_letter_path: path,
        cover_letter_status: "generated",
      },
      signedUrl,
    });
  } catch (error) {
    console.error("Error generating cover letter:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate cover letter",
      },
      { status: 500 }
    );
  }
}

async function fetchJob(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  jobId?: string
) {
  if (!jobId) return undefined;
  const { data, error } = await supabase
    .from(JOBS_TABLE)
    .select("*")
    .eq("job_id", jobId)
    .maybeSingle();

  if (error) {
    console.error("Error loading job for cover letter:", error);
    return undefined;
  }

  return data ?? undefined;
}

async function fetchResume(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  resumeId?: string
) {
  if (!resumeId) return undefined;
  const { data, error } = await supabase
    .from(RESUME_TABLE)
    .select("*")
    .eq("id", resumeId)
    .maybeSingle();

  if (error) {
    console.error("Error loading resume for cover letter:", error);
    return undefined;
  }

  return data ?? undefined;
}

function buildCoverLetter({
  queueItem,
  notes,
  job,
  resume,
}: {
  queueItem: RecordValue;
  notes: RecordValue;
  job?: RecordValue;
  resume?: RecordValue;
}) {
  const candidateName =
    asString(resume?.name) ??
    asString(resume?.full_name) ??
    "Venkateswarlu Derangula";
  const email = asString(resume?.email) ?? "vderangula44@gmail.com";
  const phone = asString(resume?.phone) ?? "+91 7780569119";
  const linkedIn =
    asString(resume?.linkedin) ??
    asString(resume?.linkedin_url) ??
    "https://www.linkedin.com/in/venkateswarlu-derangula/";

  const title =
    asString(job?.title) ??
    asString(job?.job_title) ??
    asString(notes.job_title) ??
    "the advertised role";
  const company =
    asString(job?.company) ??
    asString(job?.company_name) ??
    asString(notes.company) ??
    "your team";
  const location =
    asString(job?.location) ??
    asString(notes.location) ??
    "the listed location";
  const jd =
    asString(job?.description) ??
    asString(job?.job_description) ??
    asString(job?.description_text) ??
    asString(notes.job_description) ??
    "";
  const emphasis = pickEmphasis(`${title}\n${jd}`);

  return {
    candidateName,
    email,
    phone,
    linkedIn,
    title,
    company,
    paragraphs: [
      `Dear Hiring Manager,`,
      `I am excited to apply for the ${title} role at ${company}. With around 10 years of experience across DevOps, SRE, cloud infrastructure, Kubernetes, Terraform, and CI/CD automation, I can contribute quickly to teams building reliable and scalable platforms.`,
      `The role appears to value ${emphasis}. My recent work includes designing production-grade cloud automation, improving release reliability, managing Kubernetes-based platforms, and strengthening observability and deployment practices for business-critical systems.`,
      `I bring hands-on experience with AWS, Azure/GCP-aligned cloud practices, Jenkins, GitHub Actions, Docker, monitoring stacks, and infrastructure as code. I am based in Bengaluru and open to opportunities aligned with ${location}.`,
      `Thank you for considering my application. I would welcome the opportunity to discuss how my platform engineering and automation background can support ${company}'s engineering goals.`,
      `Sincerely,`,
      candidateName,
    ],
  };
}

async function renderCoverLetterPdf(letter: ReturnType<typeof buildCoverLetter>) {
  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 54,
      bottom: 54,
      left: 58,
      right: 58,
    },
    info: {
      Title: `${letter.candidateName} - Cover Letter`,
      Author: letter.candidateName,
      Subject: letter.title,
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc
    .font("Helvetica-Bold")
    .fontSize(18)
    .text(letter.candidateName.toUpperCase(), { align: "center" });
  doc.moveDown(0.2);
  doc
    .font("Helvetica")
    .fontSize(9.5)
    .fillColor("#334155")
    .text(`${letter.email}  |  ${letter.phone}  |  ${letter.linkedIn}`, {
      align: "center",
    });

  doc.moveDown(1.6);
  doc
    .font("Helvetica-Bold")
    .fontSize(14)
    .fillColor("#0f172a")
    .text(`Cover Letter - ${letter.title}`, { align: "left" });
  doc
    .moveTo(doc.page.margins.left, doc.y + 6)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y + 6)
    .strokeColor("#94a3b8")
    .lineWidth(0.75)
    .stroke();
  doc.moveDown(1.2);

  letter.paragraphs.forEach((paragraph, index) => {
    const isSignature = index >= letter.paragraphs.length - 2;
    doc
      .font(isSignature ? "Helvetica-Bold" : "Helvetica")
      .fontSize(11)
      .fillColor("#111827")
      .text(paragraph, {
        align: "left",
        lineGap: 4,
      });
    doc.moveDown(isSignature ? 0.4 : 0.85);
  });

  doc.end();
  return done;
}

function buildCoverLetterPath(
  queueItem: RecordValue,
  notes: RecordValue,
  job?: RecordValue
) {
  const jobId = asString(queueItem.job_id) ?? "job";
  const title =
    asString(job?.title) ??
    asString(job?.job_title) ??
    asString(notes.job_title) ??
    "cover-letter";
  return `cover_letters/venkateswarlu_derangula_${slugify(title)}_${jobId}.pdf`;
}

function pickEmphasis(text: string) {
  const lower = text.toLowerCase();
  const matches = [
    lower.includes("kubernetes") ? "Kubernetes platform reliability" : "",
    lower.includes("terraform") ? "infrastructure as code" : "",
    lower.includes("aws") ? "AWS cloud operations" : "",
    lower.includes("azure") ? "Azure DevOps practices" : "",
    lower.includes("gcp") || lower.includes("google cloud")
      ? "Google Cloud engineering"
      : "",
    lower.includes("ci/cd") || lower.includes("cicd")
      ? "CI/CD pipeline automation"
      : "",
    lower.includes("observability") || lower.includes("monitoring")
      ? "observability and incident readiness"
      : "",
    lower.includes("sre") || lower.includes("site reliability")
      ? "site reliability engineering"
      : "",
  ].filter(Boolean);

  const unique = Array.from(new Set(matches));
  if (unique.length === 0) {
    return "cloud infrastructure, automation, and delivery reliability";
  }

  return unique.slice(0, 4).join(", ");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 80);
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function asRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }

  return value as RecordValue;
}
