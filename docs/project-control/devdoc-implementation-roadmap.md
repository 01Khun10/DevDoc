# DevDoc Implementation Roadmap

## Purpose

This document defines the controlled implementation order for DevDoc.

It explains how the project should be built phase by phase so that the system remains consistent, understandable, and working throughout development.

This roadmap should be followed together with:

```text
AGENTS.md
docs/project-control/devdoc-master-context.md
docs/project-control/devdoc-30-percent-implementation-plan.md
docs/project-control/devdoc-agent-coordination-rules.md
docs/template-package/devdoc-template-package-v1.md
```

---

# 1. Implementation Principle

DevDoc should be built as a controlled vertical slice first.

That means the first goal is not to build every possible feature.

The first goal is to build one complete working workflow:

```text
User registers/logs in
→ creates a project
→ selects a documentation profile
→ previews a template
→ creates a document from template
→ edits document sections
→ creates requirements
→ links requirements to artefacts
→ runs validation
→ views validation result
```

This proves the main value of DevDoc.

---

# 2. Approved Technology Stack

## Frontend

```text
React
Vite
Tailwind CSS
```

## Backend

```text
Node.js
Express.js
Prisma
PostgreSQL
```

## Authentication

```text
JWT
bcrypt
```

## Testing and Development Tools

```text
Thunder Client or Postman
pgAdmin
Git / GitHub
Brave Browser
PlantUML / Mermaid later
React Flow later
```

---

# 3. High-Level Roadmap

The implementation is divided into these major stages:

```text
Stage 1: Project foundation
Stage 2: Database foundation
Stage 3: Template package seeding
Stage 4: Authentication
Stage 5: Project workspace
Stage 6: Template library
Stage 7: Document creation from template
Stage 8: Structured document editor
Stage 9: Requirements registry
Stage 10: Traceability links
Stage 11: Basic Doc-Linter validation
Stage 12: Demo data and polish
Stage 13: Future enhancements
```

---

# 4. Detailed Phase Roadmap

## Phase 0: Project Foundation

### Goal

Create a clean runnable project foundation.

### Tasks

- Check current folder structure
- Create frontend if missing
- Create backend if missing
- Add basic frontend folder structure
- Add basic backend folder structure
- Add root README
- Add backend `.env.example`
- Add frontend `.env.example` if needed
- Add basic backend server
- Confirm frontend runs
- Confirm backend runs

### Expected Output

```text
Frontend can start.
Backend can start.
Project has clear folder structure.
README explains how to run the project.
```

### Do Not Do Yet

```text
Do not create Prisma schema.
Do not implement authentication.
Do not create database models.
Do not seed templates.
Do not build UI features.
```

---

## Phase 1: Prisma and Database Schema

### Goal

Create the database foundation.

### Tasks

- Install Prisma if missing
- Initialize Prisma
- Connect PostgreSQL
- Create database schema
- Add User model
- Add Project model
- Add ValidationProfile model
- Add Template model
- Add TemplateSection model
- Add Document model
- Add DocumentSection model
- Add Requirement model
- Add UseCase model
- Add DesignElement model
- Add TestCase model
- Add TraceabilityLink model
- Add ValidationRule model
- Add ValidationRun model
- Add ValidationResult model
- Add ActivityLog model if needed
- Run migration
- Generate Prisma client

### Expected Output

```text
Database migration runs successfully.
Prisma client generates successfully.
Database contains the core schema.
```

---

## Phase 2: Seed Template Package v1

### Goal

Load approved profiles, templates, and template sections into the database.

### Source of Truth

```text
docs/template-package/devdoc-template-package-v1.md
```

### Tasks

- Create backend seed data folder
- Create `profiles.js`
- Create template seed files
- Create `validationRules.js`
- Create `index.js`
- Update Prisma seed file
- Seed three profiles
- Seed twelve templates
- Seed template sections
- Seed required/optional flags
- Seed validation tags
- Confirm records in pgAdmin

### Expected Output

```text
Three profiles exist in database.
Twelve templates exist in database.
Template sections exist in correct order.
Required and optional flags are stored.
Validation tags are stored.
```

---

## Phase 3: Authentication Backend

### Goal

Allow users to register, log in, and access protected backend routes.

### Tasks

- Create auth routes
- Create auth controller
- Create auth service
- Add password hashing with bcrypt
- Add JWT token generation
- Add authentication middleware
- Add current user route
- Add basic validation for auth inputs
- Test routes with Thunder Client or Postman

### Expected Output

```text
User can register.
User can log in.
JWT token is returned.
Protected route works only with valid token.
```

---

## Phase 4: Authentication Frontend

### Goal

Create frontend screens for account access.

### Tasks

- Create register page
- Create login page
- Add auth API service
- Store token safely
- Add protected route handling
- Add logout
- Redirect user after login
- Show clear error messages

### Expected Output

```text
User can register from UI.
User can log in from UI.
User reaches protected dashboard.
User can log out.
```

---

## Phase 5: Project Workspace Backend

### Goal

Allow users to create and retrieve their projects.

### Tasks

- Create project routes
- Create project controller
- Create project service
- Add create project API
- Add get user projects API
- Add get project by ID API
- Add update project API
- Protect project ownership
- Test APIs

### Expected Output

```text
Logged-in user can create project.
Logged-in user can see own projects.
User cannot access another user's project.
```

---

## Phase 6: Project Workspace Frontend

### Goal

Allow users to create, view, and open project workspaces from the UI.

### Tasks

- Create dashboard page
- Create project cards
- Create project form
- Create project detail/workspace page
- Show project summary
- Add navigation between dashboard and project workspace
- Show loading, empty, and error states

### Expected Output

```text
User can create a project from UI.
User can see project list.
User can open project dashboard.
```

---

## Phase 7: Template Library Backend

### Goal

Expose profiles and templates through APIs.

### Tasks

- Create profile API
- Create template API
- Get all profiles
- Get templates by profile
- Get template by ID
- Get template sections
- Return required/optional flags
- Return guidance/example fields

### Expected Output

```text
Frontend can load profiles.
Frontend can load templates for a selected profile.
Frontend can preview template sections.
```

---

## Phase 8: Template Library Frontend

### Goal

Allow users to select profiles and preview templates.

### Tasks

- Create profile selection UI
- Create template library page
- Create template cards
- Create template preview panel
- Show document type
- Show required/optional sections
- Show template description
- Add create document button

### Expected Output

```text
User can select a profile.
User can preview a template.
User can see template sections before creating a document.
```

---

## Phase 9: Create Document from Template

### Goal

Create editable documents from seeded templates.

### Tasks

- Create document creation API
- Create document record from template
- Copy template sections into document sections
- Preserve section number
- Preserve section title
- Preserve required/optional flag
- Preserve description/guidance/example fields
- Return created document
- Add frontend action to create document
- Redirect to editor after creation

### Expected Output

```text
User can create a document from a template.
Created document contains editable sections.
Created sections match template sections.
```

---

## Phase 10: Structured Document Editor Backend

### Goal

Support document loading and section saving.

### Tasks

- Get document with sections API
- Update document section API
- Save content
- Update section status
- Calculate completion percentage
- Return section validation-related data if available

### Expected Output

```text
Document loads with sections.
Section content can be saved.
Completion percentage can be calculated.
```

---

## Phase 11: Structured Document Editor Frontend

### Goal

Build the main editing experience.

### Tasks

- Create editor page
- Add left section sidebar
- Add center editor area
- Add right guidance panel
- Show Description
- Show Guidance
- Show Example
- Show Required/Optional badge
- Add save button
- Add section status
- Add completion progress
- Add basic validation issue display

### Expected Output

```text
User can open document editor.
User can select sections.
User can edit and save section content.
User can see guidance and example text.
```

---

## Phase 12: Requirements Registry

### Goal

Allow users to create and manage basic requirements.

### Tasks

- Create requirement routes
- Create requirement controller
- Create requirement service
- Auto-generate requirement ID
- Support FR and NFR
- Add priority
- Add status
- Add acceptance criteria
- Create requirement list UI
- Create requirement form UI

### Expected Output

```text
User can create FR/NFR.
Requirement ID is generated.
Requirement appears in registry.
```

---

## Phase 13: Traceability Links

### Goal

Allow users to connect requirements to simple artefacts.

### Tasks

- Create use case placeholder records
- Create design element placeholder records
- Create test case placeholder records
- Create traceability link API
- Link requirement to use case
- Link requirement to design element
- Link requirement to test case
- Show linked artefacts
- Show missing links

### Expected Output

```text
User can link a requirement to use case, design element, and test case.
System can show which links are present or missing.
```

---

## Phase 14: Basic Doc-Linter Validation

### Goal

Check missing sections, weak requirements, and broken traceability.

### Tasks

- Create validation service
- Create validation routes
- Check empty required sections
- Check requirement priority
- Check requirement acceptance criteria
- Check use case link
- Check design element link
- Check test case link
- Store validation run
- Store validation results
- Calculate readiness score
- Create validation dashboard UI

### Expected Output

```text
User can run validation.
System shows errors and warnings.
System shows readiness score.
System identifies missing required sections and broken traceability.
```

---

## Phase 15: Demo Data and Polish

### Goal

Prepare the system for demonstration.

### Tasks

- Add sample project
- Add sample document
- Add one complete requirement
- Add one incomplete requirement
- Add sample traceability links
- Confirm validation warnings
- Polish labels
- Polish navigation
- Fix obvious bugs
- Test full workflow

### Expected Output

```text
DevDoc has a clean demo-ready workflow.
Main system idea is understandable during evaluation.
```

---

# 5. Future Enhancement Roadmap

These features are not part of the first 30 percent milestone.

They can be planned after the main workflow works.

## Future Module: AI Writing Assistant

Possible features:

- Improve wording
- Suggest missing content
- Rephrase section content
- Explain validation issues
- Suggest requirement improvements

## Future Module: Export Package

Possible features:

- Export document as PDF
- Export document as DOCX
- Export full project package
- Include validation report
- Include traceability matrix

## Future Module: Diagram Support

Possible features:

- Mermaid diagram editor
- PlantUML diagram preview
- Attach diagrams to SDS sections
- Link diagrams to requirements

## Future Module: Versioning

Possible features:

- Save document snapshots
- Compare versions
- Restore older version
- Track section change history

## Future Module: Collaboration

Possible features:

- Team members
- Comments
- Review notes
- Assigned sections
- Basic permissions

## Future Module: Repository Awareness

Possible features:

- Manual code module links
- GitHub file reference
- Code-to-requirement mapping
- Repository scanning later

---

# 6. Roadmap Rules

- Follow phases in order.
- Do not skip foundation work.
- Do not implement future features early.
- Do not rename approved profiles or template codes.
- Do not add a custom rule builder.
- Do not make Academic profile university-specific.
- Do not use runtime DOCX/PDF parsing for templates.
- Use database seed data for templates.
- Keep UI wording simple and user-friendly.
- Keep backend structure clean and modular.
- Test after every phase.
- Commit only after a phase works.

---

# 7. Testing Gate After Each Phase

After each phase, check:

```text
Does the app still run?
Does the new feature work?
Did anything unrelated break?
Are there terminal errors?
Are there browser console errors?
Are database records correct?
Is the UI understandable?
Is the work still inside scope?
```

If the answer is no, fix before moving to the next phase.

---

# 8. Final Roadmap Summary

The first implementation should prove this:

```text
DevDoc can create structured software documentation from approved templates,
store it as project knowledge,
allow users to edit it section by section,
manage requirements,
connect requirements to artefacts,
and validate missing or weak documentation.
```

That is the core value of the project.
