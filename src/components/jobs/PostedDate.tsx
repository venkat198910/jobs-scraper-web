"use client";

import { useEffect, useMemo, useState } from "react";
import {
  formatJobDate,
  formatJobRelativeAge,
  getJobPostingDate,
} from "@/lib/jobs/dates";
import { Job } from "@/types";

interface PostedDateProps {
  job: Job;
}

export default function PostedDate({ job }: PostedDateProps) {
  const postedAt = getJobPostingDate(job);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const relativeAge = useMemo(
    () => (mounted ? formatJobRelativeAge(postedAt) : null),
    [mounted, postedAt],
  );

  const absoluteDate = formatJobDate(postedAt);

  return (
    <span>
      Posted {absoluteDate}
      {relativeAge ? ` (${relativeAge})` : ""}
    </span>
  );
}
