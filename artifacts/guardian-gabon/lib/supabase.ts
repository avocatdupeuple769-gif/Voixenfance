import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL =
  process.env.EXPO_PUBLIC_SUPABASE_URL ||
  "https://ilzrzwuhfraywjdlbtqf.supabase.co";

const SUPABASE_KEY =
  process.env.EXPO_PUBLIC_SUPABASE_KEY ||
  "sb_publishable_Ciy2zPaTFQU5_MZ5Tt3b2Q_2uFhB6ST";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: false,
    persistSession: false,
    detectSessionInUrl: false,
  },
});

export const MEDIA_BUCKET = "media";
export const SUPABASE_PUBLIC_URL = SUPABASE_URL;
