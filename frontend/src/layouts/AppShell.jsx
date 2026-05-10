import { Navigate, Outlet } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import Toaster from "../components/Toaster";
import TopBar from "../components/topbar/TopBar";
import useAuth from "../hooks/useAuth";

function AppShell() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Loading DevDoc..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="devdoc-page">
      <TopBar />
      <Outlet />
      <Toaster />
    </div>
  );
}

export default AppShell;
