// Check registry for the config-driven validation engine.
// Each check receives the project context and returns findings:
//   { params: { placeholder: value }, targetType?, targetId? }
// Severity, message template, and suggested fix come from the ValidationRule
// row in the database, not from this file.
//
// Context shape:
//   { documents, sections, requirements, useCases, businessObjectives,
//     traceabilityLinks, designElements, testCases }
// where sections are all document sections flattened with documentTitle.

function hasTraceabilityLink(traceabilityLinks, criteria) {
  return traceabilityLinks.some((link) =>
    Object.entries(criteria).every(([key, value]) => link[key] === value)
  );
}

const { findVagueTerms } = require("../constants/vagueTerms");

const validationChecks = {
  requirements_avoid_vague_terms({ requirements }) {
    return requirements.flatMap((requirement) =>
      findVagueTerms(`${requirement.title || ""} ${requirement.description || ""}`).map((term) => ({
        params: { code: requirement.code, term },
        targetType: "REQUIREMENT",
        targetId: requirement.id
      }))
    );
  },

  requirements_have_acceptance_criteria({ requirements }) {
    return requirements
      .filter(
        (requirement) =>
          !requirement.acceptanceCriteria || requirement.acceptanceCriteria.trim() === ""
      )
      .map((requirement) => ({
        params: { code: requirement.code },
        targetType: "REQUIREMENT",
        targetId: requirement.id
      }));
  },

  frs_use_shall_statements({ requirements }) {
    return requirements
      .filter((requirement) => requirement.type === "FR")
      .filter((requirement) => !/\bshall\b/i.test(requirement.description || ""))
      .map((requirement) => ({
        params: { code: requirement.code },
        targetType: "REQUIREMENT",
        targetId: requirement.id
      }));
  },

  project_has_documents({ documents }) {
    if (documents.length > 0) {
      return [];
    }

    return [{ params: {} }];
  },

  project_has_requirements({ requirements }) {
    if (requirements.length > 0) {
      return [];
    }

    return [{ params: {} }];
  },

  project_has_business_objectives({ businessObjectives }) {
    if (businessObjectives.length > 0) {
      return [];
    }

    return [{ params: {} }];
  },

  bos_linked_to_use_cases({ businessObjectives, traceabilityLinks }) {
    return businessObjectives
      .filter(
        (objective) =>
          !hasTraceabilityLink(traceabilityLinks, {
            sourceType: "BUSINESS_OBJECTIVE",
            sourceId: objective.id,
            targetType: "USE_CASE",
            linkType: "initiates"
          })
      )
      .map((objective) => ({
        params: { code: objective.code },
        targetType: "BUSINESS_OBJECTIVE",
        targetId: objective.id
      }));
  },

  project_has_use_cases({ useCases }) {
    if (useCases.length > 0) {
      return [];
    }

    return [{ params: {} }];
  },

  required_sections_completed({ sections }) {
    return sections
      .filter((section) => section.isRequired)
      .filter((section) => section.content === null || section.content.trim() === "")
      .map((section) => ({
        params: {
          sectionNumber: section.sectionNumber,
          sectionTitle: section.title,
          documentTitle: section.documentTitle
        },
        targetType: "DOCUMENT_SECTION",
        targetId: section.id
      }));
  },

  documents_completion_summary({ documents }) {
    const incompleteDocuments = documents.filter(
      (document) => document.completionPercent < 100
    );

    if (incompleteDocuments.length === 0) {
      return [];
    }

    const documentList = incompleteDocuments
      .map((document) => `'${document.title}' (${document.completionPercent}%)`)
      .join(", ");

    return [
      {
        params: {
          count: incompleteDocuments.length,
          documentList
        }
      }
    ];
  },

  requirements_have_links({ requirements, traceabilityLinks }) {
    const linkedRequirementIds = new Set();

    for (const link of traceabilityLinks) {
      if (link.sourceType === "REQUIREMENT") linkedRequirementIds.add(link.sourceId);
      if (link.targetType === "REQUIREMENT") linkedRequirementIds.add(link.targetId);
    }

    return requirements
      .filter((requirement) => !linkedRequirementIds.has(requirement.id))
      .map((requirement) => ({
        params: { code: requirement.code },
        targetType: "REQUIREMENT",
        targetId: requirement.id
      }));
  },

  use_cases_cover_requirements({ useCases, traceabilityLinks }) {
    return useCases
      .filter(
        (useCase) =>
          !hasTraceabilityLink(traceabilityLinks, {
            sourceType: "USE_CASE",
            sourceId: useCase.id,
            targetType: "REQUIREMENT",
            linkType: "covers"
          })
      )
      .map((useCase) => ({
        params: { code: useCase.code },
        targetType: "USE_CASE",
        targetId: useCase.id
      }));
  },

  use_cases_described_by_sections({ useCases, traceabilityLinks }) {
    return useCases
      .filter(
        (useCase) =>
          !hasTraceabilityLink(traceabilityLinks, {
            sourceType: "USE_CASE",
            sourceId: useCase.id,
            targetType: "DOCUMENT_SECTION",
            linkType: "described_by"
          })
      )
      .map((useCase) => ({
        params: { code: useCase.code },
        targetType: "USE_CASE",
        targetId: useCase.id
      }));
  },

  frs_covered_by_use_cases({ requirements, traceabilityLinks }) {
    return requirements
      .filter((requirement) => requirement.type === "FR")
      .filter(
        (requirement) =>
          !hasTraceabilityLink(traceabilityLinks, {
            sourceType: "USE_CASE",
            targetType: "REQUIREMENT",
            targetId: requirement.id,
            linkType: "covers"
          })
      )
      .map((requirement) => ({
        params: { code: requirement.code },
        targetType: "REQUIREMENT",
        targetId: requirement.id
      }));
  },

  frs_implemented_by_design({ requirements, traceabilityLinks }) {
    return requirements
      .filter((requirement) => requirement.type === "FR")
      .filter(
        (requirement) =>
          !hasTraceabilityLink(traceabilityLinks, {
            sourceType: "REQUIREMENT",
            sourceId: requirement.id,
            targetType: "DESIGN_ELEMENT",
            linkType: "implemented_by"
          })
      )
      .map((requirement) => ({
        params: { code: requirement.code },
        targetType: "REQUIREMENT",
        targetId: requirement.id
      }));
  },

  frs_verified_by_tests({ requirements, traceabilityLinks }) {
    return requirements
      .filter((requirement) => requirement.type === "FR")
      .filter(
        (requirement) =>
          !hasTraceabilityLink(traceabilityLinks, {
            sourceType: "REQUIREMENT",
            sourceId: requirement.id,
            targetType: "TEST_CASE",
            linkType: "verified_by"
          })
      )
      .map((requirement) => ({
        params: { code: requirement.code },
        targetType: "REQUIREMENT",
        targetId: requirement.id
      }));
  },

  links_are_fresh({
    sections,
    requirements,
    useCases,
    businessObjectives,
    designElements,
    testCases,
    traceabilityLinks
  }) {
    const artefactsByType = {
      BUSINESS_OBJECTIVE: businessObjectives,
      DOCUMENT_SECTION: sections,
      REQUIREMENT: requirements,
      USE_CASE: useCases,
      DESIGN_ELEMENT: designElements,
      TEST_CASE: testCases
    };
    const byId = {};

    for (const [type, artefacts] of Object.entries(artefactsByType)) {
      byId[type] = new Map(artefacts.map((artefact) => [artefact.id, artefact]));
    }

    const label = (artefact) =>
      artefact.code || `${artefact.sectionNumber || ""} ${artefact.title || ""}`.trim();

    const findings = [];

    for (const link of traceabilityLinks) {
      const source = byId[link.sourceType]?.get(link.sourceId);
      const target = byId[link.targetType]?.get(link.targetId);

      if (!source || !target) {
        continue; // broken endpoints are TRC-002's job
      }

      if (
        source.updatedAt > link.lastVerifiedAt ||
        target.updatedAt > link.lastVerifiedAt
      ) {
        findings.push({
          params: {
            sourceLabel: label(source),
            targetLabel: label(target),
            linkType: link.linkType
          },
          targetType: link.sourceType,
          targetId: link.sourceId
        });
      }
    }

    return findings;
  },

  links_have_valid_endpoints({
    sections,
    requirements,
    useCases,
    designElements,
    testCases,
    traceabilityLinks
  }) {
    const sectionIds = new Set(sections.map((section) => section.id));
    const requirementIds = new Set(requirements.map((requirement) => requirement.id));
    const useCaseIds = new Set(useCases.map((useCase) => useCase.id));
    const designElementIds = new Set(designElements.map((element) => element.id));
    const testCaseIds = new Set(testCases.map((testCase) => testCase.id));
    const findings = [];

    for (const link of traceabilityLinks) {
      if (link.targetType === "DOCUMENT_SECTION" && !sectionIds.has(link.targetId)) {
        findings.push({ params: { description: "to a missing document section" } });
      }

      if (link.targetType === "DESIGN_ELEMENT" && !designElementIds.has(link.targetId)) {
        findings.push({ params: { description: "to a missing design element" } });
      }

      if (link.targetType === "TEST_CASE" && !testCaseIds.has(link.targetId)) {
        findings.push({ params: { description: "to a missing test case" } });
      }

      if (link.targetType === "REQUIREMENT" && !requirementIds.has(link.targetId)) {
        findings.push({ params: { description: "to a missing requirement" } });
      }

      if (link.sourceType === "USE_CASE" && !useCaseIds.has(link.sourceId)) {
        findings.push({ params: { description: "from a missing use case" } });
      }

      if (link.sourceType === "REQUIREMENT" && !requirementIds.has(link.sourceId)) {
        findings.push({ params: { description: "from a missing requirement" } });
      }
    }

    return findings;
  }
};

module.exports = validationChecks;
