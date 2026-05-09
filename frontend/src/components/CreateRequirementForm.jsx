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
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
      onSubmit={handleSubmit}
    >
      <div className="mb-5 rounded-md border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
        <p>
          <span className="font-semibold text-slate-800">FR</span> = what the system should do.
        </p>
        <p>
          <span className="font-semibold text-slate-800">NFR</span> = how well the system should
          perform.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Type</span>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Choose FR for behavior or NFR for quality expectations.
          </p>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            value={values.type}
            onChange={(event) => updateField("type", event.target.value)}
          >
            <option value="FR">FR</option>
            <option value="NFR">NFR</option>
          </select>
          {fieldErrors.type ? (
            <span className="mt-2 block text-sm text-red-700">{fieldErrors.type}</span>
          ) : null}
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-700">Priority</span>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Optional for now. High priority items should be reviewed first.
          </p>
          <select
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            value={values.priority}
            onChange={(event) => updateField("priority", event.target.value)}
          >
            <option value="">No priority</option>
            <option value="HIGH">HIGH</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="LOW">LOW</option>
          </select>
          {fieldErrors.priority ? (
            <span className="mt-2 block text-sm text-red-700">{fieldErrors.priority}</span>
          ) : null}
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Title</span>
          <input
            className="mt-2 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            maxLength={200}
            placeholder="Example: User can log in securely"
            type="text"
            value={values.title}
            onChange={(event) => updateField("title", event.target.value)}
          />
          {fieldErrors.title ? (
            <span className="mt-2 block text-sm text-red-700">{fieldErrors.title}</span>
          ) : null}
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Description</span>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Describe the requirement in simple, testable language.
          </p>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            maxLength={5000}
            placeholder="Describe the requirement in simple, testable language."
            value={values.description}
            onChange={(event) => updateField("description", event.target.value)}
          />
          {fieldErrors.description ? (
            <span className="mt-2 block text-sm text-red-700">{fieldErrors.description}</span>
          ) : null}
        </label>

        <label className="block lg:col-span-2">
          <span className="text-sm font-medium text-slate-700">Acceptance criteria</span>
          <p className="mt-1 text-xs leading-5 text-slate-500">
            Acceptance criteria explain how we know the requirement is satisfied.
          </p>
          <textarea
            className="mt-2 min-h-24 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-100"
            maxLength={5000}
            placeholder="Example: Given valid credentials, when the user logs in, then the dashboard opens."
            value={values.acceptanceCriteria}
            onChange={(event) => updateField("acceptanceCriteria", event.target.value)}
          />
          {fieldErrors.acceptanceCriteria ? (
            <span className="mt-2 block text-sm text-red-700">
              {fieldErrors.acceptanceCriteria}
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
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Creating..." : "Create requirement"}
        </button>
      </div>
    </form>
  );
}

export default CreateRequirementForm;
