# SECURITY.md

Mandatory security rules for this project. Read before writing any code that
handles secrets, user input, authentication, data, or external calls.

## Secrets & API Keys
- Never put API keys, passwords, tokens, secrets, or credentials in code files —
  not as values, not as placeholders, not in comments.
- Always use environment variables (`.env`) for all sensitive data.
- Always keep a `.env.example` with placeholder names only (no real values).
- Add `.env` to `.gitignore` before the first commit — not after.
- Never commit `.env` files to version control under any circumstance.
- If you find an exposed secret anywhere in the codebase, stop and warn the team.

## Code Safety
- Never hardcode database connection strings, webhook URLs, or third-party
  endpoints — use env vars.
- Never log sensitive data (tokens, passwords, user PII) to the console, even in
  development.
- Never disable authentication or security middleware "temporarily" — if it must
  come off, flag it and explain why.
- Always validate and sanitize user input before using it in queries, APIs, or
  rendered output.
- Always use parameterized queries — never concatenate user input into SQL.
- Render untrusted text with safe APIs (`textContent`, not `innerHTML`).

## Authentication, Authorization & PII
- Treat any change touching auth, authorization, payment processing, or PII
  handling as high-risk — have a teammate review before merging.
- Apply least privilege: grant the minimum scope/permissions needed.

## Git & Deployment
- Never push to `main` or production without reviewing changes first.
- Before any commit, check for exposed secrets:
  ```
  git diff --cached | grep -iE "(api_key|secret|password|token)"
  ```
- If a secret is committed, consider it compromised — rotate it immediately.
  Deleting the line is not enough.

## Dependencies
- Do not add dependencies without explicit approval.
- Prefer well-maintained libraries; review transitive risk for anything new.
