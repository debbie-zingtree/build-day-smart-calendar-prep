import Link from "next/link";
import { getSupabaseAdmin, type BriefRow } from "@/lib/supabase";
import BriefRenderer from "@/components/BriefRenderer";

// Always render fresh — the list reflects the latest saved briefs.
export const dynamic = "force-dynamic";

async function fetchBriefs(email: string): Promise<BriefRow[]> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("briefs")
    .select("*")
    .eq("email", email.trim().toLowerCase())
    .order("created_at", { ascending: false });

  if (error) {
    console.error("fetchBriefs: Supabase query failed");
    throw new Error("Could not load briefs.");
  }
  return (data ?? []) as BriefRow[];
}

export default async function BriefsPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Saved briefs
        </h1>
        <Link
          href="/"
          className="mt-3 inline-block text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          ← New brief
        </Link>
      </header>

      {/* GET form so the email lands in ?email= and the page is shareable. */}
      <form method="get" className="mb-8 flex gap-2">
        <input
          type="email"
          name="email"
          required
          defaultValue={email ?? ""}
          placeholder="you@company.com"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-700"
        >
          Load
        </button>
      </form>

      {email ? <BriefList email={email} /> : <p className="text-slate-500">Enter an email to see its briefs.</p>}
    </main>
  );
}

async function BriefList({ email }: { email: string }) {
  let briefs: BriefRow[];
  try {
    briefs = await fetchBriefs(email);
  } catch {
    return <p className="text-red-700">Could not load briefs. Please try again.</p>;
  }

  if (briefs.length === 0) {
    return <p className="text-slate-500">No briefs yet for {email}.</p>;
  }

  return (
    <ul className="flex flex-col gap-6">
      {briefs.map((brief) => (
        <li key={brief.id} className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium text-slate-900">{brief.meeting_title}</h2>
            <time className="text-xs text-slate-400" dateTime={brief.created_at}>
              {new Date(brief.created_at).toLocaleString()}
            </time>
          </div>
          <p className="text-xs uppercase tracking-wide text-slate-400">
            {brief.meeting_type}
          </p>
          <BriefRenderer markdown={brief.prep_markdown} />
        </li>
      ))}
    </ul>
  );
}
