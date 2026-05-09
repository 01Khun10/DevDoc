const section = (sectionNumber, title, isRequired, validationTag, displayOrder) => ({
  sectionNumber,
  title,
  description: `This section explains the ${title.toLowerCase()} for the company QA plan.`,
  guidanceText: `Write clear QA and delivery details for the ${title.toLowerCase()}.`,
  exampleText: null,
  placeholderText: `Write the ${title} here.`,
  isRequired,
  validationTag,
  displayOrder,
  parentSectionId: null
});

module.exports = {
  name: "Company QA / Test Plan",
  code: "COMP_STP",
  profileCode: "COMPANY_SOFTWARE",
  documentType: "STP",
  description: "Defines testing objectives, scope, items, approach, environment, data, test cases, criteria, defects, deliverables, traceability, risks, roles, and sign-off.",
  recommendedFor: "Company products and client projects that need a practical QA and test plan.",
  displayOrder: 4,
  sections: [
    section("1", "Document Overview", true, "DOCUMENT_OVERVIEW", 1),
    section("2", "Testing Objectives", true, "TESTING_OBJECTIVES", 2),
    section("3", "Scope of Testing", true, "TESTING_SCOPE", 3),
    section("4", "Test Items", true, "TEST_ITEMS", 4),
    section("5", "Features to Be Tested", true, "FEATURES_TO_BE_TESTED", 5),
    section("6", "Features Not to Be Tested", true, "FEATURES_NOT_TO_BE_TESTED", 6),
    section("7", "Testing Approach", true, "TESTING_APPROACH", 7),
    section("8", "Test Environment", true, "TEST_ENVIRONMENT", 8),
    section("9", "Test Data", true, "TEST_DATA", 9),
    section("10", "Test Case Format", true, "TEST_CASE_FORMAT", 10),
    section("11", "Functional Test Cases", true, "FUNCTIONAL_TEST_CASES", 11),
    section("12", "API Test Cases", true, "API_TEST_CASES", 12),
    section("13", "Database Test Cases", true, "DATABASE_TEST_CASES", 13),
    section("14", "Business Rules Test Cases", true, "BUSINESS_RULES_TEST_CASES", 14),
    section("15", "Integration Test Cases", true, "INTEGRATION_TEST_CASES", 15),
    section("16", "Usability Test Cases", false, "USABILITY_TEST_CASES", 16),
    section("17", "Regression Testing", false, "REGRESSION_TESTING", 17),
    section("18", "Pass / Fail Criteria", true, "PASS_FAIL_CRITERIA", 18),
    section("19", "Defect / Issue Logging", true, "DEFECT_ISSUE_LOGGING", 19),
    section("20", "Test Deliverables", true, "TEST_DELIVERABLES", 20),
    section("21", "Requirements-to-Test Traceability Matrix", true, "REQUIREMENTS_TEST_TRACEABILITY", 21),
    section("22", "Test Execution Summary", false, "TEST_EXECUTION_SUMMARY", 22),
    section("23", "Testing Risks and Contingencies", true, "TESTING_RISKS_CONTINGENCIES", 23),
    section("24", "Roles and Responsibilities", false, "TEST_ROLES_RESPONSIBILITIES", 24),
    section("25", "Final QA Sign-Off", false, "FINAL_QA_SIGNOFF", 25)
  ]
};
