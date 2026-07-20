import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import useAuth from "./hooks/useAuth";
import { PageSkeleton } from "./components/ui";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";

const AppShell = lazy(() => import("./layouts/AppShell"));
const ProjectShell = lazy(() => import("./layouts/ProjectShell"));
const About = lazy(() => import("./pages/About"));
const Accessibility = lazy(() => import("./pages/Accessibility"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Documentation = lazy(() => import("./pages/Documentation"));
const Help = lazy(() => import("./pages/Help"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Profile = lazy(() => import("./pages/Profile"));
const AppSettings = lazy(() => import("./pages/AppSettings"));
const DocumentEditor = lazy(() => import("./pages/DocumentEditor"));
const ProjectAnalytics = lazy(() => import("./pages/ProjectAnalytics"));
const ProjectDiagrams = lazy(() => import("./pages/ProjectDiagrams"));
const DocumentsLibrary = lazy(() => import("./pages/DocumentsLibrary"));
const ProjectSettings = lazy(() => import("./pages/ProjectSettings"));
const ProjectVersions = lazy(() => import("./pages/ProjectVersions"));
const ProjectWorkspace = lazy(() => import("./pages/ProjectWorkspace"));
const RequirementRegistry = lazy(() => import("./pages/RequirementRegistry"));
const BusinessObjectiveRegistry = lazy(() => import("./pages/BusinessObjectiveRegistry"));
const DesignElementRegistry = lazy(() => import("./pages/DesignElementRegistry"));
const TestCaseRegistry = lazy(() => import("./pages/TestCaseRegistry"));
const TemplateLibrary = lazy(() => import("./pages/TemplateLibrary"));
const TraceabilityMatrix = lazy(() => import("./pages/TraceabilityMatrix"));
const UseCaseRegistry = lazy(() => import("./pages/UseCaseRegistry"));
const ValidationEngine = lazy(() => import("./pages/ValidationEngine"));
const SharedReport = lazy(() => import("./pages/SharedReport"));
const DocumentPrint = lazy(() => import("./pages/DocumentPrint"));

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
      <Route path="/shared/:token" element={<SharedReport />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects/:id" element={<ProjectShell />}>
          <Route index element={<ProjectWorkspace />} />
          <Route path="business-objectives" element={<BusinessObjectiveRegistry />} />
          <Route path="documents" element={<DocumentsLibrary />} />
          <Route path="documents/:documentId" element={<DocumentEditor />} />
          <Route path="documents/:documentId/print" element={<DocumentPrint />} />
          <Route path="templates" element={<TemplateLibrary />} />
          <Route path="use-cases" element={<UseCaseRegistry />} />
          <Route path="requirements" element={<RequirementRegistry />} />
          <Route path="design-elements" element={<DesignElementRegistry />} />
          <Route path="test-cases" element={<TestCaseRegistry />} />
          <Route path="traceability" element={<TraceabilityMatrix />} />
          <Route path="validation" element={<ValidationEngine />} />
          <Route path="diagrams" element={<ProjectDiagrams />} />
          <Route path="versions" element={<ProjectVersions />} />
          <Route path="analytics" element={<ProjectAnalytics />} />
          <Route path="settings" element={<ProjectSettings />} />
        </Route>
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<AppSettings />} />
        <Route path="/help" element={<Help />} />
        <Route path="/accessibility" element={<Accessibility />} />
        <Route path="/docs" element={<Documentation />} />
        <Route path="/about" element={<About />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
    </Suspense>
  );
}

export default App;
