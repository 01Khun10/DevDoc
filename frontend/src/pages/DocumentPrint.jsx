import DOMPurify from "dompurify";
import { useParams } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import { useDocument } from "../api/documents";

// TipTap persists HTML; older documents may hold plain text.
function sectionHtml(content) {
  if (!content) return "<p><em>Empty section.</em></p>";
  const html = content.trim().startsWith("<") ? content : `<p>${content}</p>`;
  return DOMPurify.sanitize(html);
}

// Print-optimized read view: white page, black text, no app chrome.
// The Export button opens this route and the user prints via the browser.
function DocumentPrint() {
  const { id, documentId } = useParams();
  const { data: document, isLoading, error } = useDocument(id, documentId);

  if (isLoading) return <LoadingSpinner fullScreen label="Preparing print view..." />;

  if (error || !document) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white px-6 text-black">
        <p className="text-sm font-semibold">Could not load the document.</p>
      </main>
    );
  }

  const sections = document.sections || [];

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="mx-auto max-w-3xl px-8 py-10">
        <div className="mb-8 flex items-center justify-between gap-4 print:hidden">
          <p className="text-sm text-neutral-500">
            Print preview — use your browser's print dialog to save as PDF.
          </p>
          <button
            className="rounded-lg bg-black px-4 py-2 text-sm font-bold text-white"
            type="button"
            onClick={() => window.print()}
          >
            Print / Save PDF
          </button>
        </div>

        <header className="mb-10 border-b border-neutral-300 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-neutral-500">
            {document.documentType}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold">{document.title}</h1>
        </header>

        {sections.map((section) => (
          <section key={section.id} className="mb-8 break-inside-avoid">
            <h2 className="mb-2 text-lg font-bold">
              {section.sectionNumber} {section.title}
            </h2>
            <div
              className="prose prose-sm max-w-none text-sm leading-6 [&_table]:w-full [&_table]:border-collapse [&_td]:border [&_td]:border-neutral-300 [&_td]:p-1.5 [&_th]:border [&_th]:border-neutral-300 [&_th]:p-1.5"
              dangerouslySetInnerHTML={{ __html: sectionHtml(section.content) }}
            />
          </section>
        ))}
      </div>
    </main>
  );
}

export default DocumentPrint;
