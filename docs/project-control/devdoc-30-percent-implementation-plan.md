# DevDoc 30 Percent Implementation Plan

## Purpose

This document defines the first major implementation milestone for DevDoc.

The goal is not to build the full platform yet. The goal is to build one strong working vertical slice that proves the main idea of the system.

The first milestone should show that DevDoc can:

- Create a project
- Use documentation profiles and templates
- Create documents from templates
- Edit document sections
- Manage basic requirements
- Link requirements to project artefacts
- Run basic validation checks
- Show validation results

## 30 Percent Implementation Strategy

The first implementation milestone will fully complete three main modules and partially implement two supporting modules.

This keeps the project realistic while still proving the main workflow.

## Core First Workflow

The first working workflow should be:

```text
User registers/logs in
→ creates a project
→ selects a documentation profile
→ opens template library
→ previews a template
→ creates a document from template
→ edits document sections
→ creates requirements
→ links requirements to artefacts
→ runs validation
→ views validation result
```

## Fully Completed Modules

### Module 1: User and Project Workspace Management

This module handles account access and project workspaces.

Required features:

- User registration
- User login
- JWT authentication
- Logout
- Protected routes
- Create project
- View project list
- Open project dashboard
- Edit basic project details
- Project summary cards

Expected result:

```text
A user can create an account, log in, create a project, and open the project dashboard.
```

---

### Module 2: Documentation Template Library

This module handles documentation profiles, templates, and template preview.

Required features:

- Load three documentation profiles from database
- Load templates for selected profile
- Show template name, type, and description
- Preview template sections
- Show required and optional sections
- Create document from selected template
- Convert template sections into document sections

Expected result:

```text
A user can select a profile, preview templates, and create a document from a selected template.
```

---

### Module 3: Structured Document Editor

This module allows users to write documents section by section.

Required features:

- Open created document
- View document section sidebar
- Select a section
- Edit section content
- Save section content
- Track section status
- Show document completion percentage
- Show section description
- Show guidance text
- Show example text
- Show basic validation issues for section

Expected result:

```text
A user can open a created document, edit sections, save content, and view completion status.
```

## Partially Implemented Supporting Modules

### Partial Module 4: Requirements and Artefact Structuring

This module supports basic requirement creation and simple artefact records.

Required features:

- Create functional requirement
- Create non-functional requirement
- Auto-generate requirement ID
- Set requirement priority
- Set requirement status
- Add acceptance criteria
- View requirement list
- Create simple use case placeholder
- Create simple design element placeholder
- Create simple test case placeholder
- Link requirement to use case
- Link requirement to design element
- Link requirement to test case

Expected result:

```text
A user can create requirements and connect them to simple project artefacts.
```

---

### Partial Module 5: Basic Doc-Linter and Traceability

This module checks whether documentation and requirements are complete enough.

Required validation checks:

- Required document section is empty
- Requirement has missing ID
- Requirement has missing priority
- Requirement has missing acceptance criteria
- Functional requirement has no use case link
- Functional requirement has no design element link
- Functional requirement has no test case link

Required features:

- Run validation
- Store validation run
- Store validation results
- Show errors and warnings
- Calculate readiness score
- Show basic traceability matrix or traceability status view

Expected result:

```text
A user can run validation and see missing sections, weak requirements, broken links, and readiness score.
```

## What Not to Build Yet

Do not build these in the first milestone:

- Full AI assistant
- Full AI document generation
- Custom rule builder
- Real-time collaboration
- Full GitHub repository scanning
- AI-generated UML from code
- Marketplace
- Advanced organization or team permissions
- Full PDF/DOCX export package
- Advanced version comparison
- Enterprise compliance engine
- Full source-code-to-documentation automation

These can be future enhancements.

## Approved Profiles

Use only these three profiles:

1. Standard Software Documentation Profile
2. Academic Project Profile
3. Company Software Documentation Profile

Do not rename these profiles.

## Approved Document Types

Use only these document types:

1. SCOPE
2. SRS
3. SDS
4. STP

## Approved Template Package

Use this file as the source of truth:

```text
docs/template-package/devdoc-template-package-v1.md
```

Templates must be seeded into the database.

The app must not read DOCX or PDF template files at runtime.

## Technology Stack

Frontend:

- React
- Vite
- Tailwind CSS

Backend:

- Node.js
- Express.js
- Prisma
- PostgreSQL

Authentication:

- JWT
- bcrypt

Testing:

- Thunder Client or Postman
- pgAdmin
- Browser testing in Brave

Version control:

- Git
- GitHub

## Implementation Phases

### Phase 0: Project Foundation

Goal:

```text
Create a clean runnable project foundation.
```

Tasks:

- Create frontend if missing
- Create backend if missing
- Add basic folder structure
- Add basic backend server file
- Add .env.example
- Add README
- Confirm frontend runs
- Confirm backend runs

Do not add Prisma schema yet.

---

### Phase 1: Prisma and Database Schema

Goal:

```text
Create the database foundation.
```

Tasks:

- Initialize Prisma
- Connect PostgreSQL
- Create schema for users, projects, profiles, templates, documents, requirements, traceability, and validation
- Run first migration
- Generate Prisma client

---

### Phase 2: Seed Template Package

Goal:

```text
Load the official template package into the database.
```

Tasks:

- Seed three profiles
- Seed twelve templates
- Seed template sections
- Seed required and optional flags
- Seed validation tags
- Confirm template records appear in database

---

### Phase 3: Authentication Backend

Goal:

```text
Allow users to register and log in.
```

Tasks:

- Register route
- Login route
- Password hashing
- JWT generation
- JWT middleware
- Current user route

---

### Phase 4: Authentication Frontend

Goal:

```text
Create frontend account access.
```

Tasks:

- Register page
- Login page
- Auth state handling
- Protected routes
- Logout button
- Redirect after login

---

### Phase 5: Project Workspace Backend

Goal:

```text
Support project creation and retrieval.
```

Tasks:

- Create project API
- Get user projects API
- Get project by ID API
- Update project API
- Protect project ownership

---

### Phase 6: Project Workspace Frontend

Goal:

```text
Allow users to create and open projects.
```

Tasks:

- Dashboard page
- Create project form
- Project list/cards
- Project dashboard page
- Project summary cards

---

### Phase 7: Template Library Backend

Goal:

```text
Expose profiles and templates through APIs.
```

Tasks:

- Get profiles API
- Get templates by profile API
- Get template preview API
- Get template sections API

---

### Phase 8: Template Library Frontend

Goal:

```text
Allow users to browse and preview templates.
```

Tasks:

- Profile selection UI
- Template library UI
- Template preview screen
- Required/optional section display
- Create document button

---

### Phase 9: Create Document from Template

Goal:

```text
Create editable project documents from seeded templates.
```

Tasks:

- Create document record
- Copy template sections into document sections
- Preserve section order
- Preserve required/optional flags
- Return created document
- Open document in editor

---

### Phase 10: Structured Document Editor Backend

Goal:

```text
Support document reading and section saving.
```

Tasks:

- Get document with sections API
- Update section content API
- Calculate section status
- Calculate document completion percentage

---

### Phase 11: Structured Document Editor Frontend

Goal:

```text
Build the main editing experience.
```

Tasks:

- Section sidebar
- Editor area
- Save button
- Section status badges
- Completion progress
- Right guidance panel
- Description, Guidance, Example display

---

### Phase 12: Requirements Registry

Goal:

```text
Allow users to create and manage basic requirements.
```

Tasks:

- Create FR/NFR API
- Generate requirement ID
- Set priority
- Add acceptance criteria
- Requirement list UI
- Requirement form UI

---

### Phase 13: Traceability Links

Goal:

```text
Allow users to connect requirements to basic artefacts.
```

Tasks:

- Create use case placeholder
- Create design element placeholder
- Create test case placeholder
- Create traceability link API
- Show linked artefacts
- Show missing links

---

### Phase 14: Basic Doc-Linter

Goal:

```text
Check missing sections, weak requirements, and broken traceability.
```

Tasks:

- Required section check
- Requirement priority check
- Acceptance criteria check
- Use case link check
- Design element link check
- Test case link check
- Validation result storage
- Readiness score calculation
- Validation dashboard UI

---

### Phase 15: Demo Data and Polish

Goal:

```text
Prepare the system for demonstration.
```

Tasks:

- Add sample project
- Add sample requirements
- Add one complete requirement
- Add one incomplete requirement
- Confirm validation warnings
- Polish UI labels
- Test main workflow
- Fix obvious bugs

## Agent Coordination Rules

- One agent edits at a time.
- Claude plans and reviews.
- Codex implements phase by phase.
- Antigravity runs, tests, reviews UI, and controls the full workspace.
- Do not let multiple agents edit the same files at the same time.
- Commit after each working phase.
- Do not skip phases.
- Do not build future features early.
- Do not rename profiles.
- Do not rename template codes.
- Do not create a custom rule builder.
- Do not make Academic profile university-specific.
- Do not read DOCX or PDF templates at runtime.
- Use database seed data for templates.

## First Milestone Acceptance Criteria

The 30 percent implementation is acceptable when:

```text
A user can register.
A user can log in.
A user can create a project.
A user can select a documentation profile.
A user can preview a template.
A user can create a document from the template.
A user can edit document sections.
A user can create requirements.
A user can link requirements to simple artefacts.
A user can run validation.
A user can see validation results and readiness score.
```

## Final Note

This 30 percent implementation plan is milestone-specific.

It should not be mixed into the permanent template package.

The permanent template configuration is stored in:

```text
docs/template-package/devdoc-template-package-v1.md
```
