import { useState } from "react";
import { useProject } from "../context/ProjectContext";
import { getTraceabilityTreePlantUml } from "../services/diagramService";

function ProjectDiagramsPlaceholder() {
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
    <main className="min-h-screen bg-[#f8f9fa] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-5xl">
        <div className="devdoc-card-border mb-8 bg-white p-8">
          <p className="text-sm font-semibold text-indigo-700">{project.name}</p>
          <h1 className="mt-3 font-headline text-3xl font-extrabold text-slate-950">Diagrams</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            Generate diagram-as-code views from your project documentation graph.
            Paste the generated .puml code into any PlantUML-compatible viewer to render it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div className="flex flex-col gap-6">
            {/* Active Diagram Tool */}
            <div className="devdoc-card-border flex flex-col bg-white">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-headline text-xl font-extrabold text-slate-950">Traceability Tree</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
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
                <div className="border-t border-slate-100 bg-red-50 p-6">
                  <p className="text-sm font-semibold text-red-700">{error}</p>
                </div>
              )}

              {diagramResult && (
                <div className="border-t border-slate-200 bg-slate-50 p-6">
                  <div className="mb-4 flex flex-wrap gap-3">
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                      Use Cases: {diagramResult.summary.useCaseCount}
                    </span>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                      Requirements: {diagramResult.summary.requirementCount}
                    </span>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                      Sections: {diagramResult.summary.documentSectionCount}
                    </span>
                    <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold text-slate-700">
                      Links: {diagramResult.summary.linkCount}
                    </span>
                  </div>

                  <div className="relative">
                    <pre className="max-h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-xs leading-relaxed text-slate-300">
                      <code>{diagramResult.plantUml}</code>
                    </pre>
                  </div>

                  <div className="mt-4 flex gap-3">
                    <button
                      onClick={handleCopy}
                      className="rounded-md bg-white px-4 py-2 text-sm font-bold text-slate-700 ring-1 ring-inset ring-slate-300 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      {copied ? "Copied!" : "Copy PlantUML"}
                    </button>
                    <button
                      onClick={handleDownload}
                      className="rounded-md bg-indigo-50 px-4 py-2 text-sm font-bold text-indigo-700 ring-1 ring-inset ring-indigo-200 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                    >
                      Download .puml
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <aside className="flex flex-col gap-4">
            <h3 className="font-headline text-lg font-bold text-slate-950">Coming Soon</h3>
            
            <div className="devdoc-card-border border-dashed p-5 opacity-60">
              <h4 className="font-bold text-slate-700">Use Case Diagram</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">Visual actor-goal mapping.</p>
            </div>
            
            <div className="devdoc-card-border border-dashed p-5 opacity-60">
              <h4 className="font-bold text-slate-700">SDS Component Diagram</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">Architecture block diagrams.</p>
            </div>
            
            <div className="devdoc-card-border border-dashed p-5 opacity-60">
              <h4 className="font-bold text-slate-700">ERD / Data Model</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">Database schema visualization.</p>
            </div>
            
            <div className="devdoc-card-border border-dashed p-5 opacity-60">
              <h4 className="font-bold text-slate-700">Test Coverage Diagram</h4>
              <p className="mt-1 text-xs leading-5 text-slate-500">Test plan traceability flow.</p>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}

export default ProjectDiagramsPlaceholder;
