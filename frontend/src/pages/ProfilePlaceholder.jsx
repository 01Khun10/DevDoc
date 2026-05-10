import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProfilePlaceholder() {
  const { user } = useAuth();
  const displayName = user?.name || "No name provided";

  return (
    <main className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <section className="mx-auto max-w-3xl">
        <Link className="text-sm font-bold text-[var(--devdoc-primary)] hover:underline" to="/dashboard">
          Back to dashboard
        </Link>

        <div className="mb-8 mt-4">
          <h1 className="font-headline text-4xl font-extrabold tracking-tight">My Profile</h1>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Your account details and quick links.</p>
        </div>

        <div className="grid gap-6">
          <div className="devdoc-card-border p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl bg-gradient-to-br from-[var(--devdoc-primary-strong)] to-[var(--devdoc-primary)] text-2xl font-black text-white shadow-lg shadow-indigo-500/20">
                {displayName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-headline truncate text-2xl font-extrabold">{displayName}</p>
                {user?.email ? (
                  <p className="mt-1 truncate text-sm text-[var(--devdoc-muted)]">{user.email}</p>
                ) : null}
              </div>
            </div>

            <dl className="mt-6 grid gap-3 border-t border-[var(--devdoc-border)] pt-5 text-sm sm:grid-cols-3">
              <div className="devdoc-inset">
                <dt className="devdoc-label">Status</dt>
                <dd className="mt-1.5 flex items-center gap-2 font-bold text-[var(--devdoc-success)]">
                  <span className="h-2 w-2 rounded-full bg-[var(--devdoc-success)]" />
                  Active
                </dd>
              </div>
              <div className="devdoc-inset">
                <dt className="devdoc-label">Role</dt>
                <dd className="mt-1.5 font-bold">Project Owner</dd>
              </div>
              <div className="devdoc-inset">
                <dt className="devdoc-label">Account type</dt>
                <dd className="mt-1.5 font-bold">DevDoc User</dd>
              </div>
            </dl>
          </div>

          <div className="devdoc-card-border p-6">
            <h2 className="font-headline text-lg font-extrabold">Quick Links</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link to="/settings" className="devdoc-button-secondary">Settings</Link>
              <Link to="/docs" className="devdoc-button-secondary">Docs</Link>
              <Link to="/help" className="devdoc-button-secondary">Help / FAQ</Link>
            </div>
          </div>

          <div className="devdoc-card-border p-6">
            <h2 className="font-headline text-lg font-extrabold">Account Actions</h2>
            <p className="mt-2 text-sm text-[var(--devdoc-muted)]">
              Profile editing and password management will be available in a future release.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button disabled className="cursor-not-allowed rounded-full border border-[var(--devdoc-border)] bg-[var(--devdoc-surface-muted)] px-4 py-2.5 text-sm font-bold text-[var(--devdoc-subtle)]">
                Edit profile - coming soon
              </button>
              <button disabled className="cursor-not-allowed rounded-full border border-[var(--devdoc-border)] bg-[var(--devdoc-surface-muted)] px-4 py-2.5 text-sm font-bold text-[var(--devdoc-subtle)]">
                Change password - coming soon
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ProfilePlaceholder;
