import { useState } from "react";

const initialValues = {
  type: "FR",
  title: "",
  description: "",
  priority: "",
  acceptanceCriteria: ""
};

function CreateRequirementForm({ onCreate, onCreated }) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateField(fieldName, value) {
    setValues((cur) => ({ ...cur, [fieldName]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setFieldErrors({});
    setErrorMessage("");
    setIsSubmitting(true);
    try {
      const requirement = await onCreate(values);
      setValues(initialValues);
      onCreated(requirement);
    } catch (error) {
      setFieldErrors(error.fields || {});
      setErrorMessage(error.fields ? "" : error.message || "Could not create requirement");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      className="devdoc-card-border p-6"
      onSubmit={handleSubmit}
    >
      <div
        className="devdoc-inset mb-5 text-sm leading-6 text-[var(--devdoc-muted)]"
      >
        <p><span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>FR</span> = what the system should do.</p>
        <p><span className="font-semibold" style={{ color: "var(--devdoc-text)" }}>NFR</span> = how well the system should perform.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="devdoc-label">Type</span>
          <p className="mt-1 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>Choose FR for behavior or NFR for quality expectations.</p>
          <select className="devdoc-select mt-2 w-full" value={values.type} onChange={(e) => updateField("type", e.target.value)}>
            <option value="FR">FR</option>
            <option value="NFR">NFR</option>
          </select>
          {fieldErrors.type ? <span className="mt-2 block text-sm" style={{ color: "var(--devdoc-error)" }}>{fieldErrors.type}</span> : null}
        </label>

        <label className="block">
          <span className="devdoc-label">Priority</span>
          <p className="mt-1 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>Optional. High priority items should be reviewed first.</p>
          <select className="devdoc-select mt-2 w-full" value={values.priority} onChange={(e) => updateField("priority", e.target.value)}>
            <option value="">No priority</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          {fieldErrors.priority ? <span className="mt-2 block text-sm" style={{ color: "var(--devdoc-error)" }}>{fieldErrors.priority}</span> : null}
        </label>

        <label className="block lg:col-span-2">
          <span className="devdoc-label">Title</span>
          <input
            className="devdoc-soft-input mt-2 w-full"
            maxLength={200}
            placeholder="Example: User can log in securely"
            type="text"
            value={values.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
          {fieldErrors.title ? <span className="mt-2 block text-sm" style={{ color: "var(--devdoc-error)" }}>{fieldErrors.title}</span> : null}
        </label>

        <label className="block lg:col-span-2">
          <span className="devdoc-label">Description</span>
          <p className="mt-1 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>Describe the requirement in simple, testable language.</p>
          <textarea
            className="devdoc-soft-input mt-2 min-h-28 w-full"
            maxLength={5000}
            placeholder="Describe the requirement in simple, testable language."
            value={values.description}
            onChange={(e) => updateField("description", e.target.value)}
          />
          {fieldErrors.description ? <span className="mt-2 block text-sm" style={{ color: "var(--devdoc-error)" }}>{fieldErrors.description}</span> : null}
        </label>

        <label className="block lg:col-span-2">
          <span className="devdoc-label">Acceptance criteria</span>
          <p className="mt-1 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>How do we know the requirement is satisfied?</p>
          <textarea
            className="devdoc-soft-input mt-2 min-h-28 w-full"
            maxLength={5000}
            placeholder="Given valid credentials, when the user logs in, then the dashboard opens."
            value={values.acceptanceCriteria}
            onChange={(e) => updateField("acceptanceCriteria", e.target.value)}
          />
          {fieldErrors.acceptanceCriteria ? <span className="mt-2 block text-sm" style={{ color: "var(--devdoc-error)" }}>{fieldErrors.acceptanceCriteria}</span> : null}
        </label>
      </div>

      {errorMessage ? (
        <div
          className="mt-5 rounded-xl border px-4 py-3 text-sm font-medium"
          style={{ backgroundColor: "rgba(207,34,46,0.08)", borderColor: "rgba(207,34,46,0.35)", color: "var(--devdoc-error)" }}
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <button className="devdoc-gradient-button" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create requirement"}
        </button>
      </div>
    </form>
  );
}

export default CreateRequirementForm;
