import { Navigate, Route, Routes } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import AppShell from "./layouts/AppShell";
import ProjectShell from "./layouts/ProjectShell";
import AboutPlaceholder from "./pages/AboutPlaceholder";
import Dashboard from "./pages/Dashboard";
import DocumentEditor from "./pages/DocumentEditor";
import DocsPlaceholder from "./pages/DocsPlaceholder";
import HelpPlaceholder from "./pages/HelpPlaceholder";
import Login from "./pages/Login";
import ProfilePlaceholder from "./pages/ProfilePlaceholder";
import ProjectAnalyticsPlaceholder from "./pages/ProjectAnalyticsPlaceholder";
import ProjectDiagramsPlaceholder from "./pages/ProjectDiagramsPlaceholder";
import ProjectDocumentsPlaceholder from "./pages/ProjectDocumentsPlaceholder";
import ProjectSettingsPlaceholder from "./pages/ProjectSettingsPlaceholder";
import ProjectVersionsPlaceholder from "./pages/ProjectVersionsPlaceholder";
import ProjectWorkspace from "./pages/ProjectWorkspace";
import Register from "./pages/Register";
import RequirementRegistry from "./pages/RequirementRegistry";
import SettingsPlaceholder from "./pages/SettingsPlaceholder";
import TemplateLibrary from "./pages/TemplateLibrary";
import TraceabilityMatrix from "./pages/TraceabilityMatrix";
import ValidationEngine from "./pages/ValidationEngine";

function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading DevDoc...</p>
      </main>
    );
  }

  return <Navigate to={user ? "/dashboard" : "/login"} replace />;
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
          <Route path="requirements" element={<RequirementRegistry />} />
          <Route path="traceability" element={<TraceabilityMatrix />} />
          <Route path="validation" element={<ValidationEngine />} />
          <Route path="diagrams" element={<ProjectDiagramsPlaceholder />} />
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
