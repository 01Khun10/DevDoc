import { Navigate, Route, Routes } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import AppShell from "./layouts/AppShell";
import ProjectShell from "./layouts/ProjectShell";
import AboutPlaceholder from "./pages/AboutPlaceholder";
import Dashboard from "./pages/Dashboard";
import DocumentEditor from "./pages/DocumentEditor";
import DocsPlaceholder from "./pages/DocsPlaceholder";
import HelpPlaceholder from "./pages/HelpPlaceholder";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import ProfilePlaceholder from "./pages/ProfilePlaceholder";
import ProjectAnalyticsPlaceholder from "./pages/ProjectAnalyticsPlaceholder";
import ProjectDiagrams from "./pages/ProjectDiagrams";
import ProjectDocumentsPlaceholder from "./pages/ProjectDocumentsPlaceholder";
import ProjectSettingsPlaceholder from "./pages/ProjectSettingsPlaceholder";
import ProjectVersionsPlaceholder from "./pages/ProjectVersionsPlaceholder";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Register from "./pages/Register";
import RequirementRegistry from "./pages/RequirementRegistry";
import DesignElementRegistry from "./pages/DesignElementRegistry";
import TestCaseRegistry from "./pages/TestCaseRegistry";
import SettingsPlaceholder from "./pages/SettingsPlaceholder";
import TemplateLibrary from "./pages/TemplateLibrary";
import TraceabilityMatrix from "./pages/TraceabilityMatrix";
import UseCaseRegistry from "./pages/UseCaseRegistry";
import ValidationEngine from "./pages/ValidationEngine";

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
  );
}

export default App;
