import Anthropic from "@anthropic-ai/sdk";
import { type BriefInput } from "./types";

// Claude Sonnet — NOT Opus (cost + latency). max_tokens capped to bound cost
// and keep briefs readable in ~2 minutes.
const MODEL = "claude-sonnet-4-6";
const MAX_TOKENS = 800;

/**
 * Builds the meeting-prep prompt. This template determines brief quality —
 * keep the section headers verbatim. Pure function: no network, no key.
 */
export function buildPrompt({ title, type, attendees, context }: BriefInput): string {
  const ctx = context?.trim() ? context.trim() : "(none provided)";
  return `You are a world-class executive assistant preparing meeting briefs. I'm
going into a meeting. Generate a structured prep brief.

Meeting title: ${title}
Meeting type:  ${type}
Attendees:     ${attendees}
Context:       ${ctx}

Return clean markdown with these sections exactly:

## Suggested Agenda
(3–5 bullets, specific to this meeting & attendees. Not generic.)

## 5 Smart Questions to Ask
(Numbered. Specific, open-ended — not yes/no.)

## Research Before the Meeting
(3 bullets. What to google / LinkedIn / CRM-pull before walking in.)

## Risks or Red Flags
(If any apply. If none, write "None obvious." Don't force.)

Keep it concise — readable in 2 minutes. Don't hedge. Don't say "here's
your brief" — just deliver the sections.`;
}

// Lazy singleton — only constructed when a brief is actually generated, so the
// rest of the app (and tests) work without the key present.
let client: Anthropic | null = null;
function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set");
  }
  if (!client) {
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Calls Anthropic and returns the brief as markdown.
 * Never logs the key or the full response (PII).
 */
export async function generatePrepBrief(input: BriefInput): Promise<string> {
  const anthropic = getClient();
  const message = await anthropic.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    messages: [{ role: "user", content: buildPrompt(input) }],
  });

  const markdown = message.content
    .filter((block): block is Anthropic.TextBlock => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  if (!markdown) {
    throw new Error("Anthropic returned an empty brief");
  }
  return markdown;
}
