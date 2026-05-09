const section = (sectionNumber, title, isRequired, validationTag, displayOrder) => ({
  sectionNumber,
  title,
  description: `This section explains the ${title.toLowerCase()} for the test plan.`,
  guidanceText: `Write clear testing details for the ${title.toLowerCase()}.`,
  exampleText: null,
  placeholderText: `Write the ${title} here.`,
  isRequired,
  validationTag,
  displayOrder,
  parentSectionId: null
});

module.exports = {
  name: "Standard Software Test Plan",
  code: "STD_STP",
  profileCode: "STANDARD_SOFTWARE",
  documentType: "STP",
  description: "Defines test scope, test items, features, approach, environment, test data, test cases, risks, and traceability.",
  recommendedFor: "General software projects that need a structured QA and testing plan.",
  displayOrder: 4,
  sections: [
    section("1", "Introduction", true, "STP_INTRODUCTION", 1),
    section("1.1", "Purpose", true, "STP_PURPOSE", 2),
    section("1.2", "Scope of Testing", true, "TESTING_SCOPE", 3),
    section("1.3", "References", false, "STP_REFERENCES", 4),
    section("2", "Test Items", true, "TEST_ITEMS", 5),
    section("3", "Features to Be Tested", true, "FEATURES_TO_BE_TESTED", 6),
    section("4", "Features Not to Be Tested", true, "FEATURES_NOT_TO_BE_TESTED", 7),
    section("5", "Test Approach", true, "TEST_APPROACH", 8),
    section("6", "Test Environment", true, "TEST_ENVIRONMENT", 9),
    section("7", "Test Data", true, "TEST_DATA", 10),
    section("8", "Test Cases", true, "TEST_CASES", 11),
    section("8.1", "Unit Test Cases", true, "UNIT_TEST_CASES", 12),
    section("8.2", "Functional Test Cases", true, "FUNCTIONAL_TEST_CASES", 13),
    section("8.3", "Business Rules Test Cases", true, "BUSINESS_RULES_TEST_CASES", 14),
    section("8.4", "Integration Test Cases", true, "INTEGRATION_TEST_CASES", 15),
    section("9", "Pass / Fail Criteria", true, "PASS_FAIL_CRITERIA", 16),
    section("10", "Suspension and Resumption Criteria", false, "SUSPENSION_RESUMPTION_CRITERIA", 17),
    section("11", "Test Deliverables", true, "TEST_DELIVERABLES", 18),
    section("12", "Testing Schedule", false, "TESTING_SCHEDULE", 19),
    section("13", "Risks and Contingencies", true, "TEST_RISKS_CONTINGENCIES", 20),
    section("14", "Roles and Responsibilities", false, "TEST_ROLES_RESPONSIBILITIES", 21),
    section("15", "Requirements Traceability for Testing", true, "TESTING_TRACEABILITY_MATRIX", 22),
    section("16", "Test Summary", false, "TEST_SUMMARY", 23)
  ]
};
