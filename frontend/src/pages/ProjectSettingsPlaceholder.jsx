import { useCallback, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "../context/ProjectContext";
import { useNotify } from "../context/NotificationContext";
import { useUpdateProject, useDeleteProject, useCreateShareLink } from "../api/projects";
import { Button, Card, Badge, PageHeader, SkeletonCard } from "../components/ui";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

/* ── Status options ───────────────────────────── */
const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Archived", label: "Archived" },
];

/* ── Inline auto-save input ──────────────────── */
function AutoSaveInput({ label, value, onSave, multiline = false, readOnly = false, lockedTooltip }) {
  const [draft, setDraft] = useState(value ?? "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef(null);

  const handleBlur = useCallback(async () => {
    const trimmed = draft.trim();
    if (trimmed === (value ?? "").trim() || readOnly) return;
    setSaving(true);
    try {
      await onSave(trimmed || null);
    } finally {
      setSaving(false);
    }
  }, [draft, value, onSave, readOnly]);

  const Tag = multiline ? "textarea" : "input";

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        <label className="devdoc-label text-xs">{label}</label>
        {saving && (
          <span className="text-[10px] font-semibold" style={{ color: "var(--devdoc-muted)" }}>
            Saving…
          </span>
        )}
        {readOnly && lockedTooltip && (
          <span
            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold"
            style={{
              backgroundColor: "var(--devdoc-surface-muted)",
              color: "var(--devdoc-muted)",
              border: "1px solid var(--devdoc-border)",
            }}
            title={lockedTooltip}
          >
            🔒 Locked
          </span>
        )}
      </div>
      <Tag
        ref={inputRef}
        className="w-full rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2"
        style={{
          backgroundColor: readOnly ? "var(--devdoc-surface-muted)" : "var(--devdoc-bg)",
          borderColor: "var(--devdoc-border)",
          color: "var(--devdoc-text)",
          "--tw-ring-color": "var(--devdoc-primary)",
          resize: multiline ? "vertical" : "none",
          minHeight: multiline ? "80px" : undefined,
          cursor: readOnly ? "not-allowed" : undefined,
        }}
        value={readOnly ? value ?? "" : draft}
        onChange={(e) => !readOnly && setDraft(e.target.value)}
        onBlur={handleBlur}
        readOnly={readOnly}
        rows={multiline ? 3 : undefined}
      />
    </div>
  );
}

/* ── Status dropdown ─────────────────────────── */
function StatusSelect({ currentStatus, onSave }) {
  const [saving, setSaving] = useState(false);

  const handleChange = useCallback(
    async (e) => {
      const newStatus = e.target.value;
      if (newStatus === currentStatus) return;
      setSaving(true);
      try {
        await onSave(newStatus);
      } finally {
        setSaving(false);
      }
    },
    [currentStatus, onSave]
  );

  return (
    <div className="grid gap-1.5">
      <div className="flex items-center gap-2">
        <span className="devdoc-label text-xs">Status</span>
        {saving && (
          <span className="text-[10px] font-semibold" style={{ color: "var(--devdoc-muted)" }}>
            Saving…
          </span>
        )}
      </div>
      <select
        className="w-full rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2"
        style={{
          backgroundColor: "var(--devdoc-bg)",
          borderColor: "var(--devdoc-border)",
          color: "var(--devdoc-text)",
          "--tw-ring-color": "var(--devdoc-primary)",
        }}
        value={currentStatus || "Active"}
        onChange={handleChange}
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ── Share Link section ──────────────────────── */
function ShareLinkSection({ projectId }) {
  const { notify } = useNotify();
  const createShareLink = useCreateShareLink(projectId);
  const [shareUrl, setShareUrl] = useState(null);
  const inputRef = useRef(null);

  const handleCreate = useCallback(() => {
    createShareLink.mutate(undefined, {
      onSuccess: (data) => {
        const url = `${window.location.origin}/shared/${data.token}`;
        setShareUrl(url);
        notify("Share link created!", { tone: "success" });
      },
      onError: (error) => {
        notify(error.message || "Failed to create share link", { tone: "error" });
      },
    });
  }, [createShareLink, notify]);

  const handleCopy = useCallback(() => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl).then(() => {
      notify("Link copied!", { tone: "success" });
    });
  }, [shareUrl, notify]);

  return (
    <Card className="mt-6">
      <h2 className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-text)" }}>
        Share Link
      </h2>
      <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
        Share links give supervisors read-only access to your validation report and traceability graph.
      </p>

      {shareUrl ? (
        <div className="mt-4 flex gap-2">
          <input
            ref={inputRef}
            readOnly
            value={shareUrl}
            className="flex-1 rounded-lg border px-3 py-2 text-sm font-mono"
            style={{
              backgroundColor: "var(--devdoc-surface-muted)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-text)",
            }}
            onClick={(e) => e.target.select()}
          />
          <Button variant="secondary" onClick={handleCopy}>
            Copy
          </Button>
        </div>
      ) : (
        <div className="mt-4">
          <Button
            onClick={handleCreate}
            disabled={createShareLink.isPending}
          >
            {createShareLink.isPending ? "Creating…" : "Create share link"}
          </Button>
        </div>
      )}
    </Card>
  );
}

/* ── Delete confirmation modal ───────────────── */
function DeleteConfirmModal({ projectName, isOpen, onClose, onConfirm, isPending }) {
  const [typed, setTyped] = useState("");

  if (!isOpen) return null;

  const matches = typed.trim() === projectName;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-6"
      role="dialog"
      aria-modal="true"
      aria-label="Delete project confirmation"
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-2xl border p-6 shadow-xl"
        style={{
          borderColor: "var(--devdoc-error)",
          backgroundColor: "var(--devdoc-surface)",
        }}
      >
        <h2
          className="font-headline text-lg font-extrabold"
          style={{ color: "var(--devdoc-error)" }}
        >
          Delete this project?
        </h2>
        <p className="mt-3 text-sm" style={{ color: "var(--devdoc-text)" }}>
          This action <strong>cannot be undone</strong>. All documents, requirements, traceability
          links, and validation data will be permanently deleted.
        </p>
        <p className="mt-4 text-sm font-medium" style={{ color: "var(--devdoc-muted)" }}>
          Type <strong style={{ color: "var(--devdoc-text)" }}>{projectName}</strong> to confirm:
        </p>
        <input
          className="mt-2 w-full rounded-lg border px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2"
          style={{
            backgroundColor: "var(--devdoc-bg)",
            borderColor: "var(--devdoc-border)",
            color: "var(--devdoc-text)",
            "--tw-ring-color": "var(--devdoc-error)",
          }}
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          placeholder={projectName}
          autoFocus
        />
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            variant="danger"
            disabled={!matches || isPending}
            onClick={() => onConfirm()}
          >
            {isPending ? "Deleting…" : "Delete project"}
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Settings Page ──────────────────────── */
function ProjectSettingsPlaceholder() {
  const { projectId, project } = useProject();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const updateProject = useUpdateProject(projectId);
  const deleteProject = useDeleteProject();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSaveField = useCallback(
    (field) => async (value) => {
      try {
        await updateProject.mutateAsync({ [field]: value });
        notify("Changes saved", { tone: "success" });
      } catch (error) {
        notify(error.message || "Failed to save", { tone: "error" });
      }
    },
    [updateProject, notify]
  );

  const handleDelete = useCallback(() => {
    deleteProject.mutate(projectId, {
      onSuccess: () => {
        notify("Project deleted", { tone: "success" });
        navigate("/dashboard", { replace: true });
      },
      onError: (error) => {
        notify(error.message || "Failed to delete project", { tone: "error" });
      },
    });
  }, [deleteProject, projectId, navigate, notify]);

  if (!project) {
    return (
      <main className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="mx-auto max-w-3xl">
          <SkeletonCard lines={4} />
          <div className="mt-6"><SkeletonCard lines={2} /></div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen text-[var(--devdoc-text)]"
      style={{ backgroundColor: "var(--devdoc-bg)" }}
    >
      <PageHeader
        eyebrow={project.name}
        title="Project Settings"
        description="Manage project metadata, sharing, and access."
      />

      <section className="mx-auto max-w-3xl px-6 py-8">
        {/* ── Project Info ────────────────────────── */}
        <Card>
          <h2 className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-text)" }}>
            Project Info
          </h2>
          <div className="mt-5 grid gap-5">
            <AutoSaveInput
              label="Project name"
              value={project.name}
              onSave={handleSaveField("name")}
            />
            <AutoSaveInput
              label="Description"
              value={project.description}
              onSave={handleSaveField("description")}
              multiline
            />
            <AutoSaveInput
              label="Profile"
              value={project.profile?.name ?? "None"}
              readOnly
              lockedTooltip="Profile cannot be changed after creation"
            />
            <StatusSelect
              currentStatus={project.status || "Active"}
              onSave={handleSaveField("status")}
            />
          </div>
        </Card>

        {/* ── Share Link ─────────────────────────── */}
        <ShareLinkSection projectId={projectId} />

        {/* ── Danger Zone ────────────────────────── */}
        <div
          className="mt-6 rounded-xl border-2 p-6"
          style={{
            borderColor: "color-mix(in srgb, var(--devdoc-error) 50%, var(--devdoc-border))",
            backgroundColor: "var(--devdoc-surface)",
          }}
        >
          <h2
            className="font-headline text-lg font-extrabold"
            style={{ color: "var(--devdoc-error)" }}
          >
            Danger Zone
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>
            Irreversible and destructive actions.
          </p>
          <div className="mt-5 flex items-center justify-between rounded-xl border px-4 py-3"
            style={{
              borderColor: "color-mix(in srgb, var(--devdoc-error) 30%, var(--devdoc-border))",
              backgroundColor: "var(--devdoc-error-soft)",
            }}
          >
            <div>
              <p className="text-sm font-bold" style={{ color: "var(--devdoc-text)" }}>
                Delete this project
              </p>
              <p className="mt-0.5 text-xs" style={{ color: "var(--devdoc-muted)" }}>
                Permanently remove the project and all associated data.
              </p>
            </div>
            <Button
              variant="danger"
              onClick={() => setShowDeleteModal(true)}
              className="shrink-0"
            >
              Delete project
            </Button>
          </div>
        </div>
      </section>

      {/* ── Delete confirmation modal ──────────── */}
      <DeleteConfirmModal
        projectName={project.name}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        isPending={deleteProject.isPending}
      />
    </main>
  );
}

export default ProjectSettingsPlaceholder;
