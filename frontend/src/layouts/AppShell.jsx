import { Navigate, Outlet, useLocation } from "react-router-dom";
import LoadingSpinner from "../components/LoadingSpinner";
import ScrollToTop from "../components/ScrollToTop";
import Toaster from "../components/Toaster";
import TopBar from "../components/topbar/TopBar";
import ErrorBoundary from "../pages/ErrorBoundary";
import useAuth from "../hooks/useAuth";

function AppShell() {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner fullScreen label="Loading DevDoc..." />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="devdoc-page">
      <ScrollToTop />
      <TopBar />
      {/* Keyed on the route so a crashed page clears when the user navigates
          away, and so the shell survives a page-level render error. */}
      <ErrorBoundary key={location.pathname} inline>
        <Outlet />
      </ErrorBoundary>
      <Toaster />
    </div>
  );
}

export default AppShell;
