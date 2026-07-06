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
  applicationProfile: {
    firstName: string;
    lastName: string;
    fullName: string;
    email: string;
    phone: string;
    linkedinUrl: string;
    githubUrl: string;
    currentLocation: string;
    addressLine1: string;
    addressCity: string;
    addressState: string;
    addressPostalCode: string;
    totalExperience: string;
    devopsExperience: string;
    sreExperience: string;
    cloudExperience: string;
    kubernetesExperience: string;
    terraformExperience: string;
    pythonExperience: string;
  };
  applicationAutomation: {
    maxJobAgeMinutes: number;
    maxDailyApplications: number;
    allowFinalSubmit: boolean;
    allowPortalLogin: boolean;
    allowPortalRegister: boolean;
    headlessBrowser: boolean;
  };
  applicationAutoAnswers: {
    country: string;
    nationality: string;
    currentJobTitle: string;
    currentEmployer: string;
    highestEducation: string;
    degreeName: string;
    university: string;
    graduationYear: string;
    bachelorDegree: string;
    bachelorUniversity: string;
    bachelorGraduationYear: string;
    availabilityDate: string;
    preferredWorkMode: string;
    preferredEmploymentType: string;
    preferredShift: string;
    openToContract: string;
    salaryNegotiable: string;
    workAuthorization: string;
    needSponsorship: string;
    indiaWorkAuthorization: string;
    indiaNeedSponsorship: string;
    outsideIndiaWorkAuthorization: string;
    outsideIndiaNeedSponsorship: string;
    currentLocation: string;
    willingToRelocate: string;
    relocateLocations: string;
    noticePeriod: string;
    indiaCurrentCtc: string;
    indiaExpectedCtc: string;
    uaeCurrentAnnual: string;
    uaeCurrentMonthly: string;
    uaeExpectedAnnual: string;
    uaeExpectedMonthly: string;
  };
  applicationQuestionAnswers: Record<string, string>;
  advanced: {
    llmMaxRpm: number;
    llmMaxRetries: number;
    llmRetryBaseDelay: number;
    llmDailyRequestBudget: number;
    llmRequestDelaySeconds: number;
    jobsToScorePerRun: number;
    jobsToCustomizePerRun: number;
    jobsToRescorePerRun: number;
    maxLinkedinJobsPerSearch: number;
    maxCareersFutureJobsPerSearch: number;
    maxCompanyCareerJobsPerRun: number;
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
  applicationProfile: {
    firstName: "Venkateswarlu",
    lastName: "Derangula",
    fullName: "Venkateswarlu Derangula",
    email: "vderangula44@gmail.com",
    phone: "+91 7780569119",
    linkedinUrl: "https://www.linkedin.com/in/venkateswarlu-derangula/",
    githubUrl: "https://github.com/venkat198910/",
    currentLocation: "Bengaluru",
    addressLine1: "31, KR Puram",
    addressCity: "Bengaluru",
    addressState: "Karnataka",
    addressPostalCode: "560036",
    totalExperience: "9.6",
    devopsExperience: "7+",
    sreExperience: "7+",
    cloudExperience: "6+",
    kubernetesExperience: "5+",
    terraformExperience: "5+",
    pythonExperience: "3+",
  },
  applicationAutomation: {
    maxJobAgeMinutes: 720,
    maxDailyApplications: 30,
    allowFinalSubmit: false,
    allowPortalLogin: false,
    allowPortalRegister: false,
    headlessBrowser: false,
  },
  applicationAutoAnswers: {
    country: "India",
    nationality: "Indian",
    currentJobTitle: "Technical Lead",
    currentEmployer: "Infinite Computer Solutions",
    highestEducation: "MBA",
    degreeName: "MBA",
    university: "SV University, Tirupati",
    graduationYear: "2012",
    bachelorDegree: "B.Com (Computer Applications)",
    bachelorUniversity: "SV University, Tirupati",
    bachelorGraduationYear: "2010",
    availabilityDate: "After 30 days notice",
    preferredWorkMode: "Remote or Hybrid",
    preferredEmploymentType: "Full-time",
    preferredShift: "Flexible",
    openToContract: "No",
    salaryNegotiable: "Yes",
    workAuthorization: "No",
    needSponsorship: "Yes",
    indiaWorkAuthorization: "Yes",
    indiaNeedSponsorship: "No",
    outsideIndiaWorkAuthorization: "No",
    outsideIndiaNeedSponsorship: "Yes",
    currentLocation: "Bengaluru",
    willingToRelocate: "Yes",
    relocateLocations: "Bengaluru, Bangalore, Dubai, Abu Dhabi",
    noticePeriod: "30 days",
    indiaCurrentCtc: "31 LPA",
    indiaExpectedCtc: "50 LPA",
    uaeCurrentAnnual: "125000 AED",
    uaeCurrentMonthly: "10300 AED",
    uaeExpectedAnnual: "300000 AED",
    uaeExpectedMonthly: "25000 AED",
  },
  applicationQuestionAnswers: {
    microservices: "5",
    "representational state transfer": "7",
    rest: "7",
    java: "0",
    devops: "7",
    sre: "7",
    "site reliability": "7",
    aws: "6",
    cloud: "6",
    kubernetes: "5",
    terraform: "5",
    python: "3",
    "ci cd": "7",
    cicd: "7",
    jenkins: "7",
    "github actions": "5",
    docker: "5",
    linux: "8",
    ansible: "4",
    prometheus: "5",
    grafana: "5",
    "notice period": "30",
    "current ctc": "31",
    "expected ctc": "50",
    "current gross compensation": "31",
    "expected gross compensation": "50",
  },
  advanced: {
    llmMaxRpm: 10,
    llmMaxRetries: 3,
    llmRetryBaseDelay: 10,
    llmDailyRequestBudget: 0,
    llmRequestDelaySeconds: 8,
    jobsToScorePerRun: 10,
    jobsToCustomizePerRun: 5,
    jobsToRescorePerRun: 0,
    maxLinkedinJobsPerSearch: 20,
    maxCareersFutureJobsPerSearch: 10,
    maxCompanyCareerJobsPerRun: 50,
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

function stringValue(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
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
  const applicationProfile =
    partial.applicationProfile && typeof partial.applicationProfile === "object"
      ? (partial.applicationProfile as Partial<SettingsState["applicationProfile"]>)
      : {};
  const applicationAutomation =
    partial.applicationAutomation && typeof partial.applicationAutomation === "object"
      ? (partial.applicationAutomation as Partial<SettingsState["applicationAutomation"]>)
      : {};
  const applicationAutoAnswers =
    partial.applicationAutoAnswers && typeof partial.applicationAutoAnswers === "object"
      ? (partial.applicationAutoAnswers as Partial<SettingsState["applicationAutoAnswers"]>)
      : {};
  const applicationQuestionAnswers =
    partial.applicationQuestionAnswers && typeof partial.applicationQuestionAnswers === "object"
      ? (partial.applicationQuestionAnswers as Record<string, unknown>)
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
    applicationProfile: {
      firstName: stringValue(applicationProfile.firstName, defaultSettings.applicationProfile.firstName),
      lastName: stringValue(applicationProfile.lastName, defaultSettings.applicationProfile.lastName),
      fullName: stringValue(applicationProfile.fullName, defaultSettings.applicationProfile.fullName),
      email: stringValue(applicationProfile.email, defaultSettings.applicationProfile.email),
      phone: stringValue(applicationProfile.phone, defaultSettings.applicationProfile.phone),
      linkedinUrl: stringValue(applicationProfile.linkedinUrl, defaultSettings.applicationProfile.linkedinUrl),
      githubUrl: stringValue(applicationProfile.githubUrl, defaultSettings.applicationProfile.githubUrl),
      currentLocation: stringValue(applicationProfile.currentLocation, defaultSettings.applicationProfile.currentLocation),
      addressLine1: stringValue(applicationProfile.addressLine1, defaultSettings.applicationProfile.addressLine1),
      addressCity: stringValue(applicationProfile.addressCity, defaultSettings.applicationProfile.addressCity),
      addressState: stringValue(applicationProfile.addressState, defaultSettings.applicationProfile.addressState),
      addressPostalCode: stringValue(applicationProfile.addressPostalCode, defaultSettings.applicationProfile.addressPostalCode),
      totalExperience: stringValue(applicationProfile.totalExperience, defaultSettings.applicationProfile.totalExperience),
      devopsExperience: stringValue(applicationProfile.devopsExperience, defaultSettings.applicationProfile.devopsExperience),
      sreExperience: stringValue(applicationProfile.sreExperience, defaultSettings.applicationProfile.sreExperience),
      cloudExperience: stringValue(applicationProfile.cloudExperience, defaultSettings.applicationProfile.cloudExperience),
      kubernetesExperience: stringValue(applicationProfile.kubernetesExperience, defaultSettings.applicationProfile.kubernetesExperience),
      terraformExperience: stringValue(applicationProfile.terraformExperience, defaultSettings.applicationProfile.terraformExperience),
      pythonExperience: stringValue(applicationProfile.pythonExperience, defaultSettings.applicationProfile.pythonExperience),
    },
    applicationAutomation: {
      maxJobAgeMinutes: boundedNumber(
        applicationAutomation.maxJobAgeMinutes,
        defaultSettings.applicationAutomation.maxJobAgeMinutes,
        1,
        1440
      ),
      maxDailyApplications: boundedNumber(
        applicationAutomation.maxDailyApplications,
        defaultSettings.applicationAutomation.maxDailyApplications,
        0,
        200
      ),
      allowFinalSubmit: Boolean(
        applicationAutomation.allowFinalSubmit ?? defaultSettings.applicationAutomation.allowFinalSubmit
      ),
      allowPortalLogin: Boolean(
        applicationAutomation.allowPortalLogin ?? defaultSettings.applicationAutomation.allowPortalLogin
      ),
      allowPortalRegister: Boolean(
        applicationAutomation.allowPortalRegister ?? defaultSettings.applicationAutomation.allowPortalRegister
      ),
      headlessBrowser: Boolean(
        applicationAutomation.headlessBrowser ?? defaultSettings.applicationAutomation.headlessBrowser
      ),
    },
    applicationAutoAnswers: {
      country: stringValue(applicationAutoAnswers.country, defaultSettings.applicationAutoAnswers.country),
      nationality: stringValue(applicationAutoAnswers.nationality, defaultSettings.applicationAutoAnswers.nationality),
      currentJobTitle: stringValue(applicationAutoAnswers.currentJobTitle, defaultSettings.applicationAutoAnswers.currentJobTitle),
      currentEmployer: stringValue(applicationAutoAnswers.currentEmployer, defaultSettings.applicationAutoAnswers.currentEmployer),
      highestEducation: stringValue(applicationAutoAnswers.highestEducation, defaultSettings.applicationAutoAnswers.highestEducation),
      degreeName: stringValue(applicationAutoAnswers.degreeName, defaultSettings.applicationAutoAnswers.degreeName),
      university: stringValue(applicationAutoAnswers.university, defaultSettings.applicationAutoAnswers.university),
      graduationYear: stringValue(applicationAutoAnswers.graduationYear, defaultSettings.applicationAutoAnswers.graduationYear),
      bachelorDegree: stringValue(applicationAutoAnswers.bachelorDegree, defaultSettings.applicationAutoAnswers.bachelorDegree),
      bachelorUniversity: stringValue(applicationAutoAnswers.bachelorUniversity, defaultSettings.applicationAutoAnswers.bachelorUniversity),
      bachelorGraduationYear: stringValue(applicationAutoAnswers.bachelorGraduationYear, defaultSettings.applicationAutoAnswers.bachelorGraduationYear),
      availabilityDate: stringValue(applicationAutoAnswers.availabilityDate, defaultSettings.applicationAutoAnswers.availabilityDate),
      preferredWorkMode: stringValue(applicationAutoAnswers.preferredWorkMode, defaultSettings.applicationAutoAnswers.preferredWorkMode),
      preferredEmploymentType: stringValue(applicationAutoAnswers.preferredEmploymentType, defaultSettings.applicationAutoAnswers.preferredEmploymentType),
      preferredShift: stringValue(applicationAutoAnswers.preferredShift, defaultSettings.applicationAutoAnswers.preferredShift),
      openToContract: stringValue(applicationAutoAnswers.openToContract, defaultSettings.applicationAutoAnswers.openToContract),
      salaryNegotiable: stringValue(applicationAutoAnswers.salaryNegotiable, defaultSettings.applicationAutoAnswers.salaryNegotiable),
      workAuthorization: stringValue(applicationAutoAnswers.workAuthorization, defaultSettings.applicationAutoAnswers.workAuthorization),
      needSponsorship: stringValue(applicationAutoAnswers.needSponsorship, defaultSettings.applicationAutoAnswers.needSponsorship),
      indiaWorkAuthorization: stringValue(applicationAutoAnswers.indiaWorkAuthorization, defaultSettings.applicationAutoAnswers.indiaWorkAuthorization),
      indiaNeedSponsorship: stringValue(applicationAutoAnswers.indiaNeedSponsorship, defaultSettings.applicationAutoAnswers.indiaNeedSponsorship),
      outsideIndiaWorkAuthorization: stringValue(applicationAutoAnswers.outsideIndiaWorkAuthorization, defaultSettings.applicationAutoAnswers.outsideIndiaWorkAuthorization),
      outsideIndiaNeedSponsorship: stringValue(applicationAutoAnswers.outsideIndiaNeedSponsorship, defaultSettings.applicationAutoAnswers.outsideIndiaNeedSponsorship),
      currentLocation: stringValue(applicationAutoAnswers.currentLocation, defaultSettings.applicationAutoAnswers.currentLocation),
      willingToRelocate: stringValue(applicationAutoAnswers.willingToRelocate, defaultSettings.applicationAutoAnswers.willingToRelocate),
      relocateLocations: stringValue(applicationAutoAnswers.relocateLocations, defaultSettings.applicationAutoAnswers.relocateLocations),
      noticePeriod: stringValue(applicationAutoAnswers.noticePeriod, defaultSettings.applicationAutoAnswers.noticePeriod),
      indiaCurrentCtc: stringValue(applicationAutoAnswers.indiaCurrentCtc, defaultSettings.applicationAutoAnswers.indiaCurrentCtc),
      indiaExpectedCtc: stringValue(applicationAutoAnswers.indiaExpectedCtc, defaultSettings.applicationAutoAnswers.indiaExpectedCtc),
      uaeCurrentAnnual: stringValue(applicationAutoAnswers.uaeCurrentAnnual, defaultSettings.applicationAutoAnswers.uaeCurrentAnnual),
      uaeCurrentMonthly: stringValue(applicationAutoAnswers.uaeCurrentMonthly, defaultSettings.applicationAutoAnswers.uaeCurrentMonthly),
      uaeExpectedAnnual: stringValue(applicationAutoAnswers.uaeExpectedAnnual, defaultSettings.applicationAutoAnswers.uaeExpectedAnnual),
      uaeExpectedMonthly: stringValue(applicationAutoAnswers.uaeExpectedMonthly, defaultSettings.applicationAutoAnswers.uaeExpectedMonthly),
    },
    applicationQuestionAnswers: normalizeQuestionAnswers(applicationQuestionAnswers),
    advanced: {
      llmMaxRpm: boundedNumber(advanced.llmMaxRpm, defaultSettings.advanced.llmMaxRpm, 1, 120),
      llmMaxRetries: boundedNumber(advanced.llmMaxRetries, defaultSettings.advanced.llmMaxRetries, 0, 10),
      llmRetryBaseDelay: boundedNumber(advanced.llmRetryBaseDelay, defaultSettings.advanced.llmRetryBaseDelay, 1, 300),
      llmDailyRequestBudget: boundedNumber(advanced.llmDailyRequestBudget, defaultSettings.advanced.llmDailyRequestBudget, 0, 10000),
      llmRequestDelaySeconds: boundedNumber(advanced.llmRequestDelaySeconds, defaultSettings.advanced.llmRequestDelaySeconds, 0, 120),
      jobsToScorePerRun: boundedNumber(advanced.jobsToScorePerRun, defaultSettings.advanced.jobsToScorePerRun, 1, 1000),
      jobsToCustomizePerRun: boundedNumber(advanced.jobsToCustomizePerRun, defaultSettings.advanced.jobsToCustomizePerRun, 1, 1000),
      jobsToRescorePerRun: boundedNumber(advanced.jobsToRescorePerRun, defaultSettings.advanced.jobsToRescorePerRun, 0, 1000),
      maxLinkedinJobsPerSearch: boundedNumber(advanced.maxLinkedinJobsPerSearch, defaultSettings.advanced.maxLinkedinJobsPerSearch, 1, 1000),
      maxCareersFutureJobsPerSearch: boundedNumber(advanced.maxCareersFutureJobsPerSearch, defaultSettings.advanced.maxCareersFutureJobsPerSearch, 1, 1000),
      maxCompanyCareerJobsPerRun: boundedNumber(advanced.maxCompanyCareerJobsPerRun, defaultSettings.advanced.maxCompanyCareerJobsPerRun, 1, 1000),
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

export function normalizeQuestionKey(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function normalizeQuestionAnswers(value: Record<string, unknown>) {
  const answers: Record<string, string> = { ...defaultSettings.applicationQuestionAnswers };

  Object.entries(value).forEach(([rawKey, rawAnswer]) => {
    const key = normalizeQuestionKey(rawKey);
    const answer = String(rawAnswer ?? "").trim();
    if (key && answer) answers[key] = answer;
  });

  return answers;
}
