import { useEffect, useState } from "react";
import { Icon } from "../components/ui";
import { useNavigate, useParams } from "react-router-dom";
import { useCreateDocumentFromTemplate } from "../api/documents";
import { useProfiles, useTemplateSections, useTemplatesByProfile } from "../api/templates";

const TYPE_COLOR = { SCOPE: "var(--devdoc-artifact-uc)", SRS: "var(--devdoc-artifact-fr)", SDS: "var(--devdoc-artifact-de)", STP: "var(--devdoc-artifact-sec)" };

export default function TemplateLibrary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const profilesQuery = useProfiles();
  const templatesQuery = useTemplatesByProfile(selectedProfile?.code);
  const previewQuery = useTemplateSections(selectedTemplate?.code);
  const createMutation = useCreateDocumentFromTemplate(id);

  useEffect(() => {
    if (!selectedProfile && profilesQuery.data?.length) setSelectedProfile(profilesQuery.data[0]);
  }, [profilesQuery.data, selectedProfile]);

  async function create() {
    if (!selectedTemplate) return;
    const doc = await createMutation.mutateAsync({ templateCode: selectedTemplate.code });
    navigate(`/projects/${id}/documents/${doc.id}`);
  }

  const profiles = profilesQuery.data || [];
  const templates = templatesQuery.data || [];

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Templates</p>
        <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">Template library</h1>
        <p className="mt-1 text-sm text-[var(--devdoc-muted)]">Create a document from a structured template.</p>
      </div>

      <div className="mx-auto max-w-6xl px-6 py-6">
        {/* profile filter */}
        <div className="mb-5 flex flex-wrap gap-2">
          {profilesQuery.isLoading
            ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="devdoc-skeleton h-9 w-28 rounded-md" />)
            : profiles.map((p) => (
              <button key={p.code} onClick={() => { setSelectedProfile(p); setSelectedTemplate(null); }}
                className="rounded-md border px-4 py-2 text-sm font-medium transition-colors"
                style={selectedProfile?.code === p.code
                  ? { borderColor: "var(--devdoc-primary)", backgroundColor: "var(--devdoc-primary-soft)", color: "var(--devdoc-primary)" }
                  : { borderColor: "var(--devdoc-border)", color: "var(--devdoc-text-secondary)" }}>
                {p.name || p.code}
              </button>
            ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          {/* template cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {templatesQuery.isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
                  <div className="devdoc-skeleton mb-3 h-8 w-8 rounded" /><div className="devdoc-skeleton mb-2 h-5 w-2/3 rounded" /><div className="devdoc-skeleton h-3 w-full rounded" />
                </div>
              ))
              : templates.map((t) => {
                const color = TYPE_COLOR[t.documentType] || "var(--devdoc-primary)";
                const active = selectedTemplate?.code === t.code;
                return (
                  <button key={t.code} onClick={() => setSelectedTemplate(t)}
                    className="flex flex-col rounded-lg border p-5 text-left transition-all hover:-translate-y-0.5"
                    style={{ borderColor: active ? "var(--devdoc-primary)" : "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", boxShadow: active ? "0 0 0 1px var(--devdoc-primary)" : "none" }}>
                    <div className="mb-3 flex h-9 w-9 items-center justify-center rounded border font-mono text-[11px]" style={{ borderColor: color, color }}>{t.documentType}</div>
                    <h3 className="font-headline text-base font-semibold">{t.name}</h3>
                    <p className="mt-1 font-mono text-[11px] text-[var(--devdoc-muted)]">{t.sectionCount ? `${t.sectionCount} sections` : "structured template"}</p>
                    {t.description && <p className="mt-2 text-[13px] text-[var(--devdoc-muted)]">{t.description}</p>}
                  </button>
                );
              })}
          </div>

          {/* preview / create rail */}
          <aside className="rounded-lg border p-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
            {!selectedTemplate ? (
              <div className="flex h-full flex-col items-center justify-center py-10 text-center">
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Preview</p>
                <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Select a template to preview its structure.</p>
              </div>
            ) : (
              <>
                <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">Preview</p>
                <h3 className="mt-1 font-headline text-lg font-semibold">{selectedTemplate.name}</h3>
                <div className="mt-4 max-h-[360px] overflow-y-auto pr-1">
                  {previewQuery.isLoading ? (
                    <div className="flex flex-col gap-2">{Array.from({ length: 6 }).map((_, i) => <div key={i} className="devdoc-skeleton h-4 w-full rounded" />)}</div>
                  ) : (
                    <ul className="flex flex-col gap-1.5 text-[13px]">
                      {(previewQuery.data || []).map((s) => (
                        <li key={s.id || s.sectionNumber} className="flex items-start gap-2">
                          <span className="font-mono text-[11px] text-[var(--devdoc-muted)]">{s.sectionNumber}</span>
                          <span className="text-[var(--devdoc-text-secondary)]">{s.title}</span>
                          {s.isRequired && <span className="ml-auto rounded px-1.5 text-[9px] uppercase" style={{ color: "var(--devdoc-primary)", backgroundColor: "var(--devdoc-primary-soft)" }}>req</span>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <button onClick={create} disabled={createMutation.isPending}
                  className="mt-5 w-full rounded-md py-2.5 text-sm font-medium text-white disabled:opacity-70" style={{ backgroundColor: "var(--devdoc-primary)" }}>
                  {createMutation.isPending ? "Creating…" : "Create document"}
                </button>
              </>
            )}
          </aside>
        </div>
      </div>
    </main>
  );
}
