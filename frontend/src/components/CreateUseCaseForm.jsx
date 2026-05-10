import { useState } from "react";

const initialValues = {
  title: "",
  description: ""
};

function CreateUseCaseForm({ onCreate, onCreated }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(fieldName, value) {
    setValues((currentValues) => ({
      ...currentValues,
      [fieldName]: value
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const useCase = await onCreate(values);
      setValues(initialValues);
      onCreated(useCase);
    } catch (error) {
      setFieldErrors(error.fields || {});
      setErrorMessage(error.fields ? "" : error.message || "Could not create use case");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="devdoc-card-border p-6" onSubmit={handleSubmit}>
      <div className="devdoc-inset mb-5 text-sm leading-6 text-[var(--devdoc-muted)]">
        <p>Use cases describe how actors or users interact with the system.</p>
        <p className="mt-1">
          Example: User logs in, user creates a project, or admin reviews validation issues.
        </p>
      </div>

      <div className="grid gap-5">
        <label className="block">
          <span className="devdoc-label">Title</span>
          <input
            className="devdoc-soft-input mt-2 w-full"
            maxLength={200}
            placeholder="Example: User logs in"
            type="text"
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
          {fieldErrors.title ? (
            <span className="mt-2 block text-sm font-medium text-[var(--devdoc-error)]">{fieldErrors.title}</span>
          ) : null}
        </label>

        <label className="block">
          <span className="devdoc-label">Description</span>
          <p className="mt-1 text-xs leading-5 text-[var(--devdoc-muted)]">
            Example: User enters valid credentials and reaches the dashboard.
          </p>
          <textarea
            className="devdoc-soft-input mt-2 min-h-28 w-full"
            maxLength={5000}
            placeholder="Describe the user scenario in clear, simple steps."
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
          {fieldErrors.description ? (
            <span className="mt-2 block text-sm font-medium text-[var(--devdoc-error)]">{fieldErrors.description}</span>
          ) : null}
        </label>
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-xl border px-4 py-3 text-sm font-medium text-[var(--devdoc-error)]" style={{ backgroundColor: "color-mix(in srgb, var(--devdoc-error) 9%, transparent)", borderColor: "color-mix(in srgb, var(--devdoc-error) 32%, var(--devdoc-border))" }}>
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button className="devdoc-gradient-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create use case"}
        </button>
      </div>
    </form>
  );
}

export default CreateUseCaseForm;
