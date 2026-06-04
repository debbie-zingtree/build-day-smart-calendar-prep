"use client";

import { useState, useTransition } from "react";
import { generateBrief } from "@/app/actions";
import { LIMITS, MEETING_TYPES } from "@/lib/types";
import BriefRenderer from "./BriefRenderer";

const TYPE_LABELS: Record<string, string> = {
  discovery: "Discovery",
  demo: "Demo",
  "check-in": "Check-in",
  strategic: "Strategic",
  other: "Other",
};

export default function MeetingForm() {
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>(MEETING_TYPES[0]);
  const [attendees, setAttendees] = useState("");
  const [context, setContext] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [markdown, setMarkdown] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMarkdown(null);
    startTransition(async () => {
      const result = await generateBrief({ email, title, type, attendees, context });
      if (result.ok && result.markdown) {
        setMarkdown(result.markdown);
      } else {
        setError(result.error ?? "Something went wrong.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Your email" hint="Used to save and look up your briefs.">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@company.com"
            className={inputClass}
          />
        </Field>

        <Field label="Meeting title">
          <input
            type="text"
            required
            maxLength={LIMITS.title}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Q3 renewal review — Acme Corp"
            className={inputClass}
          />
        </Field>

        <Field label="Meeting type">
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            {MEETING_TYPES.map((t) => (
              <option key={t} value={t}>
                {TYPE_LABELS[t]}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Attendees" hint="Names, roles, companies.">
          <input
            type="text"
            required
            maxLength={LIMITS.attendees}
            value={attendees}
            onChange={(e) => setAttendees(e.target.value)}
            placeholder="Jane Doe (VP Eng, Acme), John Smith (CTO)"
            className={inputClass}
          />
        </Field>

        <Field label="Context (optional)" hint={`${context.length}/${LIMITS.context}`}>
          <textarea
            rows={4}
            maxLength={LIMITS.context}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="Anything relevant: deal stage, prior conversations, goals…"
            className={inputClass}
          />
        </Field>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-slate-900 px-4 py-2.5 font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Generating brief…" : "Generate prep brief"}
        </button>
      </form>

      {markdown && <BriefRenderer markdown={markdown} />}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="flex items-baseline justify-between">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}
