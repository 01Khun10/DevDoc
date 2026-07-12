const { computeSuggestions, SCORE_THRESHOLD } = require("../src/services/suggestionService");

const requirements = [
  { id: "req-1", title: "Export PDF reports", description: "The system shall export monthly PDF reports for administrators." },
  { id: "req-2", title: "Password reset", description: "Users shall reset forgotten passwords via email." },
  { id: "req-linked", title: "Export PDF reports too", description: "The system shall export PDF reports." }
];

const useCases = [
  { id: "uc-1", title: "Administrator exports report", description: "An administrator exports the monthly PDF reports from the dashboard." },
  { id: "uc-2", title: "Browse catalog", description: "A visitor browses the product catalog." }
];

const documentSections = [
  { id: "sec-1", title: "Reporting", content: "<p>The reporting module lets administrators export monthly <b>PDF reports</b>.</p>" },
  { id: "sec-2", title: "Deployment", content: "Kubernetes cluster configuration and rollout strategy." }
];

const links = [
  { sourceType: "REQUIREMENT", sourceId: "req-linked", targetType: "DOCUMENT_SECTION", targetId: "sec-1" }
];

describe("computeSuggestions", () => {
  const suggestions = computeSuggestions({ requirements, useCases, documentSections, links });

  test("suggests overlapping section and use case for the unlinked requirement", () => {
    const pairs = suggestions.map((s) => `${s.sourceType}:${s.sourceId}->${s.targetType}:${s.targetId}`);
    expect(pairs).toContain("REQUIREMENT:req-1->DOCUMENT_SECTION:sec-1");
    expect(pairs).toContain("USE_CASE:uc-1->REQUIREMENT:req-1");
  });

  test("only emits supported link modes with correct linkType and score above threshold", () => {
    for (const suggestion of suggestions) {
      expect(suggestion.score).toBeGreaterThanOrEqual(SCORE_THRESHOLD);
      expect(Array.isArray(suggestion.reasonTerms)).toBe(true);
      expect(suggestion.reasonTerms.length).toBeGreaterThan(0);
      if (suggestion.sourceType === "REQUIREMENT") {
        expect(suggestion.targetType).toBe("DOCUMENT_SECTION");
        expect(suggestion.linkType).toBe("described_by");
      } else {
        expect(suggestion.sourceType).toBe("USE_CASE");
        expect(suggestion.targetType).toBe("REQUIREMENT");
        expect(suggestion.linkType).toBe("covers");
      }
    }
  });

  test("skips requirements that already have a link", () => {
    const involvesLinked = suggestions.some(
      (s) => s.sourceId === "req-linked" || s.targetId === "req-linked"
    );
    expect(involvesLinked).toBe(false);
  });

  test("does not pair unrelated artefacts", () => {
    const unrelated = suggestions.some(
      (s) => s.targetId === "sec-2" || s.sourceId === "uc-2"
    );
    expect(unrelated).toBe(false);
  });

  test("caps results at 5 and sorts by score descending", () => {
    expect(suggestions.length).toBeLessThanOrEqual(5);
    const scores = suggestions.map((s) => s.score);
    expect([...scores].sort((a, b) => b - a)).toEqual(scores);
  });

  test("returns empty array when nothing is unlinked or corpus is empty", () => {
    expect(computeSuggestions({ requirements: [], useCases, documentSections, links: [] })).toEqual([]);
    expect(
      computeSuggestions({ requirements, useCases: [], documentSections: [], links: [] })
    ).toEqual([]);
  });
});
