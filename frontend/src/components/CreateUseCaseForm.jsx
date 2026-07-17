import { useState } from "react";
import { Button, Input, Textarea } from "./ui";

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
        <Input
          label="Title"
          error={fieldErrors.title}
          maxLength={200}
          placeholder="Example: User logs in"
          type="text"
          value={values.title}
          onChange={(event) => updateField("title", event.target.value)}
        />

        <Textarea
          label="Description"
          helper="Example: User enters valid credentials and reaches the dashboard."
          error={fieldErrors.description}
          maxLength={5000}
          rows={4}
          placeholder="Describe the user scenario in clear, simple steps."
          value={values.description}
          onChange={(event) => updateField("description", event.target.value)}
        />
      </div>

      {errorMessage ? (
        <div className="mt-5 rounded-xl border px-4 py-3 text-sm font-medium text-[var(--devdoc-error)]" style={{ backgroundColor: "color-mix(in srgb, var(--devdoc-error) 9%, transparent)", borderColor: "color-mix(in srgb, var(--devdoc-error) 32%, var(--devdoc-border))" }}>
          {errorMessage}
        </div>
      ) : null}

      <div className="mt-5 flex justify-end">
        <Button loading={isSubmitting} type="submit">
          {isSubmitting ? "Creating..." : "Create use case"}
        </Button>
      </div>
    </form>
  );
}

export default CreateUseCaseForm;
