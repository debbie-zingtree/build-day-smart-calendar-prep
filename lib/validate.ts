import { LIMITS, MEETING_TYPES, type MeetingType } from "./types";

export interface RawBriefInput {
  email?: string;
  title?: string;
  type?: string;
  attendees?: string;
  context?: string;
}

export interface ValidBriefInput {
  email: string;
  title: string;
  type: MeetingType;
  attendees: string;
  context: string;
}

export type ValidationResult =
  | { ok: true; value: ValidBriefInput }
  | { ok: false; error: string };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates + normalizes raw form input. Enforces the input caps from the PRD.
 * Server-side source of truth — never trust the client's own checks.
 */
export function validateBriefInput(raw: RawBriefInput): ValidationResult {
  const email = (raw.email ?? "").trim().toLowerCase();
  const title = (raw.title ?? "").trim();
  const attendees = (raw.attendees ?? "").trim();
  const context = (raw.context ?? "").trim();
  const type = (raw.type ?? "").trim();

  if (!EMAIL_RE.test(email)) {
    return { ok: false, error: "A valid email is required." };
  }
  if (!title) {
    return { ok: false, error: "Meeting title is required." };
  }
  if (title.length > LIMITS.title) {
    return { ok: false, error: `Title must be ${LIMITS.title} characters or fewer.` };
  }
  if (!MEETING_TYPES.includes(type as MeetingType)) {
    return { ok: false, error: "Choose a valid meeting type." };
  }
  if (!attendees) {
    return { ok: false, error: "Attendees are required." };
  }
  if (attendees.length > LIMITS.attendees) {
    return { ok: false, error: `Attendees must be ${LIMITS.attendees} characters or fewer.` };
  }
  if (context.length > LIMITS.context) {
    return { ok: false, error: `Context must be ${LIMITS.context} characters or fewer.` };
  }

  return {
    ok: true,
    value: { email, title, type: type as MeetingType, attendees, context },
  };
}
