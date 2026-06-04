import ReactMarkdown from "react-markdown";

// react-markdown's defaults are safe — raw HTML is NOT rendered, so brief text
// is treated as untrusted (no markdown-injection vector).
export default function BriefRenderer({ markdown }: { markdown: string }) {
  return (
    // max-h + overflow handles long responses without breaking the layout.
    <div className="max-h-[70vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <article className="prose prose-slate prose-headings:scroll-mt-4 max-w-none">
        <ReactMarkdown>{markdown}</ReactMarkdown>
      </article>
    </div>
  );
}
