# DevDoc System Instruction Manual

## 1. Purpose

DevDoc is a web-based software documentation and project knowledge management platform.

The system helps a user create a project, generate structured documents from approved templates, edit document sections, manage use cases and requirements, create traceability links, generate basic diagrams, and run validation checks against the project knowledge base.

DevDoc is not designed as a plain text editor. It stores project knowledge as structured data. Documents, document sections, use cases, requirements, traceability links, validation runs, and validation results are separate records that can be connected and checked.

## 2. Core Concept

The central idea is a structured project workspace.

Each project can contain:

- Documents created from approved templates.
- Document sections copied from template sections.
- Use cases that describe user goals and scenarios.
- Functional and non-functional requirements.
- Design elements and test cases.
- Code modules — files in the connected codebase, linked to a design element or requirement so drift between documentation and code can be detected. [ADDED 2026-07-21 — confirmed in scope; see `project-control/prds/00-PRD-master-scope.md` Module 5 and `project-control/prds/04-PRD-api-comms-ai.md` §4.4. Already present as a `TraceableType` in §10 below — this line was the one place the narrative hadn't caught up to the enum.]
- Traceability links between use cases, requirements, document sections, design elements, code modules, and test cases.
- Validation runs that check project completeness and traceability.
- Diagram outputs derived from structured project data.

The system flow is:

```text
Account access
-> Project workspace
-> Template library
-> Document creation
-> Section editing
-> Use case registry
-> Requirements registry
-> Traceability matrix
-> Doc-Linter validation
-> Readiness review
```

## 3. Technology Stack

Frontend:

- React
- Vite
- Tailwind CSS
- React Router

Backend:

- Node.js
- Express
- Prisma
- PostgreSQL

Authentication:

- JWT access tokens
- Password hashing with bcrypt-compatible hashing

Development and verification:

- npm
- Prisma CLI
- Thunder Client or Postman
- pgAdmin
- Brave or another modern browser

## 4. Repository Structure

The project is split into frontend, backend, and documentation areas.

```text
DevDoc/
  backend/
    prisma/
      schema.prisma
      seed.js
      migrations/
    src/
      controllers/
      data/
      middleware/
      routes/
      services/
      utils/
      validators/

  frontend/
    src/
      components/
      context/
      hooks/
      layouts/
      pages/
      services/

  project-control/          [UPDATED 2026-07-21]
    foundations/
    prds/
    skills/
    testing/
    frontend-rebuild/
    templates/
```

> **[UPDATED 2026-07-21]** The old `docs/project-control/` (implementation roadmap, agent-coordination-rules, an earlier copy of the master context) and `docs/template-package/` have been declared void. `project-control/` now lives at the repo root, alongside `backend/` and `frontend/` — see its own `README.md` for the full layout. If those old `docs/` paths still exist on disk, they're historical only; nothing in this manual or `project-control/` treats them as current.

Backend responsibilities:

- Expose REST APIs.
- Validate incoming request bodies.
- Enforce authentication and ownership.
- Implement business logic in services.
- Read and write PostgreSQL through Prisma.
- Seed the approved template package.

Frontend responsibilities:

- Render authenticated and public routes.
- Send and receive the httpOnly authentication cookie.
- Call backend APIs through service modules.
- Provide project, editor, registry, traceability, diagram, and validation screens.
- Keep internal database fields hidden from normal UI.

Documentation responsibilities:

- Define project scope and rules — see `project-control/prds/00-PRD-master-scope.md`.
- Define implementation order — see `project-control/prds/00-PRD-master-scope.md` §10 (the sprint roadmap).
- Define the official template package — see `project-control/foundations/devdoc-template-package-v1.md`.
- Explain operational and technical behavior — this manual.

## 5. Runtime Architecture

DevDoc runs as two local applications.

```text
Browser
  |
  | HTTP requests with httpOnly auth cookie
  v
React + Vite frontend
  |
  | REST API calls
  v
Node.js + Express backend
  |
  | Prisma Client
  v
PostgreSQL database
```

The frontend never talks directly to the database. All data access goes through backend API routes.

The backend uses Prisma as the only database access layer. Business logic belongs in service files, not directly inside route files.

## 6. Environment Configuration

Backend environment:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/devdoc_db?schema=public"
JWT_SECRET=replace-this-with-a-real-32-character-random-secret
```

Frontend environment:

```env
VITE_API_URL=http://localhost:5000
```

Rules:

- Real `.env` files stay local.
- `backend/.env` must not be committed.
- The frontend uses `VITE_API_URL` to reach the backend.
- The backend uses `FRONTEND_URL` for CORS.
- The backend uses `JWT_SECRET` for token verification.

## 7. Installation and Startup

Backend:

```powershell
cd backend
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Frontend:

```powershell
cd frontend
npm install
npm run dev
```

Local URLs:

```text
Frontend: http://localhost:5173
Backend:  http://localhost:5000
Health:   http://localhost:5000/health
```

Expected health response:

```json
{
  "status": "ok",
  "service": "DevDoc API"
}
```

## 8. How the System Was Built

DevDoc was built as a controlled vertical slice instead of a full platform all at once.

The implementation order was:

```text
1. Project foundation
2. Prisma and database schema
3. Template package seed data
4. Authentication backend
5. Authentication frontend
6. Project workspace backend
7. Project workspace frontend
8. Template library backend
9. Template library frontend
10. Create document from template
11. Structured document editor backend
12. Structured document editor frontend
13. Requirements registry
14. Traceability links
15. Basic Doc-Linter validation
16. Demo and UI polish
17. Use case registry
18. Expanded traceability
19. Use case validation checks
20. Diagram support and workbench UI improvements
```

This order proves the main workflow before expanding into advanced modules.

The guiding implementation principle is:

```text
Build one complete working workflow first.
Keep every feature connected to the workflow.
Avoid unrelated feature expansion until the workflow is stable.
```

## 9. Approved Documentation Model

DevDoc uses three approved documentation profiles:

1. Standard Software Documentation Profile
2. Academic Project Profile
3. Company Software Documentation Profile

DevDoc uses four approved document types:

1. `SCOPE`
2. `SRS`
3. `SDS`
4. `STP`

The official template package is:

```text
project-control/foundations/devdoc-template-package-v1.md
```

> **[UPDATED 2026-07-21]** Previously at `docs/template-package/devdoc-template-package-v1.md` — that path is void, content moved. The file also now carries a verified implementation-status section (checked directly against the live schema and seed data) — worth reading alongside this manual, not just the original spec.

The template package controls:

- Profile names
- Profile codes
- Template names
- Template codes
- Document type codes
- Section lists
- Required and optional flags
- Validation tags
- ERD placement rules
- Seed data direction
- Frontend display rules

Runtime rule:

```text
Templates are loaded from database seed data.
The app does not read DOCX or PDF templates at runtime.
```

## 10. Database Design

The Prisma schema defines the structured data model.

Main entities:

- `User`
- `Project`
- `ValidationProfile`
- `Template`
- `TemplateSection`
- `Document`
- `DocumentSection`
- `BusinessObjective`
- `UseCase`
- `Requirement`
- `DesignElement`
- `TestCase`
- `TraceabilityLink`
- `ValidationRule`
- `ValidationRun`
- `ValidationResult`
- `ActivityLog`

Main enum groups:

- `DocumentType`: `SCOPE`, `SRS`, `SDS`, `STP`
- `RequirementType`: `FR`, `NFR`
- `RequirementPriority`: `HIGH`, `MEDIUM`, `LOW`
- `RequirementStatus`: `PROPOSED`, `APPROVED`, `IMPLEMENTED`, `VERIFIED`
- `DocumentStatus`: `DRAFT`, `IN_PROGRESS`, `COMPLETE`
- `SectionStatus`: `EMPTY`, `IN_PROGRESS`, `COMPLETE`
- `ValidationSeverity`: `ERROR`, `WARNING`, `INFO`
- `TraceableType`: `BUSINESS_OBJECTIVE`, `USE_CASE`, `REQUIREMENT`, `DOCUMENT_SECTION`, `DESIGN_ELEMENT`, `TEST_CASE`, `CODE_MODULE`
- `ValidationRunStatus`: `RUNNING`, `COMPLETED`, `FAILED`

Important relationship rules:

- A user owns projects.
- A project can have one validation profile.
- A profile has templates.
- A template has template sections.
- A document belongs to a project and a template.
- A document has document sections.
- A requirement belongs to a project.
- A use case belongs to a project.
- A traceability link belongs to a project and connects typed artefacts.
- A validation run belongs to a project.
- A validation result belongs to a validation run.

Important uniqueness rules:

- User email is unique.
- Validation profile code is unique.
- Template code is unique.
- Template section number is unique per template.
- Document section number is unique per document.
- Requirement code is unique per project.
- Use case code is unique per project.
- Traceability links are unique by project, source, target, and link type.

## 11. Authentication Model

Authentication is token-based.

Flow:

```text
Register or login
-> Backend validates credentials
-> Backend sets JWT in an httpOnly cookie and returns the user
-> Frontend sends requests with credentials included
-> Backend middleware verifies the cookie token
-> Backend fetches current user
-> Protected routes continue or return 401
```

Frontend storage rule:

```text
Authentication tokens are not stored in localStorage.
Theme, language, and notification preferences may use localStorage.
```

JWT payload rule:

```text
The token payload contains only userId.
```

Security rules:

- Password hashes are never returned.
- Tokens are not stored in the database.
- JWTs are not exposed to frontend JavaScript.
- Protected routes require a valid token.
- Resource ownership is checked in service queries.

## 12. Backend Layering

Backend files follow this pattern:

```text
routes -> controllers -> validators/services -> Prisma
```

Routes:

- Define URL paths.
- Attach middleware.
- Call controller functions.

Controllers:

- Read request parameters and body.
- Call validators where needed.
- Call services.
- Convert service errors into HTTP responses.

Validators:

- Perform hand-written validation.
- Return normalized values.
- Return field-level errors.

Services:

- Enforce ownership.
- Implement business rules.
- Run transactions.
- Query and update data through Prisma.

Middleware:

- Handles authentication.
- Attaches the current user to the request.

Utilities:

- Shared Prisma client.
- Token helpers.

## 13. Backend API Map

Auth:

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Projects:

```text
POST /api/projects
GET  /api/projects
GET  /api/projects/:id
PUT  /api/projects/:id
```

Templates:

```text
GET /api/templates/profiles
GET /api/templates/profiles/:profileCode/templates
GET /api/templates/:templateCode
GET /api/templates/:templateCode/sections
```

Documents:

```text
POST /api/projects/:projectId/documents/from-template
GET  /api/projects/:projectId/documents/:documentId
PUT  /api/projects/:projectId/documents/:documentId/sections/:sectionId
```

Requirements:

```text
GET  /api/projects/:projectId/requirements
POST /api/projects/:projectId/requirements
POST /api/projects/:projectId/requirements/from-section
GET  /api/projects/:projectId/requirements/:requirementId
PUT  /api/projects/:projectId/requirements/:requirementId
```

Use cases:

```text
GET  /api/projects/:projectId/use-cases
POST /api/projects/:projectId/use-cases
GET  /api/projects/:projectId/use-cases/:useCaseId
PUT  /api/projects/:projectId/use-cases/:useCaseId
```

Design elements:

```text
GET    /api/projects/:projectId/design-elements
POST   /api/projects/:projectId/design-elements
GET    /api/projects/:projectId/design-elements/:designElementId
PUT    /api/projects/:projectId/design-elements/:designElementId
DELETE /api/projects/:projectId/design-elements/:designElementId
```

Test cases:

```text
GET    /api/projects/:projectId/test-cases
POST   /api/projects/:projectId/test-cases
GET    /api/projects/:projectId/test-cases/:testCaseId
PUT    /api/projects/:projectId/test-cases/:testCaseId
DELETE /api/projects/:projectId/test-cases/:testCaseId
```

Traceability:

```text
GET    /api/projects/:projectId/traceability
GET    /api/projects/:projectId/traceability/options
POST   /api/projects/:projectId/traceability
PATCH  /api/projects/:projectId/traceability/:linkId/verify
DELETE /api/projects/:projectId/traceability/:linkId
```

Validation:

```text
POST /api/projects/:projectId/validation/run
GET  /api/projects/:projectId/validation/runs
GET  /api/projects/:projectId/validation/runs/:runId
```

Diagrams:

```text
Project diagram routes are mounted under:
/api/projects/:projectId/diagrams
```

Health:

```text
GET /health
```

## 14. Frontend Route Map

Public routes:

```text
/
/login
/register
```

Authenticated routes:

```text
/dashboard
/profile
/settings
/help
/docs
/about
```

Project routes:

```text
/projects/:id
/projects/:id/documents
/projects/:id/documents/:documentId
/projects/:id/templates
/projects/:id/use-cases
/projects/:id/requirements
/projects/:id/design-elements
/projects/:id/test-cases
/projects/:id/traceability
/projects/:id/validation
/projects/:id/diagrams
/projects/:id/versions
/projects/:id/analytics
/projects/:id/settings
```

Frontend route structure:

- `AppShell` wraps authenticated routes.
- `ProjectShell` wraps project-scoped routes.
- `ProjectSidebar` provides project navigation.
- `TopBar` provides persistent global navigation and account controls.
- Page components handle their own loading, empty, and error states.

## 15. Frontend State and Services

Frontend service files wrap API calls:

- `authService.js`
- `projectService.js`
- `templateService.js`
- `documentService.js`
- `requirementService.js`
- `useCaseService.js`
- `traceabilityService.js`
- `validationService.js`
- `diagramService.js`

Shared API behavior:

- Uses `fetch`.
- Reads `VITE_API_URL`.
- Sends JSON when a request body exists.
- Sends cookies with `credentials: "include"`.
- Parses backend error shape.
- Throws errors with status and optional field errors.

Context providers:

- `AuthContext` controls user bootstrapping, login, register, logout.
- `ProjectContext` shares loaded project data inside project routes.
- `NotificationContext` provides frontend toast notifications.
- `ThemeContext` controls light, dark, and system theme behavior.
- `LanguageContext` stores frontend language preference.

## 16. Main User Workflow

### 16.1 Account Access

The user registers or logs in.

On success:

- Backend returns a user and token.
- Frontend stores the token.
- Frontend loads `/api/auth/me` during app boot if a token exists.
- The user is sent to the dashboard.

### 16.2 Project Creation

The user creates a project from the dashboard.

Supported backend fields:

- `name`
- `description`

The project belongs to the authenticated user.

### 16.3 Project Workspace

The project workspace is the main hub for:

- Templates
- Documents
- Use cases
- Requirements
- Traceability
- Validation
- Diagrams
- Future project tools

### 16.4 Template Browsing

The user opens the template library.

Flow:

```text
Load profiles
-> Select profile
-> Load profile templates
-> Select template
-> Load template sections
-> Preview required and optional sections
```

The selected profile in the UI is local until document creation. Template data comes from seeded database records.

### 16.5 Document Creation

The user creates a document from a selected template.

Backend behavior:

- Verifies project ownership.
- Finds active template by exact template code.
- Checks project profile compatibility.
- Creates a document.
- Copies template sections into document sections.
- Preserves section number, title, required flag, validation tag, guidance, example, placeholder, and display order.
- Sets document status to `DRAFT`.
- Sets completion percent to `0`.

### 16.6 Document Editing

The editor loads a document and its sections.

Editor layout:

```text
Left rail: section list and progress
Center: paper-style section editor
Right panel: guidance, validation placeholder, linked artefacts placeholder
```

Saving a section:

- Sends `content` to the backend.
- Backend stores content.
- Backend sets section status:
  - `EMPTY` if content is null or blank after trimming.
  - `COMPLETE` if content has meaningful text.
- Backend recalculates document completion.
- Backend updates document status:
  - `DRAFT` at 0 percent.
  - `IN_PROGRESS` between 1 and 99 percent.
  - `COMPLETE` at 100 percent.

Completion formula:

```text
completed required sections / total required sections * 100
```

If a document has no required sections, all sections are used for completion.

### 16.7 Use Case Registry

Use cases capture user goals or scenarios.

Use case code generation:

```text
UC-001
UC-002
UC-003
```

Rules:

- Codes are generated by the backend.
- Code generation is per project.
- Codes are not editable by the user.
- Title is required.
- Description is optional.

### 16.8 Requirements Registry

Requirements capture functional and non-functional needs.

Requirement types:

- `FR`
- `NFR`

Requirement code generation:

```text
FR-001
FR-002
NFR-001
NFR-002
```

Rules:

- Codes are generated by the backend.
- Code generation is per project and per requirement type.
- Codes are not editable by the user.
- Type is not changed after creation.
- Status defaults to `PROPOSED`.
- Priority can be `HIGH`, `MEDIUM`, `LOW`, or empty.

### 16.9 Traceability Matrix

Traceability links connect project artefacts.

Supported link types:

```text
USE_CASE -> REQUIREMENT        linkType: covers
USE_CASE -> DOCUMENT_SECTION   linkType: described_by
REQUIREMENT -> DOCUMENT_SECTION linkType: described_by
REQUIREMENT -> DESIGN_ELEMENT  linkType: implemented_by
REQUIREMENT -> TEST_CASE       linkType: verified_by
```

Rules:

- Both source and target must belong to the same project.
- The project must belong to the authenticated user.
- Duplicate links are rejected.
- Unsupported source-target combinations are rejected.
- Deleting a link removes only the traceability record.

### 16.10 Doc-Linter Validation

The validation engine runs project-level checks and stores the results.

Validation flow:

```text
Create ValidationRun as RUNNING
-> Load active ValidationRule rows for the project profile
-> Load documents, sections, requirements, use cases, design elements, test cases, and traceability links
-> Execute validation checks by checkKey
-> Calculate readiness score and metrics
-> Save ValidationResult rows
-> Mark ValidationRun as COMPLETED
```

If an unexpected error occurs after run creation, the run is marked `FAILED` when possible.

### 16.11 Diagram Workspace

The diagram workspace provides project diagram support.

Current diagram direction:

- Generate project-level visual output from structured data.
- Support copying or downloading generated diagram content.
- Keep diagram generation project-scoped.

The diagram module must not change project records unless an explicit save feature is added.

## 17. Validation Rules

The current validation engine uses `ValidationRule` rows as the live rule source. The service maps each rule's `checkKey` to a code check and uses the database row for severity, message, and suggested fix.

Implemented checks:

### DOC-001

Project has at least one document.

If no documents exist:

- Severity: `ERROR`
- Suggested fix: create a document from the Template Library.

### REQ-001

Project has at least one requirement.

If no requirements exist:

- Severity: `WARNING`
- Suggested fix: add requirements in the Requirements Registry.

### UC-001

Project has at least one use case.

If no use cases exist:

- Severity: `WARNING`
- Suggested fix: add use cases.

### SEC-001

Required document sections should not be empty.

For each empty required section:

- Severity: `ERROR`
- Target type: `DOCUMENT_SECTION`
- Suggested fix: complete the required section in the editor.

### TRC-001

Each requirement should have at least one traceability link.

For each unlinked requirement:

- Severity: `WARNING`
- Target type: `REQUIREMENT`
- Suggested fix: link the requirement in the Traceability Matrix.

### UC-002

Each use case should cover at least one requirement.

For each use case without a `covers` link to a requirement:

- Severity: `WARNING`
- Target type: `USE_CASE`

### UC-003

Each use case should be described by at least one document section.

For each use case without a `described_by` link to a document section:

- Severity: `INFO`
- Target type: `USE_CASE`

### REQ-002

Functional requirements should be covered by a use case.

For each `FR` without a use-case coverage link:

- Severity: `WARNING`
- Target type: `REQUIREMENT`

### DOC-002

Document completion below 100 percent.

Incomplete documents are collapsed into one summary result:

- Severity: `INFO`
- Suggested fix: complete remaining required sections.

### TRC-002

Traceability links should not point to missing artefacts.

Broken references produce:

- Severity: `ERROR`
- Suggested fix: remove the broken link and create a valid one.

### TRC-003

Traceability links should be re-verified after linked artefacts change.

For each stale link:

- Severity: `WARNING`
- Suggested fix: review the link and click Re-verify if it is still correct.

### REQ-003

Functional requirements should be linked to implementing design elements.

### REQ-004

Functional requirements should be linked to verifying test cases.

### QUA-001, QUA-002, QUA-003

Requirement quality checks flag vague wording, missing acceptance criteria, and FR descriptions without a `shall` statement.

> **[NOTE 2026-07-21]** These three are deterministic, pattern-based checks — part of today's Doc-Linter, no AI involved. There's a separate, planned AI-based quality layer for the same general area (semantic ambiguity review, not just keyword/pattern matching) — see `project-control/prds/04-PRD-api-comms-ai.md` §4.1, Module 4 row. That's future work, sequenced after Sprint 6; QUA-001/2/3 are real and running today.

## 18. Readiness Score

The readiness score is calculated from weighted coverage metrics:

```text
sectionCompletion = completed required sections / required sections
reqTraced = requirements with at least one link / requirements
frCovered = FRs covered by use cases / FRs
frImplemented = FRs linked to design elements / FRs
frVerified = FRs linked to test cases / FRs
```

Formula:

```text
readinessScore = round(100 * (0.30*sectionCompletion + 0.25*reqTraced + 0.20*frCovered + 0.15*frImplemented + 0.10*frVerified))
```

Interpretation:

- High score means the project has fewer blocking documentation issues.
- Errors indicate missing required structure or broken links.
- Warnings indicate incomplete coverage or missing supporting artefacts.
- Info results are advisory and do not lower the score.

> **[NOTE 2026-07-21]** `project-control/prds/02-PRD-backend.md` §8 shows a "show your work" example response with different illustrative weights (0.20/0.30/0.20/0.15/0.15) — that example was written to demonstrate the *shape* of a transparent formula response, not to restate these actual weights. This manual's numbers above (0.30/0.25/0.20/0.15/0.10) are the real, current ones. If the two ever need to match exactly, fix the PRD's example, not this file.

## 19. UI Design Rules

The UI is designed as a developer workbench.

Primary layout:

- Persistent top command bar.
- Project sidebar for project-scoped pages.
- Workbench-style cards and panels.
- Compact navigation.
- Clear light and dark themes.

Editor layout:

```text
Left: section rail
Center: document section editor
Right: guidance and helper panel
```

Traceability layout:

```text
Relationship mode selector
-> grid, builder, graph, and audit views
-> source and target artefacts by selected relationship
-> re-verification for stale links
```

Validation layout:

```text
Readiness summary
-> run validation action
-> severity summaries
-> validation results
-> run history
```

## 20. Hidden Internal Fields

Normal users should not see these values as primary UI text:

```text
database IDs
owner IDs
validationTag
templateCode
profileCode
raw validation IDs
```

Allowed user-facing codes:

```text
FR-001
NFR-001
UC-001
SCOPE
SRS
SDS
STP
```

Reason:

- Requirement and use case codes are business-facing identifiers.
- Document type codes are approved user-facing document labels.
- Database IDs and backend validation tags are implementation details.

## 21. Ownership and Security Rules

Every project-scoped backend operation must verify ownership.

Examples:

- A project must have `ownerId` equal to the authenticated user ID.
- A document must belong to a project owned by the user.
- A requirement must belong to a project owned by the user.
- A use case must belong to a project owned by the user.
- A traceability link must belong to a project owned by the user.
- A validation run must belong to a project owned by the user.

Unauthorized or cross-project access should return:

```text
404 for missing or not-owned resources
401 for missing or invalid authentication
```

This prevents users from discovering whether another user's resource exists.

## 22. Validation and Error Response Shape

Normal error:

```json
{
  "error": {
    "message": "Some message"
  }
}
```

Validation error:

```json
{
  "error": {
    "message": "Validation failed",
    "fields": {
      "title": "Title is required"
    }
  }
}
```

Frontend rule:

- Show field errors beside fields when available.
- Show general errors as panel or inline messages.
- Redirect to login on 401.
- Show "not found" pages for 404 project-scoped resources.

## 23. Template and ERD Rules

ERD belongs in design documents only.

ERD is allowed in:

```text
STD_SDS
ACAD_SDS
COMP_SDS
```

ERD is not included in:

```text
Scope documents
SRS documents
STP documents
```

SRS may contain data requirements, but not a full ERD.

STP may contain database tests, but not a full ERD.

## 24. Current Functional Modules

### Authentication

Provides registration, login, logout, and current user loading.

### Dashboard

Shows project list, project search, project creation, and recent project activity.

### Project Workspace

Provides project context and navigation to the project tools.

### Template Library

Loads profiles, templates, and template sections for preview.

### Document Creation

Creates a document and document sections from a selected template.

### Document Editor

Allows section-by-section editing and document progress tracking.

### Use Case Registry

Creates and updates use cases with generated `UC` codes.

### Requirements Registry

Creates and updates requirements with generated `FR` and `NFR` codes.

### Design Element Registry

Creates and updates design elements with generated `DE` codes.

### Test Case Registry

Creates and updates test cases with generated `TC` codes.

### Traceability Matrix

Creates, removes, visualizes, and re-verifies supported traceability links.

### Doc-Linter Validation

Runs profile-based rule checks, stores validation history, and displays readiness score.

### Diagram Workspace

Provides project diagram support based on structured project data.

## 25. Build and Verification Commands

Backend validation:

```powershell
cd backend
npx prisma validate
```

Seed database:

```powershell
cd backend
npx prisma db seed
```

Run backend:

```powershell
cd backend
npm run dev
```

Build frontend:

```powershell
cd frontend
npm run build
```

Run frontend:

```powershell
cd frontend
npm run dev
```

## 26. Manual Test Checklist

Account:

- Register a user.
- Log in.
- Refresh while logged in.
- Log out.
- Visit protected route while logged out.

Project:

- Create a project.
- View project on dashboard.
- Open project workspace.
- Confirm another user cannot access the project.

Templates:

- Open Template Library.
- Load profiles.
- Select a profile.
- Select a template.
- Preview sections.

Document:

- Create a document from template.
- Open editor.
- Select section.
- Save content.
- Confirm section status changes.
- Confirm completion updates.
- Refresh and confirm saved content persists.

Use cases:

- Create use case.
- Confirm `UC-001` code.
- Edit title or description.
- Refresh and confirm persistence.

Requirements:

- Create `FR`.
- Create `NFR`.
- Confirm generated codes.
- Update priority and status.
- Refresh and confirm persistence.

Design elements:

- Create a design element.
- Confirm generated `DE-001` code.
- Refresh and confirm persistence.

Test cases:

- Create a test case.
- Confirm generated `TC-001` code.
- Update status.
- Refresh and confirm persistence.

Traceability:

- Open Traceability Matrix.
- Link use case to requirement.
- Link use case to document section.
- Link requirement to document section.
- Link requirement to design element.
- Link requirement to test case.
- Re-verify a link.
- Remove a link.
- Confirm duplicate links are rejected.

Validation:

- Run validation.
- Confirm readiness score appears.
- Confirm results are grouped or sorted by severity.
- Fix one issue.
- Run validation again.
- Confirm readiness score changes.

Diagrams:

- Open Diagrams page.
- Generate available project diagram output.
- Copy or download diagram content if the UI offers those actions.

## 27. Current Limitations

Current implementation intentionally does not include:

- Full export package generation.
- Full TipTap rich text editing workflow.
- Custom validation rule builder.
- Real-time collaboration.
- Enterprise team permission model.
- Advanced version comparison.
- Full, automatic source-repository scanning (crawling an entire repo without the user pointing at specific files). [CORRECTED 2026-07-21 — this line previously read "Full source repository integration" as a blanket exclusion. That's no longer accurate: user-directed code-module linking with git-based staleness detection is confirmed in scope, just built in two tiers so it doesn't cross into automatic whole-repo crawling. See `project-control/prds/04-PRD-api-comms-ai.md` §4.4 and `project-control/prds/03-PRD-database.md` §7.4 for what's actually planned. What's still excluded is the specific thing this line originally meant: DevDoc does not walk an entire connected repository on its own.]

These are outside the current core workflow and should be implemented only after the structured documentation workflow remains stable.

## 28. Conceptual Rules for Future Work

Future work must preserve these rules:

1. Keep project data structured.
2. Do not turn DevDoc into only a plain text editor.
3. Preserve approved profile names and document type codes.
4. Keep template data seeded in the database.
5. Keep backend logic inside services.
6. Keep request validation explicit and simple.
7. Enforce project ownership on every project-scoped operation.
8. Keep internal IDs and backend tags out of normal UI.
9. Add new features through clear, testable workflow slices.
10. Run backend and frontend checks before accepting changes.
11. AI is real, planned scope for every module — not something to avoid, but always sequenced *after* a module's deterministic core exists and works on its own. [ADDED 2026-07-21] Never build an AI layer as a substitute for a feature that doesn't exist yet underneath it. See `project-control/prds/04-PRD-api-comms-ai.md` §4.1 for the per-module plan and `project-control/prds/00-PRD-master-scope.md` §10 (Sprint 7) for when it happens.

## 29. Operational Recovery Notes

If the frontend fails:

- Check browser console.
- Check Vite terminal output.
- Run `npm run build`.
- Confirm `VITE_API_URL` points to the backend.

If the backend fails:

- Check terminal output.
- Run `npx prisma validate`.
- Confirm `DATABASE_URL` is correct.
- Confirm PostgreSQL is running.
- Confirm migrations are applied.

If authentication fails:

- Confirm `JWT_SECRET` exists.
- Confirm the browser receives the auth cookie from login/register.
- Confirm frontend requests include credentials.
- Confirm `/api/auth/me` works after login.

If seeded templates are missing:

- Run `npx prisma db seed`.
- Confirm profiles, templates, and template sections exist.
- Confirm validation rules are seeded for each approved profile.

If validation output seems wrong:

- Confirm documents exist.
- Confirm document sections have content.
- Confirm use cases and requirements exist.
- Confirm traceability links are present.
- Run a new validation run after changes.

## 30. Final System Summary

DevDoc is a structured documentation workbench.

It stores project documentation as connected records:

```text
Project
-> Documents
-> Document Sections
-> Use Cases
-> Requirements
-> Design Elements
-> Code Modules
-> Test Cases
-> Traceability Links
-> Validation Runs
-> Validation Results
```

The system is designed to prove that software documentation can be created, edited, connected, and checked as structured project knowledge.

The current completed workflow is:

```text
Register or log in
-> create project
-> browse templates
-> create document
-> edit sections
-> create use cases
-> create requirements
-> create design elements and test cases
-> link artefacts
-> run validation
-> review readiness
```

That workflow is the foundation for every future module.
