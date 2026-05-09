import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import CreateRequirementForm from "../components/CreateRequirementForm";
import RequirementCard from "../components/RequirementCard";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  createRequirement,
  listRequirements,
  updateRequirement
} from "../services/requirementService";

function RequirementRegistry() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState(null);
  const [requirements, setRequirements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState("");
  const [activeFilter, setActiveFilter] = useState("ALL");

  const summary = useMemo(
    () => ({
      total: requirements.length,
      fr: requirements.filter((requirement) => requirement.type === "FR").length,
      nfr: requirements.filter((requirement) => requirement.type === "NFR").length,
      highPriority: requirements.filter((requirement) => requirement.priority === "HIGH").length,
      approvedOrVerified: requirements.filter((requirement) =>
        ["APPROVED", "VERIFIED"].includes(requirement.status)
      ).length
    }),
    [requirements]
  );

  const filteredRequirements = useMemo(() => {
    if (activeFilter === "FR") {
      return requirements.filter((requirement) => requirement.type === "FR");
    }

    if (activeFilter === "NFR") {
      return requirements.filter((requirement) => requirement.type === "NFR");
    }

    if (activeFilter === "HIGH") {
      return requirements.filter((requirement) => requirement.priority === "HIGH");
    }

    if (activeFilter === "APPROVED_VERIFIED") {
      return requirements.filter((requirement) =>
        ["APPROVED", "VERIFIED"].includes(requirement.status)
      );
    }

    return requirements;
  }, [activeFilter, requirements]);

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
      const [loadedProject, loadedRequirements] = await Promise.all([
        getProject(id),
        listRequirements(id)
      ]);
      setProject(loadedProject);
      setRequirements(loadedRequirements);
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

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  async function handleCreateRequirement(input) {
    return createRequirement(id, input);
  }

  async function handleRequirementCreated() {
    const loadedRequirements = await listRequirements(id);
    setRequirements(loadedRequirements);
    setActiveFilter("ALL");
  }

  async function handleUpdateRequirement(requirementId, input) {
    const updatedRequirement = await updateRequirement(id, requirementId, input);
    setRequirements((currentRequirements) =>
      currentRequirements.map((requirement) =>
        requirement.id === updatedRequirement.id ? updatedRequirement : requirement
      )
    );
    return updatedRequirement;
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading requirements...</p>
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
            Could not load requirements. Check your connection and try again.
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
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              to={`/projects/${id}`}
            >
              Back to project workspace
            </Link>
            <h1 className="mt-3 text-3xl font-bold">Requirements Registry</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Capture functional and non-functional requirements before linking them to design,
              tests, and validation.
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Project: <span className="font-semibold text-slate-800">{project.name}</span>
            </p>
          </div>
          <button
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-100"
            type="button"
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Total Requirements</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.total}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Functional Requirements</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.fr}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Non-Functional Requirements</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.nfr}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">High Priority</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">{summary.highPriority}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Approved / Verified</p>
            <p className="mt-2 text-2xl font-bold text-slate-950">
              {summary.approvedOrVerified}
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-950">Create requirement</h2>
          <div className="mt-4">
            <CreateRequirementForm
              onCreate={handleCreateRequirement}
              onCreated={handleRequirementCreated}
            />
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-950">Requirements</h2>
              <p className="mt-1 text-sm text-slate-600">
                Showing {filteredRequirements.length} of {requirements.length}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                ["ALL", "All"],
                ["FR", "FR"],
                ["NFR", "NFR"],
                ["HIGH", "HIGH priority"],
                ["APPROVED_VERIFIED", "APPROVED/VERIFIED"]
              ].map(([value, label]) => (
                <button
                  key={value}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                    activeFilter === value
                      ? "bg-teal-700 text-white ring-teal-700"
                      : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                  }`}
                  type="button"
                  onClick={() => setActiveFilter(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {requirements.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 shadow-sm">
              <p className="font-semibold text-slate-950">
                No requirements yet. Start by creating your first FR or NFR.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="font-semibold text-slate-800">FR example</p>
                  <p className="mt-1">User can create a project.</p>
                </div>
                <div className="rounded-md bg-slate-50 p-4">
                  <p className="font-semibold text-slate-800">NFR example</p>
                  <p className="mt-1">The dashboard loads within 2 seconds.</p>
                </div>
              </div>
            </div>
          ) : filteredRequirements.length === 0 ? (
            <div className="mt-4 rounded-lg border border-dashed border-slate-300 bg-white p-8 text-sm text-slate-600 shadow-sm">
              No requirements match this filter.
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {filteredRequirements.map((requirement) => (
                <RequirementCard
                  key={requirement.id}
                  requirement={requirement}
                  onUpdate={handleUpdateRequirement}
                />
              ))}
            </div>
          )}
        </section>

        <p className="mt-8 rounded-lg border border-slate-200 bg-white px-5 py-4 text-sm text-slate-600 shadow-sm">
          Traceability links and validation checks will be added in later phases.
        </p>
      </section>
    </main>
  );
}

export default RequirementRegistry;
