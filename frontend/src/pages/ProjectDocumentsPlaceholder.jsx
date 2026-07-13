import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useProjectOverview } from "../api/projects";
import { Badge, Button, Card, PageHeader, Skeleton, StatCard } from "../components/ui";

const DOC_TYPE_COLORS = {
  SCOPE: "#8b5cf6",
  SRS: "#3b82f6",
  SDS: "#10b981",
  STP: "#f97316"
};

const STATUS_TONES = {
  DRAFT: "muted",
  IN_PROGRESS: "warning",
  COMPLETE: "success"
};

function relativeTime(dateString) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(dateString).toLocaleDateString();
}

function completionColor(percent) {
  if (percent >= 80) return "var(--devdoc-success)";
  if (percent >= 50) return "var(--devdoc-warning)";
  return "var(--devdoc-error)";
}

function SectionStatusMark({ status }) {
  if (status === "COMPLETE") {
    return <span style={{ color: "var(--devdoc-success)" }}>✓</span>;
  }
  if (status === "IN_PROGRESS") {
    return <span style={{ color: "var(--devdoc-warning)" }}>○</span>;
  }
  return <span style={{ color: "var(--devdoc-muted)" }}>—</span>;
}

function DocumentCard({ projectId, document }) {
  const navigate = useNavigate();
  const [sectionsOpen, setSectionsOpen] = useState(false);

  const accent = DOC_TYPE_COLORS[document.documentType] ?? "var(--devdoc-primary)";
  const percent = document.completionPercent ?? 0;

  return (
    <Card className="overflow-hidden !p-0">
      <div className="flex">
        <div className="w-1.5 shrink-0" style={{ backgroundColor: accent }} />
        <div className="min-w-0 flex-1 p-5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge style={{ backgroundColor: `${accent}1f`, color: accent }}>
              {document.documentType}
            </Badge>
            <Badge tone={STATUS_TONES[document.status] ?? "muted"}>
              {document.status?.replace("_", " ")}
            </Badge>
          </div>

          <h2 className="font-headline mt-2 truncate text-xl font-extrabold" title={document.title}>
            {document.title}
          </h2>

          <div className="mt-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span style={{ color: "var(--devdoc-muted)" }}>
                {document.completedRequired}/{document.totalRequired} required sections
              </span>
              <span style={{ color: completionColor(percent) }}>{percent}%</span>
            </div>
            <div
              className="mt-1.5 h-2 w-full overflow-hidden rounded-full"
              style={{ backgroundColor: "var(--devdoc-surface-muted)" }}
            >
              <div
                className="h-full rounded-full transition-all"
                style={{ width: `${percent}%`, backgroundColor: completionColor(percent) }}
              />
            </div>
          </div>

          <p className="mt-3 text-xs" style={{ color: "var(--devdoc-muted)" }}>
            Created {new Date(document.createdAt).toLocaleDateString()} · Last updated{" "}
            {relativeTime(document.updatedAt)}
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => navigate(`/projects/${projectId}/documents/${document.id}`)}>
              Open Editor
            </Button>
            <Button variant="secondary" onClick={() => setSectionsOpen((open) => !open)}>
              {sectionsOpen ? "Hide Sections" : "View Sections"}
            </Button>
          </div>

          {sectionsOpen ? (
            <ul
              className="mt-4 divide-y rounded-xl border text-sm"
              style={{ borderColor: "var(--devdoc-border)" }}
            >
              {(document.sections ?? []).map((section) => (
                <li
                  key={section.id}
                  className="flex items-center gap-3 px-3 py-2"
                  style={{ borderColor: "var(--devdoc-border)" }}
                >
                  <SectionStatusMark status={section.status} />
                  <span className="font-mono text-xs" style={{ color: "var(--devdoc-muted)" }}>
                    {section.sectionNumber}
                  </span>
                  <span className="min-w-0 flex-1 truncate">{section.title}</span>
                  {section.isRequired ? <Badge tone="muted">required</Badge> : null}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  );
}

function ProjectDocumentsPlaceholder() {
  const { projectId, project } = useProject();
  const { data: overview, isLoading } = useProjectOverview(projectId);

  const documents = overview?.documents ?? [];
  const totalSections = documents.reduce((sum, doc) => sum + (doc.sections?.length ?? 0), 0);
  const completedSections = documents.reduce(
    (sum, doc) => sum + (doc.sections?.filter((section) => section.status === "COMPLETE").length ?? 0),
    0
  );
  const completionPercent =
    totalSections > 0 ? Math.round((completedSections / totalSections) * 100) : 0;

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] text-[var(--devdoc-text)]">
      <PageHeader
        eyebrow={project.name}
        title="Documents"
        description="Browse and manage every document in this project."
        actions={
          <Link className="devdoc-gradient-button" to={`/projects/${projectId}/templates`}>
            Create from template
          </Link>
        }
      />

      <div className="mx-auto grid max-w-6xl gap-6 px-6 py-8 lg:grid-cols-[1fr_280px]">
        <section className="space-y-4">
          {isLoading ? (
            <>
              <Skeleton className="h-52 animate-pulse" />
              <Skeleton className="h-52 animate-pulse" />
            </>
          ) : documents.length === 0 ? (
            <div className="devdoc-card-border p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h2 className="font-headline text-xl font-extrabold">No documents yet</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[var(--devdoc-muted)]">
                Create your first document from a professionally structured template.
              </p>
              <div className="mt-6">
                <Link className="devdoc-gradient-button" to={`/projects/${projectId}/templates`}>
                  Browse Templates
                </Link>
              </div>
            </div>
          ) : (
            documents.map((document) => (
              <DocumentCard key={document.id} projectId={projectId} document={document} />
            ))
          )}
        </section>

        <aside className="space-y-4">
          <Card>
            <p className="devdoc-label">Quick actions</p>
            <Link
              className="devdoc-gradient-button mt-3 block w-full text-center"
              to={`/projects/${projectId}/templates`}
            >
              Create document from template
            </Link>
          </Card>
          <div className="grid gap-3">
            <StatCard label="Documents" value={documents.length} />
            <StatCard label="Total sections" value={totalSections} />
            <StatCard label="Completed sections" value={completedSections} />
            <StatCard
              label="Completion"
              value={`${completionPercent}%`}
              color={completionColor(completionPercent)}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}

export default ProjectDocumentsPlaceholder;
