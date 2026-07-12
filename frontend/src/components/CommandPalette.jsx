import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Command } from "cmdk";
import { useProjectOverview } from "../api/projects";
import { useTraceabilityOptions } from "../api/traceability";

const SCREENS = [
  ["Overview", ""],
  ["Business Objectives", "business-objectives"],
  ["Templates", "templates"],
  ["Use Cases", "use-cases"],
  ["Requirements", "requirements"],
  ["Design Elements", "design-elements"],
  ["Test Cases", "test-cases"],
  ["Traceability Matrix", "traceability"],
  ["Doc-Linter Validation", "validation"],
  ["Diagrams", "diagrams"],
  ["Analytics", "analytics"]
];

// Ctrl+K palette: jump to project screens, documents, requirements, use cases.
function CommandPalette({ projectId }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  // Only fetch artefacts once the palette is opened.
  const overviewQuery = useProjectOverview(projectId, { enabled: open });
  const optionsQuery = useTraceabilityOptions(projectId, { enabled: open });

  useEffect(() => {
    function onKeyDown(event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!open) return null;

  const documents = overviewQuery.data?.documents || [];
  const requirements = optionsQuery.data?.requirements || [];
  const useCases = optionsQuery.data?.useCases || [];
  const base = `/projects/${projectId}`;

  function go(path) {
    setOpen(false);
    navigate(path);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[15vh]"
      style={{ backgroundColor: "rgba(0,0,0,0.45)" }}
      onClick={() => setOpen(false)}
    >
      <div className="w-full max-w-lg" onClick={(event) => event.stopPropagation()}>
        <Command
          label="Command palette"
          className="overflow-hidden rounded-xl border shadow-2xl"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
        >
          <Command.Input
            autoFocus
            placeholder="Jump to a screen, document, requirement, or use case..."
            className="w-full border-b px-4 py-3 text-sm outline-none"
            style={{
              borderColor: "var(--devdoc-border)",
              backgroundColor: "var(--devdoc-surface)",
              color: "var(--devdoc-text)"
            }}
          />
          <Command.List
            className="max-h-[50vh] overflow-y-auto p-2 text-sm"
            style={{ color: "var(--devdoc-text)" }}
          >
            <Command.Empty className="px-3 py-6 text-center text-sm" style={{ color: "var(--devdoc-muted)" }}>
              No results.
            </Command.Empty>

            <Command.Group heading="Screens" className="devdoc-cmdk-group">
              {SCREENS.map(([label, path]) => (
                <Command.Item key={label} className="devdoc-cmdk-item" onSelect={() => go(`${base}/${path}`)}>
                  {label}
                </Command.Item>
              ))}
            </Command.Group>

            {documents.length > 0 ? (
              <Command.Group heading="Documents" className="devdoc-cmdk-group">
                {documents.map((document) => (
                  <Command.Item
                    key={document.id}
                    className="devdoc-cmdk-item"
                    onSelect={() => go(`${base}/documents/${document.id}`)}
                  >
                    {document.title}
                    <span style={{ color: "var(--devdoc-muted)" }}> · {document.documentType}</span>
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {requirements.length > 0 ? (
              <Command.Group heading="Requirements" className="devdoc-cmdk-group">
                {requirements.map((requirement) => (
                  <Command.Item
                    key={requirement.id}
                    className="devdoc-cmdk-item"
                    onSelect={() => go(`${base}/requirements?highlight=${requirement.id}`)}
                  >
                    {requirement.code} {requirement.title}
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}

            {useCases.length > 0 ? (
              <Command.Group heading="Use Cases" className="devdoc-cmdk-group">
                {useCases.map((useCase) => (
                  <Command.Item
                    key={useCase.id}
                    className="devdoc-cmdk-item"
                    onSelect={() => go(`${base}/use-cases?highlight=${useCase.id}`)}
                  >
                    {useCase.code} {useCase.title}
                  </Command.Item>
                ))}
              </Command.Group>
            ) : null}
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

export default CommandPalette;
