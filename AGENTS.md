@'
# DevDoc Agent Instructions

## 1. Purpose

These are the shared repository instructions for Codex and other development agents working on DevDoc.

Claude Code also has `CLAUDE.md` for Claude-specific guidance. Where both files apply, they should be interpreted consistently.

DevDoc is being developed as a complete software system. The earlier 30 percent implementation milestone is historical and must not restrict current work.

## 2. Development Agents

Claude Code and Codex are the primary DevDoc development agents.

Both may:

- Analyze the complete project.
- Implement frontend and backend features.
- Refactor existing code.
- Modify the Prisma schema through reviewed migrations.
- Add and update tests.
- Review architecture, security, validation, traceability, UI, and database behavior.
- Update technical documentation when implementation decisions change.

Do not assign permanent roles such as:

- Claude only plans while Codex implements.
- Codex only writes code while Claude reviews.
- Antigravity controls the project.
- Gemini decides architecture or implementation.

The user decides which agent handles each task.

Gemini is used only for testing, independent review, and Graphify semantic extraction. Its feedback is advisory until verified and accepted.

## 3. Current Project Direction

A new complete-project baseline will be created later.

Until it exists, use this temporary source priority:

1. The user's current instruction.
2. Decisions explicitly approved by the user for the current task.
3. Current working code, Prisma schema, migrations, and API behavior.
4. Existing project documentation and SDS as important references.
5. Older roadmaps and milestone plans as historical context only.

The SDS is necessary, but it is not an unchangeable implementation baseline.

When code, documentation, and instructions conflict:

- Identify the conflict.
- Explain the practical impact.
- Do not silently choose one source.
- Request approval when the decision changes scope, architecture, data, or major behavior.

Do not claim that an authoritative complete baseline exists until the user approves and creates it.

## 4. Graphify Knowledge Graph

Graphify is the shared knowledge layer for Codex and Claude Code.

Before broad repository exploration, run a focused query:

`graphify query "<specific project question>"`

Use these when appropriate:

- `graphify explain "<concept>"`
- `graphify path "<concept A>" "<concept B>"`

After Graphify provides orientation, inspect the actual relevant source files before implementing or confirming behavior.

Rules:

- Do not delete `graphify-out/`.
- Do not treat inferred graph relationships as confirmed without checking source code.
- Prefer focused queries over reading the complete graph report for every task.
- Regenerate the graph after substantial accepted changes, not after every small edit.
- On PowerShell, use `graphify .`, not `/graphify .`.
- Semantic extraction for documentation and images may require:

  `.\Enter-DevDoc.ps1`

  `graphify . --backend gemini`

The Gemini API key is project-local and must never be displayed, logged, committed, or copied into documentation.

## 5. Before Editing

Before modifying code:

1. Read the requested outcome and constraints.
2. Run `git status --short`.
3. Check for unrelated modified or untracked files.
4. Query Graphify for the affected modules.
5. Inspect the relevant code, tests, Prisma models, migrations, and documentation.
6. Identify API, database, security, traceability, and UI dependencies.
7. Define measurable acceptance criteria.
8. Explain any major conflict or destructive risk before proceeding.

Do not overwrite or discard unrelated work.

## 6. Implementation Standards

### Backend

- Preserve controller, service, validator, route, and middleware separation where currently used.
- Validate request data.
- Enforce authentication, project ownership, and authorization.
- Do not trust client-provided ownership or relationship identifiers.
- Keep error responses consistent.
- Avoid exposing secrets, password hashes, internal stack traces, or unnecessary database details.
- Add migrations for intentional schema changes.
- Do not use destructive database operations without explicit approval.

### Frontend

- Keep frontend API clients aligned with backend contracts.
- Implement real behavior rather than visual placeholders.
- Handle loading, empty, success, validation, and error states.
- Preserve accessibility and responsive behavior where practical.
- Do not report a module as complete merely because a route, file, or screen exists.
- Reuse existing components when doing so does not preserve a defect.

### Validation and Traceability

- Treat HTML editor content according to meaningful rendered content, not raw non-empty markup.
- Verify that traceability relationships match the documented semantics.
- Do not count unrelated links as complete requirement coverage.
- Validation results must be reproducible, explainable, and connected to the affected artefact.

### Security

- Keep credentials outside tracked files.
- Never expose `.env`, `.secrets`, JWT secrets, database credentials, or user data.
- Review authentication, authorization, file upload, export, and external-service behavior for abuse cases.
- External services must be documented when project data leaves the local application.

## 7. Testing and Verification

Use the actual scripts declared in the current `package.json` files. Do not assume commands exist.

As applicable, verify:

- Backend tests.
- Frontend tests.
- Frontend production build.
- JavaScript or TypeScript syntax and lint checks.
- Prisma schema validation.
- Migration consistency.
- API behavior.
- Authorization and ownership checks.
- Regression scenarios.
- Dependency or security findings.

Do not run `npm audit fix` automatically.

Report separately:

- Checks that passed.
- Checks that failed.
- Checks that could not be run.
- Known limitations that remain.

## 8. Git Safety

Never run these without explicit authorization for the exact operation:

- `git clean -fd`
- `git clean -fdx`
- `git reset --hard`
- `git restore .`
- `git checkout .`
- `git push --force`
- destructive rebases
- mass deletion commands

Also:

- Never remove or replace `.git/`.
- Never stage unrelated work.
- Do not use `git add -A` by default.
- Stage explicit task files only.
- Do not commit, push, merge, rebase, or open a pull request unless requested.
- Review staged changes before committing.
- Do not commit `node_modules`, build output, logs, database dumps, environment files, secrets, or Graphify generated output.

## 9. Dependency and Database Safety

Allowed without changing project versions:

- `npm ci` from an existing lock file.
- Running existing test, build, lint, and validation scripts.
- Reading migration status and schema information.

Require user approval:

- Adding or removing packages.
- Upgrading dependency versions.
- Running `npm audit fix`.
- Changing database providers.
- Resetting, truncating, or reseeding real data.
- Applying destructive migrations.
- Replacing the Prisma schema with generated output.

## 10. Prohibited Persistent AI Infrastructure

Do not initialize, restore, or generate project-local:

- Ruflo
- Claude Flow
- `.claude-flow`
- `.swarm`
- RuVector or AgentDB memory databases
- Antigravity control rules
- Gemini control files
- autonomous background daemons
- uncontrolled recursive agent swarms

Temporary built-in subagents may be used for a specific task when useful, but they must not create persistent control systems or conflicting instructions.

## 11. Completion Standard

Before saying a task is complete, state:

- What behavior was implemented or corrected.
- Which files changed.
- Which tests and checks ran.
- Their exact results.
- Database and migration impact.
- Security and privacy impact.
- Documentation impact.
- Remaining limitations or unresolved issues.

Never hide failures, skipped checks, incomplete requirements, or uncertainty.
'@ | Set-Content ".\AGENTS.md" -Encoding UTF8