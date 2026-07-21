# DevDoc Master Context

## Project Name

DevDoc

## Project Type

Web-based software documentation and project knowledge management platform.

## Main Idea

DevDoc is a platform that helps users create, manage, validate, and connect software project documentation.

It is not just a normal document editor. It stores project information as structured data so the system can understand relationships between documents, requirements, design, testing, and validation results.

## Main Purpose

The purpose of DevDoc is to make software documentation easier to create, easier to organize, and easier to check.

Many teams write documentation in separate files. Requirements may be written in one document, diagrams in another file, and test cases somewhere else. This causes missing links, weak traceability, repeated work, and confusion during review.

DevDoc solves this by giving users a structured workspace where project documents, requirements, design elements, test cases, validation results, and traceability links can stay connected.

## Core Problem

Software project documentation is often scattered across different files and tools.

This creates problems such as:

- Missing required sections
- Weak requirement quality
- Requirements not linked to design
- Requirements not linked to test cases
- Diagrams and documents not matching
- Manual checking taking too much time
- Review problems discovered too late

## Proposed Solution

DevDoc provides a web-based workspace where users can:

- Create projects
- Select documentation profiles
- Use structured templates
- Write documents section by section
- Manage requirements
- Create traceability links
- Run basic validation checks
- View missing sections and broken links
- Prepare documentation for review

## Main Traceability Chain

The main traceability chain is:

```text
Business Objective → Use Case → Requirement → Design Element → Code Module/File → Test Case
```

For the first implementation, Code Module/File can remain optional or represented as a placeholder.

## Approved Profiles

DevDoc Template Package v1 includes three profiles:

1. Standard Software Documentation Profile
2. Academic Project Profile
3. Company Software Documentation Profile

These names must not be changed without approval.

## Approved Document Types

DevDoc uses four document types:

1. SCOPE
2. SRS
3. SDS
4. STP

## Approved Template Package

The official template package is:

```text
docs/template-package/devdoc-template-package-v1.md
```

Agents must follow this file as the source of truth for profiles, templates, template codes, section lists, required/optional flags, validation tags, and ERD placement.

## Main Technology Stack

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

Testing and tools:

- Thunder Client or Postman
- pgAdmin
- Git / GitHub
- Brave Browser

## Important Scope Decisions

The first implementation should not include:

- Full AI document generation
- Custom rule builder
- Real-time collaboration
- Full GitHub repository scanning
- Marketplace
- Enterprise permission system
- Full IEEE/ISO compliance engine
- AI-generated UML from code
- Full export package generation

> **[UPDATED 2026-07-21]** "Full GitHub repository scanning" still holds as written — DevDoc does not auto-crawl an entire repository. But the user has since confirmed that user-directed code-to-documentation linking and drift detection (see the traceability chain above and `project-control/prds/00-PRD-master-scope.md` Module 5) *is* in scope, built in two tiers to stay on the right side of this line — see `project-control/prds/04-PRD-api-comms-ai.md` §4.4. Tier 1 (a user links a specific file, DevDoc tracks whether it's changed) does not cross this non-goal. Tier 2 (semantic drift-checking across the whole project) would need this line formally revised if it's ever built — it isn't scheduled yet.

These can be future enhancements.

## Core First Workflow

The first strong workflow should be:

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

## Main Modules

### 1. User and Project Workspace Management

Handles account access and project workspaces.

### 2. Documentation Template Library

Stores profiles, templates, and template sections.

### 3. Structured Document Editor

Allows users to write documents section by section.

### 4. Requirements and Artefact Structuring

Allows users to create requirements, use cases, design elements, and test cases.

### 5. Traceability System

Allows users to connect project artefacts.

### 6. Basic Doc-Linter Validation

Checks missing required sections, weak requirements, and broken traceability links.

### 7. Export and Reporting

Prepares documents and reports for review. This can be basic or future work in the first implementation.

## Data Direction

DevDoc should store structured project data, including:

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

## UI Direction

The UI should be simple, clean, and easy to understand.

The structured editor should use this layout:

```text
Left Panel:
Document sections and completion status

Center Panel:
Editor area

Right Panel:
Description, Guidance, Example, validation issues, and linked artefacts
```

Normal users should not see backend fields such as:

```text
validationTag
ruleCode
templateCode
profileCode
database IDs
```

## Agent Rule

All agents must treat this file, AGENTS.md, the implementation roadmap, and the template package as project truth before editing code.

> **[UPDATED 2026-07-21]** The "30 percent implementation plan" referenced above no longer exists — confirmed retired. `AGENTS.md` (repo root) states explicitly: *"The earlier 30 percent implementation milestone is historical and must not restrict current work."* `CLAUDE.md` (repo root) states the same. Both are real files, both verified present, both should be read alongside this one. This file's own reference to that plan is removed above rather than left dangling.

---

## Status & cross-references [ADDED — does not alter anything above]

This section is appended, not blended into the original. Everything above this line is the original master context, unedited.

### Where the rest of the project's working documents live

A `project-control/` folder now exists at the repo root, alongside `backend/` and `frontend/`. It holds PRDs, testing strategy, a frontend rebuild plan, and review/analysis skills. **Per `AGENTS.md` §3 — "do not claim that an authoritative complete baseline exists until the user approves and creates it" — none of `project-control/`'s contents are the complete-project baseline.** They are a proposed working structure, grounded in the actual repo, that the user has not yet declared authoritative. Treat them the way `AGENTS.md` §3 treats the SDS: an important reference, not an unchangeable one.

Priority order when this file, the template package, `project-control/`, and running code disagree — same order `AGENTS.md` §3 already establishes:

1. The user's current instruction
2. Decisions the user has explicitly approved for the current task
3. Current working code, Prisma schema, migrations, API behavior
4. This file, the template package, and `project-control/` as references
5. Anything older as historical context only

### Two open items — now resolved [RESOLVED 2026-07-21]

**1. The traceability chain discrepancy is resolved: `Code Module` is confirmed in scope, not optional.** `project-control/prds/00-PRD-master-scope.md` now includes it in the chain and describes the real feature — user-directed linking between a Design Element and the code that implements it, plus staleness/drift detection, built in two tiers so it doesn't silently expand past the "no full GitHub repository scanning" non-goal above. See PRD 00 Module 5, PRD 04 §4.4, and PRD 03 §7.4 for the full design.

**2. Module numbering is resolved: this is a solo project.** There is no second developer. Every "Dawood" reference across `project-control/` (ownership splits, PRD owner lines, the frontend rebuild plan's owner column) has been corrected to reflect one developer — Hassan — owning all 8 modules. The 8-module, ownership-oriented list in `project-control/prds/00-PRD-master-scope.md` is kept as the canonical one (it's more specific than this file's 7-module capability list), with the understanding that "ownership" now just means "who signs off," not a team split.

### Verified against the real repo (2026-07-21)

The template package (see `devdoc-template-package-v1.md` in this same folder) has already been substantially implemented — profiles, templates, and the section-model schema match the spec closely. See that file's own status section for the specific verified findings, including one real content gap (`exampleText` is null everywhere) and one frontend rule violation (raw `ruleCode` values are rendered to users in `ValidationEngine.jsx` and `SharedReport.jsx`, contradicting this project's own Frontend Display Rules).
