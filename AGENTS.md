# DevDoc AI Agent Instructions

## Project Identity

DevDoc is a web-based software documentation and project knowledge management platform.

It helps users create, manage, validate, and connect software project documentation.

DevDoc is not only a document editor. It stores project knowledge as structured data so requirements, documents, design elements, test cases, validation results, and traceability links can stay connected.

---

# 1. Required Reading

Before editing code, every AI agent must read these files:

```text
AGENTS.md
docs/project-control/devdoc-master-context.md
docs/project-control/devdoc-implementation-roadmap.md
docs/project-control/devdoc-30-percent-implementation-plan.md
docs/project-control/devdoc-agent-coordination-rules.md
docs/template-package/devdoc-template-package-v1.md
```

If any of these files are missing, pause implementation and report the missing file.

---

# 2. Source of Truth

Use this priority order if files conflict:

1. `AGENTS.md`
2. `docs/project-control/devdoc-master-context.md`
3. `docs/template-package/devdoc-template-package-v1.md`
4. `docs/project-control/devdoc-30-percent-implementation-plan.md`
5. `docs/project-control/devdoc-implementation-roadmap.md`
6. Current codebase

---

# 3. Approved Project Scope

The first implementation must focus on one complete working workflow:

```text
User registers/logs in
→ creates a project
→ selects documentation profile
→ opens template library
→ previews a template
→ creates document from template
→ edits document sections
→ creates requirements
→ links requirements to artefacts
→ runs validation
→ views validation result
```

Do not build the full platform at once.

---

# 4. Approved Profiles

Use only these three profiles:

1. Standard Software Documentation Profile
2. Academic Project Profile
3. Company Software Documentation Profile

Do not rename these profiles.

Do not add new profiles without approval.

Do not make the Academic profile university-specific.

---

# 5. Approved Document Types

Use only these document types:

1. `SCOPE`
2. `SRS`
3. `SDS`
4. `STP`

Do not rename document type codes.

---

# 6. Approved Template Package

The official template package is:

```text
docs/template-package/devdoc-template-package-v1.md
```

This file controls:

- Profile names
- Profile codes
- Template names
- Template codes
- Document type codes
- Section lists
- Required/optional flags
- Validation tags
- ERD placement rules
- Frontend display rules
- Seed-data direction

Templates must be loaded from database seed data.

The app must not read DOCX or PDF template files at runtime.

---

# 7. Approved Technology Stack

## Frontend

- React
- Vite
- Tailwind CSS

## Backend

- Node.js
- Express.js
- Prisma
- PostgreSQL

## Authentication

- JWT
- bcrypt

## Testing and Tools

- Thunder Client or Postman
- pgAdmin
- Git / GitHub
- Brave Browser

## Diagrams Later

- PlantUML
- Mermaid

## Traceability UI Later

- React Flow

---

# 8. Important Scope Limits

Do not build these in the first implementation milestone:

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

These can be mentioned as future work only.

---

# 9. Agent Roles

## Antigravity

Antigravity is the main workspace and control room.

Use Antigravity to:

- Open the project
- Inspect files
- Run frontend
- Run backend
- Check terminal errors
- Review UI
- Test workflow
- Coordinate the local environment

Antigravity should not build the entire project at once.

## Claude Code

Claude is the architect, planner, and reviewer.

Use Claude to:

- Analyze structure
- Review architecture
- Review phase plans
- Identify risks
- Check consistency
- Review Codex changes

Claude should not implement multiple phases at once.

## Codex

Codex is the implementation worker.

Use Codex to:

- Create files
- Write backend code
- Write frontend code
- Implement one phase at a time
- Fix bugs
- Create seed data
- Add API routes
- Add UI pages

Codex must list files before editing.

## Gemini / Google AI inside Antigravity

Gemini can help explain errors, inspect UI behavior, and suggest small fixes.

Gemini must not rewrite the whole system independently.

---

# 10. Editing Rules

Before editing, the agent must say:

```text
Files I will create or modify:
1. ...
2. ...
3. ...
```

During editing, the agent must:

- Work only on the approved phase
- Avoid unrelated cleanup
- Avoid deleting user files
- Avoid changing `.env` unless asked
- Avoid adding unnecessary packages
- Keep code beginner-readable
- Keep structure clean and modular

After editing, the agent must report:

```text
What changed:
1. ...
2. ...

How to test:
1. ...
2. ...

Known risks:
1. ...
```

---

# 11. Phase Order

Follow this order:

```text
Phase 0: Project Foundation
Phase 1: Prisma and Database Schema
Phase 2: Seed Template Package
Phase 3: Authentication Backend
Phase 4: Authentication Frontend
Phase 5: Project Workspace Backend
Phase 6: Project Workspace Frontend
Phase 7: Template Library Backend
Phase 8: Template Library Frontend
Phase 9: Create Document from Template
Phase 10: Structured Document Editor Backend
Phase 11: Structured Document Editor Frontend
Phase 12: Requirements Registry
Phase 13: Traceability Links
Phase 14: Basic Doc-Linter
Phase 15: Demo Data and Polish
```

Do not skip phases.

If a phase depends on missing earlier work, pause and report the dependency.

---

# 12. Frontend UI Rules

The UI should be simple, clean, and easy to understand.

Use these user-facing labels:

```text
Description
Guidance
Example
Required
Optional
Validation Issues
Linked Artefacts
```

Do not show these backend fields to normal users:

```text
validationTag
ruleCode
templateCode
profileCode
database IDs
```

The structured editor should follow this layout:

```text
Left Panel:
Document sections and completion status

Center Panel:
Editor area

Right Panel:
Description, Guidance, Example, validation issues, and linked artefacts
```

---

# 13. Backend Structure Rules

Use a clear backend structure:

```text
routes/
controllers/
services/
middleware/
validators/
utils/
data/
```

Business logic should go into services, not directly into route files.

Validation and Doc-Linter logic should have its own clear area.

Template seed data should go under:

```text
backend/src/data/templates/
```

---

# 14. Database Rules

DevDoc needs structured data, not only plain document text.

The database should support:

- Users
- Projects
- Validation profiles
- Templates
- Template sections
- Documents
- Document sections
- Business objectives
- Use cases
- Requirements
- Design elements
- Test cases
- Traceability links
- Validation rules
- Validation runs
- Validation results
- Activity logs

Use Prisma with PostgreSQL.

---

# 15. ERD Rule

ERD belongs in design documents only.

ERD should be included in:

```text
STD_SDS
ACAD_SDS
COMP_SDS
```

ERD should not be included in Scope, SRS, or STP documents.

SRS may include Data Requirements, but not the full ERD.

STP may include database tests, but not the full ERD.

---

# 16. Git Rules

Commit only after a phase works.

Recommended flow:

```powershell
git status
git add .
git commit -m "clear commit message"
```

Recommended commit messages:

```text
add project control docs
add frontend and backend foundation
add prisma schema
seed template package v1
add authentication backend
add authentication frontend
add project workspace backend
add project workspace frontend
add template library
add structured document editor
add requirements registry
add basic validation engine
```

Do not commit broken code unless the user clearly wants a savepoint.

---

# 17. Testing Rules

After each phase, test only what that phase should provide.

Examples:

## Phase 0

- Frontend runs
- Backend runs
- README instructions work

## Phase 1

- Prisma connects
- Migration runs
- Prisma client generates

## Phase 2

- Profiles are seeded
- Templates are seeded
- Template sections are seeded

## Authentication

- Register works
- Login works
- Protected route blocks unauthenticated user

## Template Library

- Profiles load
- Templates load
- Template preview shows sections

## Editor

- Document opens
- Section saves
- Completion updates

## Validation

- Empty required section creates warning
- Requirement without priority creates warning
- Missing traceability creates warning

---

# 18. Emergency Stop Rules

Pause implementation if:

- An agent wants to rewrite the whole project
- An agent wants to rename approved profiles/templates
- An agent wants to add a custom rule builder
- An agent wants to build full AI generation now
- An agent wants to delete existing project files
- Multiple agents are editing the same files
- The app stops running and the cause is unclear
- The database schema drifts away from the approved project model

When this happens, stop and ask for review.

---

# 19. Safe Agent Prompt Pattern

Use this pattern:

```text
Read these files first:
1. AGENTS.md
2. docs/project-control/devdoc-master-context.md
3. docs/project-control/devdoc-implementation-roadmap.md
4. docs/project-control/devdoc-30-percent-implementation-plan.md
5. docs/project-control/devdoc-agent-coordination-rules.md
6. docs/template-package/devdoc-template-package-v1.md

Task:
[Specific phase/task here]

Rules:
- Work only on this task.
- Do not implement future features.
- Before editing, list files you will create or modify.
- After editing, summarize changes and explain how to test.
```

---

# 20. Final Rule

The goal is controlled, consistent, working progress.

Do not rush.

Do not build everything at once.

Do not let agents overlap.

Build one phase, test it, review it, commit it, then move forward.
