import { useEffect, useState } from "react";
import InlineBadgeSelect from "./InlineBadgeSelect";

const PRIORITY_OPTIONS = ["", "HIGH", "MEDIUM", "LOW"];
const STATUS_OPTIONS = ["PROPOSED", "APPROVED", "IMPLEMENTED", "VERIFIED"];

function formatDate(value) {
  if (!value) return "Unknown";
  return new Date(value).toLocaleDateString();
}

const BADGE = {
  teal:    { bg: "rgba(20,184,166,0.12)", border: "rgba(20,184,166,0.35)", color: "#0d9488" },
  amber:   { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.35)", color: "#b45309" },
  slate:   { bg: "var(--devdoc-surface-muted)", border: "var(--devdoc-border)", color: "var(--devdoc-muted)" },
};

function Badge({ children, tone = "slate" }) {
  const s = BADGE[tone] || BADGE.slate;
  return (
    <span className="rounded-full px-2.5 py-1 text-xs font-bold"
      style={{ backgroundColor: s.bg, border: `1px solid ${s.border}`, color: s.color }}>
      {children}
    </span>
  );
}

const inputStyle = {
  width: "100%",
  borderRadius: "6px",
  border: "1px solid var(--devdoc-border)",
  backgroundColor: "var(--devdoc-surface-inset)",
  color: "var(--devdoc-text)",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  outline: "none",
};

function RequirementCard({ requirement, onUpdate }) {
  const [title, setTitle] = useState(requirement.title);
  const [description, setDescription] = useState(requirement.description || "");
  const [acceptanceCriteria, setAcceptanceCriteria] = useState(requirement.acceptanceCriteria || "");
  const [priority, setPriority] = useState(requirement.priority || "");
  const [status, setStatus] = useState(requirement.status);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    setTitle(requirement.title);
    setDescription(requirement.description || "");
    setAcceptanceCriteria(requirement.acceptanceCriteria || "");
    setPriority(requirement.priority || "");
    setStatus(requirement.status);
  }, [requirement]);

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage("");
    setSuccessMessage("");
    try {
      await onUpdate(requirement.id, { title, description, priority: priority || null, status, acceptanceCriteria });
      setSuccessMessage("Changes saved.");
    } catch (error) {
      setErrorMessage(error.message || "Could not update requirement.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article
      className="rounded-2xl p-5 shadow-[var(--devdoc-shadow-soft)]"
      style={{ border: "1px solid var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <Badge tone="teal">{requirement.code}</Badge>
            <Badge>{requirement.type}</Badge>
            <InlineBadgeSelect
              value={requirement.priority || ""}
              options={PRIORITY_OPTIONS}
              placeholder="No priority"
              badgeStyle={
                requirement.priority === "HIGH"
                  ? { backgroundColor: BADGE.amber.bg, border: `1px solid ${BADGE.amber.border}`, color: BADGE.amber.color }
                  : {}
              }
              onSelect={(next) => onUpdate(requirement.id, { priority: next || null })}
            />
            <InlineBadgeSelect
              value={requirement.status}
              options={STATUS_OPTIONS}
              onSelect={(next) => onUpdate(requirement.id, { status: next })}
            />
          </div>

          <div className="mt-5 grid gap-4">
            <label className="block">
            <span className="devdoc-label">Title</span>
              <input style={{ ...inputStyle, marginTop: "0.5rem", fontWeight: 600 }} maxLength={200} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block">
              <span className="devdoc-label">Description</span>
              <textarea style={{ ...inputStyle, marginTop: "0.5rem", minHeight: "6rem", lineHeight: "1.6" }} maxLength={5000} placeholder="No description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </label>
          </div>

          <label
            className="mt-4 block rounded-2xl p-4"
            style={{ backgroundColor: "var(--devdoc-surface-inset)", border: "1px solid var(--devdoc-border)" }}
          >
            <p className="devdoc-label">Acceptance criteria</p>
            <textarea style={{ ...inputStyle, marginTop: "0.5rem", minHeight: "6rem", lineHeight: "1.6" }} maxLength={5000} placeholder="No acceptance criteria" value={acceptanceCriteria} onChange={(e) => setAcceptanceCriteria(e.target.value)} />
          </label>
          <p className="mt-4 text-xs" style={{ color: "var(--devdoc-muted)" }}>Created {formatDate(requirement.createdAt)}</p>
        </div>

        <div
          className="w-full rounded-2xl p-4 lg:w-72"
          style={{ backgroundColor: "var(--devdoc-surface-muted)", border: "1px solid var(--devdoc-border)" }}
        >
          <h4 className="text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>Review fields</h4>
          <p className="mt-1 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>Code and type stay fixed after creation.</p>
          <div className="mt-4 grid gap-4">
            <label className="block">
              <span className="devdoc-label">Priority</span>
              <select className="devdoc-select mt-2 w-full" value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="">No priority</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </label>
            <label className="block">
              <span className="devdoc-label">Status</span>
              <select className="devdoc-select mt-2 w-full" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="PROPOSED">PROPOSED</option>
                <option value="APPROVED">APPROVED</option>
                <option value="IMPLEMENTED">IMPLEMENTED</option>
                <option value="VERIFIED">VERIFIED</option>
              </select>
            </label>

            {errorMessage ? <p className="text-sm" style={{ color: "var(--devdoc-error)" }}>{errorMessage}</p> : null}
            {successMessage ? <p className="text-sm" style={{ color: "var(--devdoc-success)" }}>{successMessage}</p> : null}

            <button className="devdoc-gradient-button" disabled={isSaving} type="button" onClick={handleSave}>
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default RequirementCard;
