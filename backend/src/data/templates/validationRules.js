const PROFILE_CODES = ["STANDARD_SOFTWARE", "ACADEMIC_PROJECT", "COMPANY_SOFTWARE"];

// One base definition per rule. Rules are seeded once per profile so severity
// can differ per profile via severityOverrides (profileCode -> severity).
const baseRules = [
  {
    ruleCode: "DOC-001",
    ruleName: "Project has documents",
    ruleCategory: "C",
    severity: "ERROR",
    checkKey: "project_has_documents",
    message: "This project does not have any documents yet.",
    suggestedFix: "Create at least one document from the Template Library."
  },
  {
    ruleCode: "DOC-002",
    ruleName: "Documents are fully complete",
    ruleCategory: "C",
    severity: "INFO",
    checkKey: "documents_completion_summary",
    message: "{count} document(s) are not fully complete: {documentList}.",
    suggestedFix: "Complete the remaining required sections to improve readiness."
  },
  {
    ruleCode: "SEC-001",
    ruleName: "Required sections are completed",
    ruleCategory: "C",
    severity: "ERROR",
    checkKey: "required_sections_completed",
    message:
      "Required section '{sectionNumber} {sectionTitle}' in document '{documentTitle}' is empty.",
    suggestedFix: "Open the document editor and complete this required section."
  },
  {
    ruleCode: "REQ-001",
    ruleName: "Project has requirements",
    ruleCategory: "C",
    severity: "WARNING",
    checkKey: "project_has_requirements",
    message: "This project does not have any requirements yet.",
    suggestedFix: "Add functional or non-functional requirements in the Requirements Registry."
  },
  {
    ruleCode: "REQ-002",
    ruleName: "Functional requirements are covered by use cases",
    ruleCategory: "T",
    severity: "WARNING",
    checkKey: "frs_covered_by_use_cases",
    message: "Functional requirement {code} is not covered by any use case.",
    suggestedFix: "Create or link a use case that explains the user scenario behind this requirement."
  },
  {
    ruleCode: "REQ-003",
    ruleName: "Functional requirements are implemented by design elements",
    ruleCategory: "T",
    severity: "WARNING",
    checkKey: "frs_implemented_by_design",
    message: "Functional requirement {code} has no implementing design element.",
    suggestedFix:
      "Create a design element and link it to this requirement with an implemented_by link."
  },
  {
    ruleCode: "REQ-004",
    ruleName: "Functional requirements are verified by test cases",
    ruleCategory: "T",
    severity: "WARNING",
    checkKey: "frs_verified_by_tests",
    message: "Functional requirement {code} is not verified by any test case.",
    suggestedFix:
      "Create a test case and link it to this requirement with a verified_by link."
  },
  {
    ruleCode: "UC-001",
    ruleName: "Project has use cases",
    ruleCategory: "C",
    severity: "WARNING",
    checkKey: "project_has_use_cases",
    message: "This project does not have any use cases yet.",
    suggestedFix: "Add use cases to describe how users interact with the system."
  },
  {
    ruleCode: "UC-002",
    ruleName: "Use cases are linked to requirements",
    ruleCategory: "T",
    severity: "WARNING",
    checkKey: "use_cases_cover_requirements",
    message: "Use case {code} is not linked to any requirement.",
    suggestedFix: "Open the Traceability Matrix and link this use case to at least one requirement."
  },
  {
    ruleCode: "UC-003",
    ruleName: "Use cases are described by document sections",
    ruleCategory: "T",
    severity: "INFO",
    checkKey: "use_cases_described_by_sections",
    message: "Use case {code} is not linked to any document section.",
    suggestedFix: "Link this use case to a document section where the scenario is explained."
  },
  {
    ruleCode: "TRC-001",
    ruleName: "Requirements have traceability links",
    ruleCategory: "T",
    severity: "WARNING",
    checkKey: "requirements_have_links",
    message: "Requirement {code} has no traceability links.",
    suggestedFix: "Link this requirement to a document section in the Traceability Matrix.",
    severityOverrides: {
      ACADEMIC_PROJECT: "ERROR"
    }
  },
  {
    ruleCode: "TRC-002",
    ruleName: "Traceability links point to existing artefacts",
    ruleCategory: "CN",
    severity: "ERROR",
    checkKey: "links_have_valid_endpoints",
    message: "A traceability link points {description}.",
    suggestedFix: "Remove the broken traceability link and create a valid one."
  },
  {
    ruleCode: "TRC-003",
    ruleName: "Traceability links are up to date",
    ruleCategory: "CN",
    severity: "WARNING",
    checkKey: "links_are_fresh",
    message:
      "Link '{sourceLabel}' {linkType} '{targetLabel}' may be stale: an artefact changed after the link was last verified.",
    suggestedFix: "Review the link in the Traceability Matrix and click Re-verify if it is still correct."
  },
  {
    ruleCode: "QUA-001",
    ruleName: "Requirements avoid vague terms",
    ruleCategory: "Q",
    severity: "WARNING",
    checkKey: "requirements_avoid_vague_terms",
    message: "Requirement {code} uses the vague term '{term}'.",
    suggestedFix: "Replace '{term}' with a measurable, testable criterion (e.g. a number, limit, or standard)."
  },
  {
    ruleCode: "QUA-002",
    ruleName: "Requirements have acceptance criteria",
    ruleCategory: "Q",
    severity: "INFO",
    checkKey: "requirements_have_acceptance_criteria",
    message: "Requirement {code} has no acceptance criteria.",
    suggestedFix: "Add acceptance criteria describing how this requirement will be verified."
  },
  {
    ruleCode: "QUA-003",
    ruleName: "Functional requirements use shall statements",
    ruleCategory: "Q",
    severity: "INFO",
    checkKey: "frs_use_shall_statements",
    message: "Functional requirement {code} does not use a 'shall' statement.",
    suggestedFix: "Rephrase the description in the form 'The system shall ...'."
  }
];

const validationRules = PROFILE_CODES.flatMap((profileCode) =>
  baseRules.map(({ severityOverrides, ...rule }) => ({
    ...rule,
    profileCode,
    severity: (severityOverrides && severityOverrides[profileCode]) || rule.severity,
    isActive: true
  }))
);

module.exports = validationRules;
