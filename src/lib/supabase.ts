import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://vdvxuqepjtvsmwdwvljp.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZkdnh1cWVwanR2c213ZHd2bGpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDUxNTcsImV4cCI6MjA5NTI4MTE1N30.oGByOvHspRS7pod_W8w6sD6f4JnHGJSgVpTdVnMa98A";

// Simple in-memory storage (avoids AsyncStorage native module crash)
const memoryStorage: Record<string, string> = {};
const MemoryStorageAdapter = {
  getItem: (key: string) => memoryStorage[key] ?? null,
  setItem: (key: string, value: string) => { memoryStorage[key] = value; },
  removeItem: (key: string) => { delete memoryStorage[key]; },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: MemoryStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
