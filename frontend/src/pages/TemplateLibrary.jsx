import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProfileSelector from "../components/ProfileSelector";
import TemplateCard from "../components/TemplateCard";
import TemplatePreview from "../components/TemplatePreview";
import useAuth from "../hooks/useAuth";
import { getProject } from "../services/projectService";
import {
  getTemplateSections,
  listProfiles,
  listTemplatesByProfile
} from "../services/templateService";

function TemplateLibrary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [project, setProject] = useState(null);
  const [projectStatus, setProjectStatus] = useState("loading");
  const [profiles, setProfiles] = useState([]);
  const [profilesLoading, setProfilesLoading] = useState(false);
  const [profilesError, setProfilesError] = useState("");
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [templatesError, setTemplatesError] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [previewSections, setPreviewSections] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");

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

  const loadProfiles = useCallback(async () => {
    setProfilesLoading(true);
    setProfilesError("");

    try {
      const loadedProfiles = await listProfiles();
      setProfiles(loadedProfiles);
    } catch (error) {
      if (handleRequestError(error)) {
        return;
      }

      setProfilesError("Could not load profiles. Check your connection and try again.");
    } finally {
      setProfilesLoading(false);
    }
  }, [handleRequestError]);

  useEffect(() => {
    let isCancelled = false;

    async function loadProject() {
      setProjectStatus("loading");

      try {
        const loadedProject = await getProject(id);
        if (!isCancelled) {
          setProject(loadedProject);
          setProjectStatus("loaded");
        }
      } catch (error) {
        if (handleRequestError(error)) {
          return;
        }

        if (!isCancelled) {
          setProjectStatus(error.status === 404 ? "not-found" : "error");
        }
      }
    }

    loadProject();

    return () => {
      isCancelled = true;
    };
  }, [id, handleRequestError]);

  useEffect(() => {
    if (projectStatus !== "loaded") {
      return undefined;
    }

    let isCancelled = false;

    async function loadInitialProfiles() {
      setProfilesLoading(true);
      setProfilesError("");

      try {
        const loadedProfiles = await listProfiles();
        if (!isCancelled) {
          setProfiles(loadedProfiles);
        }
      } catch (error) {
        if (handleRequestError(error)) {
          return;
        }

        if (!isCancelled) {
          setProfilesError("Could not load profiles. Check your connection and try again.");
        }
      } finally {
        if (!isCancelled) {
          setProfilesLoading(false);
        }
      }
    }

    loadInitialProfiles();

    return () => {
      isCancelled = true;
    };
  }, [projectStatus, handleRequestError]);

  useEffect(() => {
    if (!selectedProfile) {
      setTemplates([]);
      setTemplatesError("");
      setTemplatesLoading(false);
      return undefined;
    }

    let isCancelled = false;

    async function loadTemplates() {
      setTemplatesLoading(true);
      setTemplatesError("");

      try {
        const response = await listTemplatesByProfile(selectedProfile.code);
        if (!isCancelled) {
          setTemplates(response.templates || []);
        }
      } catch (error) {
        if (handleRequestError(error)) {
          return;
        }

        if (!isCancelled) {
          setTemplatesError("Could not load templates. Check your connection and try again.");
        }
      } finally {
        if (!isCancelled) {
          setTemplatesLoading(false);
        }
      }
    }

    loadTemplates();

    return () => {
      isCancelled = true;
    };
  }, [selectedProfile, handleRequestError]);

  useEffect(() => {
    if (!selectedTemplate) {
      setPreviewTemplate(null);
      setPreviewSections([]);
      setPreviewError("");
      setPreviewLoading(false);
      return undefined;
    }

    let isCancelled = false;

    async function loadPreview() {
      setPreviewLoading(true);
      setPreviewError("");

      try {
        const response = await getTemplateSections(selectedTemplate.code);
        if (!isCancelled) {
          setPreviewTemplate({
            ...selectedTemplate,
            ...response.template
          });
          setPreviewSections(response.sections || []);
        }
      } catch (error) {
        if (handleRequestError(error)) {
          return;
        }

        if (!isCancelled) {
          setPreviewError("Could not load template preview. Check your connection and try again.");
        }
      } finally {
        if (!isCancelled) {
          setPreviewLoading(false);
        }
      }
    }

    loadPreview();

    return () => {
      isCancelled = true;
    };
  }, [selectedTemplate, handleRequestError]);

  function handleProfileSelect(profile) {
    setSelectedProfile(profile);
    setSelectedTemplate(null);
    setPreviewTemplate(null);
    setPreviewSections([]);
    setPreviewError("");
  }

  function handleTemplateSelect(template) {
    setSelectedTemplate(template);
  }

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  if (projectStatus === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 text-slate-900">
        <p className="text-sm font-medium text-slate-600">Loading project...</p>
      </main>
    );
  }

  if (projectStatus === "not-found") {
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

  if (projectStatus === "error") {
    return (
      <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
        <section className="mx-auto max-w-3xl rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <p className="text-lg font-semibold text-slate-950">
            Could not load project. Check your connection and try again.
          </p>
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

  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              className="text-sm font-semibold text-teal-700 hover:text-teal-800"
              to={`/projects/${id}`}
            >
              Back to project workspace
            </Link>
            <h1 className="mt-3 text-3xl font-bold">Template Library</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Browsing templates for:{" "}
              <span className="font-semibold text-slate-800">{project.name}</span>
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

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-slate-950">Documentation profiles</h2>
          <div className="mt-4">
            <ProfileSelector
              profiles={profiles}
              selectedCode={selectedProfile?.code || ""}
              isLoading={profilesLoading}
              error={profilesError}
              onRetry={loadProfiles}
              onSelect={handleProfileSelect}
            />
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
          <section>
            <h2 className="text-lg font-semibold text-slate-950">Templates</h2>
            <div className="mt-4 grid gap-4">
              {!selectedProfile ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  Select a profile above to see its templates.
                </div>
              ) : null}

              {selectedProfile && templatesLoading ? (
                <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
                  Loading templates...
                </div>
              ) : null}

              {selectedProfile && !templatesLoading && templatesError ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-sm text-red-700">
                  {templatesError}
                </div>
              ) : null}

              {selectedProfile && !templatesLoading && !templatesError
                ? templates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplate?.code === template.code}
                      onSelect={handleTemplateSelect}
                    />
                  ))
                : null}
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-slate-950">Preview</h2>
            <div className="mt-4">
              <TemplatePreview
                template={previewTemplate}
                sections={previewSections}
                isLoading={previewLoading}
                error={previewError}
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default TemplateLibrary;
