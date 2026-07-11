import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import AppShell from "./layouts/AppShell";
import ProjectShell from "./layouts/ProjectShell";
import { PageSkeleton } from "./components/ui";
import AboutPlaceholder from "./pages/AboutPlaceholder";
import Dashboard from "./pages/Dashboard";
import DocsPlaceholder from "./pages/DocsPlaceholder";
import HelpPlaceholder from "./pages/HelpPlaceholder";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ProfilePlaceholder from "./pages/ProfilePlaceholder";
import Register from "./pages/Register";
import SettingsPlaceholder from "./pages/SettingsPlaceholder";

const DocumentEditor = lazy(() => import("./pages/DocumentEditor"));
const ProjectAnalyticsPlaceholder = lazy(() => import("./pages/ProjectAnalyticsPlaceholder"));
const ProjectDiagrams = lazy(() => import("./pages/ProjectDiagrams"));
const ProjectDocumentsPlaceholder = lazy(() => import("./pages/ProjectDocumentsPlaceholder"));
const ProjectSettingsPlaceholder = lazy(() => import("./pages/ProjectSettingsPlaceholder"));
const ProjectVersionsPlaceholder = lazy(() => import("./pages/ProjectVersionsPlaceholder"));
const ProjectWorkspace = lazy(() => import("./pages/ProjectWorkspace"));
const RequirementRegistry = lazy(() => import("./pages/RequirementRegistry"));
const DesignElementRegistry = lazy(() => import("./pages/DesignElementRegistry"));
const TestCaseRegistry = lazy(() => import("./pages/TestCaseRegistry"));
const TemplateLibrary = lazy(() => import("./pages/TemplateLibrary"));
const TraceabilityMatrix = lazy(() => import("./pages/TraceabilityMatrix"));
const UseCaseRegistry = lazy(() => import("./pages/UseCaseRegistry"));
const ValidationEngine = lazy(() => import("./pages/ValidationEngine"));

function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6 text-[var(--devdoc-text)]">
        <p className="text-sm font-semibold text-[var(--devdoc-muted)]">Loading DevDoc...</p>
      </main>
    );
  }

  return user ? <Navigate to="/dashboard" replace /> : <LandingPage />;
}

function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectShell />}>
          <Route index element={<ProjectWorkspace />} />
          <Route path="documents" element={<ProjectDocumentsPlaceholder />} />
          <Route path="documents/:documentId" element={<DocumentEditor />} />
          <Route path="templates" element={<TemplateLibrary />} />
          <Route path="use-cases" element={<UseCaseRegistry />} />
          <Route path="requirements" element={<RequirementRegistry />} />
          <Route path="design-elements" element={<DesignElementRegistry />} />
          <Route path="test-cases" element={<TestCaseRegistry />} />
          <Route path="traceability" element={<TraceabilityMatrix />} />
          <Route path="validation" element={<ValidationEngine />} />
          <Route path="diagrams" element={<ProjectDiagrams />} />
          <Route path="versions" element={<ProjectVersionsPlaceholder />} />
          <Route path="analytics" element={<ProjectAnalyticsPlaceholder />} />
          <Route path="settings" element={<ProjectSettingsPlaceholder />} />
        </Route>
        <Route path="/profile" element={<ProfilePlaceholder />} />
        <Route path="/settings" element={<SettingsPlaceholder />} />
        <Route path="/help" element={<HelpPlaceholder />} />
        <Route path="/docs" element={<DocsPlaceholder />} />
        <Route path="/about" element={<AboutPlaceholder />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </Suspense>
  );
}

export default App;
