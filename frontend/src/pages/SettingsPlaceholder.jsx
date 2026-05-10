import { Link } from "react-router-dom";

const settingsSections = [
  ["Theme", "Theme preferences will be added as local preferences later."],
  ["Language", "Language options will be added after the main workflow is stable."],
  ["Notifications", "Notification preferences will connect to future in-app alerts."],
  ["Editor Preferences", "Editor display preferences will be added in a later UX pass."]
];

function SettingsPlaceholder() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Settings</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          These settings are placeholders for future local preferences.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {settingsSections.map(([title, description]) => (
            <article
              key={title}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              <span className="mt-4 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                Coming soon
              </span>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export default SettingsPlaceholder;
