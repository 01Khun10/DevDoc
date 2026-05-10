import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CreateUseCaseForm from "../components/CreateUseCaseForm";
import LoadingSpinner from "../components/LoadingSpinner";
import UseCaseCard from "../components/UseCaseCard";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import { createUseCase, listUseCases, updateUseCase } from "../services/useCaseService";

function UseCaseRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState(null);
  const [useCases, setUseCases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");

  const handleRequestError = useCallback(
    (error) => {
      if (error.status === 401) {
        logout();
        navigate("/login", { replace: true });
        return true;
      }

      return false;
    },
    [logout, navigate]
  );

  const loadPage = useCallback(async () => {
    setIsLoading(true);
    setErrorType("");

    try {
      const [loadedProject, loadedUseCases] = await Promise.all([
        getProject(id),
        listUseCases(id)
      ]);
      setProject(loadedProject);
      setUseCases(loadedUseCases);
    } catch (error) {
      if (handleRequestError(error)) {
        return;
      }

      setErrorType(error.status === 404 ? "not-found" : "load-error");
    } finally {
      setIsLoading(false);
    }
  }, [handleRequestError, id]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  async function handleCreateUseCase(input) {
    return createUseCase(id, input);
  }

  async function handleUseCaseCreated() {
    const loadedUseCases = await listUseCases(id);
    setUseCases(loadedUseCases);
  }

  async function handleUpdateUseCase(useCaseId, input) {
    const updatedUseCase = await updateUseCase(id, useCaseId, input);
    setUseCases((currentUseCases) =>
      currentUseCases.map((useCase) =>
        useCase.id === updatedUseCase.id ? updatedUseCase : useCase
      )
    );
    return updatedUseCase;
  }

  if (isLoading) return <LoadingSpinner fullScreen label="Loading use cases..." />;

  if (errorType === "not-found") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Project not found</p>
          <button className="devdoc-gradient-button mt-6" onClick={() => navigate("/dashboard")}>Back to dashboard</button>
        </div>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--devdoc-bg)] px-6">
        <div className="devdoc-card-border max-w-md p-8 text-center">
          <p className="font-headline text-xl font-extrabold text-[var(--devdoc-text)]">Could not load use cases</p>
          <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Check your connection and try again.</p>
          <button className="devdoc-gradient-button mt-6" onClick={loadPage}>Retry</button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--devdoc-bg)] px-6 py-8" style={{ color: "var(--devdoc-text)" }}>
      <section className="mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="devdoc-label">{project.name}</p>
          <h1 className="font-headline mt-2 text-4xl font-extrabold tracking-tight" style={{ color: "var(--devdoc-text)" }}>Use Case Registry</h1>
          <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
            Capture user goals and scenarios before linking them to requirements and document sections.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="devdoc-card-border p-5">
            <p className="devdoc-label">Total use cases</p>
            <p className="font-headline mt-2 text-3xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>{useCases.length}</p>
          </div>
          <div className="devdoc-card-border p-5 sm:col-span-2">
            <p className="devdoc-label">Why this matters</p>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
              Use cases describe user intent before the system is mapped into requirements, traceability links, and diagrams.
            </p>
          </div>
        </div>

        <section className="mb-8">
          <h2 className="mb-4 font-headline text-xl font-extrabold">Create use case</h2>
          <CreateUseCaseForm onCreate={handleCreateUseCase} onCreated={handleUseCaseCreated} />
        </section>

        <section>
          <div className="mb-4 flex items-end justify-between">
            <div>
              <h2 className="font-headline text-xl font-extrabold">Use cases</h2>
              <p className="mt-1 text-sm text-[var(--devdoc-muted)]">{useCases.length} total</p>
            </div>
          </div>

          {useCases.length === 0 ? (
            <div className="devdoc-card-border p-10 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--devdoc-border)] bg-[var(--devdoc-primary-soft)] text-[var(--devdoc-primary)]">
                <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="font-headline text-lg font-extrabold text-[var(--devdoc-text)]">No use cases yet</p>
              <p className="mt-2 text-sm text-[var(--devdoc-muted)]">Start by describing the first user goal or scenario.</p>
              <div
                className="mx-auto mt-6 max-w-xs rounded-xl p-4 text-left"
                style={{ backgroundColor: "var(--devdoc-surface-muted)", border: "1px solid var(--devdoc-border)" }}
              >
                <p className="font-bold" style={{ color: "var(--devdoc-text)" }}>Example</p>
                <p className="mt-1 text-sm" style={{ color: "var(--devdoc-muted)" }}>User logs in and reaches the dashboard.</p>
              </div>
            </div>
          ) : (
            <div className="grid gap-4">
              {useCases.map((useCase) => (
                <UseCaseCard key={useCase.id} useCase={useCase} onUpdate={handleUpdateUseCase} />
              ))}
            </div>
          )}
        </section>

        <div className="devdoc-card-border mt-8 px-5 py-4 text-sm" style={{ color: "var(--devdoc-muted)" }}>
          Link these use cases to requirements and document sections in the Traceability Matrix.
        </div>
      </section>
    </main>
  );
}

export default UseCaseRegistry;
