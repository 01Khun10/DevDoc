import { useState } from "react";
import { Button, Input, Select, Textarea } from "./ui";

const initialValues = {
  type: "FR",
  title: "",
  description: "",
  priority: "",
  acceptanceCriteria: ""
};

const TYPE_OPTIONS = [
  { value: "FR", label: "FR" },
  { value: "NFR", label: "NFR" }
];

const PRIORITY_OPTIONS = [
  { value: "", label: "No priority" },
  { value: "HIGH", label: "HIGH" },
  { value: "MEDIUM", label: "MEDIUM" },
  { value: "LOW", label: "LOW" }
];

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
        <Select
          label="Type"
          helper="Choose FR for behavior or NFR for quality expectations."
          error={fieldErrors.type}
          options={TYPE_OPTIONS}
          value={values.type}
          onChange={(e) => updateField("type", e.target.value)}
        />

        <Select
          label="Priority"
          helper="Optional. High priority items should be reviewed first."
          error={fieldErrors.priority}
          options={PRIORITY_OPTIONS}
          value={values.priority}
          onChange={(e) => updateField("priority", e.target.value)}
        />

        <Input
          label="Title"
          fieldClassName="lg:col-span-2"
          error={fieldErrors.title}
          maxLength={200}
          placeholder="Example: User can log in securely"
          type="text"
          value={values.title}
          onChange={(e) => updateField("title", e.target.value)}
        />

        <Textarea
          label="Description"
          fieldClassName="lg:col-span-2"
          helper="Describe the requirement in simple, testable language."
          error={fieldErrors.description}
          maxLength={5000}
          rows={4}
          placeholder="Describe the requirement in simple, testable language."
          value={values.description}
          onChange={(e) => updateField("description", e.target.value)}
        />

        <Textarea
          label="Acceptance criteria"
          fieldClassName="lg:col-span-2"
          helper="How do we know the requirement is satisfied?"
          error={fieldErrors.acceptanceCriteria}
          maxLength={5000}
          rows={4}
          placeholder="Given valid credentials, when the user logs in, then the dashboard opens."
          value={values.acceptanceCriteria}
          onChange={(e) => updateField("acceptanceCriteria", e.target.value)}
        />
      </div>

      {errorMessage ? (
        <div
          className="mt-5 rounded-xl border px-4 py-3 text-sm font-medium"
          style={{
            backgroundColor: "var(--devdoc-error-soft)",
            borderColor: "color-mix(in srgb, var(--devdoc-error) 32%, var(--devdoc-border))",
            color: "var(--devdoc-error)"
          }}
          role="alert"
        >
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button loading={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create requirement"}
        </Button>
      </div>
    </form>
  );
}

export default CreateRequirementForm;
