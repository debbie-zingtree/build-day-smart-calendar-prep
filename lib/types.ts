// Shared, dependency-free types and constants.
// Safe to import from BOTH client and server (no SDK imports here).

export const MEETING_TYPES = [
  "discovery",
  "demo",
  "check-in",
  "strategic",
  "other",
] as const;

export type MeetingType = (typeof MEETING_TYPES)[number];

// Input caps (chars). Enforced client-side for UX and re-checked server-side.
export const LIMITS = {
  title: 200,
  attendees: 500,
  context: 2000,
} as const;

export interface BriefInput {
  title: string;
  type: MeetingType;
  attendees: string;
  context?: string;
}
