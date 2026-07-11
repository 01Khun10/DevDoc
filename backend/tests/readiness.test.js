const { calculateReadinessMetrics, sortResults } = require("../src/services/validationService");

const emptyContext = {
  documents: [],
  sections: [],
  requirements: [],
  useCases: [],
  traceabilityLinks: [],
  designElements: [],
  testCases: []
};

function fullyLinkedContext() {
  return {
    documents: [],
    sections: [{ id: "s1", isRequired: true, content: "done" }],
    requirements: [{ id: "r1", code: "FR-001", type: "FR" }],
    useCases: [{ id: "u1", code: "UC-001" }],
    designElements: [{ id: "d1", code: "DE-001" }],
    testCases: [{ id: "t1", code: "TC-001" }],
    traceabilityLinks: [
      { sourceType: "USE_CASE", sourceId: "u1", targetType: "REQUIREMENT", targetId: "r1", linkType: "covers" },
      { sourceType: "REQUIREMENT", sourceId: "r1", targetType: "DESIGN_ELEMENT", targetId: "d1", linkType: "implemented_by" },
      { sourceType: "REQUIREMENT", sourceId: "r1", targetType: "TEST_CASE", targetId: "t1", linkType: "verified_by" }
    ]
  };
}

describe("calculateReadinessMetrics", () => {
  test("empty project scores 0 with all-zero ratios", () => {
    const { metrics, readinessScore } = calculateReadinessMetrics(emptyContext);
    expect(readinessScore).toBe(0);
    expect(metrics).toEqual({
      sectionCompletion: 0,
      reqTraced: 0,
      frCovered: 0,
      frImplemented: 0,
      frVerified: 0
    });
  });

  test("fully linked project scores 100", () => {
    const { metrics, readinessScore } = calculateReadinessMetrics(fullyLinkedContext());
    expect(readinessScore).toBe(100);
    expect(metrics.sectionCompletion).toBe(1);
    expect(metrics.frVerified).toBe(1);
  });

  test("missing verified_by link drops exactly the 10% weight", () => {
    const context = fullyLinkedContext();
    context.traceabilityLinks = context.traceabilityLinks.filter(
      (link) => link.linkType !== "verified_by"
    );
    expect(calculateReadinessMetrics(context).readinessScore).toBe(90);
  });

  test("empty required-section content does not count as complete", () => {
    const context = fullyLinkedContext();
    context.sections[0].content = "   ";
    expect(calculateReadinessMetrics(context).metrics.sectionCompletion).toBe(0);
  });

  test("NFRs count for reqTraced but not FR coverage denominators", () => {
    const context = fullyLinkedContext();
    context.requirements.push({ id: "r2", code: "NFR-001", type: "NFR" });
    const { metrics } = calculateReadinessMetrics(context);
    expect(metrics.reqTraced).toBe(0.5);
    expect(metrics.frCovered).toBe(1);
  });
});

describe("sortResults", () => {
  test("orders by severity then rule code", () => {
    const sorted = sortResults([
      { ruleCode: "UC-001", severity: "INFO" },
      { ruleCode: "SEC-001", severity: "ERROR" },
      { ruleCode: "REQ-002", severity: "WARNING" },
      { ruleCode: "DOC-001", severity: "ERROR" }
    ]);
    expect(sorted.map((result) => result.ruleCode)).toEqual([
      "DOC-001",
      "SEC-001",
      "REQ-002",
      "UC-001"
    ]);
  });
});
