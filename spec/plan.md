# spec/plan.md — Smart Calendar Prep

HOW we build it. Read `PRD.md` first (WHAT + WHY), then follow this build order.

## 1. Architecture Overview
Next.js (App Router) on Vercel. A client `<MeetingForm>` posts to a server
action `generateBrief`, which validates + rate-limits input, calls Anthropic
(Claude Sonnet) server-side, persists the brief to Supabase, and returns
markdown that `<BriefRenderer>` renders with react-markdown. A `/briefs` page
lists a given email's past briefs in reverse-chronological order. The Anthropic
key and Supabase service-role key live server-side only.

## 2. Components / Modules
- **`<MeetingForm>`** — client form: email, title, type select, attendees,
  optional context. Enforces input caps client-side; server re-validates.
- **`<BriefRenderer>`** — renders prep markdown via react-markdown + Tailwind
  `prose`. Handles long responses gracefully (scroll, no layout break).
- **`/briefs` page** — reads `?email=`, lists saved briefs reverse-chron.
- **`lib/anthropic.ts`** — Anthropic client + `buildPrompt()` template builder.
- **`generateBrief` server action** — validate → rate-limit → call Anthropic →
  persist → return markdown.
- **`lib/supabase.ts`** — server-side service-role client.
- **`lib/ratelimit.ts`** — in-memory per-email-per-hour limiter (10/hour).

## 3. Data Model
Postgres (Supabase). One table.

**`briefs`**
| column        | type        | notes                                  |
|---------------|-------------|----------------------------------------|
| id            | uuid        | PK, default `gen_random_uuid()`        |
| email         | text        | not null                               |
| meeting_title | text        | not null, ≤ 200 chars                  |
| meeting_type  | text        | discovery/demo/check-in/strategic/other|
| attendees     | text        | ≤ 500 chars                            |
| context       | text        | nullable, ≤ 2000 chars                 |
| prep_markdown | text        | the generated brief                    |
| created_at    | timestamptz | default `now()`                        |

- **Index**: `(email, created_at DESC)` — powers the reverse-chron dashboard.
- **RLS**: enabled. Only a `service_role` policy (server-side writes/reads).
  No anon access — all DB access goes through the server action.

### Schema (run via Supabase MCP)
```sql
create extension if not exists "pgcrypto";

create table if not exists briefs (
  id            uuid primary key default gen_random_uuid(),
  email         text not null,
  meeting_title text not null,
  meeting_type  text not null,
  attendees     text,
  context       text,
  prep_markdown text not null,
  created_at    timestamptz not null default now()
);

create index if not exists briefs_email_created_idx
  on briefs (email, created_at desc);

alter table briefs enable row level security;

-- service_role only; no anon/auth policies on purpose
create policy "service_role full access"
  on briefs for all
  to service_role
  using (true)
  with check (true);
```

## 4. Anthropic Prompt Template (critical — determines brief quality)
Built by `buildPrompt({ title, type, attendees, context })` in `lib/anthropic.ts`.
Verbatim template — interpolate the four fields:

```
You are a world-class executive assistant preparing meeting briefs. I'm
going into a meeting. Generate a structured prep brief.

Meeting title: {title}
Meeting type:  {type}
Attendees:     {attendees}
Context:       {context}

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
your brief" — just deliver the sections.
```

- **Model**: a Claude Sonnet variant (not Opus — cost + latency).
- **max_tokens**: cap at ~800 to bound cost and keep briefs concise.

## 5. External Dependencies & APIs
- **`@anthropic-ai/sdk`** — Claude API client (server-side only).
- **`react-markdown`** — render the returned brief markdown.
- **`@supabase/supabase-js`** — DB persistence (service-role, server-side).
- **Env vars** (names only — see `.env.example`):
  - `ANTHROPIC_API_KEY` — server-side only, never shipped to client.
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY` — server-side only.

## 6. Implementation Order (11 steps)
1. **Scaffold Next.js (App Router) + Tailwind**; confirm dev server boots.
2. **Env wiring** — add `ANTHROPIC_API_KEY` + Supabase keys to `.env` and
   `.env.example` (placeholders only in `.env.example`). Confirm `.env` is
   gitignored.
3. **Supabase migration** — run the `briefs` schema (table + index + RLS +
   service_role policy) via the Supabase MCP. Verify table + RLS in dashboard.
4. **`lib/anthropic.ts`** — client + `buildPrompt()`. **CHECKPOINT:** generate
   briefs for 2 sample meetings and get brief-quality approval BEFORE wiring
   the rest of the app to the prompt.
5. **`lib/supabase.ts`** — server-side service-role client.
6. **`lib/ratelimit.ts`** — in-memory per-email limiter, 10 briefs/hour.
7. **`generateBrief` server action** — validate (input caps) → rate-limit →
   call Anthropic → persist to `briefs` → return markdown.
8. **`<MeetingForm>`** — client form with the five fields + client-side caps.
9. **`<BriefRenderer>`** — react-markdown + Tailwind `prose`; long-response
   handling.
10. **`/briefs` page** — read `?email=`, list reverse-chron from Supabase.
11. **End-to-end pass** — submit a real meeting, confirm row in Supabase,
    confirm `/briefs?email=` shows it, confirm 11th rapid submit is rejected.

## 7. Testing Strategy
- **Unit** — `buildPrompt()` builder: correct interpolation, section headers
  present, input-cap enforcement.
- **Integration** — `generateBrief` with Anthropic + Supabase mocked: happy
  path, over-cap input rejected, rate-limit triggers on the 11th call.
- **Component** — `<MeetingForm>` validation (required fields, char caps).
- Feedback signal: tests run green locally before any deploy.

## 8. Known Risks & Mitigations
- **API cost** → Sonnet (not Opus), `max_tokens` capped ~800, rate limit
  10/email/hour.
- **Markdown injection** → render with react-markdown's safe defaults; do NOT
  enable raw HTML; treat brief text as untrusted.
- **Streaming vs. wait** → v1 waits for the full response (simpler, brief is
  short). Streaming deferred to v2.
- **Long responses** → `max_tokens` cap + `<BriefRenderer>` scroll/overflow
  handling so layout never breaks.
- **Key rotation** → key in env only; if exposed, rotate at console.anthropic.com
  and update `.env` + Vercel env. Never logged, never client-side.

## 9. Done Criteria
- [ ] Brief returns in < 15s and renders as markdown (headings + bullets).
- [ ] All four required sections appear in generated briefs.
- [ ] Brief row persists to Supabase `briefs` with all fields.
- [ ] `/briefs?email=...` lists that email's briefs reverse-chron.
- [ ] 11th rapid submit for the same email is rejected (rate limit).
- [ ] `ANTHROPIC_API_KEY` is server-side only — absent from client network
      payloads (verify in DevTools).
- [ ] RLS enabled on `briefs`; only service_role policy.
- [ ] No secrets in git history; `.env` gitignored.
- [ ] `ANTHROPIC_API_KEY` + Supabase keys synced to Vercel Production.

## 10. Deferred / Future (v2)
- Response streaming.
- Persistent (DB-backed) rate limiting instead of in-memory.
- Auth + per-user brief ownership.
