# DevDoc Template Package v1

## Package Name

DevDoc Documentation Profiles and Template Package v1

## Package Purpose

This package defines the official template system for DevDoc.

It contains the approved documentation profiles, document types, template names, template codes, section structure, validation tags, frontend display rules, backend seed-data direction, ERD placement rules, validation rule naming convention, seed object shapes, and agent rules.

This file is the source of truth for DevDoc templates.

Agents must not rename profiles, templates, document types, or template codes without approval.

---

# 1. Final Profile List

## Profile 1: Standard Software Documentation Profile

**Profile Code:** `STANDARD_SOFTWARE`

**Purpose:** General-purpose software documentation for web apps, mobile apps, internal systems, SaaS systems, and professional software projects.

**Tone:** Formal, complete, neutral, and industry-friendly.

**Best For:** General software projects that need Scope, SRS, SDS, and STP documents.

---

## Profile 2: Academic Project Profile

**Profile Code:** `ACADEMIC_PROJECT`

**Purpose:** Structured documentation for university, final-year, capstone, semester, and supervised academic software projects.

**Tone:** Academic but still practical, clean, and easy to understand.

**Best For:** Student projects, FYPs, capstone projects, research-based software prototypes, and project evaluations.

**Important Rule:** This profile must not be tied to any one university. It should remain general and reusable.

---

## Profile 3: Company Software Documentation Profile

**Profile Code:** `COMPANY_SOFTWARE`

**Purpose:** Practical documentation for companies, software houses, startups, agencies, internal teams, product teams, and client-based projects.

**Tone:** Professional, business-friendly, practical, and delivery-focused.

**Best For:** Client projects, company products, SaaS tools, internal business systems, and startup products.

---

# 2. Final Document Types

DevDoc Template Package v1 uses four document types.

| Document Type | Code | Meaning |
|---|---|---|
| Scope / Proposal / Project Brief | `SCOPE` | Defines project idea, need, goals, users, boundaries, deliverables, risks, and success criteria. |
| Requirements Specification | `SRS` | Defines what the system must do, user needs, functional requirements, non-functional requirements, use cases, acceptance criteria, and traceability. |
| Design / Technical Design | `SDS` | Defines how the system will be designed and built, including architecture, modules, database, ERD, APIs, UI design, algorithms, deployment, and testing considerations. |
| Test Plan / QA Plan | `STP` | Defines how the system will be tested, including test scope, test items, test data, test cases, pass/fail criteria, defects, and test traceability. |

---

# 3. Final Template List

## Profile 1: Standard Software Documentation Profile

| Order | Template Name | Template Code | Document Type |
|---:|---|---|---|
| 1 | Standard Project Scope Document | `STD_SCOPE` | `SCOPE` |
| 2 | Standard Software Requirements Specification | `STD_SRS` | `SRS` |
| 3 | Standard Software Design Description | `STD_SDS` | `SDS` |
| 4 | Standard Software Test Plan | `STD_STP` | `STP` |

## Profile 2: Academic Project Profile

| Order | Template Name | Template Code | Document Type |
|---:|---|---|---|
| 1 | Academic Project Scope / Proposal Document | `ACAD_SCOPE` | `SCOPE` |
| 2 | Academic Software Requirements Specification | `ACAD_SRS` | `SRS` |
| 3 | Academic Software Design Description | `ACAD_SDS` | `SDS` |
| 4 | Academic Software Test Plan | `ACAD_STP` | `STP` |

## Profile 3: Company Software Documentation Profile

| Order | Template Name | Template Code | Document Type |
|---:|---|---|---|
| 1 | Company Project Brief / Product Scope Document | `COMP_SCOPE` | `SCOPE` |
| 2 | Company Requirements Specification | `COMP_SRS` | `SRS` |
| 3 | Company Technical Design Document | `COMP_SDS` | `SDS` |
| 4 | Company QA / Test Plan | `COMP_STP` | `STP` |

---

# 4. Frontend Display Rules

The frontend should not show backend technical fields to normal users.

Do not show these directly in the UI:

```text
validationTag
ruleCode
templateCode
profileCode
database IDs
```

These fields are for the backend, seed data, and Doc-Linter logic.

## What the User Should See in the Editor

Each document section should show:

```text
Section title
Required / Optional badge
Short description
Guidance
Example, if available
Editor area
Validation issues, if any
Linked artefacts, if relevant
```

## Recommended Structured Editor Layout

```text
Left Panel:
Document section list and completion status

Center Panel:
Section editor

Right Panel:
Guidance, example, validation issues, and linked artefacts
```

## Frontend Label Mapping

| Internal Meaning | Frontend Label |
|---|---|
| What this section means | Description |
| What the user should write | Guidance |
| Example | Example |
| Required: Yes | Required badge |
| Required: Optional | Optional badge |
| Validation tag | Hidden backend field |
| Validation rule ID | Hidden backend field or issue reference |

---

# 5. Backend Seed Folder Structure

When the backend is created, template seed data should use this structure:

```text
backend/src/data/templates/
  profiles.js
  validationRules.js
  index.js

  standard/
    stdScopeTemplate.js
    stdSrsTemplate.js
    stdSdsTemplate.js
    stdStpTemplate.js

  academic/
    acadScopeTemplate.js
    acadSrsTemplate.js
    acadSdsTemplate.js
    acadStpTemplate.js

  company/
    compScopeTemplate.js
    compSrsTemplate.js
    compSdsTemplate.js
    compStpTemplate.js
```

Prisma seed file:

```text
backend/prisma/seed.js
```

The app should use cleaned seed data.

The app should not read DOCX or PDF template files at runtime.

---

# 6. Database Direction for Template Package

The database should support the template package using these models or equivalent table names:

```text
ValidationProfile
Template
TemplateSection
ValidationRule
```

## ValidationProfile Fields

```text
id
name
code
description
audience
tone
isActive
createdAt
updatedAt
```

## Template Fields

```text
id
profileId
name
code
documentType
description
recommendedFor
displayOrder
isActive
createdAt
updatedAt
```

## TemplateSection Fields

```text
id
templateId
sectionNumber
title
description
guidanceText
exampleText
placeholderText
isRequired
validationTag
displayOrder
parentSectionId
createdAt
updatedAt
```

## ValidationRule Fields

```text
id
profileId
templateId
ruleCode
ruleName
ruleCategory
severity
checkKey
message
suggestedFix
isActive
createdAt
updatedAt
```

---

# 7. ERD Placement Rule

ERD diagrams belong mainly in the design documents.

| Document Type | ERD Included? | Explanation |
|---|---|---|
| Scope | No | Scope only explains project idea, goals, boundaries, and deliverables. |
| SRS | No full ERD | SRS should include Data Requirements, not the full technical ERD. |
| SDS / Technical Design | Yes | ERD belongs in Data Design or Database Design section. |
| STP / QA Plan | No | STP can test database behavior, but it does not need the full ERD. |

For DevDoc, ERD is required in:

```text
STD_SDS
ACAD_SDS
COMP_SDS
```

Recommended ERD section names:

```text
Standard SDS: 5. Data Design
Academic SDS: 5. Data Design
Company TDD: 11. Database Design
```

---

# 8. Validation Rule Naming Convention

Use these prefixes for validation rules:

| Profile | Template | Prefix |
|---|---|---|
| Standard Scope | `STD_SCOPE` | `STD-SCOPE` |
| Standard SRS | `STD_SRS` | `STD-SRS` |
| Standard SDS | `STD_SDS` | `STD-SDS` |
| Standard STP | `STD_STP` | `STD-STP` |
| Academic Scope | `ACAD_SCOPE` | `ACAD-SCOPE` |
| Academic SRS | `ACAD_SRS` | `ACAD-SRS` |
| Academic SDS | `ACAD_SDS` | `ACAD-SDS` |
| Academic STP | `ACAD_STP` | `ACAD-STP` |
| Company Scope | `COMP_SCOPE` | `COMP-SCOPE` |
| Company SRS | `COMP_SRS` | `COMP-SRS` |
| Company SDS | `COMP_SDS` | `COMP-SDS` |
| Company STP | `COMP_STP` | `COMP-STP` |

Rule code examples:

```text
STD-SRS-C-001
ACAD-SDS-D-001
COMP-STP-T-001
```

## Rule Category Codes

| Category | Code | Meaning |
|---|---|---|
| Completeness | `C` | Required section or required content exists. |
| Quality | `Q` | Requirement, test case, or document quality. |
| Consistency | `CN` | Content does not conflict across documents. |
| Traceability | `T` | Artefacts are properly linked. |
| Design | `D` | Required design models, ERD, architecture, or diagrams exist. |
| Security | `SEC` | Security-related expectations are met. |

---

# 9. Section Registry: Profile 1

This section defines all templates inside the Standard Software Documentation Profile.

Profile code: `STANDARD_SOFTWARE`

Templates: `STD_SCOPE`, `STD_SRS`, `STD_SDS`, `STD_STP`

---

# 9.1 Standard Project Scope Document

**Template Code:** `STD_SCOPE`

**Document Type:** `SCOPE`

## Purpose

This template defines the starting scope of a general software project. It explains what the project is, why it is needed, who will use it, what will be included, what will not be included, and how success will be measured.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Project Overview | Yes | `PROJECT_OVERVIEW` |
| 2 | Problem Statement | Yes | `PROBLEM_STATEMENT` |
| 3 | Project Goals | Yes | `PROJECT_GOALS` |
| 4 | Business Objectives | Yes | `BUSINESS_OBJECTIVES` |
| 5 | Project Scope | Yes | `PROJECT_SCOPE` |
| 5.1 | In-Scope Features | Yes | `IN_SCOPE_FEATURES` |
| 5.2 | Out-of-Scope Features | Yes | `OUT_OF_SCOPE_FEATURES` |
| 6 | Stakeholders | Yes | `STAKEHOLDERS` |
| 7 | Target Users | Yes | `TARGET_USERS` |
| 8 | Major Features | Yes | `MAJOR_FEATURES` |
| 9 | Key Deliverables | Yes | `DELIVERABLES` |
| 10 | Assumptions | Yes | `ASSUMPTIONS` |
| 11 | Constraints | Yes | `CONSTRAINTS` |
| 12 | Risks | Yes | `RISKS` |
| 13 | Success Criteria | Yes | `SUCCESS_CRITERIA` |
| 14 | Initial Timeline | Optional | `INITIAL_TIMELINE` |
| 15 | Approval / Review | Optional | `APPROVAL_REVIEW` |

## Important Notes

The Scope document should not contain a full ERD or detailed technical design.

It should only explain the project direction, business objectives, users, features, assumptions, risks, and success criteria.

Detailed requirements belong in the SRS.  
Detailed design belongs in the SDS.  
Detailed testing belongs in the STP.

---

# 9.2 Standard Software Requirements Specification

**Template Code:** `STD_SRS`

**Document Type:** `SRS`

## Purpose

This template defines what the software system must do. It contains user needs, product functions, functional requirements, non-functional requirements, use cases, data requirements, acceptance criteria, and traceability.

The SRS should focus on expected system behavior, not code or database design.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Introduction | Yes | `SRS_INTRODUCTION` |
| 1.1 | Purpose | Yes | `SRS_PURPOSE` |
| 1.2 | Scope | Yes | `SRS_SCOPE` |
| 1.3 | Definitions, Acronyms, and Abbreviations | Optional | `DEFINITIONS_ACRONYMS` |
| 1.4 | References | Optional | `REFERENCES` |
| 1.5 | Document Overview | Optional | `DOCUMENT_OVERVIEW` |
| 2 | Overall Description | Yes | `OVERALL_DESCRIPTION` |
| 2.1 | Product Perspective | Yes | `PRODUCT_PERSPECTIVE` |
| 2.2 | Product Functions | Yes | `PRODUCT_FUNCTIONS` |
| 2.3 | User Classes and Characteristics | Yes | `USER_CLASSES` |
| 2.4 | Operating Environment | Yes | `OPERATING_ENVIRONMENT` |
| 2.5 | Design and Implementation Constraints | Yes | `DESIGN_CONSTRAINTS` |
| 2.6 | Assumptions and Dependencies | Yes | `ASSUMPTIONS_DEPENDENCIES` |
| 3 | External Interface Requirements | Yes | `EXTERNAL_INTERFACE_REQUIREMENTS` |
| 3.1 | User Interfaces | Yes | `USER_INTERFACES` |
| 3.2 | Hardware Interfaces | Optional | `HARDWARE_INTERFACES` |
| 3.3 | Software Interfaces | Yes | `SOFTWARE_INTERFACES` |
| 3.4 | Communication Interfaces | Yes | `COMMUNICATION_INTERFACES` |
| 4 | System Features and Functional Requirements | Yes | `FUNCTIONAL_REQUIREMENTS` |
| 4.1 | Authentication Requirements | Optional | `AUTH_REQUIREMENTS` |
| 4.2 | Project Management Requirements | Optional | `PROJECT_REQUIREMENTS` |
| 4.3 | Document and Template Requirements | Optional | `DOCUMENT_TEMPLATE_REQUIREMENTS` |
| 4.4 | Requirement Management Requirements | Optional | `REQUIREMENT_MANAGEMENT_REQUIREMENTS` |
| 4.5 | Traceability and Validation Requirements | Optional | `TRACEABILITY_VALIDATION_REQUIREMENTS` |
| 5 | Non-Functional Requirements | Yes | `NON_FUNCTIONAL_REQUIREMENTS` |
| 5.1 | Performance Requirements | Yes | `PERFORMANCE_REQUIREMENTS` |
| 5.2 | Security Requirements | Yes | `SECURITY_REQUIREMENTS` |
| 5.3 | Usability Requirements | Yes | `USABILITY_REQUIREMENTS` |
| 5.4 | Reliability Requirements | Optional | `RELIABILITY_REQUIREMENTS` |
| 5.5 | Maintainability Requirements | Optional | `MAINTAINABILITY_REQUIREMENTS` |
| 6 | Use Cases | Yes | `USE_CASES` |
| 7 | Data Requirements | Yes | `DATA_REQUIREMENTS` |
| 8 | Validation and Traceability Requirements | Yes | `VALIDATION_TRACEABILITY_REQUIREMENTS` |
| 9 | Acceptance Criteria | Yes | `ACCEPTANCE_CRITERIA` |
| 10 | Requirements Traceability Matrix | Yes | `REQUIREMENTS_TRACEABILITY_MATRIX` |

## Important Notes

The SRS should include Data Requirements, but it should not include the full ERD.

Functional requirements should be clear, numbered, and testable.

Recommended requirement format:

```text
FR-X.X: The system shall [perform action] for [purpose].
```

---

# 9.3 Standard Software Design Description

**Template Code:** `STD_SDS`

**Document Type:** `SDS`

## Purpose

This template explains how the software system will be designed and built. It contains architecture, system modules, diagrams, data design, ERD, UI design, algorithms, APIs, deployment, and testing considerations.

The SDS is where the system becomes technical.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Introduction | Yes | `SDS_INTRODUCTION` |
| 1.1 | Purpose | Yes | `SDS_PURPOSE` |
| 1.2 | Scope of Design | Yes | `SDS_SCOPE` |
| 1.3 | References | Optional | `SDS_REFERENCES` |
| 2 | Design Methodology and Process Model | Yes | `DESIGN_METHODOLOGY_PROCESS` |
| 3 | System Overview | Yes | `SYSTEM_OVERVIEW` |
| 3.1 | Architectural Design | Yes | `ARCHITECTURAL_DESIGN` |
| 3.2 | Technology Stack | Yes | `TECHNOLOGY_STACK` |
| 4 | Design Models | Yes | `DESIGN_MODELS` |
| 4.1 | Use Case Diagrams | Yes | `USE_CASE_DIAGRAMS` |
| 4.2 | Class Diagram | Yes | `CLASS_DIAGRAM` |
| 4.3 | Activity Diagrams | Yes | `ACTIVITY_DIAGRAMS` |
| 4.4 | Sequence Diagrams | Yes | `SEQUENCE_DIAGRAMS` |
| 4.5 | State Transition Diagrams | Yes | `STATE_DIAGRAMS` |
| 5 | Data Design | Yes | `DATA_DESIGN` |
| 5.1 | Data Dictionary | Yes | `DATA_DICTIONARY` |
| 6 | Human Interface Design | Yes | `HUMAN_INTERFACE_DESIGN` |
| 6.1 | Screen Images | Yes | `SCREEN_IMAGES` |
| 6.2 | Screen Objects and Actions | Yes | `SCREEN_OBJECTS_ACTIONS` |
| 7 | Implementation | Yes | `IMPLEMENTATION` |
| 7.1 | Algorithms | Yes | `ALGORITHMS` |
| 7.2 | External APIs / SDKs | Yes | `EXTERNAL_APIS_SDKS` |
| 7.3 | User Interface Implementation | Yes | `UI_IMPLEMENTATION` |
| 7.4 | Deployment | Yes | `DEPLOYMENT` |
| 8 | Testing and Evaluation | Yes | `TESTING_EVALUATION` |
| 8.1 | Unit Testing | Yes | `UNIT_TESTING` |
| 8.2 | Functional Testing | Yes | `FUNCTIONAL_TESTING` |
| 8.3 | Business Rules Testing | Yes | `BUSINESS_RULES_TESTING` |
| 8.4 | Integration Testing | Yes | `INTEGRATION_TESTING` |
| 8.5 | Requirements Traceability for Testing | Yes | `TESTING_TRACEABILITY` |

## Important Notes

The ERD belongs in this template under `5. Data Design`.

The SDS should include or reference architecture, use case, class, activity, sequence, state, ERD/database, and deployment diagrams.

---

# 9.4 Standard Software Test Plan

**Template Code:** `STD_STP`

**Document Type:** `STP`

## Purpose

This template explains how the system will be tested. It defines the test scope, test items, features to be tested, features not to be tested, test approach, test environment, test data, test cases, pass/fail criteria, risks, and traceability between requirements and tests.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Introduction | Yes | `STP_INTRODUCTION` |
| 1.1 | Purpose | Yes | `STP_PURPOSE` |
| 1.2 | Scope of Testing | Yes | `TESTING_SCOPE` |
| 1.3 | References | Optional | `STP_REFERENCES` |
| 2 | Test Items | Yes | `TEST_ITEMS` |
| 3 | Features to Be Tested | Yes | `FEATURES_TO_BE_TESTED` |
| 4 | Features Not to Be Tested | Yes | `FEATURES_NOT_TO_BE_TESTED` |
| 5 | Test Approach | Yes | `TEST_APPROACH` |
| 6 | Test Environment | Yes | `TEST_ENVIRONMENT` |
| 7 | Test Data | Yes | `TEST_DATA` |
| 8 | Test Cases | Yes | `TEST_CASES` |
| 8.1 | Unit Test Cases | Yes | `UNIT_TEST_CASES` |
| 8.2 | Functional Test Cases | Yes | `FUNCTIONAL_TEST_CASES` |
| 8.3 | Business Rules Test Cases | Yes | `BUSINESS_RULES_TEST_CASES` |
| 8.4 | Integration Test Cases | Yes | `INTEGRATION_TEST_CASES` |
| 9 | Pass / Fail Criteria | Yes | `PASS_FAIL_CRITERIA` |
| 10 | Suspension and Resumption Criteria | Optional | `SUSPENSION_RESUMPTION_CRITERIA` |
| 11 | Test Deliverables | Yes | `TEST_DELIVERABLES` |
| 12 | Testing Schedule | Optional | `TESTING_SCHEDULE` |
| 13 | Risks and Contingencies | Yes | `TEST_RISKS_CONTINGENCIES` |
| 14 | Roles and Responsibilities | Optional | `TEST_ROLES_RESPONSIBILITIES` |
| 15 | Requirements Traceability for Testing | Yes | `TESTING_TRACEABILITY_MATRIX` |
| 16 | Test Summary | Optional | `TEST_SUMMARY` |

## Important Notes

The STP does not need an ERD.

It may include database testing, but the full ERD should stay in the SDS.

---

# 10. Section Registry: Profile 2

This section defines all templates inside the Academic Project Profile.

Profile code: `ACADEMIC_PROJECT`

Templates: `ACAD_SCOPE`, `ACAD_SRS`, `ACAD_SDS`, `ACAD_STP`

---

# 10.1 Academic Project Scope / Proposal Document

**Template Code:** `ACAD_SCOPE`

**Document Type:** `SCOPE`

## Purpose

This template defines the project proposal or scope for an academic software project. It explains the project idea, background, problem, aim, objectives, proposed solution, scope, feasibility, risks, expected outcomes, and deliverables.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Project Title | Yes | `PROJECT_TITLE` |
| 2 | Project Overview | Yes | `PROJECT_OVERVIEW` |
| 3 | Background | Yes | `PROJECT_BACKGROUND` |
| 4 | Problem Statement | Yes | `PROBLEM_STATEMENT` |
| 5 | Aim of the Project | Yes | `PROJECT_AIM` |
| 6 | Project Objectives | Yes | `PROJECT_OBJECTIVES` |
| 7 | Proposed Solution | Yes | `PROPOSED_SOLUTION` |
| 8 | Project Scope | Yes | `PROJECT_SCOPE` |
| 8.1 | In-Scope Features | Yes | `IN_SCOPE_FEATURES` |
| 8.2 | Out-of-Scope Features | Yes | `OUT_OF_SCOPE_FEATURES` |
| 9 | Target Users | Yes | `TARGET_USERS` |
| 10 | Stakeholders | Yes | `STAKEHOLDERS` |
| 11 | Major Features | Yes | `MAJOR_FEATURES` |
| 12 | Expected Outcomes | Yes | `EXPECTED_OUTCOMES` |
| 13 | Feasibility | Yes | `FEASIBILITY` |
| 14 | Assumptions | Yes | `ASSUMPTIONS` |
| 15 | Constraints and Limitations | Yes | `CONSTRAINTS_LIMITATIONS` |
| 16 | Risks | Yes | `RISKS` |
| 17 | Success Criteria | Yes | `SUCCESS_CRITERIA` |
| 18 | Project Deliverables | Yes | `PROJECT_DELIVERABLES` |
| 19 | Review and Approval | Optional | `REVIEW_APPROVAL` |

## Important Notes

This template should remain academic but not university-specific.

---

# 10.2 Academic Software Requirements Specification

**Template Code:** `ACAD_SRS`

**Document Type:** `SRS`

## Purpose

This template defines the requirements of an academic software project. It includes the system scope, users, product functions, interfaces, functional requirements, non-functional requirements, use cases, data requirements, assumptions, constraints, acceptance criteria, and traceability.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Introduction | Yes | `SRS_INTRODUCTION` |
| 1.1 | Purpose | Yes | `SRS_PURPOSE` |
| 1.2 | Scope of the System | Yes | `SRS_SCOPE` |
| 1.3 | Definitions, Acronyms, and Abbreviations | Optional | `DEFINITIONS_ACRONYMS` |
| 1.4 | References | Optional | `SRS_REFERENCES` |
| 1.5 | Document Overview | Optional | `DOCUMENT_OVERVIEW` |
| 2 | Overall Description | Yes | `OVERALL_DESCRIPTION` |
| 2.1 | Product Perspective | Yes | `PRODUCT_PERSPECTIVE` |
| 2.2 | Product Functions | Yes | `PRODUCT_FUNCTIONS` |
| 2.3 | User Classes and Characteristics | Yes | `USER_CLASSES` |
| 2.4 | Operating Environment | Yes | `OPERATING_ENVIRONMENT` |
| 2.5 | Design and Implementation Constraints | Yes | `DESIGN_IMPLEMENTATION_CONSTRAINTS` |
| 2.6 | Assumptions and Dependencies | Yes | `ASSUMPTIONS_DEPENDENCIES` |
| 3 | External Interface Requirements | Yes | `EXTERNAL_INTERFACE_REQUIREMENTS` |
| 3.1 | User Interfaces | Yes | `USER_INTERFACES` |
| 3.2 | Hardware Interfaces | Optional | `HARDWARE_INTERFACES` |
| 3.3 | Software Interfaces | Yes | `SOFTWARE_INTERFACES` |
| 3.4 | Communication Interfaces | Yes | `COMMUNICATION_INTERFACES` |
| 4 | Functional Requirements | Yes | `FUNCTIONAL_REQUIREMENTS` |
| 4.1 | Authentication Requirements | Optional | `AUTHENTICATION_REQUIREMENTS` |
| 4.2 | Project Workspace Requirements | Optional | `PROJECT_WORKSPACE_REQUIREMENTS` |
| 4.3 | Template and Document Requirements | Optional | `TEMPLATE_DOCUMENT_REQUIREMENTS` |
| 4.4 | Requirement Management Requirements | Optional | `REQUIREMENT_MANAGEMENT_REQUIREMENTS` |
| 4.5 | Traceability and Validation Requirements | Optional | `TRACEABILITY_VALIDATION_REQUIREMENTS` |
| 5 | Non-Functional Requirements | Yes | `NON_FUNCTIONAL_REQUIREMENTS` |
| 5.1 | Performance Requirements | Yes | `PERFORMANCE_REQUIREMENTS` |
| 5.2 | Security Requirements | Yes | `SECURITY_REQUIREMENTS` |
| 5.3 | Usability Requirements | Yes | `USABILITY_REQUIREMENTS` |
| 5.4 | Reliability Requirements | Optional | `RELIABILITY_REQUIREMENTS` |
| 5.5 | Maintainability Requirements | Optional | `MAINTAINABILITY_REQUIREMENTS` |
| 6 | Use Cases | Yes | `USE_CASES` |
| 7 | Data Requirements | Yes | `DATA_REQUIREMENTS` |
| 8 | Assumptions and Constraints | Yes | `SRS_ASSUMPTIONS_CONSTRAINTS` |
| 9 | Acceptance Criteria | Yes | `ACCEPTANCE_CRITERIA` |
| 10 | Requirements Traceability Matrix | Yes | `REQUIREMENTS_TRACEABILITY_MATRIX` |

## Important Notes

The academic SRS should be clear enough for supervisors, evaluators, developers, and testers.

It should not contain full source code or full database ERD.

---

# 10.3 Academic Software Design Description

**Template Code:** `ACAD_SDS`

**Document Type:** `SDS`

## Purpose

This template explains how the academic software project will be designed and built. It includes methodology, process model, architecture, modules, design diagrams, data design, interface design, algorithms, APIs, deployment, and testing approach.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Introduction | Yes | `SDS_INTRODUCTION` |
| 1.1 | Purpose | Yes | `SDS_PURPOSE` |
| 1.2 | Scope of Design | Yes | `SDS_SCOPE` |
| 1.3 | References | Optional | `SDS_REFERENCES` |
| 2 | Design Methodology and Software Process Model | Yes | `DESIGN_METHODOLOGY_PROCESS` |
| 3 | System Overview | Yes | `SYSTEM_OVERVIEW` |
| 3.1 | Architectural Design | Yes | `ARCHITECTURAL_DESIGN` |
| 3.2 | Main System Modules | Yes | `SYSTEM_MODULES` |
| 3.3 | Technology Stack | Yes | `TECHNOLOGY_STACK` |
| 4 | Design Models | Yes | `DESIGN_MODELS` |
| 4.1 | Use Case Diagrams | Yes | `USE_CASE_DIAGRAMS` |
| 4.2 | Class Diagram | Yes | `CLASS_DIAGRAM` |
| 4.3 | Activity Diagrams | Yes | `ACTIVITY_DIAGRAMS` |
| 4.4 | Sequence Diagrams | Yes | `SEQUENCE_DIAGRAMS` |
| 4.5 | State Transition Diagrams | Yes | `STATE_DIAGRAMS` |
| 4.6 | Component Diagram | Yes | `COMPONENT_DIAGRAM` |
| 4.7 | Traceability Tree / Traceability Model | Yes | `TRACEABILITY_MODEL` |
| 5 | Data Design | Yes | `DATA_DESIGN` |
| 5.1 | Data Dictionary | Yes | `DATA_DICTIONARY` |
| 6 | Human Interface Design | Yes | `HUMAN_INTERFACE_DESIGN` |
| 6.1 | Screen Images | Yes | `SCREEN_IMAGES` |
| 6.2 | Screen Objects and Actions | Yes | `SCREEN_OBJECTS_ACTIONS` |
| 7 | Implementation | Yes | `IMPLEMENTATION` |
| 7.1 | Algorithms | Yes | `ALGORITHMS` |
| 7.2 | External APIs / SDKs | Yes | `EXTERNAL_APIS_SDKS` |
| 7.3 | User Interface Implementation | Yes | `UI_IMPLEMENTATION` |
| 7.4 | Deployment | Yes | `DEPLOYMENT` |
| 8 | Testing and Evaluation | Yes | `TESTING_EVALUATION` |
| 8.1 | Unit Testing | Yes | `UNIT_TESTING` |
| 8.2 | Functional Testing | Yes | `FUNCTIONAL_TESTING` |
| 8.3 | Business Rules Testing | Yes | `BUSINESS_RULES_TESTING` |
| 8.4 | Integration Testing | Yes | `INTEGRATION_TESTING` |
| 8.5 | Requirements Traceability for Testing | Yes | `TESTING_TRACEABILITY` |

## Important Notes

The ERD belongs in this template under `5. Data Design`.

The academic SDS should include diagrams that are useful for project evaluation and implementation.

---

# 10.4 Academic Software Test Plan

**Template Code:** `ACAD_STP`

**Document Type:** `STP`

## Purpose

This template defines how the academic software project will be tested. It includes test scope, test items, features to be tested, features not to be tested, test approach, test environment, test data, test cases, pass/fail criteria, risks, roles, and traceability between requirements and test cases.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Introduction | Yes | `STP_INTRODUCTION` |
| 1.1 | Purpose | Yes | `STP_PURPOSE` |
| 1.2 | Scope of Testing | Yes | `TESTING_SCOPE` |
| 1.3 | References | Optional | `STP_REFERENCES` |
| 2 | Test Items | Yes | `TEST_ITEMS` |
| 3 | Features to Be Tested | Yes | `FEATURES_TO_BE_TESTED` |
| 4 | Features Not to Be Tested | Yes | `FEATURES_NOT_TO_BE_TESTED` |
| 5 | Test Approach | Yes | `TEST_APPROACH` |
| 6 | Test Environment | Yes | `TEST_ENVIRONMENT` |
| 7 | Test Data | Yes | `TEST_DATA` |
| 8 | Test Cases | Yes | `TEST_CASES` |
| 8.1 | Unit Test Cases | Yes | `UNIT_TEST_CASES` |
| 8.2 | Functional Test Cases | Yes | `FUNCTIONAL_TEST_CASES` |
| 8.3 | Business Rules Test Cases | Yes | `BUSINESS_RULES_TEST_CASES` |
| 8.4 | Integration Test Cases | Yes | `INTEGRATION_TEST_CASES` |
| 9 | Pass / Fail Criteria | Yes | `PASS_FAIL_CRITERIA` |
| 10 | Suspension and Resumption Criteria | Optional | `SUSPENSION_RESUMPTION_CRITERIA` |
| 11 | Test Deliverables | Yes | `TEST_DELIVERABLES` |
| 12 | Testing Schedule | Optional | `TESTING_SCHEDULE` |
| 13 | Testing Risks and Contingencies | Yes | `TEST_RISKS_CONTINGENCIES` |
| 14 | Roles and Responsibilities | Optional | `TEST_ROLES_RESPONSIBILITIES` |
| 15 | Requirements Traceability for Testing | Yes | `TESTING_TRACEABILITY_MATRIX` |
| 16 | Test Summary | Optional | `TEST_SUMMARY` |

## Important Notes

The STP does not include the full ERD.

It may include database test cases, but the ERD remains in the SDS.

---

# 11. Section Registry: Profile 3

This section defines all templates inside the Company Software Documentation Profile.

Profile code: `COMPANY_SOFTWARE`

Templates: `COMP_SCOPE`, `COMP_SRS`, `COMP_SDS`, `COMP_STP`

---

# 11.1 Company Project Brief / Product Scope Document

**Template Code:** `COMP_SCOPE`

**Document Type:** `SCOPE`

## Purpose

This template defines the project brief or product scope for a company software project. It explains the business need, problem, product vision, goals, users, stakeholders, scope, features, deliverables, risks, success metrics, milestones, and approval/sign-off.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Project Name | Yes | `PROJECT_NAME` |
| 2 | Executive Summary | Yes | `EXECUTIVE_SUMMARY` |
| 3 | Business Need | Yes | `BUSINESS_NEED` |
| 4 | Problem Statement | Yes | `PROBLEM_STATEMENT` |
| 5 | Product Vision | Yes | `PRODUCT_VISION` |
| 6 | Product Goals | Yes | `PRODUCT_GOALS` |
| 7 | Target Users | Yes | `TARGET_USERS` |
| 8 | Stakeholders | Yes | `STAKEHOLDERS` |
| 9 | Scope Overview | Yes | `SCOPE_OVERVIEW` |
| 10 | In-Scope Features | Yes | `IN_SCOPE_FEATURES` |
| 11 | Out-of-Scope Features | Yes | `OUT_OF_SCOPE_FEATURES` |
| 12 | Key Features and Capabilities | Yes | `KEY_FEATURES_CAPABILITIES` |
| 13 | Deliverables | Yes | `DELIVERABLES` |
| 14 | Assumptions | Yes | `ASSUMPTIONS` |
| 15 | Constraints | Yes | `CONSTRAINTS` |
| 16 | Risks and Mitigation | Yes | `RISKS_MITIGATION` |
| 17 | Success Metrics | Yes | `SUCCESS_METRICS` |
| 18 | Milestones | Optional | `MILESTONES` |
| 19 | Approval and Sign-Off | Optional | `APPROVAL_SIGNOFF` |

## Important Notes

This template should use business-friendly language.

It should not be too academic or too technical.

---

# 11.2 Company Requirements Specification

**Template Code:** `COMP_SRS`

**Document Type:** `SRS`

## Purpose

This template defines the requirements for a company software project. It includes business context, product goals, users and roles, user needs, product features, functional requirements, non-functional requirements, business rules, use cases, acceptance criteria, data requirements, priorities, and traceability.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Document Overview | Yes | `DOCUMENT_OVERVIEW` |
| 2 | Business Context | Yes | `BUSINESS_CONTEXT` |
| 3 | Product Goals | Yes | `PRODUCT_GOALS` |
| 4 | Users and Roles | Yes | `USERS_AND_ROLES` |
| 5 | User Needs | Yes | `USER_NEEDS` |
| 6 | Product Features | Yes | `PRODUCT_FEATURES` |
| 7 | Functional Requirements | Yes | `FUNCTIONAL_REQUIREMENTS` |
| 7.1 | Authentication Requirements | Optional | `AUTHENTICATION_REQUIREMENTS` |
| 7.2 | Project Workspace Requirements | Optional | `PROJECT_WORKSPACE_REQUIREMENTS` |
| 7.3 | Template and Document Requirements | Optional | `TEMPLATE_DOCUMENT_REQUIREMENTS` |
| 7.4 | Requirement Management Requirements | Optional | `REQUIREMENT_MANAGEMENT_REQUIREMENTS` |
| 7.5 | Traceability Requirements | Optional | `TRACEABILITY_REQUIREMENTS` |
| 7.6 | Validation Requirements | Optional | `VALIDATION_REQUIREMENTS` |
| 8 | Non-Functional Requirements | Yes | `NON_FUNCTIONAL_REQUIREMENTS` |
| 8.1 | Performance Requirements | Yes | `PERFORMANCE_REQUIREMENTS` |
| 8.2 | Security Requirements | Yes | `SECURITY_REQUIREMENTS` |
| 8.3 | Usability Requirements | Yes | `USABILITY_REQUIREMENTS` |
| 8.4 | Reliability Requirements | Optional | `RELIABILITY_REQUIREMENTS` |
| 8.5 | Maintainability Requirements | Optional | `MAINTAINABILITY_REQUIREMENTS` |
| 8.6 | Compatibility Requirements | Optional | `COMPATIBILITY_REQUIREMENTS` |
| 9 | Business Rules | Yes | `BUSINESS_RULES` |
| 10 | Use Cases | Yes | `USE_CASES` |
| 11 | Acceptance Criteria | Yes | `ACCEPTANCE_CRITERIA` |
| 12 | Data Requirements | Yes | `DATA_REQUIREMENTS` |
| 13 | Assumptions and Constraints | Yes | `ASSUMPTIONS_CONSTRAINTS` |
| 14 | Requirements Priority | Yes | `REQUIREMENTS_PRIORITY` |
| 15 | Requirements Traceability Matrix | Yes | `REQUIREMENTS_TRACEABILITY_MATRIX` |

## Important Notes

The company requirements document should be practical, testable, and useful for developers, QA testers, product owners, and clients.

The full ERD belongs in the technical design document, not here.

---

# 11.3 Company Technical Design Document

**Template Code:** `COMP_SDS`

**Document Type:** `SDS`

## Purpose

This template defines the technical design of a company software project. It explains the system context, design goals, architecture, technology stack, modules, component design, frontend design, backend design, API design, database design, traceability design, validation engine design, security design, error handling, deployment, key logic, testing considerations, and future enhancements.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Document Overview | Yes | `DOCUMENT_OVERVIEW` |
| 2 | System Context | Yes | `SYSTEM_CONTEXT` |
| 3 | Design Goals | Yes | `DESIGN_GOALS` |
| 4 | Architecture Overview | Yes | `ARCHITECTURE_OVERVIEW` |
| 5 | Technology Stack | Yes | `TECHNOLOGY_STACK` |
| 6 | System Modules | Yes | `SYSTEM_MODULES` |
| 7 | Component Design | Yes | `COMPONENT_DESIGN` |
| 8 | Frontend Design | Yes | `FRONTEND_DESIGN` |
| 9 | Backend Design | Yes | `BACKEND_DESIGN` |
| 10 | API Design | Yes | `API_DESIGN` |
| 11 | Database Design | Yes | `DATABASE_DESIGN` |
| 11.1 | Main Database Entities | Yes | `MAIN_DATABASE_ENTITIES` |
| 11.2 | Data Dictionary | Yes | `DATA_DICTIONARY` |
| 12 | Traceability Design | Yes | `TRACEABILITY_DESIGN` |
| 13 | Validation Engine Design | Yes | `VALIDATION_ENGINE_DESIGN` |
| 14 | Security Design | Yes | `SECURITY_DESIGN` |
| 15 | Error Handling and Logging | Yes | `ERROR_HANDLING_LOGGING` |
| 16 | User Interface Design | Yes | `USER_INTERFACE_DESIGN` |
| 17 | Deployment Design | Yes | `DEPLOYMENT_DESIGN` |
| 18 | Key Algorithms and Logic | Yes | `KEY_ALGORITHMS_LOGIC` |
| 19 | Testing Considerations | Yes | `TESTING_CONSIDERATIONS` |
| 20 | Future Technical Enhancements | Optional | `FUTURE_TECHNICAL_ENHANCEMENTS` |

## Important Notes

The ERD belongs in this template under `11. Database Design`.

This template should be the most technical document in the Company profile.

---

# 11.4 Company QA / Test Plan

**Template Code:** `COMP_STP`

**Document Type:** `STP`

## Purpose

This template defines the QA and testing plan for a company software project. It explains testing objectives, scope, test items, features to test, excluded features, testing approach, environment, test data, test cases, API tests, database tests, business rule tests, integration tests, usability tests, regression testing, pass/fail criteria, defect logging, deliverables, traceability, risks, roles, and final sign-off.

## Section Registry

| No. | Section Title | Required | Validation Tag |
|---|---|---|---|
| 1 | Document Overview | Yes | `DOCUMENT_OVERVIEW` |
| 2 | Testing Objectives | Yes | `TESTING_OBJECTIVES` |
| 3 | Scope of Testing | Yes | `TESTING_SCOPE` |
| 4 | Test Items | Yes | `TEST_ITEMS` |
| 5 | Features to Be Tested | Yes | `FEATURES_TO_BE_TESTED` |
| 6 | Features Not to Be Tested | Yes | `FEATURES_NOT_TO_BE_TESTED` |
| 7 | Testing Approach | Yes | `TESTING_APPROACH` |
| 8 | Test Environment | Yes | `TEST_ENVIRONMENT` |
| 9 | Test Data | Yes | `TEST_DATA` |
| 10 | Test Case Format | Yes | `TEST_CASE_FORMAT` |
| 11 | Functional Test Cases | Yes | `FUNCTIONAL_TEST_CASES` |
| 12 | API Test Cases | Yes | `API_TEST_CASES` |
| 13 | Database Test Cases | Yes | `DATABASE_TEST_CASES` |
| 14 | Business Rules Test Cases | Yes | `BUSINESS_RULES_TEST_CASES` |
| 15 | Integration Test Cases | Yes | `INTEGRATION_TEST_CASES` |
| 16 | Usability Test Cases | Optional | `USABILITY_TEST_CASES` |
| 17 | Regression Testing | Optional | `REGRESSION_TESTING` |
| 18 | Pass / Fail Criteria | Yes | `PASS_FAIL_CRITERIA` |
| 19 | Defect / Issue Logging | Yes | `DEFECT_ISSUE_LOGGING` |
| 20 | Test Deliverables | Yes | `TEST_DELIVERABLES` |
| 21 | Requirements-to-Test Traceability Matrix | Yes | `REQUIREMENTS_TEST_TRACEABILITY` |
| 22 | Test Execution Summary | Optional | `TEST_EXECUTION_SUMMARY` |
| 23 | Testing Risks and Contingencies | Yes | `TESTING_RISKS_CONTINGENCIES` |
| 24 | Roles and Responsibilities | Optional | `TEST_ROLES_RESPONSIBILITIES` |
| 25 | Final QA Sign-Off | Optional | `FINAL_QA_SIGNOFF` |

## Important Notes

The QA / Test Plan should focus on testing evidence and delivery readiness.

It should not contain the full ERD.

---

# 12. Seed Data Object Shape

## Profile Object Shape

```js
{
  name: "Standard Software Documentation Profile",
  code: "STANDARD_SOFTWARE",
  description: "General-purpose software documentation profile for complete software projects.",
  audience: "Software teams, client projects, internal systems, SaaS products, and professional projects.",
  tone: "Formal, complete, neutral, and industry-friendly.",
  displayOrder: 1
}
```

## Template Object Shape

```js
{
  name: "Standard Project Scope Document",
  code: "STD_SCOPE",
  profileCode: "STANDARD_SOFTWARE",
  documentType: "SCOPE",
  description: "Defines project idea, goals, scope, users, deliverables, risks, and success criteria.",
  recommendedFor: "General software projects, web apps, SaaS systems, internal tools, and professional documentation.",
  displayOrder: 1,
  sections: []
}
```

## Template Section Object Shape

```js
{
  sectionNumber: "1",
  title: "Project Overview",
  description: "Short explanation of what this section means.",
  guidanceText: "Clear help text shown to the user in the editor.",
  exampleText: "Optional sample content shown in the guidance panel.",
  placeholderText: "Short placeholder shown inside the editor.",
  isRequired: true,
  validationTag: "PROJECT_OVERVIEW",
  displayOrder: 1,
  parentSectionNumber: null
}
```

---

# 13. Agent Instruction Summary

AI agents must follow this package exactly.

## Rules

1. Do not rename profiles without approval.
2. Do not rename template codes without approval.
3. Do not add new profiles without approval.
4. Do not add a custom rule builder.
5. Do not make the Academic profile university-specific.
6. Do not present future features as current-version features.
7. Keep ERD only in SDS / Technical Design templates.
8. Keep frontend wording simple: Description, Guidance, Example.
9. Hide validation tags and rule codes from normal users.
10. Use seed data for templates instead of reading DOCX/PDF files at runtime.
11. Implement one feature at a time and commit after working changes.
12. Keep implementation focused and consistent with the approved project workflow.

---

# 14. Implementation Readiness Checklist

The template package is ready for implementation when:

```text
Three profiles are seeded.
Twelve templates are seeded.
Template sections are seeded.
Required/optional flags are seeded.
Validation tags are seeded.
Template preview works.
Create document from template works.
Document sections are created in correct order.
Editor displays guidance and examples.
Doc-Linter can check required empty sections.
ERD requirement is attached to SDS/TDD templates only.
```

---

# 15. Final Package Summary

DevDoc Template Package v1 contains:

```text
3 Profiles
12 Templates
4 Document Types
Reusable validation tags
Required/optional section mapping
Seed-data naming convention
Frontend guidance display rules
ERD placement rules
Validation rule naming convention
Implementation-ready object shapes
```

This package should now be treated as the official DevDoc template configuration for the project.
