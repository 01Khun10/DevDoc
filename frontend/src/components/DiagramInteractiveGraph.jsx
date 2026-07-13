import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import ReactFlow, { Background, Controls, MiniMap, MarkerType } from "reactflow";
import "reactflow/dist/style.css";
import { getDiagramGraphData } from "../services/diagramService";
import { SkeletonCard } from "./ui";

const TYPE_STYLES = {
  BUSINESS_OBJECTIVE: { color: "#0d9488", label: "BO", name: "Business Objective", route: "business-objectives" },
  USE_CASE: { color: "#8b5cf6", label: "UC", name: "Use Case", route: "use-cases" },
  FR: { color: "#06b6d4", label: "FR", name: "Functional Requirement", route: "requirements" },
  NFR: { color: "#0ea5e9", label: "NFR", name: "Non-Functional Requirement", route: "requirements" },
  DOCUMENT_SECTION: { color: "#f59e0b", label: "SEC", name: "Document Section", route: "documents" },
  DESIGN_ELEMENT: { color: "#10b981", label: "DE", name: "Design Element", route: "design-elements" },
  TEST_CASE: { color: "#ec4899", label: "TC", name: "Test Case", route: "test-cases" }
};

const COLUMN_ORDER = ["BUSINESS_OBJECTIVE", "USE_CASE", "FR", "NFR", "DOCUMENT_SECTION", "DESIGN_ELEMENT", "TEST_CASE"];
const COLUMN_WIDTH = 240;
const NODE_WIDTH = COLUMN_WIDTH - 40;
const NODE_HEIGHT = 44;
const ROW_HEIGHT = 70;

function sectionCode(section) {
  return `${section.document?.documentType || "DOC"} ${section.sectionNumber}`;
}

// Flatten the API payload into one list of typed items.
function collectItems(graph) {
  return [
    ...graph.businessObjectives.map((item) => ({ ...item, graphType: "BUSINESS_OBJECTIVE" })),
    ...graph.useCases.map((item) => ({ ...item, graphType: "USE_CASE" })),
    ...graph.requirements.map((item) => ({ ...item, graphType: item.type === "FR" ? "FR" : "NFR" })),
    ...graph.documentSections.map((item) => ({
      ...item,
      code: sectionCode(item),
      description: item.document?.title,
      graphType: "DOCUMENT_SECTION"
    })),
    ...graph.designElements.map((item) => ({ ...item, graphType: "DESIGN_ELEMENT" })),
    ...graph.testCases.map((item) => ({ ...item, graphType: "TEST_CASE" }))
  ];
}

function buildFlow(graph) {
  const items = collectItems(graph);
  const linkedIds = new Set(graph.links.flatMap((link) => [link.sourceId, link.targetId]));

  // ponytail: simple layered layout (one column per type); add dagre if graphs get messy
  const rowCounters = {};
  const nodes = items.map((item) => {
    const columnIndex = COLUMN_ORDER.indexOf(item.graphType);
    const rowIndex = rowCounters[item.graphType] || 0;
    rowCounters[item.graphType] = rowIndex + 1;
    const style = TYPE_STYLES[item.graphType];
    const isOrphan = !linkedIds.has(item.id);

    return {
      id: item.id,
      position: { x: columnIndex * COLUMN_WIDTH, y: rowIndex * ROW_HEIGHT },
      data: { label: `${item.code}${item.title ? ` ${item.title.slice(0, 24)}` : ""}`, item, isOrphan },
      style: {
        borderRadius: 10,
        padding: 8,
        fontSize: 12,
        fontWeight: 600,
        width: NODE_WIDTH,
        backgroundColor: "var(--devdoc-surface)",
        color: "var(--devdoc-text)",
        border: isOrphan ? "2px dashed #dc2626" : `2px solid ${style.color}`,
        boxShadow: `inset 4px 0 0 ${style.color}`
      }
    };
  });

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges = graph.links
    .filter((link) => nodeIds.has(link.sourceId) && nodeIds.has(link.targetId))
    .map((link) => ({
      id: link.id,
      source: link.sourceId,
      target: link.targetId,
      label: link.linkType,
      labelStyle: { fontSize: 10, fill: "var(--devdoc-muted)" },
      labelBgStyle: { fill: "var(--devdoc-surface)" },
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: "var(--devdoc-border-strong, var(--devdoc-border))" }
    }));

  return { nodes, edges };
}

// Hand-rolled SVG export from the computed layout — no extra dependency needed
// for boxes, labels, and straight edges.
function downloadSvg(nodes, edges) {
  const nodeById = new Map(nodes.map((node) => [node.id, node]));
  const maxX = Math.max(...nodes.map((node) => node.position.x)) + NODE_WIDTH + 40;
  const maxY = Math.max(...nodes.map((node) => node.position.y)) + NODE_HEIGHT + 40;

  const escapeXml = (text) =>
    String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const edgeLines = edges
    .map((edge) => {
      const source = nodeById.get(edge.source);
      const target = nodeById.get(edge.target);
      if (!source || !target) return "";
      const x1 = source.position.x + NODE_WIDTH;
      const y1 = source.position.y + NODE_HEIGHT / 2;
      const x2 = target.position.x;
      const y2 = target.position.y + NODE_HEIGHT / 2;
      return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#8b949e" stroke-width="1.5" marker-end="url(#arrow)" />`;
    })
    .join("\n");

  const nodeRects = nodes
    .map((node) => {
      const { x, y } = node.position;
      const color = TYPE_STYLES[node.data.item.graphType].color;
      const dash = node.data.isOrphan ? ` stroke-dasharray="6 3" stroke="#dc2626"` : ` stroke="${color}"`;
      return (
        `<rect x="${x}" y="${y}" width="${NODE_WIDTH}" height="${NODE_HEIGHT}" rx="10" fill="#ffffff" stroke-width="2"${dash} />\n` +
        `<text x="${x + 10}" y="${y + NODE_HEIGHT / 2 + 4}" font-family="sans-serif" font-size="12" font-weight="600" fill="#1f2328">${escapeXml(node.data.label)}</text>`
      );
    })
    .join("\n");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${maxX}" height="${maxY}" viewBox="0 0 ${maxX} ${maxY}">\n` +
    `<defs><marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#8b949e" /></marker></defs>\n` +
    `<rect width="100%" height="100%" fill="#ffffff" />\n${edgeLines}\n${nodeRects}\n</svg>`;

  const blob = new Blob([svg], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "devdoc-hierarchy-graph.svg";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function DetailPanel({ node, projectId, onClose }) {
  const navigate = useNavigate();
  const item = node.data.item;
  const style = TYPE_STYLES[item.graphType];

  return (
    <div
      className="absolute right-3 top-3 z-10 w-[280px] rounded-xl border p-4 shadow-lg"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)" }}
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <span
          className="rounded-full px-2.5 py-0.5 text-xs font-bold"
          style={{ backgroundColor: `${style.color}1f`, border: `1px solid ${style.color}55`, color: style.color }}
        >
          {style.name}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close details"
          className="text-sm font-bold"
          style={{ color: "var(--devdoc-muted)" }}
        >
          ✕
        </button>
      </div>
      <p className="font-headline text-sm font-extrabold" style={{ color: "var(--devdoc-text)" }}>
        {item.code}
      </p>
      <p className="mt-1 text-sm font-semibold" style={{ color: "var(--devdoc-text)" }}>{item.title}</p>
      {item.description ? (
        <p className="mt-2 text-xs leading-5" style={{ color: "var(--devdoc-muted)" }}>
          {item.description.length > 160 ? `${item.description.slice(0, 160)}…` : item.description}
        </p>
      ) : null}
      {node.data.isOrphan ? (
        <p className="mt-2 text-xs font-bold" style={{ color: "#dc2626" }}>
          Orphan — no traceability links
        </p>
      ) : null}
      <button
        type="button"
        className="devdoc-button-secondary mt-3 w-full text-sm"
        onClick={() =>
          navigate(
            style.route === "documents"
              ? `/projects/${projectId}/documents/${item.document?.id}`
              : `/projects/${projectId}/${style.route}?highlight=${item.id}`
          )
        }
      >
        Open in registry
      </button>
    </div>
  );
}

function DiagramInteractiveGraph({ projectId }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const { data: graph, isLoading, isError } = useQuery({
    queryKey: ["projects", projectId, "diagramGraph"],
    queryFn: () => getDiagramGraphData(projectId),
    enabled: Boolean(projectId)
  });

  const { nodes, edges } = useMemo(
    () => (graph ? buildFlow(graph) : { nodes: [], edges: [] }),
    [graph]
  );

  if (isLoading) return <SkeletonCard lines={6} />;
  if (isError) {
    return (
      <p className="p-6 text-sm font-semibold" style={{ color: "var(--devdoc-error)" }}>
        Failed to load graph data. Please try again.
      </p>
    );
  }
  if (nodes.length === 0) {
    return (
      <p className="p-6 text-center text-sm" style={{ color: "var(--devdoc-muted)" }}>
        No artifacts yet. Add business objectives, use cases, and requirements to see the hierarchy.
      </p>
    );
  }

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-3 text-xs">
          {COLUMN_ORDER.map((type) => (
            <span key={type} className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--devdoc-muted)" }}>
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_STYLES[type].color }} />
              {TYPE_STYLES[type].label}
            </span>
          ))}
          <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--devdoc-muted)" }}>
            <span className="h-2.5 w-2.5 rounded-full border-2 border-dashed" style={{ borderColor: "#dc2626" }} />
            Orphan
          </span>
        </div>
        <button type="button" className="devdoc-button-secondary text-sm" onClick={() => downloadSvg(nodes, edges)}>
          Download as SVG
        </button>
      </div>

      <div
        className="relative rounded-xl border"
        style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", height: "600px" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodeClick={(event, node) => setSelectedNode(node)}
          onPaneClick={() => setSelectedNode(null)}
          fitView
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={16} />
          <Controls />
          <MiniMap
            pannable
            style={{ width: 120, height: 80 }}
            nodeColor={(node) => TYPE_STYLES[node.data.item.graphType].color}
          />
        </ReactFlow>
        {selectedNode ? (
          <DetailPanel node={selectedNode} projectId={projectId} onClose={() => setSelectedNode(null)} />
        ) : null}
      </div>
    </div>
  );
}

export default DiagramInteractiveGraph;
