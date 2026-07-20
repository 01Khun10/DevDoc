# DevDoc Module Documentation

## 1. Purpose

This directory contains the detailed implementation specification for every major DevDoc module.

The module documents will gradually replace the large root-level `DEVDOC_UPGRADE_PLAN_V3.md` by separating its useful requirements into focused, maintainable specifications.

The existing upgrade plan must not be deleted until all useful requirements have been transferred, reviewed, and approved.

These files are not the overall DevDoc baseline. A separate complete-project baseline will later define the global product scope, architecture, cross-module rules, and completion standard.

## 2. Status Definitions

Each module uses one of these implementation states:

| Status | Meaning |
|---|---|
| Implemented | The main documented workflow exists and is integrated, but improvements may still be required |
| Partial | Meaningful functionality exists, but important requirements, integrations, validation, security, or tests remain incomplete |
| Missing | The documented module has not yet been implemented as a complete working feature |
| Review Required | The implementation exists, but its actual behavior must be audited before assigning a reliable status |
| Planned | The module specification has been approved but implementation has not started |

A route, screen, component, model, or placeholder does not by itself make a module implemented.

## 3. Priority Definitions

| Priority | Meaning |
|---|---|
| Critical | Required for system correctness, security, or core DevDoc behavior |
| High | Required before DevDoc can be considered complete |
| Medium | Important product capability that follows core completion |
| Low | Enhancement that can be completed after primary workflows are stable |

## 4. Module Index

| No. | Module | Current Status | Priority | Main Dependencies | Specification |
|---:|---|---|---|---|---|
| 01 | Authentication and Users | Partial | Critical | PostgreSQL, Prisma, JWT | `01-authentication-and-users.md` |
| 02 | Project Management | Partial | Critical | Authentication, Profiles | `02-project-management.md` |
| 03 | Profiles and Templates | Partial | High | Projects, Documents | `03-profiles-and-templates.md` |
| 04 | Structured Document Editor | Partial | Critical | Documents, Templates, TipTap | `04-structured-document-editor.md` |
| 05 | Business Objectives | Partial | High | Projects, Traceability | `05-business-objectives.md` |
| 06 | Requirements Registry | Partial | Critical | Projects, Traceability | `06-requirements-registry.md` |
| 07 | Use Case Registry | Partial | Critical | Requirements, Traceability | `07-use-case-registry.md` |
| 08 | Design Elements | Partial | High | Requirements, Diagrams | `08-design-elements.md` |
| 09 | Test Case Registry | Partial | High | Requirements, Traceability | `09-test-case-registry.md` |
| 10 | Linked Artefacts | Partial | Critical | All artefact registries | `10-linked-artefacts.md` |
| 11 | Traceability Engine | Partial | Critical | Linked Artefacts, Registries | `11-traceability-engine.md` |
| 12 | Doc-Linter and Validation | Partial | Critical | Documents, Profiles, Rules | `12-doc-linter-and-validation.md` |
| 13 | Diagram Management | Missing | High | Projects, Documents, Design Elements | `13-diagram-management.md` |
| 14 | Versioning and History | Missing | High | Documents, Users, Audit History | `14-versioning-and-history.md` |
| 15 | Document Export | Missing | High | Editor, Templates, Diagrams | `15-document-export.md` |
| 16 | AI Assistance | Missing | Medium | Editor, Validation, Project Knowledge | `16-ai-assistance.md` |
| 17 | Project Knowledge Database | Partial | High | All project artefacts | `17-project-knowledge-database.md` |
| 18 | Search and Navigation | Partial | Medium | Projects, Documents, Artefacts | `18-search-and-navigation.md` |
| 19 | Activity and Audit History | Partial | High | Users, Projects, Mutations | `19-activity-and-audit-history.md` |
| 20 | Sharing and Collaboration | Partial | High | Projects, Permissions, Audit | `20-sharing-and-collaboration.md` |
| 21 | Analytics and Readiness | Partial | High | Validation, Traceability, Activity | `21-analytics-and-readiness.md` |
| 22 | Notifications | Missing | Medium | Users, Activity, Review Workflows | `22-notifications.md` |
| 23 | Reviewer and Supervisor Workflows | Missing | High | Sharing, Notifications, Permissions | `23-reviewer-and-supervisor-workflows.md` |
| 24 | Administration | Missing | Medium | Users, Roles, Audit History | `24-administration.md` |
| 25 | Security and Platform Hardening | Partial | Critical | Entire application | `25-security-and-platform-hardening.md` |

The statuses above are initial audit classifications. Each status must be confirmed when its individual module document is prepared.

## 5. Standard Module Document Structure

Every module specification should use this structure:

1. Purpose
2. Scope
3. Current Implementation
4. Existing Files and Components
5. Problems and Gaps
6. Target Behavior
7. Functional Requirements
8. User Roles and Permissions
9. User Workflows
10. Frontend Requirements
11. Backend Requirements
12. API Endpoints
13. Database Models
14. Validation Rules
15. Security and Privacy
16. Integration with Other Modules
17. Error and Edge Cases
18. Testing Requirements
19. Implementation Tasks
20. Acceptance Criteria
21. Documentation Impact
22. Status and Remaining Work
23. Open Decisions

A section may state “Not applicable,” but it should not be silently removed.

## 6. Source Material for Module Specifications

Module documents may use information from:

- Current working source code
- Prisma schema and migration history
- Existing tests
- Current API behavior
- Software Design Specification
- Existing project documentation
- `DEVDOC_UPGRADE_PLAN_V3.md`
- Professional audit findings
- User-approved implementation decisions
- Graphify knowledge-graph queries

Source material must be checked against the real implementation. Outdated documentation must not be copied without review.

## 7. Source Priority During Module Preparation

Until the complete-project baseline is approved, use this order:

1. The user’s current instruction
2. User-approved decisions for the module
3. Current code, Prisma schema, migrations, and verified behavior
4. Existing SDS and project documentation
5. Upgrade plans and older milestone documents as historical sources

When sources conflict, record the conflict in the module document under **Open Decisions**.

## 8. Migration Process

Each module should be migrated using this workflow:

1. Inspect the relevant upgrade-plan sections.
2. Query Graphify for the related implementation.
3. Inspect the actual frontend and backend source files.
4. Inspect related Prisma models and migrations.
5. Identify implemented, partial, missing, and defective behavior.
6. Write the module specification.
7. Define measurable acceptance criteria.
8. Review the module with the user.
9. Commit the approved module document.
10. Mark its upgrade-plan content as migrated.

The root upgrade plan may be removed only when every useful section has been mapped to an approved module document or intentionally rejected.

## 9. Module Documentation Rules

- Do not mark a requirement implemented without evidence.
- Do not describe planned behavior as existing behavior.
- Do not copy contradictions from the SDS without noting them.
- Do not hide security, privacy, authorization, or data-integrity gaps.
- Keep frontend, backend, database, and API requirements aligned.
- Include negative and edge-case behavior.
- Include test requirements before implementation begins.
- Record unresolved architectural decisions explicitly.
- Update the module document when its implementation materially changes.

## 10. Recommended Preparation Order

The modules should be documented in this order:

1. Authentication and Users
2. Project Management
3. Profiles and Templates
4. Structured Document Editor
5. Requirements Registry
6. Use Case Registry
7. Business Objectives
8. Design Elements
9. Test Case Registry
10. Linked Artefacts
11. Traceability Engine
12. Doc-Linter and Validation
13. Project Knowledge Database
14. Security and Platform Hardening
15. Diagram Management
16. Versioning and History
17. Document Export
18. Sharing and Collaboration
19. Reviewer and Supervisor Workflows
20. Notifications
21. Search and Navigation
22. Activity and Audit History
23. Analytics and Readiness
24. Administration
25. AI Assistance

Core correctness, authorization, traceability, and validation should be stabilized before adding major AI functionality.

## 11. Migration Tracking

| Module | Specification Created | Upgrade-Plan Content Migrated | Code Audited | User Approved |
|---|---:|---:|---:|---:|
| Authentication and Users | No | No | No | No |
| Project Management | No | No | No | No |
| Profiles and Templates | No | No | No | No |
| Structured Document Editor | No | No | No | No |
| Business Objectives | No | No | No | No |
| Requirements Registry | No | No | No | No |
| Use Case Registry | No | No | No | No |
| Design Elements | No | No | No | No |
| Test Case Registry | No | No | No | No |
| Linked Artefacts | No | No | No | No |
| Traceability Engine | No | No | No | No |
| Doc-Linter and Validation | No | No | No | No |
| Diagram Management | No | No | No | No |
| Versioning and History | No | No | No | No |
| Document Export | No | No | No | No |
| AI Assistance | No | No | No | No |
| Project Knowledge Database | No | No | No | No |
| Search and Navigation | No | No | No | No |
| Activity and Audit History | No | No | No | No |
| Sharing and Collaboration | No | No | No | No |
| Analytics and Readiness | No | No | No | No |
| Notifications | No | No | No | No |
| Reviewer and Supervisor Workflows | No | No | No | No |
| Administration | No | No | No | No |
| Security and Platform Hardening | No | No | No | No |
