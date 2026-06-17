export type SettingKey =
  | "linkedin"
  | "careersFuture"
  | "remote"
  | "hybrid"
  | "onsite"
  | "easyApplyOnly"
  | "companyPortals"
  | "autoGenerateResume"
  | "strictExperience";

export type SettingsState = {
  locations: string[];
  roles: string[];
  jobTypes: string[];
  postingDateFilter: string;
  minExperience: number;
  maxExperience: number;
  minScore: number;
  advanced: {
    llmMaxRpm: number;
    llmMaxRetries: number;
    llmRetryBaseDelay: number;
    llmDailyRequestBudget: number;
    llmRequestDelaySeconds: number;
    linkedinMaxStart: number;
    requestTimeout: number;
    maxRetries: number;
    retryDelaySeconds: number;
    jobExpiryDays: number;
    jobCheckDays: number;
    jobDeletionDays: number;
    jobCheckLimit: number;
    activeCheckTimeout: number;
    activeCheckMaxRetries: number;
    activeCheckRetryDelay: number;
  };
  toggles: Record<SettingKey, boolean>;
};

export const roleSuggestions = [
  "DevOps Engineer",
  "Senior DevOps Engineer",
  "Cloud Engineer",
  "Senior Cloud Engineer",
  "Azure DevOps Engineer",
  "AWS DevOps Engineer",
  "GCP Engineer",
  "GCP DevOps Engineer",
  "Google Cloud Engineer",
  "Kubernetes Engineer",
  "Senior Kubernetes Engineer",
  "Platform Engineer",
  "Senior Platform Engineer",
  "Infrastructure Engineer",
  "Cloud Infrastructure Engineer",
  "Terraform Engineer",
  "Site Reliability Engineer",
  "Senior Site Reliability Engineer",
  "SRE",
  "DevSecOps Engineer",
  "CI/CD Engineer",
  "Release Engineer",
  "Cloud Platform Engineer",
  "Observability Engineer",
  "Docker Kubernetes Engineer",
  "GKE Engineer",
  "Cloud Native Engineer",
  "Production DevOps Engineer",
  "Systems Engineer",
  "Linux Engineer",
  "Automation Engineer",
];

export const jobTypeOptions = [
  { value: "F", label: "Full-time" },
  { value: "C", label: "Contract" },
  { value: "P", label: "Part-time" },
  { value: "T", label: "Temporary" },
  { value: "I", label: "Internship" },
];

export const postingDateOptions = [
  { value: "r3600", label: "Past 1h" },
  { value: "r7200", label: "Past 2h" },
  { value: "r10800", label: "Past 3h" },
  { value: "r14400", label: "Past 4h" },
  { value: "r18000", label: "Past 5h" },
  { value: "r21600", label: "Past 6h" },
  { value: "r43200", label: "Past 12h" },
  { value: "r86400", label: "Past 24h" },
  { value: "r604800", label: "Past week" },
];

export const defaultSettings: SettingsState = {
  locations: [
    "Dubai, United Arab Emirates",
    "Abu Dhabi, United Arab Emirates",
    "Bengaluru, Karnataka, India",
    "Bangalore, Karnataka, India",
  ],
  roles: roleSuggestions,
  jobTypes: ["F"],
  postingDateFilter: "r86400",
  minExperience: 6,
  maxExperience: 12,
  minScore: 90,
  advanced: {
    llmMaxRpm: 10,
    llmMaxRetries: 3,
    llmRetryBaseDelay: 10,
    llmDailyRequestBudget: 0,
    llmRequestDelaySeconds: 8,
    linkedinMaxStart: 1,
    requestTimeout: 30,
    maxRetries: 3,
    retryDelaySeconds: 15,
    jobExpiryDays: 7,
    jobCheckDays: 3,
    jobDeletionDays: 60,
    jobCheckLimit: 50,
    activeCheckTimeout: 20,
    activeCheckMaxRetries: 2,
    activeCheckRetryDelay: 10,
  },
  toggles: {
    linkedin: true,
    careersFuture: false,
    remote: true,
    hybrid: true,
    onsite: false,
    easyApplyOnly: false,
    companyPortals: true,
    autoGenerateResume: true,
    strictExperience: true,
  },
};

export const locationSuggestions = [
  "Dubai, United Arab Emirates",
  "Abu Dhabi, United Arab Emirates",
  "Sharjah, United Arab Emirates",
  "Bengaluru, Karnataka, India",
  "Bangalore, Karnataka, India",
  "Hyderabad, Telangana, India",
  "Pune, Maharashtra, India",
  "Chennai, Tamil Nadu, India",
  "Mumbai, Maharashtra, India",
  "Noida, Uttar Pradesh, India",
  "Gurugram, Haryana, India",
  "Singapore",
];

function stringArray(value: unknown, fallback: string[]) {
  if (!Array.isArray(value)) return fallback;

  const cleaned = value
    .map((item) => String(item || "").trim())
    .filter(Boolean);

  return cleaned.length > 0 ? Array.from(new Set(cleaned)) : fallback;
}

function boundedNumber(value: unknown, fallback: number, min: number, max: number) {
  const numberValue = Number(value);
  if (!Number.isFinite(numberValue)) return fallback;
  return Math.min(max, Math.max(min, Math.round(numberValue)));
}

function enumArray(value: unknown, fallback: string[], allowed: string[]) {
  const allowedSet = new Set(allowed);
  const cleaned = stringArray(value, fallback).filter((item) => allowedSet.has(item));
  return cleaned.length > 0 ? cleaned : fallback;
}

function enumValue(value: unknown, fallback: string, allowed: string[]) {
  const text = String(value || "");
  return allowed.includes(text) ? text : fallback;
}

export function normalizeSettings(value: unknown): SettingsState {
  const partial = value && typeof value === "object" ? (value as Partial<SettingsState>) : {};
  const toggles =
    partial.toggles && typeof partial.toggles === "object"
      ? partial.toggles
      : {};

  const minExperience = boundedNumber(partial.minExperience, defaultSettings.minExperience, 0, 50);
  const maxExperience = Math.max(
    minExperience,
    boundedNumber(partial.maxExperience, defaultSettings.maxExperience, 0, 50)
  );
  const advanced =
    partial.advanced && typeof partial.advanced === "object"
      ? (partial.advanced as Partial<SettingsState["advanced"]>)
      : {};

  return {
    locations: stringArray(partial.locations, defaultSettings.locations),
    roles: stringArray(partial.roles, defaultSettings.roles),
    jobTypes: enumArray(
      partial.jobTypes,
      defaultSettings.jobTypes,
      jobTypeOptions.map((option) => option.value)
    ),
    postingDateFilter: enumValue(
      partial.postingDateFilter,
      defaultSettings.postingDateFilter,
      postingDateOptions.map((option) => option.value)
    ),
    minExperience,
    maxExperience,
    minScore: boundedNumber(partial.minScore, defaultSettings.minScore, 0, 100),
    advanced: {
      llmMaxRpm: boundedNumber(advanced.llmMaxRpm, defaultSettings.advanced.llmMaxRpm, 1, 120),
      llmMaxRetries: boundedNumber(advanced.llmMaxRetries, defaultSettings.advanced.llmMaxRetries, 0, 10),
      llmRetryBaseDelay: boundedNumber(advanced.llmRetryBaseDelay, defaultSettings.advanced.llmRetryBaseDelay, 1, 300),
      llmDailyRequestBudget: boundedNumber(advanced.llmDailyRequestBudget, defaultSettings.advanced.llmDailyRequestBudget, 0, 10000),
      llmRequestDelaySeconds: boundedNumber(advanced.llmRequestDelaySeconds, defaultSettings.advanced.llmRequestDelaySeconds, 0, 120),
      linkedinMaxStart: boundedNumber(advanced.linkedinMaxStart, defaultSettings.advanced.linkedinMaxStart, 0, 1000),
      requestTimeout: boundedNumber(advanced.requestTimeout, defaultSettings.advanced.requestTimeout, 5, 300),
      maxRetries: boundedNumber(advanced.maxRetries, defaultSettings.advanced.maxRetries, 0, 10),
      retryDelaySeconds: boundedNumber(advanced.retryDelaySeconds, defaultSettings.advanced.retryDelaySeconds, 1, 300),
      jobExpiryDays: boundedNumber(advanced.jobExpiryDays, defaultSettings.advanced.jobExpiryDays, 1, 365),
      jobCheckDays: boundedNumber(advanced.jobCheckDays, defaultSettings.advanced.jobCheckDays, 1, 365),
      jobDeletionDays: boundedNumber(advanced.jobDeletionDays, defaultSettings.advanced.jobDeletionDays, 1, 3650),
      jobCheckLimit: boundedNumber(advanced.jobCheckLimit, defaultSettings.advanced.jobCheckLimit, 1, 1000),
      activeCheckTimeout: boundedNumber(advanced.activeCheckTimeout, defaultSettings.advanced.activeCheckTimeout, 5, 300),
      activeCheckMaxRetries: boundedNumber(advanced.activeCheckMaxRetries, defaultSettings.advanced.activeCheckMaxRetries, 0, 10),
      activeCheckRetryDelay: boundedNumber(advanced.activeCheckRetryDelay, defaultSettings.advanced.activeCheckRetryDelay, 1, 300),
    },
    toggles: {
      ...defaultSettings.toggles,
      ...Object.fromEntries(
        Object.keys(defaultSettings.toggles).map((key) => [
          key,
          Boolean((toggles as Record<string, unknown>)[key] ?? defaultSettings.toggles[key as SettingKey]),
        ])
      ),
    },
  };
}
