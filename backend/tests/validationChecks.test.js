const checks = require("../src/services/validationChecks");
const { findVagueTerms } = require("../src/constants/vagueTerms");

function requirement(overrides = {}) {
  return {
    id: "r1",
    code: "FR-001",
    type: "FR",
    title: "Login",
    description: "The system shall authenticate users.",
    acceptanceCriteria: "Given valid credentials, login succeeds.",
    ...overrides
  };
}

describe("QUA-001 requirements_avoid_vague_terms", () => {
  test("names every matched vague term", () => {
    const findings = checks.requirements_avoid_vague_terms({
      requirements: [requirement({ title: "System should be fast and easy", description: null })]
    });
    expect(findings.map((finding) => finding.params.term).sort()).toEqual(["easy", "fast"]);
    expect(findings[0].targetType).toBe("REQUIREMENT");
  });

  test("matches whole words only", () => {
    expect(findVagueTerms("the fastest simplest breakfast")).toEqual([]);
  });

  test("matches multi-word phrases case-insensitively", () => {
    expect(findVagueTerms("Scale AS NEEDED later")).toEqual(["as needed"]);
  });

  test("clean requirements produce no findings", () => {
    expect(checks.requirements_avoid_vague_terms({ requirements: [requirement()] })).toEqual([]);
  });
});

describe("QUA-002 requirements_have_acceptance_criteria", () => {
  test("flags null and whitespace-only criteria", () => {
    const findings = checks.requirements_have_acceptance_criteria({
      requirements: [
        requirement({ acceptanceCriteria: null }),
        requirement({ id: "r2", code: "FR-002", acceptanceCriteria: "  " }),
        requirement({ id: "r3", code: "FR-003" })
      ]
    });
    expect(findings.map((finding) => finding.params.code)).toEqual(["FR-001", "FR-002"]);
  });
});

describe("QUA-003 frs_use_shall_statements", () => {
  test("flags FRs without 'shall' and ignores NFRs", () => {
    const findings = checks.frs_use_shall_statements({
      requirements: [
        requirement({ description: "Users can log in." }),
        requirement({ id: "r2", code: "NFR-001", type: "NFR", description: "Must be quick." }),
        requirement({ id: "r3", code: "FR-003" })
      ]
    });
    expect(findings.map((finding) => finding.params.code)).toEqual(["FR-001"]);
  });
});

describe("TRC-001 requirements_have_links", () => {
  test("flags requirements with no traceability links", () => {
    const findings = checks.requirements_have_links({
      requirements: [requirement(), requirement({ id: "r2", code: "FR-002" })],
      traceabilityLinks: [
        { sourceType: "USE_CASE", sourceId: "u1", targetType: "REQUIREMENT", targetId: "r1", linkType: "covers" }
      ]
    });
    expect(findings.map((finding) => finding.params.code)).toEqual(["FR-002"]);
  });
});

describe("REQ-002 frs_covered_by_use_cases", () => {
  test("flags uncovered FRs only", () => {
    const findings = checks.frs_covered_by_use_cases({
      requirements: [requirement(), requirement({ id: "r2", code: "NFR-001", type: "NFR" })],
      traceabilityLinks: []
    });
    expect(findings.map((finding) => finding.params.code)).toEqual(["FR-001"]);
  });
});

describe("SEC-001 required_sections_completed", () => {
  test("flags empty required sections, skips optional ones", () => {
    const findings = checks.required_sections_completed({
      sections: [
        { id: "s1", sectionNumber: "1.1", title: "Purpose", content: "", isRequired: true, documentTitle: "SRS" },
        { id: "s2", sectionNumber: "1.2", title: "Scope", content: null, isRequired: false, documentTitle: "SRS" },
        { id: "s3", sectionNumber: "1.3", title: "Refs", content: "done", isRequired: true, documentTitle: "SRS" }
      ]
    });
    expect(findings).toHaveLength(1);
    expect(findings[0].targetId).toBe("s1");
  });
});

describe("TRC-003 links_are_fresh", () => {
  const old = new Date("2026-01-01");
  const recent = new Date("2026-06-01");

  function context(lastVerifiedAt) {
    return {
      sections: [],
      designElements: [],
      testCases: [],
      requirements: [requirement({ updatedAt: recent })],
      useCases: [{ id: "u1", code: "UC-001", updatedAt: old }],
      traceabilityLinks: [
        {
          id: "l1",
          sourceType: "USE_CASE",
          sourceId: "u1",
          targetType: "REQUIREMENT",
          targetId: "r1",
          linkType: "covers",
          lastVerifiedAt
        }
      ]
    };
  }

  test("flags links whose endpoint changed after verification", () => {
    const findings = checks.links_are_fresh(context(old));
    expect(findings).toHaveLength(1);
    expect(findings[0].params).toEqual({
      sourceLabel: "UC-001",
      targetLabel: "FR-001",
      linkType: "covers"
    });
  });

  test("re-verifying clears the finding", () => {
    expect(checks.links_are_fresh(context(new Date("2026-07-01")))).toEqual([]);
  });

  test("links with missing endpoints are left to TRC-002", () => {
    const staleContext = context(old);
    staleContext.requirements = [];
    expect(checks.links_are_fresh(staleContext)).toEqual([]);
  });
});

describe("TRC-002 links_have_valid_endpoints", () => {
  test("flags links pointing at missing artefacts", () => {
    const findings = checks.links_have_valid_endpoints({
      sections: [],
      requirements: [],
      useCases: [{ id: "u1" }],
      designElements: [],
      testCases: [],
      traceabilityLinks: [
        { sourceType: "USE_CASE", sourceId: "u1", targetType: "REQUIREMENT", targetId: "gone", linkType: "covers" }
      ]
    });
    expect(findings).toHaveLength(1);
    expect(findings[0].params.description).toBe("to a missing requirement");
  });
});
