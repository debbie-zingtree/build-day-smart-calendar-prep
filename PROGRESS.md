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

## Deployed (step 8) ✅
- Live (production alias): https://build-day-smart-calendar-prep-three.vercel.app
- Vercel project: debbie-1979s-projects/build-day-smart-calendar-prep
- Env vars synced: ANTHROPIC_API_KEY, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
  on Production + Development (+ Preview pending — CLI quirk; add via dashboard if needed).
- Live end-to-end verified: submit → brief (~5s, well under 15s) → row saved → /briefs shows it.
- GitHub auto-deploy NOT connected (repo under debbie-zingtree; Vercel GitHub app lacks access).
  Deploys are via `vercel deploy --prod` from CLI. Connect in dashboard to enable push-to-deploy.

## Security pre-flight (§15)
- [x] No real secrets in git history (only npm integrity-hash false positives)
- [x] `.env` gitignored + never committed
- [x] No hardcoded keys in source
- [x] RLS enabled on `briefs` (service_role policy only)
- [x] HTTPS enforced (Vercel)
- [x] API key server-side only (not in client bundle / payload by construction)
- [ ] ⚠ Rate limit on serverless: in-memory limiter is PER-INSTANCE. On Vercel,
      requests can hit different instances, so the "11th rejected" test is unreliable.
      Move to DB/Redis-backed limiting for a real guarantee (v2).

## Not yet started
- Tests: prompt-builder unit, `generateBrief` integration (mock Anthropic + Supabase),
  `<MeetingForm>` validation component tests.

## Decisions / Notes
- In-memory rate limit is per-instance and resets on restart (v1). Persistent limiting = v2.
- Brief persistence failures don't block the user — the brief still returns.
- No Design Rules set yet — UI is a clean neutral default; restyle once rules are defined.
