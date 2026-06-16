"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Check,
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
  locationSuggestions,
  normalizeSettings,
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
              suggestionId="location-suggestions"
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
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
    </div>
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
  suggestionId,
}: {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  suggestions?: string[];
  suggestionId?: string;
}) {
  return (
    <div className="mt-4 flex gap-2">
      <div className="min-w-0 flex-1">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") onAdd();
          }}
          placeholder={placeholder}
          list={suggestionId}
          className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        />
        {suggestionId && suggestions.length > 0 && (
          <datalist id={suggestionId}>
            {suggestions.map((suggestion) => (
              <option key={suggestion} value={suggestion} />
            ))}
          </datalist>
        )}
      </div>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Add
      </button>
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
      className={`flex items-center justify-between rounded-md border px-4 py-3 text-sm font-medium ${
        checked
          ? "border-blue-200 bg-blue-50 text-blue-800"
          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
      <Switch checked={checked} />
    </button>
  );
}

function Switch({ checked }: { checked: boolean }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
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
