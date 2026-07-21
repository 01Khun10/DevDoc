import { useMemo } from "react";
import { Icon } from "../components/ui";
import useAuth from "../hooks/useAuth";
import { useProjects } from "../api/projects";

function initials(name = "") {
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "U") + (p[1]?.[0] || "")).toUpperCase();
}
function Card({ title, children }) {
  return (
    <section className="rounded-lg border p-6" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
      <h2 className="mb-4 font-mono text-[11px] uppercase tracking-[0.15em] text-[var(--devdoc-muted)]">{title}</h2>
      {children}
    </section>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { data: projects = [] } = useProjects();

  const memberSince = useMemo(() => {
    if (!user?.createdAt) return null;
    return new Date(user.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long" });
  }, [user]);

  return (
    <main className="min-h-screen text-[var(--devdoc-text)]" style={{ backgroundColor: "var(--devdoc-bg)" }}>
      <div className="border-b px-6 py-5" style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--devdoc-primary)]">Account</p>
        <h1 className="mt-1.5 font-headline text-2xl font-bold tracking-tight">Profile</h1>
      </div>

      <div className="mx-auto flex max-w-3xl flex-col gap-5 px-6 py-6">
        <Card title="Identity">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full font-headline text-xl font-semibold text-white"
              style={{ background: "linear-gradient(135deg, var(--devdoc-primary), var(--devdoc-highlight))" }}>
              {initials(user?.name)}
            </div>
            <div className="min-w-0">
              <p className="font-headline text-lg font-semibold">{user?.name || "No name provided"}</p>
              <p className="truncate text-sm text-[var(--devdoc-muted)]">{user?.email}</p>
              {memberSince && <p className="mt-0.5 font-mono text-[11px] text-[var(--devdoc-subtle)]">Member since {memberSince}</p>}
            </div>
          </div>
          <p className="mt-4 text-[12px] text-[var(--devdoc-subtle)]">Email can't be changed.</p>
        </Card>

        <Card title="Your stats">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div><p className="font-headline text-2xl font-semibold">{projects.length}</p><p className="text-[12px] text-[var(--devdoc-muted)]">Projects</p></div>
            <div><p className="font-headline text-2xl font-semibold">{memberSince ? "✓" : "—"}</p><p className="text-[12px] text-[var(--devdoc-muted)]">Active account</p></div>
          </div>
        </Card>

      </div>
    </main>
  );
}
