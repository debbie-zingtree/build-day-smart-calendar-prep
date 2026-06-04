import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// SERVER-SIDE ONLY. The service-role key bypasses RLS — never import this into
// a client component or expose the key to the browser.
let client: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) {
    throw new Error("Supabase env vars are not set");
  }
  if (!client) {
    client = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export interface BriefRow {
  id: string;
  email: string;
  meeting_title: string;
  meeting_type: string;
  attendees: string | null;
  context: string | null;
  prep_markdown: string;
  created_at: string;
}
