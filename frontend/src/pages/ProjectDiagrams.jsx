import { useState } from "react";
import { useProject } from "../context/ProjectContext";
import { getTraceabilityTreePlantUml } from "../services/diagramService";

function ProjectDiagrams() {
  const { projectId, project } = useProject();
  const [isGenerating, setIsGenerating] = useState(false);
  const [diagramResult, setDiagramResult] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function handleGenerate() {
    setIsGenerating(true);
    setError("");
    setDiagramResult(null);
    setCopied(false);

    try {
      const data = await getTraceabilityTreePlantUml(projectId);
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
    link.download = "devdoc-traceability-tree.puml";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <main className="min-h-screen px-6 py-10" style={{ backgroundColor: "var(--devdoc-bg)", color: "var(--devdoc-text)" }}>
      <section className="mx-auto max-w-5xl">
        <div className="devdoc-card-border mb-8 p-8">
          <p className="devdoc-label">{project.name}</p>
          <h1 className="mt-3 font-headline text-3xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Diagrams</h1>
          <p className="mt-4 text-sm leading-7" style={{ color: "var(--devdoc-muted)" }}>
            Generate diagram-as-code views from your project documentation graph.
            Paste the generated .puml code into any PlantUML-compatible viewer to render it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            {/* Active Diagram Tool */}
            <div className="devdoc-card-border flex flex-col">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-xl font-extrabold" style={{ color: "var(--devdoc-text)" }}>Traceability Tree</h2>
                    <p className="mt-2 text-sm leading-6" style={{ color: "var(--devdoc-muted)" }}>
                      Generate PlantUML from use cases, requirements, document sections, and traceability links.
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
                    {[
                      ["Use Cases", diagramResult.summary.useCaseCount],
                      ["Requirements", diagramResult.summary.requirementCount],
                      ["Sections", diagramResult.summary.documentSectionCount],
                      ["Links", diagramResult.summary.linkCount],
                    ].map(([label, count]) => (
                      <span
                        key={label}
                        className="rounded-full px-3 py-1 text-xs font-bold"
                        style={{ backgroundColor: "var(--devdoc-surface-inset)", border: "1px solid var(--devdoc-border)", color: "var(--devdoc-text)" }}
                      >
                        {label}: {count}
                      </span>
                    ))}
                  </div>

                  <div className="relative">
                    <pre className="max-h-96 overflow-auto rounded-xl bg-[#010409] p-4 text-xs leading-relaxed text-[#c9d1d9] ring-1 ring-[var(--devdoc-border)]">
                      <code>{diagramResult.plantUml}</code>
                    </pre>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="devdoc-button-secondary"
                    >
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
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <h3 className="font-headline text-lg font-bold" style={{ color: "var(--devdoc-text)" }}>Coming Soon</h3>
            {[
              ["Use Case Diagram", "Visual actor-goal mapping."],
              ["SDS Component Diagram", "Architecture block diagrams."],
              ["ERD / Data Model", "Database schema visualization."],
              ["Test Coverage Diagram", "Test plan traceability flow."],
            ].map(([title, desc]) => (
              <div key={title} className="devdoc-card-border border-dashed p-5 opacity-60">
                <h4 className="font-bold" style={{ color: "var(--devdoc-text)" }}>{title}</h4>
                <p className="mt-1 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>{desc}</p>
              </div>
            ))}
          </aside>
        </div>
      </section>
    </main>
  );
}

export default ProjectDiagrams;
