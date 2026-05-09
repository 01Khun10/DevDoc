const section = (sectionNumber, title, isRequired, validationTag, displayOrder) => ({
  sectionNumber,
  title,
  description: `This section explains the ${title.toLowerCase()} for the academic project scope.`,
  guidanceText: `Write clear academic project details for the ${title.toLowerCase()}.`,
  exampleText: null,
  placeholderText: `Write the ${title} here.`,
  isRequired,
  validationTag,
  displayOrder,
  parentSectionId: null
});

module.exports = {
  name: "Academic Project Scope / Proposal Document",
  code: "ACAD_SCOPE",
  profileCode: "ACADEMIC_PROJECT",
  documentType: "SCOPE",
  description: "Defines project idea, background, problem, aim, objectives, proposed solution, scope, feasibility, risks, and deliverables.",
  recommendedFor: "Academic software projects, capstone projects, final-year projects, and supervised prototypes.",
  displayOrder: 1,
  sections: [
    section("1", "Project Title", true, "PROJECT_TITLE", 1),
    section("2", "Project Overview", true, "PROJECT_OVERVIEW", 2),
    section("3", "Background", true, "PROJECT_BACKGROUND", 3),
    section("4", "Problem Statement", true, "PROBLEM_STATEMENT", 4),
    section("5", "Aim of the Project", true, "PROJECT_AIM", 5),
    section("6", "Project Objectives", true, "PROJECT_OBJECTIVES", 6),
    section("7", "Proposed Solution", true, "PROPOSED_SOLUTION", 7),
    section("8", "Project Scope", true, "PROJECT_SCOPE", 8),
    section("8.1", "In-Scope Features", true, "IN_SCOPE_FEATURES", 9),
    section("8.2", "Out-of-Scope Features", true, "OUT_OF_SCOPE_FEATURES", 10),
    section("9", "Target Users", true, "TARGET_USERS", 11),
    section("10", "Stakeholders", true, "STAKEHOLDERS", 12),
    section("11", "Major Features", true, "MAJOR_FEATURES", 13),
    section("12", "Expected Outcomes", true, "EXPECTED_OUTCOMES", 14),
    section("13", "Feasibility", true, "FEASIBILITY", 15),
    section("14", "Assumptions", true, "ASSUMPTIONS", 16),
    section("15", "Constraints and Limitations", true, "CONSTRAINTS_LIMITATIONS", 17),
    section("16", "Risks", true, "RISKS", 18),
    section("17", "Success Criteria", true, "SUCCESS_CRITERIA", 19),
    section("18", "Project Deliverables", true, "PROJECT_DELIVERABLES", 20),
    section("19", "Review and Approval", false, "REVIEW_APPROVAL", 21)
  ]
};
