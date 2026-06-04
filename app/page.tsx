import Link from "next/link";
import MeetingForm from "@/components/MeetingForm";

export default function Home() {
  return (
    <main className="mx-auto min-h-screen max-w-2xl px-5 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Smart Calendar Prep
        </h1>
        <p className="mt-2 text-slate-600">
          Generate a focused, 2-minute prep brief for any meeting — agenda, smart
          questions, research, and risks.
        </p>
        <Link
          href="/briefs"
          className="mt-3 inline-block text-sm font-medium text-slate-500 underline-offset-2 hover:text-slate-900 hover:underline"
        >
          View saved briefs →
        </Link>
      </header>

      <MeetingForm />
    </main>
  );
}
