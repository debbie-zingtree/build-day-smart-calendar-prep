# PROGRESS — Smart Calendar Prep

Status log for Build Day, App 3. See `PRD.md` (what/why) and `spec/plan.md` (how).

## Implementation Order (from spec/plan.md)
1. [x] Scaffold Next.js (App Router) + Tailwind — builds clean
2. [x] Env wiring — `.env.example` has `ANTHROPIC_API_KEY` + Supabase keys; `.env` gitignored
3. [ ] **Supabase migration** — run `briefs` schema (table + index + RLS + service_role policy) via Supabase MCP ⛔ needs Supabase project
4. [x] `lib/anthropic.ts` — client + `buildPrompt()` written
       [ ] **CHECKPOINT: approve 2 sample briefs before wiring the rest** ⛔ needs ANTHROPIC_API_KEY
5. [x] `lib/supabase.ts` — service-role client (server-side only)
6. [x] `lib/ratelimit.ts` — in-memory 10/email/hour
7. [x] `generateBrief` server action — validate → rate-limit → call → persist → return
8. [x] `<MeetingForm>` — five fields, client-side caps
9. [x] `<BriefRenderer>` — react-markdown + Tailwind `prose`, long-response scroll
10. [x] `/briefs` page — reads `?email=`, reverse-chron
11. [ ] End-to-end pass ⛔ needs keys + Supabase

## Built so far (key-independent — verified by `npm run build`)
- `lib/types.ts` · `lib/anthropic.ts` · `lib/validate.ts` · `lib/ratelimit.ts` · `lib/supabase.ts`
- `app/actions.ts` · `app/page.tsx` · `app/briefs/page.tsx`
- `components/MeetingForm.tsx` · `components/BriefRenderer.tsx`
- Model: `claude-sonnet-4-6`, `max_tokens` 800 (Sonnet, not Opus — cost/latency)

## Blocked on (user / external)
- **ANTHROPIC_API_KEY** — console.anthropic.com → API Keys → Create. Needed for the
  step-4 sample-brief approval checkpoint and any end-to-end run.
- **Supabase project** — create project, run the schema in `spec/plan.md` §3 via the
  Supabase MCP, add `NEXT_PUBLIC_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` to `.env`.
- **GitHub repo** — `gh` CLI / Homebrew not installed; push pending (see chat).

## Not yet started (later phases of the SOP)
- Tests: prompt-builder unit, `generateBrief` integration (mock Anthropic + Supabase),
  `<MeetingForm>` validation component tests.
- CLAUDE.md autonomous build rules + pre-commit hook + agent team.
- Deploy: `/vercel:bootstrap`, `/vercel:env` (sync `ANTHROPIC_API_KEY`), `/vercel:deploy prod`.

## Decisions / Notes
- In-memory rate limit is per-instance and resets on restart (v1). Persistent limiting = v2.
- Brief persistence failures don't block the user — the brief still returns.
- No Design Rules set yet — UI is a clean neutral default; restyle once rules are defined.
