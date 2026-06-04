# PROGRESS — Smart Calendar Prep

Status log for Build Day, App 3. See `PRD.md` (what/why) and `spec/plan.md` (how).

## Implementation Order (from spec/plan.md)
1. [x] Scaffold Next.js (App Router) + Tailwind — builds clean
2. [x] Env wiring — `.env` has real Anthropic + Supabase keys; `.env` gitignored
3. [x] **Supabase migration** — `briefs` schema run in SQL Editor (table + index + RLS + service_role policy); connection verified
4. [x] `lib/anthropic.ts` — client + `buildPrompt()`; **2 sample briefs APPROVED** (prompt locked)
5. [x] `lib/supabase.ts` — service-role client (server-side only)
6. [x] `lib/ratelimit.ts` — in-memory 10/email/hour
7. [x] `generateBrief` server action — validate → rate-limit → call → persist → return
8. [x] `<MeetingForm>` — five fields, client-side caps
9. [x] `<BriefRenderer>` — react-markdown + Tailwind `prose`, long-response scroll
10. [x] `/briefs` page — reads `?email=`, reverse-chron
11. [x] **End-to-end pass** — browser submit → brief rendered (4 sections) → row saved → /briefs shows it ✅

## Built so far (key-independent — verified by `npm run build`)
- `lib/types.ts` · `lib/anthropic.ts` · `lib/validate.ts` · `lib/ratelimit.ts` · `lib/supabase.ts`
- `app/actions.ts` · `app/page.tsx` · `app/briefs/page.tsx`
- `components/MeetingForm.tsx` · `components/BriefRenderer.tsx`
- Model: `claude-sonnet-4-6`, `max_tokens` 800 (Sonnet, not Opus — cost/latency)

## Verified locally
- GitHub: pushed to github.com/debbie-zingtree/build-day-smart-calendar-prep (SSH).
- Supabase: project `lbivcqfyxkjktlsipdxu`, `briefs` table reachable, RLS on, real row saved.
- Anthropic: `claude-sonnet-4-6`, samples ~595–619 output tokens (under 800 cap).
- Dev-mode brief latency ~17s (includes Turbopack compile) — confirm < 15s on prod.

## Not yet started (later phases of the SOP)
- Tests: prompt-builder unit, `generateBrief` integration (mock Anthropic + Supabase),
  `<MeetingForm>` validation component tests.
- Security pre-flight (§15): confirm key absent from client payload, RLS check, git-history scan.
- Deploy: `/vercel:bootstrap`, `/vercel:env` (sync `ANTHROPIC_API_KEY`), `/vercel:deploy prod`.

## Decisions / Notes
- In-memory rate limit is per-instance and resets on restart (v1). Persistent limiting = v2.
- Brief persistence failures don't block the user — the brief still returns.
- No Design Rules set yet — UI is a clean neutral default; restyle once rules are defined.
