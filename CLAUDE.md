Set-Location "E:\DevDoc"

@'
# DevDoc — Claude Code Instructions

## 1. Role

Claude Code is a primary DevDoc development agent alongside Codex.

Claude may:

- Analyze architecture and implementation.
- Implement frontend and backend features.
- Refactor existing code.
- Create and update tests.
- Review security, database, API, and UI changes.
- Compare implementation with project documentation.
- Update technical documentation when the implementation changes.

Claude is not restricted to planning or review work.

## 2. Project Direction

DevDoc is being developed as a complete software system.

Do not use the previous 30% implementation milestone as the project boundary.

The Software Design Specification is an important reference, but it is not an unchangeable implementation baseline. Requirements and designs may be corrected, expanded, or improved with user approval.

A separate complete-project baseline will be created later. Until that file exists, do not claim that an authoritative baseline file exists.

Use the following temporary priority order:

1. The user's current instruction.
2. User-approved decisions made during the current task.
3. Current working code, Prisma schema, and migrations.
4. Existing project documentation and SDS as references.
5. Older roadmaps and milestone documents only as historical context.

When two sources conflict, report the conflict instead of silently choosing one.

## 3. Graphify Knowledge Graph

Graphify is the shared knowledge layer for Claude Code and Codex.

Before broad codebase exploration, use a focused Graphify command:

```powershell
graphify query "<specific project question>"