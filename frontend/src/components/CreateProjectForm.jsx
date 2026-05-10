import { useState } from "react";
import { createProject } from "../services/projectService";

function CreateProjectForm({ onCreated }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const project = await createProject({ name, description });
      setName("");
      setDescription("");
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
      className="devdoc-card-border mt-6 p-6"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="devdoc-label">Project name</span>
          <input
            className="devdoc-soft-input mt-2 w-full"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
          />
          {fieldErrors.name ? (
            <span className="mt-2 block text-sm font-medium text-[var(--devdoc-error)]">{fieldErrors.name}</span>
          ) : null}
        </label>

        <label className="block">
          <span className="devdoc-label">Description</span>
          <textarea
            className="devdoc-soft-input mt-2 min-h-28 w-full"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={5000}
          />
          {fieldErrors.description ? (
            <span className="mt-2 block text-sm font-medium text-[var(--devdoc-error)]">
              {fieldErrors.description}
            </span>
          ) : null}
        </label>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-xl border px-4 py-3 text-sm font-medium text-[var(--devdoc-error)]" style={{ backgroundColor: "color-mix(in srgb, var(--devdoc-error) 9%, transparent)", borderColor: "color-mix(in srgb, var(--devdoc-error) 32%, var(--devdoc-border))" }}>
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          className="devdoc-gradient-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create project"}
        </button>
      </div>
    </form>
  );
}

export default CreateProjectForm;
