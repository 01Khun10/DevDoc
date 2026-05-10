import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CreateUseCaseForm from "../components/CreateUseCaseForm";
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

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading use cases...</p>
      </main>
    );
  }

  if (errorType === "not-found") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">Project not found.</p>
          <Link
            className="mt-5 inline-flex text-sm font-semibold text-teal-700 hover:text-teal-800"
            to="/dashboard"
          >
            Back to dashboard
          </Link>
        </section>
      </main>
    );
  }

  if (errorType === "load-error") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">
            Could not load use cases. Check your connection and try again.
          </p>
          <button
            className="mt-5 rounded-md bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            type="button"
            onClick={loadPage}
          >
            Retry
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="devdoc-card p-8">
          <Link
            className="text-sm font-bold text-indigo-700 hover:text-indigo-800"
            to={`/projects/${id}`}
          >
            Back to project workspace
          </Link>
          <h1 className="font-headline mt-3 text-4xl font-extrabold tracking-tight">
            Use Case Registry
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Capture user goals and scenarios for this project.
          </p>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Project: <span className="font-semibold text-slate-800">{project.name}</span>
          </p>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="devdoc-card-border p-4">
            <p className="devdoc-label">Total use cases</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{useCases.length}</p>
          </div>
          <div className="devdoc-card-border p-4 sm:col-span-2">
            <p className="devdoc-label">Why this matters</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Use cases describe user intent before the system is mapped into requirements,
              traceability, and diagrams.
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-950">Create use case</h2>
          <div className="mt-4">
            <CreateUseCaseForm onCreate={handleCreateUseCase} onCreated={handleUseCaseCreated} />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Use cases</h2>
              <p className="mt-1 text-sm text-slate-600">{useCases.length} total</p>
            </div>
          </div>

          {useCases.length === 0 ? (
            <div className="devdoc-card-border mt-4 p-8 text-sm text-slate-600">
              <p className="font-semibold text-slate-950">
                No use cases yet. Start by describing the first user goal or scenario.
              </p>
              <div className="mt-4 rounded-2xl bg-slate-50 p-4">
                <p className="font-semibold text-slate-800">Example</p>
                <p className="mt-1">User logs in and reaches the dashboard.</p>
              </div>
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {useCases.map((useCase) => (
                <UseCaseCard
                  key={useCase.id}
                  useCase={useCase}
                  onUpdate={handleUpdateUseCase}
                />
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 rounded-2xl bg-white px-5 py-4 text-sm text-slate-600 shadow-[0_20px_40px_rgba(53,37,205,0.06)]">
          Expanded traceability and PlantUML diagrams will use these scenarios in later batches.
        </p>
      </section>
    </main>
  );
}

export default UseCaseRegistry;
