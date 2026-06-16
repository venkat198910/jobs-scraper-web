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
  minExperience: number;
  maxExperience: number;
  minScore: number;
  toggles: Record<SettingKey, boolean>;
};

export const defaultSettings: SettingsState = {
  locations: [
    "Dubai, United Arab Emirates",
    "Abu Dhabi, United Arab Emirates",
    "Bengaluru, Karnataka, India",
    "Bangalore, Karnataka, India",
  ],
  roles: [
    "DevOps Engineer",
    "Senior DevOps Engineer",
    "Cloud Engineer",
    "GCP Engineer",
    "GCP DevOps Engineer",
    "Google Cloud Engineer",
    "Kubernetes Engineer",
    "Platform Engineer",
    "Infrastructure Engineer",
    "Terraform Engineer",
    "Site Reliability Engineer",
    "SRE",
    "DevSecOps Engineer",
    "CI/CD Engineer",
    "Release Engineer",
    "Cloud Platform Engineer",
    "Observability Engineer",
    "Docker Kubernetes Engineer",
    "GKE Engineer",
    "Cloud Native Engineer",
  ],
  minExperience: 6,
  maxExperience: 12,
  minScore: 90,
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

  return {
    locations: stringArray(partial.locations, defaultSettings.locations),
    roles: stringArray(partial.roles, defaultSettings.roles),
    minExperience,
    maxExperience,
    minScore: boundedNumber(partial.minScore, defaultSettings.minScore, 0, 100),
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
