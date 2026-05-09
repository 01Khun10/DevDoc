const section = (sectionNumber, title, isRequired, validationTag, displayOrder) => ({
  sectionNumber,
  title,
  description: `This section explains the ${title.toLowerCase()} for the company project scope.`,
  guidanceText: `Write clear business-focused details for the ${title.toLowerCase()}.`,
  exampleText: null,
  placeholderText: `Write the ${title} here.`,
  isRequired,
  validationTag,
  displayOrder,
  parentSectionId: null
});

module.exports = {
  name: "Company Project Brief / Product Scope Document",
  code: "COMP_SCOPE",
  profileCode: "COMPANY_SOFTWARE",
  documentType: "SCOPE",
  description: "Defines business need, problem, product vision, goals, users, stakeholders, scope, deliverables, risks, metrics, and sign-off.",
  recommendedFor: "Company products, client projects, SaaS tools, startup products, and internal business systems.",
  displayOrder: 1,
  sections: [
    section("1", "Project Name", true, "PROJECT_NAME", 1),
    section("2", "Executive Summary", true, "EXECUTIVE_SUMMARY", 2),
    section("3", "Business Need", true, "BUSINESS_NEED", 3),
    section("4", "Problem Statement", true, "PROBLEM_STATEMENT", 4),
    section("5", "Product Vision", true, "PRODUCT_VISION", 5),
    section("6", "Product Goals", true, "PRODUCT_GOALS", 6),
    section("7", "Target Users", true, "TARGET_USERS", 7),
    section("8", "Stakeholders", true, "STAKEHOLDERS", 8),
    section("9", "Scope Overview", true, "SCOPE_OVERVIEW", 9),
    section("10", "In-Scope Features", true, "IN_SCOPE_FEATURES", 10),
    section("11", "Out-of-Scope Features", true, "OUT_OF_SCOPE_FEATURES", 11),
    section("12", "Key Features and Capabilities", true, "KEY_FEATURES_CAPABILITIES", 12),
    section("13", "Deliverables", true, "DELIVERABLES", 13),
    section("14", "Assumptions", true, "ASSUMPTIONS", 14),
    section("15", "Constraints", true, "CONSTRAINTS", 15),
    section("16", "Risks and Mitigation", true, "RISKS_MITIGATION", 16),
    section("17", "Success Metrics", true, "SUCCESS_METRICS", 17),
    section("18", "Milestones", false, "MILESTONES", 18),
    section("19", "Approval and Sign-Off", false, "APPROVAL_SIGNOFF", 19)
  ]
};
