# Smart Calendar Prep — PRD

## Core Features (3)
1. Meeting input form — email, title, type (discovery/demo/check-in/
   strategic/other), attendees, optional context textarea
2. AI-generated prep brief — calls Anthropic, returns structured
   markdown: agenda · 5 smart questions · research points · risks
3. Saved briefs dashboard — /briefs?email=... lists past briefs,
   reverse-chron

## Secure Coding
- ANTHROPIC_API_KEY server-side only. Never in client.
- Input caps: title 200, attendees 500, context 2000 chars
- Rate limit per email: 10 briefs/hour (prevents key abuse)
- Never log API key · never log full brief response (PII)
- RLS: service_role only on briefs

## Stack addition
+ @anthropic-ai/sdk (Claude Sonnet) · react-markdown for render
