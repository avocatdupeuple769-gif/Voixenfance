import { createClient } from "@supabase/supabase-js";

export const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://ilzrzwuhfraywjdlbtqf.supabase.co";

// service_role key — bypasses RLS, required for storage operations
export const SUPABASE_SERVICE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsenJ6d3VoZnJheXdqZGxidHFmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjYwOTQ2OCwiZXhwIjoyMDkyMTg1NDY4fQ.dqP30mpxRkCmg0nIFHSPLnol-y46u33CQONSYGyWDSg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export const REPORTS_BUCKET = "reports";
export const MEDIA_BUCKET = "media";
