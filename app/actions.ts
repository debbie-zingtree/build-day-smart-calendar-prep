"use server";

import { generatePrepBrief } from "@/lib/anthropic";
import { validateBriefInput, type RawBriefInput } from "@/lib/validate";
import { checkRateLimit } from "@/lib/ratelimit";
import { getSupabaseAdmin } from "@/lib/supabase";

export interface GenerateBriefResult {
  ok: boolean;
  markdown?: string;
  error?: string;
}

/**
 * Server action: validate -> rate-limit -> call Anthropic -> persist -> return.
 * Runs server-side only; the Anthropic key never reaches the client.
 */
export async function generateBrief(raw: RawBriefInput): Promise<GenerateBriefResult> {
  const validated = validateBriefInput(raw);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }
  const input = validated.value;

  const limit = checkRateLimit(input.email);
  if (!limit.allowed) {
    return {
      ok: false,
      error: "Rate limit reached: 10 briefs per hour for this email. Try again later.",
    };
  }

  let markdown: string;
  try {
    markdown = await generatePrepBrief({
      title: input.title,
      type: input.type,
      attendees: input.attendees,
      context: input.context,
    });
  } catch {
    // Never log the key or the full response. Generic message only.
    console.error("generateBrief: Anthropic call failed");
    return { ok: false, error: "Could not generate the brief. Please try again." };
  }

  try {
    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("briefs").insert({
      email: input.email,
      meeting_title: input.title,
      meeting_type: input.type,
      attendees: input.attendees,
      context: input.context || null,
      prep_markdown: markdown,
    });
    if (error) {
      // Don't block the user on a persistence hiccup — return the brief anyway.
      console.error("generateBrief: Supabase insert failed");
    }
  } catch {
    console.error("generateBrief: Supabase unavailable");
  }

  return { ok: true, markdown };
}
