import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/utils/supabase/server";
import { defaultSettings, normalizeSettings } from "@/lib/settings";

const SETTINGS_ID = "default";
const SETTINGS_TABLE = "app_settings";
const SETTINGS_BUCKET = "resumes";
const SETTINGS_PATH = "settings/app_settings.json";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select("settings")
      .eq("id", SETTINGS_ID)
      .maybeSingle();

    if (error) {
      if (isMissingTableError(error)) {
        const settings = await getStorageSettings(supabase);
        return NextResponse.json({
          settings,
          needsSetup: false,
          storageFallback: true,
        });
      }

      throw error;
    }

    if (!data?.settings) {
      const settings = await getStorageSettings(supabase);
      return NextResponse.json({
        settings,
        needsSetup: false,
        storageFallback: true,
      });
    }

    return NextResponse.json({
      settings: normalizeSettings(data.settings),
      needsSetup: false,
    });
  } catch (error) {
    console.error("Error loading settings:", error);
    return NextResponse.json(
      {
        settings: defaultSettings,
        error: error instanceof Error ? error.message : "Failed to load settings",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const settings = normalizeSettings(body?.settings ?? body);

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .upsert(
        {
          id: SETTINGS_ID,
          settings,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" }
      )
      .select("settings")
      .single();

    if (error) {
      if (isMissingTableError(error)) {
        await saveStorageSettings(supabase, settings);
        return NextResponse.json({
          settings,
          needsSetup: false,
          storageFallback: true,
        });
      }

      throw error;
    }

    return NextResponse.json({
      settings: normalizeSettings(data?.settings ?? settings),
      needsSetup: false,
    });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to save settings",
      },
      { status: 500 }
    );
  }
}

function isMissingTableError(error: { code?: string; message?: string }) {
  return error.code === "42P01" || /app_settings|schema cache|does not exist/i.test(error.message || "");
}

async function getStorageSettings(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>) {
  try {
    const { data, error } = await supabase.storage.from(SETTINGS_BUCKET).download(SETTINGS_PATH);
    if (error || !data) throw error;
    const text = await data.text();
    return normalizeSettings(JSON.parse(text));
  } catch {
    return defaultSettings;
  }
}

async function saveStorageSettings(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  settings: ReturnType<typeof normalizeSettings>
) {
  const { error } = await supabase.storage
    .from(SETTINGS_BUCKET)
    .upload(SETTINGS_PATH, JSON.stringify(settings, null, 2), {
      contentType: "application/json",
      upsert: true,
    });

  if (error) throw error;
}
