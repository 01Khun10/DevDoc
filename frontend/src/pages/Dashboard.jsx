import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
              DevDoc
            </p>
            <h1 className="mt-2 text-3xl font-bold">Welcome to DevDoc</h1>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium text-slate-500">Signed in as</p>
          {user?.name ? (
            <p className="mt-2 text-xl font-semibold text-slate-950">{user.name}</p>
          ) : null}
          <p className="mt-2 break-all text-base text-slate-700">{user?.email}</p>
        </div>
      </section>
    </main>
  );
}

export default Dashboard;
