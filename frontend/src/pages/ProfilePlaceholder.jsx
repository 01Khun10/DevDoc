import { Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function ProfilePlaceholder() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        <Link className="text-sm font-semibold text-teal-700 hover:text-teal-800" to="/dashboard">
          Back to dashboard
        </Link>
        <h1 className="mt-4 text-3xl font-bold">Profile / Account Details</h1>
        <div className="mt-6 grid gap-4 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm">
          <div>
            <p className="font-semibold text-slate-700">Name</p>
            <p className="mt-1 text-slate-600">{user?.name || "No name provided"}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-700">Email</p>
            <p className="mt-1 break-all text-slate-600">{user?.email}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
            type="button"
            disabled
          >
            Edit profile coming soon
          </button>
          <button
            className="rounded-md border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400"
            type="button"
            disabled
          >
            Change password coming soon
          </button>
        </div>
      </section>
    </main>
  );
}

export default ProfilePlaceholder;
