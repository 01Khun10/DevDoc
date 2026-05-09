const section = (sectionNumber, title, isRequired, validationTag, displayOrder) => ({
  sectionNumber,
  title,
  description: `This section explains the ${title.toLowerCase()} for the project scope.`,
  guidanceText: `Write clear and concise details for the ${title.toLowerCase()}.`,
  exampleText: null,
  placeholderText: `Write the ${title} here.`,
  isRequired,
  validationTag,
  displayOrder,
  parentSectionId: null
});

module.exports = {
  name: "Standard Project Scope Document",
  code: "STD_SCOPE",
  profileCode: "STANDARD_SOFTWARE",
  documentType: "SCOPE",
  description: "Defines project idea, goals, scope, users, deliverables, risks, and success criteria.",
  recommendedFor: "General software projects, web apps, SaaS systems, internal tools, and professional documentation.",
  displayOrder: 1,
  sections: [
    section("1", "Project Overview", true, "PROJECT_OVERVIEW", 1),
    section("2", "Problem Statement", true, "PROBLEM_STATEMENT", 2),
    section("3", "Project Goals", true, "PROJECT_GOALS", 3),
    section("4", "Business Objectives", true, "BUSINESS_OBJECTIVES", 4),
    section("5", "Project Scope", true, "PROJECT_SCOPE", 5),
    section("5.1", "In-Scope Features", true, "IN_SCOPE_FEATURES", 6),
    section("5.2", "Out-of-Scope Features", true, "OUT_OF_SCOPE_FEATURES", 7),
    section("6", "Stakeholders", true, "STAKEHOLDERS", 8),
    section("7", "Target Users", true, "TARGET_USERS", 9),
    section("8", "Major Features", true, "MAJOR_FEATURES", 10),
    section("9", "Key Deliverables", true, "DELIVERABLES", 11),
    section("10", "Assumptions", true, "ASSUMPTIONS", 12),
    section("11", "Constraints", true, "CONSTRAINTS", 13),
    section("12", "Risks", true, "RISKS", 14),
    section("13", "Success Criteria", true, "SUCCESS_CRITERIA", 15),
    section("14", "Initial Timeline", false, "INITIAL_TIMELINE", 16),
    section("15", "Approval / Review", false, "APPROVAL_REVIEW", 17)
  ]
};
