import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import { useNotify } from "../context/NotificationContext";
import { useProjects } from "../api/projects";
import { useUpdateProfile, useChangePassword } from "../api/auth";
import { Button, Card, PageHeader, SkeletonCard } from "../components/ui";

/* ── Avatar with gradient initials ────────────── */
function AvatarCircle({ user }) {
  const displayName = user?.name || user?.email || "U";
  const initials = displayName.includes(" ")
    ? displayName.split(" ").slice(0, 2).map((w) => w[0]).join("").toUpperCase()
    : displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex h-24 w-24 items-center justify-center rounded-full text-3xl font-black text-white shadow-lg"
        style={{
          background: "linear-gradient(135deg, var(--devdoc-primary-strong), var(--devdoc-primary))",
          boxShadow: "0 8px 24px color-mix(in srgb, var(--devdoc-primary) 30%, transparent)",
        }}
      >
        {initials}
      </div>
      <span
        className="rounded-full px-2.5 py-1 text-[10px] font-bold"
        style={{
          backgroundColor: "var(--devdoc-surface-muted)",
          color: "var(--devdoc-muted)",
          border: "1px solid var(--devdoc-border)",
        }}
      >
        Change avatar — coming soon
      </span>
    </div>
  );
}

/* ── Account info card ────────────────────────── */
function AccountInfoCard({ user }) {
  const { updateUser } = useAuth();
  const { notify } = useNotify();
  const updateProfile = useUpdateProfile();
  const [name, setName] = useState(user?.name || "");

  const handleSaveName = useCallback(async () => {
    const trimmed = name.trim();
    if (trimmed === (user?.name || "")) return;
    try {
      const updatedUser = await updateProfile.mutateAsync({ name: trimmed });
      updateUser(updatedUser);
      notify("Name updated", { tone: "success" });
    } catch (error) {
      notify(error.message || "Failed to update name", { tone: "error" });
    }
  }, [name, user?.name, updateProfile, updateUser, notify]);

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—";

  return (
    <Card>
      <h2 className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-text)" }}>
        Account Info
      </h2>
      <div className="mt-5 grid gap-5">
        <div className="grid gap-1.5">
          <div className="flex items-center gap-2">
            <label className="devdoc-label text-xs">Name</label>
            {updateProfile.isPending && (
              <span className="text-[10px] font-semibold" style={{ color: "var(--devdoc-muted)" }}>
                Saving…
              </span>
            )}
          </div>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--devdoc-bg)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-text)",
              "--tw-ring-color": "var(--devdoc-primary)",
            }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={handleSaveName}
            placeholder="Your display name"
          />
        </div>

        <div className="grid gap-1.5">
          <div className="flex items-center gap-2">
            <label className="devdoc-label text-xs">Email</label>
            <span
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{
                backgroundColor: "var(--devdoc-surface-muted)",
                color: "var(--devdoc-muted)",
                border: "1px solid var(--devdoc-border)",
              }}
            >
              Cannot be changed
            </span>
          </div>
          <input
            className="w-full rounded-lg border px-3 py-2 text-sm font-medium"
            style={{
              backgroundColor: "var(--devdoc-surface-muted)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-muted)",
              cursor: "not-allowed",
            }}
            value={user?.email || ""}
            readOnly
          />
        </div>

        <div className="grid gap-1.5">
          <label className="devdoc-label text-xs">Member since</label>
          <p className="text-sm font-bold" style={{ color: "var(--devdoc-text)" }}>
            {memberSince}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ── Security card ────────────────────────────── */
function SecurityCard() {
  const { notify } = useNotify();
  const changePasswordMutation = useChangePassword();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [localError, setLocalError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setLocalError(null);
      setSuccess(false);

      if (!currentPassword) {
        setLocalError("Current password is required");
        return;
      }
      if (!newPassword) {
        setLocalError("New password is required");
        return;
      }
      if (newPassword.length < 8) {
        setLocalError("New password must be at least 8 characters");
        return;
      }
      if (newPassword !== confirmPassword) {
        setLocalError("New passwords do not match");
        return;
      }

      try {
        await changePasswordMutation.mutateAsync({ currentPassword, newPassword });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSuccess(true);
        notify("Password changed successfully", { tone: "success" });
      } catch (error) {
        setLocalError(error.message || "Failed to change password");
      }
    },
    [currentPassword, newPassword, confirmPassword, changePasswordMutation, notify]
  );

  return (
    <Card>
      <h2 className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-text)" }}>
        Security
      </h2>
      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-1.5">
          <label className="devdoc-label text-xs">Current password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--devdoc-bg)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-text)",
              "--tw-ring-color": "var(--devdoc-primary)",
            }}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="devdoc-label text-xs">New password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--devdoc-bg)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-text)",
              "--tw-ring-color": "var(--devdoc-primary)",
            }}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            placeholder="At least 8 characters"
          />
        </div>
        <div className="grid gap-1.5">
          <label className="devdoc-label text-xs">Confirm new password</label>
          <input
            type="password"
            className="w-full rounded-lg border px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2"
            style={{
              backgroundColor: "var(--devdoc-bg)",
              borderColor: "var(--devdoc-border)",
              color: "var(--devdoc-text)",
              "--tw-ring-color": "var(--devdoc-primary)",
            }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
        </div>

        {localError && (
          <p className="rounded-lg px-3 py-2 text-sm font-medium" style={{ backgroundColor: "var(--devdoc-error-soft)", color: "var(--devdoc-error)" }}>
            {localError}
          </p>
        )}
        {success && (
          <p className="rounded-lg px-3 py-2 text-sm font-medium" style={{ backgroundColor: "var(--devdoc-success-soft)", color: "var(--devdoc-success)" }}>
            Password changed successfully!
          </p>
        )}

        <div>
          <Button
            type="submit"
            disabled={changePasswordMutation.isPending}
          >
            {changePasswordMutation.isPending ? "Changing…" : "Change password"}
          </Button>
        </div>
      </form>
    </Card>
  );
}

/* ── Stats card ───────────────────────────────── */
function StatsCard({ user }) {
  const { data: projects, isLoading } = useProjects();

  const projectCount = projects?.length ?? 0;

  // Sum all requirements across projects from cached data
  // Since we don't have a dedicated stats endpoint, show project count
  const lastActive = user?.updatedAt
    ? new Date(user.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <Card>
      <h2 className="font-headline text-lg font-extrabold" style={{ color: "var(--devdoc-text)" }}>
        Stats
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          <p className="devdoc-label text-xs">Your projects</p>
          <p className="mt-1.5 font-headline text-2xl font-extrabold" style={{ color: "var(--devdoc-primary)" }}>
            {isLoading ? "—" : projectCount}
          </p>
        </div>
        <div
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          <p className="devdoc-label text-xs">Account type</p>
          <p className="mt-1.5 text-sm font-bold" style={{ color: "var(--devdoc-text)" }}>
            DevDoc User
          </p>
        </div>
        <div
          className="rounded-xl border px-4 py-3"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          <p className="devdoc-label text-xs">Last active</p>
          <p className="mt-1.5 text-sm font-bold" style={{ color: "var(--devdoc-text)" }}>
            {lastActive}
          </p>
        </div>
      </div>
    </Card>
  );
}

/* ── Main Profile Page ────────────────────────── */
function ProfilePlaceholder() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <main className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--devdoc-bg)" }}>
        <div className="mx-auto max-w-3xl">
          <SkeletonCard lines={4} />
          <div className="mt-6"><SkeletonCard lines={3} /></div>
          <div className="mt-6"><SkeletonCard lines={3} /></div>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}
    >
      <PageHeader
        eyebrow={
          <Link className="text-sm font-bold hover:underline" style={{ color: "var(--devdoc-primary)" }} to="/dashboard">
            ← Back to dashboard
          </Link>
        }
        title="My Profile"
        description="Your account details, security, and stats."
      />

      <section className="mx-auto max-w-3xl px-6 py-8">
        {/* Avatar */}
        <div className="flex justify-center mb-8">
          <AvatarCircle user={user} />
        </div>

        <div className="grid gap-6">
          <AccountInfoCard user={user} />
          <SecurityCard />
          <StatsCard user={user} />
        </div>
      </section>
    </main>
  );
}

export default ProfilePlaceholder;
