import { createClient } from "@supabase/supabase-js";

// Values from .env win. The fallbacks point at the project this app was built
// against; the publishable key is meant to be public (row level security in
// supabase/schema.sql is what protects the data).
const FALLBACK_URL = "https://hepvnocqlfkhuhsfkdbo.supabase.co";
const FALLBACK_KEY = "sb_publishable_Ti7l5nD3_TArbv7HKpORQA_XRktuqWJ";

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL).trim();
export const SUPABASE_KEY = (
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  FALLBACK_KEY
).trim();

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
});

/** True when an error means the tables from supabase/schema.sql are missing. */
export function isMissingSchema(error) {
  if (!error) return false;
  const code = String(error.code || "");
  const message = String(error.message || "");
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    code === "PGRST202" ||
    code === "42883" ||
    /does not exist|could not find the (table|function)/i.test(message)
  );
}

/** Checks, without signing in, whether the database has been set up. */
export async function checkBackend() {
  try {
    const { error } = await supabase.from("members").select("id", { head: true, count: "exact" }).limit(1);
    if (!error) return "ready";
    return isMissingSchema(error) ? "missing-schema" : "error";
  } catch {
    return "unreachable";
  }
}
