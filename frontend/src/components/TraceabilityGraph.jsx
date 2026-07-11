import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactFlow, { Background, Controls, MarkerType } from "reactflow";
import "reactflow/dist/style.css";

const TYPE_STYLES = {
  USE_CASE: { color: "#8b5cf6", label: "Use Case", route: "use-cases" },
  FR: { color: "#06b6d4", label: "FR", route: "requirements" },
  NFR: { color: "#0ea5e9", label: "NFR", route: "requirements" },
  DOCUMENT_SECTION: { color: "#f59e0b", label: "Section", route: "documents" },
  DESIGN_ELEMENT: { color: "#10b981", label: "Design", route: "design-elements" },
  TEST_CASE: { color: "#ec4899", label: "Test", route: "test-cases" },
};

const COLUMN_ORDER = ["USE_CASE", "FR", "NFR", "DOCUMENT_SECTION", "DESIGN_ELEMENT", "TEST_CASE"];
const COLUMN_WIDTH = 240;
const ROW_HEIGHT = 70;

function sectionLabel(section) {
  return `${section.document?.documentType || "DOC"} ${section.sectionNumber}`;
}

function buildNodes({ useCases, requirements, documentSections, designElements, testCases }, linkedIds) {
  const groups = {
    USE_CASE: useCases.map((item) => ({ id: item.id, label: item.code, title: item.title })),
    FR: requirements
      .filter((item) => item.type === "FR")
      .map((item) => ({ id: item.id, label: item.code, title: item.title })),
    NFR: requirements
      .filter((item) => item.type !== "FR")
      .map((item) => ({ id: item.id, label: item.code, title: item.title })),
    DOCUMENT_SECTION: documentSections.map((item) => ({
      id: item.id,
      label: sectionLabel(item),
      title: item.title,
    })),
    DESIGN_ELEMENT: designElements.map((item) => ({ id: item.id, label: item.code, title: item.title })),
    TEST_CASE: testCases.map((item) => ({ id: item.id, label: item.code, title: item.title })),
  };

  // ponytail: simple layered layout (one column per type); add dagre if graphs get messy
  return COLUMN_ORDER.flatMap((type, columnIndex) =>
    groups[type].map((item, rowIndex) => {
      const isOrphan = !linkedIds.has(item.id);
      const style = TYPE_STYLES[type];
      return {
        id: item.id,
        position: { x: columnIndex * COLUMN_WIDTH, y: rowIndex * ROW_HEIGHT },
        data: { label: `${item.label}${item.title ? ` ${item.title.slice(0, 24)}` : ""}`, type },
        style: {
          borderRadius: 10,
          padding: 8,
          fontSize: 12,
          fontWeight: 600,
          width: COLUMN_WIDTH - 40,
          backgroundColor: "var(--devdoc-surface)",
          color: "var(--devdoc-text)",
          border: isOrphan ? "2px solid #dc2626" : `2px solid ${style.color}`,
          boxShadow: `inset 4px 0 0 ${style.color}`,
        },
      };
    })
  );
}

function TraceabilityGraph({ projectId, options, links }) {
  const navigate = useNavigate();

  const { nodes, edges } = useMemo(() => {
    const linkedIds = new Set(links.flatMap((link) => [link.sourceId, link.targetId]));
    return {
      nodes: buildNodes(options, linkedIds),
      edges: links.map((link) => ({
        id: link.id,
        source: link.sourceId,
        target: link.targetId,
        label: link.linkType,
        labelStyle: { fontSize: 10, fill: "var(--devdoc-muted)" },
        labelBgStyle: { fill: "var(--devdoc-surface)" },
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "var(--devdoc-border-strong, var(--devdoc-border))" },
      })),
    };
  }, [links, options]);

  function handleNodeClick(event, node) {
    const route = TYPE_STYLES[node.data.type]?.route;
    if (route && route !== "documents") {
      navigate(`/projects/${projectId}/${route}`);
    }
  }

  return (
    <div
      className="rounded-xl border"
      style={{ borderColor: "var(--devdoc-border)", backgroundColor: "var(--devdoc-surface)", height: "600px" }}
    >
      <ReactFlow nodes={nodes} edges={edges} onNodeClick={handleNodeClick} fitView proOptions={{ hideAttribution: true }}>
        <Background gap={16} />
        <Controls />
      </ReactFlow>
      <div className="flex flex-wrap gap-3 border-t px-4 py-2 text-xs" style={{ borderColor: "var(--devdoc-border)" }}>
        {COLUMN_ORDER.map((type) => (
          <span key={type} className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--devdoc-muted)" }}>
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: TYPE_STYLES[type].color }} />
            {TYPE_STYLES[type].label}
          </span>
        ))}
        <span className="flex items-center gap-1.5 font-semibold" style={{ color: "var(--devdoc-muted)" }}>
          <span className="h-2.5 w-2.5 rounded-full border-2" style={{ borderColor: "#dc2626" }} />
          Orphan (no links)
        </span>
      </div>
    </div>
  );
}

export default TraceabilityGraph;
