import { useMemo } from "react";
import { Icon } from "../components/ui";
import { Link, useParams } from "react-router-dom";
import { useDocument } from "../api/documents";
import { useProjectOverview } from "../api/projects";

/*
 * Document print / export view (route: /projects/:id/documents/:documentId/print).
 * A clean, paper-like read layout for PDF export / supervisor reading.
 * Export (download) is GATED: enabled only when the latest validation has zero errors,
 * matching the same rule used in the editor. "Print" uses the browser print dialog,
 * which produces a PDF — no backend PDF service required.
 */


export default function DocumentPrint() {
  const params = useParams();
  const projectId = params.id || params.projectId;
  const documentId = params.documentId;

  const { data: document, isLoading } = useDocument(projectId, documentId);
  const { data: overview } = useProjectOverview(projectId);

  const sections = useMemo(() => document?.sections || [], [document]);
  const latestValidation = overview?.latestValidation || null;
  const canExport = Boolean(latestValidation && latestValidation.status === "COMPLETED" && latestValidation.errorCount === 0);
  const errorCount = latestValidation?.errorCount ?? null;

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <p className="font-mono text-sm text-[var(--devdoc-muted)]">Loading document…</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      {/* screen-only toolbar (hidden when printing) */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b px-6 py-3 print:hidden"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <Link to={`/projects/${projectId}/documents/${documentId}`} className="flex items-center gap-1.5 text-sm text-[var(--devdoc-muted)] hover:text-[var(--devdoc-text)]">
          <Icon><path d="M19 12H5M12 19l-7-7 7-7" /></Icon> Back to editor
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <button onClick={() => window.print()} className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm"
            style={{ borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}>
            <Icon><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z" /></Icon>
            Print
          </button>
          <button
            onClick={() => canExport && window.print()}
            disabled={!canExport}
            title={canExport ? "Export as PDF" : `Resolve ${errorCount ?? "all"} validation error${errorCount === 1 ? "" : "s"} to export`}
            className="flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
            style={{ backgroundColor: "var(--devdoc-primary)" }}>
            <Icon><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></Icon>
            Download PDF
          </button>
        </div>
      </div>

      {/* validation gate notice */}
      {!canExport && (
        <div className="mx-auto mt-4 max-w-3xl px-6 print:hidden">
          <div className="flex items-center gap-2 rounded-md border px-4 py-2 text-[13px]"
            style={{ borderColor: "var(--devdoc-warning)", backgroundColor: "var(--devdoc-warning-soft)", color: "var(--devdoc-warning)" }}>
            <Icon size={15}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><path d="M12 9v4M12 17h.01" /></Icon>
            {latestValidation
              ? `Resolve ${errorCount} validation error${errorCount === 1 ? "" : "s"} before exporting. You can still print a draft.`
              : "Run validation before exporting. You can still print a draft."}
          </div>
        </div>
      )}

      {/* the document — paper sheet */}
      <div className="mx-auto my-6 max-w-3xl px-6 print:my-0 print:max-w-none print:px-0">
        <article className="rounded-lg border p-10 print:rounded-none print:border-0 print:p-0"
          style={{ backgroundColor: "#ffffff", color: "#1a1a1a", boxShadow: "0 8px 30px rgba(6,12,24,0.25)" }}>
          {/* title block */}
          <header className="mb-8 border-b pb-6" style={{ borderColor: "#e2e2e2" }}>
            <p className="font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: "#888" }}>{document?.documentType}</p>
            <h1 className="mt-2 text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{document?.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 font-mono text-[11px]" style={{ color: "#888" }}>
              <span>Version: {document?.version || "1.0"}</span>
              <span>Status: {document?.status || "DRAFT"}</span>
              <span>Generated: {new Date().toLocaleDateString()}</span>
            </div>
          </header>

          {/* table of contents */}
          {sections.length > 0 && (
            <nav className="mb-8">
              <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.15em]" style={{ color: "#888" }}>Contents</p>
              <ol className="flex flex-col gap-1 text-sm">
                {sections.map((s) => (
                  <li key={s.id} className="flex gap-2">
                    <span className="font-mono" style={{ color: "#888" }}>{s.sectionNumber}</span>
                    <span>{s.title || s.heading}</span>
                  </li>
                ))}
              </ol>
            </nav>
          )}

          {/* body */}
          <div className="flex flex-col gap-6">
            {sections.map((s) => (
              <section key={s.id} className="break-inside-avoid">
                <h2 className="mb-2 text-xl font-semibold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  <span className="font-mono text-base" style={{ color: "#888" }}>{s.sectionNumber} </span>
                  {s.title || s.heading}
                </h2>
                {s.content && s.content.trim() ? (
                  <div className="prose-sm max-w-none leading-relaxed" style={{ color: "#333" }}
                    dangerouslySetInnerHTML={{ __html: s.content }} />
                ) : (
                  <p className="text-sm italic" style={{ color: "#aaa" }}>This section is empty.</p>
                )}
              </section>
            ))}
          </div>

          <footer className="mt-10 border-t pt-4 text-center font-mono text-[11px]" style={{ borderColor: "#e2e2e2", color: "#aaa" }}>
            Generated by DevDoc
          </footer>
        </article>
      </div>
    </div>
  );
}
