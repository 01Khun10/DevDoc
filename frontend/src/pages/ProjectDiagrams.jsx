import { useState } from "react";
import plantumlEncoder from "plantuml-encoder";
import { useProject } from "../context/ProjectContext";
import {
  getTraceabilityTreePlantUml,
  getUseCasePlantUml,
  getComponentPlantUml
} from "../services/diagramService";

const CHIP_COLORS = {
  "Use Cases": "#8b5cf6",
  Requirements: "#06b6d4",
  Sections: "#f59e0b",
  "Design Elements": "#10b981",
  "Test Cases": "#ec4899",
  Links: "#6366f1",
  Actors: "#0d9488",
  "Initiates Links": "#0d9488"
};

const TABS = [
  {
    key: "traceability",
    label: "Traceability Tree",
    description:
      "Generate PlantUML from use cases, requirements, document sections, and traceability links.",
    fileName: "devdoc-traceability-tree.puml",
    fetcher: getTraceabilityTreePlantUml,
    chips: (summary) => [
      ["Use Cases", summary.useCaseCount],
      ["Requirements", summary.requirementCount],
      ["Sections", summary.documentSectionCount],
      ["Design Elements", summary.designElementCount],
      ["Test Cases", summary.testCaseCount],
      ["Links", summary.linkCount]
    ]
  },
  {
    key: "use-case",
    label: "Use Case Diagram",
    description:
      "UML use case diagram: every use case as an actor goal, with stakeholder associations from business objectives.",
    fileName: "devdoc-use-case-diagram.puml",
    fetcher: getUseCasePlantUml,
    chips: (summary) => [
      ["Use Cases", summary.useCaseCount],
      ["Actors", summary.actorCount],
      ["Initiates Links", summary.initiatesLinkCount]
    ]
  },
  {
    key: "component",
    label: "Component Diagram",
    description:
      "Architecture component diagram generated from design elements and the links between them.",
    fileName: "devdoc-component-diagram.puml",
    fetcher: getComponentPlantUml,
    chips: (summary) => [
      ["Design Elements", summary.designElementCount],
      ["Links", summary.linkCount]
    ]
  }
];

function DiagramPanel({ projectId, tab }) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramResult, setDiagramResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const encoded = diagramResult ? plantumlEncoder.encode(diagramResult.plantUml) : null;
  const imageUrl = encoded ? `https://www.plantuml.com/plantuml/svg/${encoded}` : null;

  async function handleGenerate() {
    setIsGenerating(true);
    setError("");
    setDiagramResult(null);
    setCopied(false);
    setZoom(1);

    try {
      const data = await tab.fetcher(projectId);
      setDiagramResult(data);
    } catch (err) {
      if (err.status === 404) {
        setError("Project not found.");
      } else {
        setError("Failed to generate diagram. Please check your connection and try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  }

  function handleCopy() {
    if (!diagramResult?.plantUml) return;
    navigator.clipboard.writeText(diagramResult.plantUml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDownload() {
    if (!diagramResult?.plantUml) return;
    const blob = new Blob([diagramResult.plantUml], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = tab.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="devdoc-card-border flex flex-col">
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>
              {tab.label}
            </h2>
            <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
              {tab.description}
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="devdoc-gradient-button shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isGenerating ? "Generating..." : "Generate PlantUML"}
          </button>
        </div>
      </div>

      {error && (
        <div
          className="border-t p-6"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "rgba(207,34,46,0.08)" }}
        >
          <p className="text-sm font-semibold" style={{ color: "var(--devdoc-error)" }}>{error}</p>
        </div>
      )}

      {diagramResult && (
        <div
          className="border-t p-6"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface-muted)" }}
        >
          <div className="mb-4 flex flex-wrap gap-3">
            {tab.chips(diagramResult.summary).map(([label, count]) => {
              const color = CHIP_COLORS[label] ?? "var(--devdoc-primary)";
              return (
                <span
                  key={label}
                  className="rounded-full px-3 py-1 text-xs font-bold"
                  style={{ backgroundColor: `${color}1f`, border: `1px solid ${color}55`, color }}
                >
                  {label}: {count}
                </span>
              );
            })}
          </div>

          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button className="devdoc-button-secondary" onClick={() => setZoom((z) => Math.max(0.5, Math.round((z - 0.25) * 100) / 100))} aria-label="Zoom out">
              −
            </button>
            <span className="w-12 text-center text-xs font-bold" style={{ color: "var(--devdoc-muted)" }}>
              {Math.round(zoom * 100)}%
            </span>
            <button className="devdoc-button-secondary" onClick={() => setZoom((z) => Math.min(3, Math.round((z + 0.25) * 100) / 100))} aria-label="Zoom in">
              +
            </button>
            <button className="devdoc-button-secondary" onClick={() => setFullscreen(true)}>
              Fullscreen
            </button>
            <a
              className="devdoc-button-secondary"
              href={`https://www.plantuml.com/plantuml/uml/${encoded}`}
              target="_blank"
              rel="noreferrer"
            >
              Open in PlantUML Editor ↗
            </a>
          </div>

          <div
            className="mb-4 overflow-auto rounded-xl border p-4"
            style={{ borderColor: "var(--devdoc-border)", backgroundColor: "#ffffff", maxHeight: "32rem" }}
          >
            <div style={{ transform: `scale(${zoom})`, transformOrigin: "top left", width: `${100 / zoom}%` }}>
              <img src={imageUrl} alt={`Rendered ${tab.label.toLowerCase()}`} className="mx-auto max-w-full" />
            </div>
          </div>

          <pre className="max-h-96 overflow-auto rounded-xl bg-[#010409] p-4 text-xs leading-relaxed text-[#c9d1d9] ring-1 ring-[var(--devdoc-border)]">
            <code>{diagramResult.plantUml}</code>
          </pre>

          <div className="mt-4 flex gap-3">
            <button onClick={handleCopy} className="devdoc-button-secondary">
              {copied ? "Copied!" : "Copy PlantUML"}
            </button>
            <button
              onClick={handleDownload}
              className="devdoc-button-secondary"
              style={{ backgroundColor: "var(--devdoc-primary-soft)", borderColor: "var(--devdoc-primary)", color: "var(--devdoc-primary)" }}
            >
              Download .puml
            </button>
          </div>
        </div>
      )}

      {fullscreen && (
        <div
          className="fixed inset-0 z-50 overflow-auto p-8"
          role="dialog"
          aria-modal="true"
          aria-label={`${tab.label} fullscreen`}
          style={{ backgroundColor: "rgba(1,4,9,0.92)" }}
        >
          <button
            type="button"
            className="fixed right-6 top-6 rounded-lg px-3 py-1.5 text-sm font-bold"
            style={{ backgroundColor: "var(--devdoc-surface)", color: "var(--devdoc-text)", border: "1px solid var(--devdoc-border)" }}
            onClick={() => setFullscreen(false)}
          >
            ✕ Close
          </button>
          <img src={imageUrl} alt={`Rendered ${tab.label.toLowerCase()} fullscreen`} className="mx-auto rounded-xl bg-white p-4" />
        </div>
      )}
    </div>
  );
}

function ProjectDiagrams() {
  const { projectId, project } = useProject();
  const [activeTab, setActiveTab] = useState(TABS[0].key);

  return (
    <main className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <section className="mx-auto max-w-5xl">
        <div className="devdoc-card-border mb-8 p-8">
          <p className="devdoc-label">{project.name}</p>
          <h1 className="mt-3 font-headline text-3xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Diagrams</h1>
          <p className="mt-4 text-sm leading-7" style={{ color: "var(--devdoc-muted)" }}>
            Generate diagram-as-code views from your project documentation graph.
            Render inline, zoom, go fullscreen, or open in the PlantUML editor.
          </p>
        </div>

        <div
          className="mb-6 flex flex-wrap gap-1 rounded-xl border p-1"
          style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
          role="tablist"
        >
          {TABS.map((tab) => {
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.key)}
                className="rounded-lg px-4 py-2 text-sm font-bold transition"
                style={
                  isActive
                    ? { backgroundColor: "var(--devdoc-primary)", color: "#ffffff" }
                    : { color: "var(--devdoc-muted)" }
                }
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {TABS.map((tab) =>
          tab.key === activeTab ? <DiagramPanel key={tab.key} projectId={projectId} tab={tab} /> : null
        )}
      </section>
    </main>
  );
}

export default ProjectDiagrams;
