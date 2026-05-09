# DevDoc Agent Coordination Rules

## Purpose

This document defines how Claude Code, Codex, Antigravity, Gemini/Google AI, and the user should work together on the DevDoc project.

The goal is to prevent confusion, overlapping edits, duplicated work, broken files, and inconsistent implementation.

All agents must read this file before making project changes.

---

# 1. Main Rule

Only one agent should edit the project at a time.

Do not allow Claude, Codex, and Antigravity to modify files at the same time.

The safe workflow is:

```text
Plan → Implement → Test → Review → Commit
```

Not:

```text
Everyone edits everything at once
```

---

# 2. Role of Each Agent

## 2.1 User

The user is the final decision maker.

The user decides:

- Which phase starts
- Which agent edits
- Whether changes are accepted
- Whether a commit should happen
- Whether a feature is inside or outside scope

The user should not let any AI agent make big scope decisions alone.

---

## 2.2 Antigravity

Antigravity is the main workspace and control room.

Antigravity should be used for:

- Opening the project
- Viewing folder structure
- Running the frontend
- Running the backend
- Checking terminal errors
- Reviewing UI behavior
- Testing the full workflow
- Coordinating the local development environment

Antigravity should not build the whole project at once.

Antigravity should first read:

```text
AGENTS.md
docs/project-control/devdoc-master-context.md
docs/project-control/devdoc-implementation-roadmap.md
docs/project-control/devdoc-30-percent-implementation-plan.md
docs/project-control/devdoc-agent-coordination-rules.md
docs/template-package/devdoc-template-package-v1.md
```

Antigravity should report what exists, what is missing, and what needs to happen next.

---

## 2.3 Claude Code

Claude Code is the architect, planner, and reviewer.

Claude should be used for:

- Understanding the project
- Reviewing phase plans
- Checking architecture
- Explaining risks
- Reviewing Codex changes
- Suggesting cleaner structure
- Preventing scope creep
- Checking consistency with DevDoc documents

Claude should not be asked to build the entire project in one prompt.

Claude should usually be asked:

```text
Analyze this phase.
Tell me what files should be created or modified.
Do not edit yet.
```

Claude can edit files only when the user clearly asks it to.

---

## 2.4 Codex

Codex is the implementation worker.

Codex should be used for:

- Creating files
- Writing backend code
- Writing frontend code
- Implementing one phase at a time
- Fixing bugs
- Refactoring small parts
- Creating seed data
- Adding API routes
- Adding UI pages

Codex must not implement multiple phases at once unless the user explicitly allows it.

Codex must always list files before editing.

Codex should usually receive prompts like:

```text
Read AGENTS.md first.
Read the relevant project-control files.
Implement Phase X only.
Before editing, list files you will create or modify.
After editing, explain what changed and how to test.
```

---

## 2.5 Gemini / Google AI inside Antigravity

Gemini or Google AI inside Antigravity should be used as a helper inside the workspace.

It can help with:

- Explaining terminal errors
- Checking UI behavior
- Summarizing project files
- Suggesting small fixes
- Reviewing whether a phase works
- Helping understand generated code

It should not be used to independently rewrite the whole system.

---

# 3. Required Reading Before Editing

Before any agent edits code, it must read these files:

```text
AGENTS.md
docs/project-control/devdoc-master-context.md
docs/project-control/devdoc-implementation-roadmap.md
docs/project-control/devdoc-30-percent-implementation-plan.md
docs/project-control/devdoc-agent-coordination-rules.md
docs/template-package/devdoc-template-package-v1.md
```

If one of these files is missing, implementation should pause until the file is added.

---

# 4. Source of Truth Priority

If files conflict, use this priority order:

## Priority 1: AGENTS.md

Controls agent behavior and project rules.

## Priority 2: devdoc-master-context.md

Explains what DevDoc is and what it should become.

## Priority 3: devdoc-template-package-v1.md

Controls profiles, templates, template codes, document types, section lists, validation tags, and ERD placement.

## Priority 4: devdoc-30-percent-implementation-plan.md

Controls the first milestone scope.

## Priority 5: devdoc-implementation-roadmap.md

Controls the broader implementation order.

## Priority 6: Current codebase

Existing code should be respected, but it can be changed if it conflicts with the approved documentation.

---

# 5. File Editing Rules

## 5.1 Before Editing

Before editing, the agent must say:

```text
Files I will create or modify:
1. ...
2. ...
3. ...
```

The agent should also explain why those files are needed.

## 5.2 During Editing

The agent must:

- Work only on the approved phase
- Avoid unrelated cleanup
- Avoid renaming approved files or folders
- Avoid deleting user files
- Avoid changing .env unless asked
- Avoid adding unnecessary packages
- Keep code beginner-readable

## 5.3 After Editing

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

# 6. Git Rules

Commit only after a phase works.

Recommended commit flow:

```powershell
git status
git add .
git commit -m "short clear message"
```

Do not commit broken code unless the user clearly wants a savepoint.

Recommended commit message examples:

```text
add project control docs
add frontend and backend foundation
add prisma schema
seed template package v1
add authentication backend
add project workspace frontend
add structured document editor
add basic validation engine
```

---

# 7. Phase Control Rules

Implementation must follow phases.

Do not jump from Phase 0 directly to validation.

Approved phase order:

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

If a phase depends on missing earlier work, pause and report the dependency.

---

# 8. Scope Control Rules

Do not build these during the first milestone:

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

Agents may mention these as future work, but they must not implement them in the first milestone.

---

# 9. Template Package Rules

The official template package is:

```text
docs/template-package/devdoc-template-package-v1.md
```

Agents must not rename:

- Profile names
- Profile codes
- Template names
- Template codes
- Document type codes
- Validation tags

The app must use seed data for templates.

The app must not read DOCX or PDF templates at runtime.

---

# 10. Frontend UI Rules

The UI should be simple and easy to understand.

Use these labels:

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

The structured editor should use this layout:

```text
Left Panel:
Document section list and completion status

Center Panel:
Editor area

Right Panel:
Description, Guidance, Example, validation issues, and linked artefacts
```

---

# 11. Backend Structure Rules

The backend should use clear separation:

```text
routes
controllers
services
middleware
validators
utils
data
```

Business logic should not be placed directly inside route files if it becomes complex.

Validation logic should be placed in a clear validation/linter area.

Template seed data should be placed under:

```text
backend/src/data/templates/
```

---

# 12. Database Rules

The database should support structured project knowledge.

Core records should include:

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

Do not design the database only as plain document text. DevDoc needs structured data.

---

# 13. Testing Rules

After every phase, test only what that phase should provide.

Examples:

## Phase 0 Testing

- Frontend runs
- Backend runs
- README instructions work

## Phase 1 Testing

- Prisma connects
- Migration runs
- Prisma client generates

## Phase 2 Testing

- Profiles are seeded
- Templates are seeded
- Template sections are seeded

## Authentication Testing

- Register works
- Login works
- Protected route blocks unauthenticated user

## Template Library Testing

- Profiles load
- Templates load
- Template preview shows sections

## Editor Testing

- Document opens
- Section saves
- Completion updates

## Validation Testing

- Empty required section creates warning
- Requirement without priority creates warning
- Missing traceability creates warning

---

# 14. Safe Prompt Pattern

Use this prompt structure for any agent:

```text
Read these files first:
1. AGENTS.md
2. docs/project-control/devdoc-master-context.md
3. docs/project-control/devdoc-implementation-roadmap.md
4. docs/project-control/devdoc-30-percent-implementation-plan.md
5. docs/project-control/devdoc-agent-coordination-rules.md
6. docs/template-package/devdoc-template-package-v1.md

Task:
[Write the specific phase/task here]

Rules:
- Work only on this task.
- Do not implement future features.
- Before editing, list files you will create or modify.
- After editing, summarize changes and explain how to test.
```

---

# 15. Emergency Stop Rules

Pause implementation if:

- An agent wants to rewrite the whole project
- An agent wants to rename approved profiles/templates
- An agent wants to add a custom rule builder
- An agent wants to build full AI generation now
- An agent wants to delete existing project files
- Multiple agents are editing the same files
- The app stops running and the cause is unclear
- The database schema starts drifting away from the approved project model

When this happens, stop and ask for review.

---

# 16. Final Coordination Summary

Use this workflow:

```text
1. Antigravity checks project status.
2. Claude reviews the phase plan.
3. Codex implements one phase.
4. Antigravity runs and tests the phase.
5. User approves.
6. User commits.
7. Move to next phase.
```

Do not skip the review and testing step.

The goal is not fast messy progress.

The goal is controlled, consistent, working progress.
