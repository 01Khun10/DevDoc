import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ProfileSelector from "../components/ProfileSelector";
import TemplateCard from "../components/TemplateCard";
import TemplatePreview from "../components/TemplatePreview";
import { useProject } from "../context/ProjectContext";
import { useCreateDocumentFromTemplate } from "../api/documents";
import { useProfiles, useTemplateSections, useTemplatesByProfile } from "../api/templates";
import useAuthGuard from "../api/useAuthGuard";

function TemplateLibrary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { project } = useProject();
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [createDocumentError, setCreateDocumentError] = useState("");

  const profilesQuery = useProfiles();
  const templatesQuery = useTemplatesByProfile(selectedProfile?.code);
  const previewQuery = useTemplateSections(selectedTemplate?.code);
  const createDocumentMutation = useCreateDocumentFromTemplate(id);
  useAuthGuard(
    profilesQuery.error,
    templatesQuery.error,
    previewQuery.error,
    createDocumentMutation.error
  );

  const profiles = profilesQuery.data || [];
  const templates = templatesQuery.data?.templates || [];
  const previewTemplate =
    selectedTemplate && previewQuery.data
      ? { ...selectedTemplate, ...previewQuery.data.template }
      : null;
  const previewSections = previewQuery.data?.sections || [];

  function handleProfileSelect(profile) {
    setSelectedProfile(profile);
    setSelectedTemplate(null);
  }

  function handleTemplateSelect(template) {
    setSelectedTemplate(template);
    setCreateDocumentError("");
  }

  async function handleCreateDocument() {
    if (!selectedTemplate) {
      return;
    }

    setCreateDocumentError("");

    try {
      const document = await createDocumentMutation.mutateAsync({
        templateCode: selectedTemplate.code
      });

      navigate(`/projects/${id}/documents/${document.id}`, {
        state: { document }
      });
    } catch (error) {
      setCreateDocumentError(error.message || "Could not create document.");
    }
  }

  return (
    <main className="min-h-screen px-6 py-8" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <section className="mx-auto max-w-7xl devdoc-fade-in">
        <div className="devdoc-card-border p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="devdoc-label" style={{ color: "var(--devdoc-primary)" }}>Template Library</p>
            <h1 className="font-headline mt-2 text-3xl font-extrabold tracking-tight">
              Template Library
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--devdoc-muted)]">
              Browsing templates for:{" "}
              <span className="font-semibold text-[var(--devdoc-text)]">{project.name}</span>
            </p>
          </div>
          <Link className="devdoc-button-secondary" to={`/projects/${id}`}>Project overview</Link>
        </div>
        </div>

        <section className="mt-8">
          <h2 className="font-headline text-lg font-extrabold text-[var(--devdoc-text)]">Documentation profiles</h2>
          <div className="mt-4">
            <ProfileSelector
              profiles={profiles}
              selectedCode={selectedProfile?.code || ""}
              isLoading={profilesQuery.isLoading}
              error={profilesQuery.error ? "Could not load profiles. Check your connection and try again." : ""}
              onRetry={() => profilesQuery.refetch()}
              onSelect={handleProfileSelect}
            />
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
          <section>
            <h2 className="font-headline text-lg font-extrabold text-[var(--devdoc-text)]">Templates</h2>
            <div className="mt-4 grid gap-4">
              {!selectedProfile ? (
              <div className="devdoc-card-border p-6 text-sm text-[var(--devdoc-muted)]">
                Select a profile above to see its templates.
              </div>
              ) : null}

              {selectedProfile && templatesQuery.isLoading ? (
                <div className="devdoc-card-border p-6 text-sm text-[var(--devdoc-muted)]">
                  Loading templates...
                </div>
              ) : null}

              {selectedProfile && !templatesQuery.isLoading && templatesQuery.error ? (
                <div
                  className="rounded-xl border p-6 text-sm font-medium"
                  style={{
                    borderColor: "color-mix(in srgb, var(--devdoc-error) 35%, var(--devdoc-border))",
                    backgroundColor: "var(--devdoc-error-soft)",
                    color: "var(--devdoc-error)"
                  }}
                >
                  Could not load templates. Check your connection and try again.
                </div>
              ) : null}

              {selectedProfile && !templatesQuery.isLoading && !templatesQuery.error
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
            <h2 className="font-headline text-lg font-extrabold text-[var(--devdoc-text)]">Preview</h2>
            <div className="mt-4">
              <TemplatePreview
                template={previewTemplate}
                sections={previewSections}
                isLoading={previewQuery.isLoading && Boolean(selectedTemplate)}
                error={
                  previewQuery.error
                    ? "Could not load template preview. Check your connection and try again."
                    : ""
                }
                onCreateDocument={handleCreateDocument}
                isCreating={createDocumentMutation.isPending}
                createError={createDocumentError}
              />
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

export default TemplateLibrary;
