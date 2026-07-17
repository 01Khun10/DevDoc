import { useState } from "react";
import { useNotify } from "../context/NotificationContext";
import { createProject } from "../services/projectService";
import { Button, Input, Textarea } from "./ui";

const profileOptions = [
  {
    id: "standard",
    title: "Standard Documentation",
    description: "Scope, SRS, SDS, and STP for professional software projects."
  },
  {
    id: "academic",
    title: "Academic FYP",
    description: "Structured documents for capstone, semester, and final-year projects."
  },
  {
    id: "company",
    title: "Company Project",
    description: "Delivery-friendly documentation for product and client teams."
  }
];

function CreateProjectForm({ onCreated, onCancel }) {
  const { notify } = useNotify();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedProfile, setSelectedProfile] = useState("standard");
  const [docLintingEnabled, setDocLintingEnabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage("");

    const trimmedName = name.trim();
    if (!trimmedName) {
      setFieldErrors({ name: "Project name is required" });
      return;
    }

    setIsSubmitting(true);

    try {
      const project = await createProject({
        name: trimmedName,
        description: description.trim()
      });
      setName("");
      setDescription("");
      setSelectedProfile("standard");
      setDocLintingEnabled(true);
      notify("Project created.", { tone: "success" });
      onCreated(project);
    } catch (error) {
      setFieldErrors(error.fields || {});
      setErrorMessage(error.fields ? "" : error.message || "Could not create project");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="grid gap-5"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4">
        <Input
          label="Project name"
          error={fieldErrors.name}
          type="text"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={200}
          placeholder="Example: Flight Booking API"
        />

        <Textarea
          label="Description"
          error={fieldErrors.description}
          rows={4}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          maxLength={5000}
          placeholder="Describe the project goals, product scope, or documentation focus."
        />
      </div>

      <section>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="devdoc-label">Documentation setup preference</p>
            <p className="mt-1 text-xs" style={{ color: "var(--devdoc-muted)" }}>
              Local UI guidance only. You can choose templates after opening the project.
            </p>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          {profileOptions.map((option) => {
            const isSelected = selectedProfile === option.id;

            return (
              <button
                key={option.id}
                className="rounded-xl border p-4 text-left transition hover:-translate-y-0.5"
                style={{
                  borderColor: isSelected ? "var(--devdoc-primary)" : "var(--devdoc-border)",
                  backgroundColor: isSelected ? "var(--devdoc-primary-soft)" : "var(--devdoc-surface-inset)",
                  color: "var(--devdoc-text)"
                }}
                type="button"
                onClick={() => setSelectedProfile(option.id)}
              >
                <span className="text-sm font-extrabold">{option.title}</span>
                <span className="mt-2 block text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div
        className="grid gap-3 rounded-xl border px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center"
        style={{
          borderColor: "var(--devdoc-border)",
          backgroundColor: "var(--devdoc-surface-inset)"
        }}
      >
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-bold" style={{ color: "var(--devdoc-text)" }}>Doc-Linter checks</p>
            <span
              className="rounded-md border px-2 py-0.5 text-[11px] font-bold"
              style={{
                borderColor: docLintingEnabled
                  ? "color-mix(in srgb, var(--devdoc-primary) 35%, var(--devdoc-border))"
                  : "var(--devdoc-border)",
                backgroundColor: docLintingEnabled ? "var(--devdoc-primary-soft)" : "var(--devdoc-surface)",
                color: docLintingEnabled ? "var(--devdoc-primary)" : "var(--devdoc-muted)"
              }}
            >
              {docLintingEnabled ? "Preferred" : "Off for now"}
            </span>
          </div>
          <p className="mt-1 text-xs" style={{ color: "var(--devdoc-muted)" }}>
            Frontend preference for now. Validation remains available from the project workspace.
          </p>
        </div>
        <button
          aria-pressed={docLintingEnabled}
          className="relative h-7 w-12 justify-self-start rounded-full border transition sm:justify-self-end"
          style={{
            borderColor: docLintingEnabled ? "var(--devdoc-primary)" : "var(--devdoc-border)",
            backgroundColor: docLintingEnabled ? "var(--devdoc-primary)" : "var(--devdoc-surface-muted)"
          }}
          type="button"
          onClick={() => setDocLintingEnabled((value) => !value)}
          title="Doc-Linter preference is local to this setup form for now"
        >
          <span
            className={`absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${docLintingEnabled ? "translate-x-6" : "translate-x-1"}`}
          />
        </button>
      </div>

      {errorMessage ? (
        <div className="rounded-xl border px-4 py-3 text-sm font-medium text-[var(--devdoc-error)]" style={{ backgroundColor: "color-mix(in srgb, var(--devdoc-error) 9%, transparent)", borderColor: "color-mix(in srgb, var(--devdoc-error) 32%, var(--devdoc-border))" }}>
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {isSubmitting ? "Creating..." : "Create project"}
        </Button>
      </div>
    </form>
  );
}

export default CreateProjectForm;
