import { useState } from "react";
import { Link } from "react-router-dom";
import { Modal, SkeletonText } from "./ui";
import { useActivityLog } from "../api/activity";

const ENTITY_META = {
  BUSINESS_OBJECTIVE: { color: "var(--devdoc-artifact-bo)", label: "Business objective", path: "business-objectives" },
  USE_CASE: { color: "var(--devdoc-artifact-uc)", label: "Use case", path: "use-cases" },
  REQUIREMENT: { color: "var(--devdoc-artifact-fr)", label: "Requirement", path: "requirements" },
  DESIGN_ELEMENT: { color: "var(--devdoc-artifact-de)", label: "Design element", path: "design-elements" },
  TEST_CASE: { color: "var(--devdoc-artifact-tc)", label: "Test case", path: "test-cases" },
  DOCUMENT: { color: "var(--devdoc-artifact-sec)", label: "Document", path: "documents" },
  TRACEABILITY_LINK: { color: "var(--devdoc-primary)", label: "Traceability link", path: "traceability" },
  VALIDATION_RUN: { color: "var(--devdoc-warning)", label: "Validation run", path: "validation" }
};

const ACTION_VERBS = {
  CREATED: "created",
  UPDATED: "updated",
  DELETED: "deleted"
};

function relativeTime(value) {
  const seconds = Math.round((Date.now() - new Date(value).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function describeEntry(entry) {
  const metadata = entry.metadata || {};
  const meta = ENTITY_META[entry.entityType] || { label: entry.entityType || "Item" };

  if (entry.action === "LINKED") {
    return {
      code: metadata.sourceCode,
      text: `${metadata.sourceCode || "Artifact"} linked to ${metadata.targetCode || "artifact"} (${metadata.linkType || "link"})`
    };
  }
  if (entry.action === "UNLINKED") {
    return { code: null, text: "Traceability link removed" };
  }
  if (entry.action === "VALIDATION_RUN") {
    return {
      code: null,
      text: `Validation run completed — Score: ${metadata.readinessScore ?? "?"}/100`
    };
  }
  if (entry.entityType === "DOCUMENT") {
    return {
      code: null,
      text: `${metadata.documentType || ""} document ${ACTION_VERBS[entry.action] || entry.action.toLowerCase()} — ${metadata.title || ""}`.trim()
    };
  }

  const verb = ACTION_VERBS[entry.action] || entry.action.toLowerCase();
  return {
    code: metadata.code,
    text: `${metadata.code || ""} ${meta.label} ${verb}${metadata.title ? ` — ${metadata.title}` : ""}`.trim()
  };
}

function ActivityEntry({ entry, projectId }) {
  const meta = ENTITY_META[entry.entityType] || { color: "var(--devdoc-muted)", path: null };
  const { code, text } = describeEntry(entry);
  // DELETED items no longer exist, so a highlight link would go nowhere useful.
  const linkable = meta.path && entry.action !== "DELETED";
  const target = entry.entityType === "TRACEABILITY_LINK" || entry.entityType === "VALIDATION_RUN"
    ? `/projects/${projectId}/${meta.path}`
    : `/projects/${projectId}/${meta.path}?highlight=${entry.entityId}`;

  return (
    <li className="flex items-start gap-3">
      <span
        className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
        style={{ backgroundColor: meta.color }}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6" style={{ color: "var(--devdoc-text)" }}>
          {linkable ? (
            <Link
              to={target}
              className="font-semibold hover:underline"
              style={{ color: "var(--devdoc-primary)" }}
            >
              {code ? `${code} ` : ""}
            </Link>
          ) : code ? (
            <span className="font-semibold">{code} </span>
          ) : null}
          {code ? text.slice(code.length).trimStart() : text}
        </p>
        <p className="text-xs" style={{ color: "var(--devdoc-muted)" }}>
          {relativeTime(entry.createdAt)}
        </p>
      </div>
    </li>
  );
}

function TimelineSkeleton({ count = 5 }) {
  return (
    <ul className="grid gap-4">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex items-start gap-3">
          <span className="devdoc-skeleton mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" />
          <div className="flex-1">
            <SkeletonText width={index % 2 === 0 ? "w-64" : "w-48"} />
            <SkeletonText width="w-20" className="mt-1.5" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function ActivityFeed({ projectId }) {
  const { data: activities, isLoading } = useActivityLog(projectId);
  const [showAll, setShowAll] = useState(false);

  return (
    <div
      className="rounded-xl border p-5"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      {isLoading ? (
        <TimelineSkeleton />
      ) : !activities || activities.length === 0 ? (
        <p className="py-4 text-center text-sm" style={{ color: "var(--devdoc-muted)" }}>
          No activity yet. Start by creating a document.
        </p>
      ) : (
        <>
          <ul className="grid gap-4">
            {activities.slice(0, 15).map((entry) => (
              <ActivityEntry key={entry.id} entry={entry} projectId={projectId} />
            ))}
          </ul>
          {activities.length > 15 ? (
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="mt-4 text-xs font-bold hover:underline"
              style={{ color: "var(--devdoc-primary)" }}
            >
              View all
            </button>
          ) : null}
        </>
      )}

      <Modal isOpen={showAll} title="All recent activity" onClose={() => setShowAll(false)}>
        <ul className="grid max-h-[60vh] gap-4 overflow-y-auto pr-1">
          {(activities || []).map((entry) => (
            <ActivityEntry key={entry.id} entry={entry} projectId={projectId} />
          ))}
        </ul>
      </Modal>
    </div>
  );
}

export default ActivityFeed;
