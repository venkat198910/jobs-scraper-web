"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  Clock3,
  Contact,
  Loader2,
  MapPin,
  Plus,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Trash2,
} from "lucide-react";
import {
  defaultSettings,
  jobTypeOptions,
  locationSuggestions,
  normalizeSettings,
  postingDateOptions,
  roleSuggestions,
  type SettingKey,
  type SettingsState,
} from "@/lib/settings";

export default function SettingsClient() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const [locationDraft, setLocationDraft] = useState("");
  const [roleDraft, setRoleDraft] = useState("");
  const [savedAt, setSavedAt] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const response = await fetch("/api/settings", { cache: "no-store" });
        const payload = await response.json();

        if (!isMounted) return;

        setSettings(normalizeSettings(payload.settings));
        setMessage(payload.needsSetup ? payload.error || "Settings table needs setup." : "");
      } catch (error) {
        if (!isMounted) return;
        setSettings(defaultSettings);
        setMessage(error instanceof Error ? error.message : "Settings could not be loaded.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedWorkModes = useMemo(() => {
    const modes = [];
    if (settings.toggles.remote) modes.push("Remote");
    if (settings.toggles.hybrid) modes.push("Hybrid");
    if (settings.toggles.onsite) modes.push("Onsite");
    return modes.join(", ") || "None";
  }, [settings.toggles]);

  const availableLocationSuggestions = useMemo(() => {
    const selectedLocations = new Set(settings.locations.map((location) => location.toLowerCase()));
    return locationSuggestions.filter((location) => !selectedLocations.has(location.toLowerCase()));
  }, [settings.locations]);

  const availableRoleSuggestions = useMemo(() => {
    const selectedRoles = new Set(settings.roles.map((role) => role.toLowerCase()));
    return roleSuggestions.filter((role) => !selectedRoles.has(role.toLowerCase()));
  }, [settings.roles]);

  async function saveSettings(nextSettings = settings) {
    setIsSaving(true);
    setMessage("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: nextSettings }),
      });
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.error || "Settings could not be saved.");
      }

      setSettings(normalizeSettings(payload.settings));
      setSavedAt(new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Settings could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetSettings() {
    setSettings(defaultSettings);
    setSavedAt("");
    saveSettings(defaultSettings);
  }

  function addItem(key: "locations" | "roles", value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;
    setSettings((current) => {
      if (current[key].some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
        return current;
      }
      return { ...current, [key]: [...current[key], trimmed] };
    });
    if (key === "locations") setLocationDraft("");
    if (key === "roles") setRoleDraft("");
  }

  function removeItem(key: "locations" | "roles", value: string) {
    setSettings((current) => ({
      ...current,
      [key]: current[key].filter((item) => item !== value),
    }));
  }

  function setToggle(key: SettingKey) {
    setSettings((current) => ({
      ...current,
      toggles: { ...current.toggles, [key]: !current.toggles[key] },
    }));
  }

  function setJobType(value: string) {
    setSettings((current) => {
      const selected = current.jobTypes.includes(value)
        ? current.jobTypes.filter((item) => item !== value)
        : [...current.jobTypes, value];

      return { ...current, jobTypes: selected.length > 0 ? selected : [value] };
    });
  }

  function setAdvanced(key: keyof SettingsState["advanced"], value: number) {
    setSettings((current) => ({
      ...current,
      advanced: { ...current.advanced, [key]: value },
    }));
  }

  function setProfile(key: keyof SettingsState["applicationProfile"], value: string) {
    setSettings((current) => ({
      ...current,
      applicationProfile: { ...current.applicationProfile, [key]: value },
    }));
  }

  function setAutomation(
    key: keyof SettingsState["applicationAutomation"],
    value: number | boolean,
  ) {
    setSettings((current) => ({
      ...current,
      applicationAutomation: { ...current.applicationAutomation, [key]: value },
    }));
  }

  function setAutoAnswer(key: keyof SettingsState["applicationAutoAnswers"], value: string) {
    setSettings((current) => ({
      ...current,
      applicationAutoAnswers: { ...current.applicationAutoAnswers, [key]: value },
    }));
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-950">Settings</h1>
          <p className="text-sm text-slate-600 mt-1">
            Preferred locations, roles, experience range, and job automation defaults.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetSettings}
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => saveSettings()}
            disabled={isSaving || isLoading}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {isSaving ? "Saving" : "Save"}
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.25fr_0.75fr]">
        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <SectionHeader icon={<MapPin className="h-5 w-5" />} title="Preferred Locations" />
          <div className="p-5">
            <ChipList
              items={settings.locations}
              onRemove={(item) => removeItem("locations", item)}
            />
            <AddRow
              value={locationDraft}
              placeholder="Add location"
              onChange={setLocationDraft}
              onAdd={() => addItem("locations", locationDraft)}
              suggestions={availableLocationSuggestions}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <SectionHeader icon={<SlidersHorizontal className="h-5 w-5" />} title="Experience And Score" />
          <div className="grid grid-cols-3 gap-3 p-5">
            <NumberField
              label="Min Years"
              value={settings.minExperience}
              min={0}
              onChange={(value) => setSettings((current) => ({ ...current, minExperience: value }))}
            />
            <NumberField
              label="Max Years"
              value={settings.maxExperience}
              min={settings.minExperience}
              onChange={(value) => setSettings((current) => ({ ...current, maxExperience: value }))}
            />
            <NumberField
              label="Min Score"
              value={settings.minScore}
              min={0}
              max={100}
              onChange={(value) => setSettings((current) => ({ ...current, minScore: value }))}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <SectionHeader icon={<BriefcaseBusiness className="h-5 w-5" />} title="Preferred Roles" />
          <div className="p-5">
            <ChipList items={settings.roles} onRemove={(item) => removeItem("roles", item)} />
            <AddRow
              value={roleDraft}
              placeholder="Add role"
              onChange={setRoleDraft}
              onAdd={() => addItem("roles", roleDraft)}
              suggestions={availableRoleSuggestions}
            />
          </div>
        </section>

        <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <SectionHeader icon={<Building2 className="h-5 w-5" />} title="Sources And Automation" />
          <div className="divide-y divide-slate-100">
            <ToggleRow label="LinkedIn Jobs" checked={settings.toggles.linkedin} onClick={() => setToggle("linkedin")} />
            <ToggleRow label="CareersFuture Jobs" checked={settings.toggles.careersFuture} onClick={() => setToggle("careersFuture")} />
            <ToggleRow label="Easy Apply Only" checked={settings.toggles.easyApplyOnly} onClick={() => setToggle("easyApplyOnly")} />
            <ToggleRow label="Company Portals" checked={settings.toggles.companyPortals} onClick={() => setToggle("companyPortals")} />
            <ToggleRow label="Auto Custom Resume" checked={settings.toggles.autoGenerateResume} onClick={() => setToggle("autoGenerateResume")} />
            <ToggleRow label="Strict Experience Match" checked={settings.toggles.strictExperience} onClick={() => setToggle("strictExperience")} />
          </div>
        </section>
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Clock3 className="h-5 w-5 text-slate-600" />
          <h2 className="text-base font-semibold text-slate-950">LinkedIn Filters</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <span className="mb-2 block text-xs font-medium text-slate-500">Job Type</span>
            <div className="flex flex-wrap gap-2">
              {jobTypeOptions.map((option) => (
                <TogglePill
                  key={option.value}
                  label={option.label}
                  checked={settings.jobTypes.includes(option.value)}
                  onClick={() => setJobType(option.value)}
                />
              ))}
            </div>
          </div>
          <label className="block lg:max-w-72">
            <span className="mb-2 block text-xs font-medium text-slate-500">Posting Date</span>
            <select
              value={settings.postingDateFilter}
              onChange={(event) =>
                setSettings((current) => ({ ...current, postingDateFilter: event.target.value }))
              }
              className="w-full rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
            >
              {postingDateOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <TogglePill label="Remote" checked={settings.toggles.remote} onClick={() => setToggle("remote")} />
          <TogglePill label="Hybrid" checked={settings.toggles.hybrid} onClick={() => setToggle("hybrid")} />
          <TogglePill label="Onsite" checked={settings.toggles.onsite} onClick={() => setToggle("onsite")} />
        </div>
        <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
          <span>
            Work modes: <span className="font-medium text-slate-900">{selectedWorkModes}</span>
          </span>
          {savedAt && (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <Check className="h-4 w-4" />
              Saved {savedAt}
            </span>
          )}
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
        <SectionHeader icon={<Contact className="h-5 w-5" />} title="Application Profile" />
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
          <TextField label="First Name" value={settings.applicationProfile.firstName} onChange={(value) => setProfile("firstName", value)} />
          <TextField label="Last Name" value={settings.applicationProfile.lastName} onChange={(value) => setProfile("lastName", value)} />
          <TextField label="Full Name" value={settings.applicationProfile.fullName} onChange={(value) => setProfile("fullName", value)} />
          <TextField label="Email" value={settings.applicationProfile.email} onChange={(value) => setProfile("email", value)} />
          <TextField label="Mobile" value={settings.applicationProfile.phone} onChange={(value) => setProfile("phone", value)} />
          <TextField label="Current Location" value={settings.applicationProfile.currentLocation} onChange={(value) => setProfile("currentLocation", value)} />
          <TextField label="LinkedIn URL" value={settings.applicationProfile.linkedinUrl} onChange={(value) => setProfile("linkedinUrl", value)} />
          <TextField label="GitHub URL" value={settings.applicationProfile.githubUrl} onChange={(value) => setProfile("githubUrl", value)} />
          <TextField label="Address Line" value={settings.applicationProfile.addressLine1} onChange={(value) => setProfile("addressLine1", value)} />
          <TextField label="City" value={settings.applicationProfile.addressCity} onChange={(value) => setProfile("addressCity", value)} />
          <TextField label="State" value={settings.applicationProfile.addressState} onChange={(value) => setProfile("addressState", value)} />
          <TextField label="Postal Code" value={settings.applicationProfile.addressPostalCode} onChange={(value) => setProfile("addressPostalCode", value)} />
          <TextField label="Total Experience" value={settings.applicationProfile.totalExperience} onChange={(value) => setProfile("totalExperience", value)} />
          <TextField label="DevOps Experience" value={settings.applicationProfile.devopsExperience} onChange={(value) => setProfile("devopsExperience", value)} />
          <TextField label="SRE Experience" value={settings.applicationProfile.sreExperience} onChange={(value) => setProfile("sreExperience", value)} />
          <TextField label="AWS/Cloud Experience" value={settings.applicationProfile.cloudExperience} onChange={(value) => setProfile("cloudExperience", value)} />
          <TextField label="Kubernetes Experience" value={settings.applicationProfile.kubernetesExperience} onChange={(value) => setProfile("kubernetesExperience", value)} />
          <TextField label="Terraform Experience" value={settings.applicationProfile.terraformExperience} onChange={(value) => setProfile("terraformExperience", value)} />
          <TextField label="Python Experience" value={settings.applicationProfile.pythonExperience} onChange={(value) => setProfile("pythonExperience", value)} />
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
        <SectionHeader icon={<SlidersHorizontal className="h-5 w-5" />} title="Application Automation" />
        <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-[14rem_1fr]">
          <NumberField
            label="Max Job Age Minutes"
            value={settings.applicationAutomation.maxJobAgeMinutes}
            min={1}
            max={1440}
            onChange={(value) => setAutomation("maxJobAgeMinutes", value)}
          />
          <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
            <TogglePill
              label="Allow Portal Login"
              checked={settings.applicationAutomation.allowPortalLogin}
              onClick={() => setAutomation("allowPortalLogin", !settings.applicationAutomation.allowPortalLogin)}
            />
            <TogglePill
              label="Allow Final Submit"
              checked={settings.applicationAutomation.allowFinalSubmit}
              onClick={() => setAutomation("allowFinalSubmit", !settings.applicationAutomation.allowFinalSubmit)}
            />
            <TogglePill
              label="Headless Browser"
              checked={settings.applicationAutomation.headlessBrowser}
              onClick={() => setAutomation("headlessBrowser", !settings.applicationAutomation.headlessBrowser)}
            />
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
          Portal password is intentionally read from the runtime environment, not saved in app settings.
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
        <SectionHeader icon={<Check className="h-5 w-5" />} title="Auto Answers" />
        <div className="grid grid-cols-1 gap-5 p-5 lg:grid-cols-3">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Work Authorization</h3>
            <TextField label="Default Work Authorization" value={settings.applicationAutoAnswers.workAuthorization} onChange={(value) => setAutoAnswer("workAuthorization", value)} />
            <TextField label="Default Sponsorship Required" value={settings.applicationAutoAnswers.needSponsorship} onChange={(value) => setAutoAnswer("needSponsorship", value)} />
            <TextField label="India Work Authorization" value={settings.applicationAutoAnswers.indiaWorkAuthorization} onChange={(value) => setAutoAnswer("indiaWorkAuthorization", value)} />
            <TextField label="India Sponsorship Required" value={settings.applicationAutoAnswers.indiaNeedSponsorship} onChange={(value) => setAutoAnswer("indiaNeedSponsorship", value)} />
            <TextField label="Outside India Work Authorization" value={settings.applicationAutoAnswers.outsideIndiaWorkAuthorization} onChange={(value) => setAutoAnswer("outsideIndiaWorkAuthorization", value)} />
            <TextField label="Outside India Sponsorship Required" value={settings.applicationAutoAnswers.outsideIndiaNeedSponsorship} onChange={(value) => setAutoAnswer("outsideIndiaNeedSponsorship", value)} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Relocation And Availability</h3>
            <TextField label="Current Location" value={settings.applicationAutoAnswers.currentLocation} onChange={(value) => setAutoAnswer("currentLocation", value)} />
            <TextField label="Willing To Relocate" value={settings.applicationAutoAnswers.willingToRelocate} onChange={(value) => setAutoAnswer("willingToRelocate", value)} />
            <TextField label="Relocation Locations" value={settings.applicationAutoAnswers.relocateLocations} onChange={(value) => setAutoAnswer("relocateLocations", value)} />
            <TextField label="Notice Period" value={settings.applicationAutoAnswers.noticePeriod} onChange={(value) => setAutoAnswer("noticePeriod", value)} />
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Salary</h3>
            <TextField label="India Current CTC" value={settings.applicationAutoAnswers.indiaCurrentCtc} onChange={(value) => setAutoAnswer("indiaCurrentCtc", value)} />
            <TextField label="India Expected CTC" value={settings.applicationAutoAnswers.indiaExpectedCtc} onChange={(value) => setAutoAnswer("indiaExpectedCtc", value)} />
            <TextField label="UAE Current Annual" value={settings.applicationAutoAnswers.uaeCurrentAnnual} onChange={(value) => setAutoAnswer("uaeCurrentAnnual", value)} />
            <TextField label="UAE Current Monthly" value={settings.applicationAutoAnswers.uaeCurrentMonthly} onChange={(value) => setAutoAnswer("uaeCurrentMonthly", value)} />
            <TextField label="UAE Expected Annual" value={settings.applicationAutoAnswers.uaeExpectedAnnual} onChange={(value) => setAutoAnswer("uaeExpectedAnnual", value)} />
            <TextField label="UAE Expected Monthly" value={settings.applicationAutoAnswers.uaeExpectedMonthly} onChange={(value) => setAutoAnswer("uaeExpectedMonthly", value)} />
          </div>
        </div>
        <div className="border-t border-slate-100 px-5 py-3 text-sm text-slate-600">
          These answers are used only for known fields. Unknown screening questions still require review unless final-submit rules are explicitly enabled.
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
        <SectionHeader icon={<SlidersHorizontal className="h-5 w-5" />} title="Advanced Settings" />
        <div className="grid grid-cols-2 gap-3 p-5 md:grid-cols-4">
          <NumberField label="LLM RPM" value={settings.advanced.llmMaxRpm} min={1} onChange={(value) => setAdvanced("llmMaxRpm", value)} />
          <NumberField label="LLM Retries" value={settings.advanced.llmMaxRetries} min={0} onChange={(value) => setAdvanced("llmMaxRetries", value)} />
          <NumberField label="LLM Backoff" value={settings.advanced.llmRetryBaseDelay} min={1} onChange={(value) => setAdvanced("llmRetryBaseDelay", value)} />
          <NumberField label="LLM Daily Budget" value={settings.advanced.llmDailyRequestBudget} min={0} onChange={(value) => setAdvanced("llmDailyRequestBudget", value)} />
          <NumberField label="LLM Delay" value={settings.advanced.llmRequestDelaySeconds} min={0} onChange={(value) => setAdvanced("llmRequestDelaySeconds", value)} />
          <NumberField label="LinkedIn Pages" value={settings.advanced.linkedinMaxStart} min={0} onChange={(value) => setAdvanced("linkedinMaxStart", value)} />
          <NumberField label="Request Timeout" value={settings.advanced.requestTimeout} min={5} onChange={(value) => setAdvanced("requestTimeout", value)} />
          <NumberField label="HTTP Retries" value={settings.advanced.maxRetries} min={0} onChange={(value) => setAdvanced("maxRetries", value)} />
          <NumberField label="HTTP Retry Delay" value={settings.advanced.retryDelaySeconds} min={1} onChange={(value) => setAdvanced("retryDelaySeconds", value)} />
          <NumberField label="Expire Days" value={settings.advanced.jobExpiryDays} min={1} onChange={(value) => setAdvanced("jobExpiryDays", value)} />
          <NumberField label="Check Days" value={settings.advanced.jobCheckDays} min={1} onChange={(value) => setAdvanced("jobCheckDays", value)} />
          <NumberField label="Delete Days" value={settings.advanced.jobDeletionDays} min={1} onChange={(value) => setAdvanced("jobDeletionDays", value)} />
          <NumberField label="Check Limit" value={settings.advanced.jobCheckLimit} min={1} onChange={(value) => setAdvanced("jobCheckLimit", value)} />
          <NumberField label="Active Timeout" value={settings.advanced.activeCheckTimeout} min={5} onChange={(value) => setAdvanced("activeCheckTimeout", value)} />
          <NumberField label="Active Retries" value={settings.advanced.activeCheckMaxRetries} min={0} onChange={(value) => setAdvanced("activeCheckMaxRetries", value)} />
          <NumberField label="Active Retry Delay" value={settings.advanced.activeCheckRetryDelay} min={1} onChange={(value) => setAdvanced("activeCheckRetryDelay", value)} />
        </div>
      </section>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
      />
    </label>
  );
}

function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
      <span className="text-slate-600">{icon}</span>
      <h2 className="text-base font-semibold text-slate-950">{title}</h2>
    </div>
  );
}

function ChipList({ items, onRemove }: { items: string[]; onRemove: (item: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex max-w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-sm font-medium text-slate-800"
        >
          <span className="truncate">{item}</span>
          <button
            type="button"
            onClick={() => onRemove(item)}
            className="rounded p-0.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
            aria-label={`Remove ${item}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

function AddRow({
  value,
  placeholder,
  onChange,
  onAdd,
  suggestions = [],
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  suggestions?: string[];
}) {
  const normalizedValue = value.trim().toLowerCase();
  const visibleSuggestions = suggestions
    .filter((suggestion) => !normalizedValue || suggestion.toLowerCase().includes(normalizedValue))
    .slice(0, 8);

  return (
    <div className="mt-4">
      <div className="flex gap-2">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onAdd();
          }}
          placeholder={placeholder}
          className="min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        />
        <button
          type="button"
          onClick={onAdd}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>
      {visibleSuggestions.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {visibleSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => onChange(suggestion)}
              className="rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-800"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-950 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
      />
    </label>
  );
}

function ToggleRow({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between px-5 py-3 text-left text-sm hover:bg-slate-50"
    >
      <span className="font-medium text-slate-800">{label}</span>
      <Switch checked={checked} />
    </button>
  );
}

function TogglePill({
  label,
  checked,
  onClick,
}: {
  label: string;
  checked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex min-h-14 min-w-[9.5rem] items-center justify-between gap-3 rounded-md border px-4 py-3 text-sm font-medium ${
        checked
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      <span className="min-w-0 text-left leading-snug">{label}</span>
      <Switch checked={checked} />
    </button>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-blue-600" : "bg-slate-300"
      }`}
      aria-hidden="true"
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}
