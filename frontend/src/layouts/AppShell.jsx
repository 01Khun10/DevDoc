import { Navigate, Outlet } from "react-router-dom";
import Toaster from "../components/Toaster";
import TopBar from "../components/topbar/TopBar";
import useAuth from "../hooks/useAuth";

function AppShell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading DevDoc...</p>
      </main>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <Outlet />
      <Toaster />
    </div>
  );
}

export default AppShell;
