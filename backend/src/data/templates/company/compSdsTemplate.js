const section = (sectionNumber, title, isRequired, validationTag, displayOrder) => ({
  sectionNumber,
  title,
  description: `This section describes the ${title.toLowerCase()} for the company technical design.`,
  guidanceText: `Write clear technical delivery details for the ${title.toLowerCase()}.`,
  exampleText: null,
  placeholderText: `Write the ${title} here.`,
  isRequired,
  validationTag,
  displayOrder,
  parentSectionId: null
});

module.exports = {
  name: "Company Technical Design Document",
  code: "COMP_SDS",
  profileCode: "COMPANY_SOFTWARE",
  documentType: "SDS",
  description: "Defines system context, design goals, architecture, modules, APIs, database design, traceability design, validation design, security, deployment, and testing considerations.",
  recommendedFor: "Company products and client projects that need practical technical design documentation.",
  displayOrder: 3,
  sections: [
    section("1", "Document Overview", true, "DOCUMENT_OVERVIEW", 1),
    section("2", "System Context", true, "SYSTEM_CONTEXT", 2),
    section("3", "Design Goals", true, "DESIGN_GOALS", 3),
    section("4", "Architecture Overview", true, "ARCHITECTURE_OVERVIEW", 4),
    section("5", "Technology Stack", true, "TECHNOLOGY_STACK", 5),
    section("6", "System Modules", true, "SYSTEM_MODULES", 6),
    section("7", "Component Design", true, "COMPONENT_DESIGN", 7),
    section("8", "Frontend Design", true, "FRONTEND_DESIGN", 8),
    section("9", "Backend Design", true, "BACKEND_DESIGN", 9),
    section("10", "API Design", true, "API_DESIGN", 10),
    section("11", "Database Design", true, "DATABASE_DESIGN", 11),
    section("11.1", "Main Database Entities", true, "MAIN_DATABASE_ENTITIES", 12),
    section("11.2", "Data Dictionary", true, "DATA_DICTIONARY", 13),
    section("12", "Traceability Design", true, "TRACEABILITY_DESIGN", 14),
    section("13", "Validation Engine Design", true, "VALIDATION_ENGINE_DESIGN", 15),
    section("14", "Security Design", true, "SECURITY_DESIGN", 16),
    section("15", "Error Handling and Logging", true, "ERROR_HANDLING_LOGGING", 17),
    section("16", "User Interface Design", true, "USER_INTERFACE_DESIGN", 18),
    section("17", "Deployment Design", true, "DEPLOYMENT_DESIGN", 19),
    section("18", "Key Algorithms and Logic", true, "KEY_ALGORITHMS_LOGIC", 20),
    section("19", "Testing Considerations", true, "TESTING_CONSIDERATIONS", 21),
    section("20", "Future Technical Enhancements", false, "FUTURE_TECHNICAL_ENHANCEMENTS", 22)
  ]
};
