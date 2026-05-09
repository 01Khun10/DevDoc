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
      className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="grid gap-5">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Project name</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            maxLength={200}
          />
          {fieldErrors.name ? (
            <span className="mt-2 block text-sm text-red-700">{fieldErrors.name}</span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <textarea
            className="mt-2 min-h-28 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            maxLength={5000}
          />
          {fieldErrors.description ? (
            <span className="mt-2 block text-sm text-red-700">
              {fieldErrors.description}
            </span>
          ) : null}
        </label>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button
          className="rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-400"
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
