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
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    setNowTick((value) => value + 1);
    const interval = window.setInterval(() => {
      setNowTick((value) => value + 1);
    }, 60000);

    return () => window.clearInterval(interval);
  }, []);

  const relativeAge = useMemo(
    () => formatJobRelativeAge(postedAt),
    [postedAt, nowTick],
  );

  const absoluteDate = formatJobDate(postedAt);

  return (
    <span suppressHydrationWarning>
      Posted {relativeAge ? `${relativeAge} · ` : ""}
      {absoluteDate}
    </span>
  );
}
