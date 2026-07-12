# DevDoc Upgrade Plan — Claude Code Master Spec

> Audience: Claude Code (and any coordinated agents via claude-flow).
> Read `AGENTS.md` and `docs/project-control/devdoc-master-context.md` first. This file extends them.
> If this file conflicts with AGENTS.md conventions, AGENTS.md wins for *style*, this file wins for *scope*.

---

## 0. Non-Negotiable Guardrails

1. **Never touch `backend/.env`.** Never print its contents, never commit it, never write secrets into any file. Use `backend/.env.example` for new variable names only.
2. **Backend stays CommonJS JavaScript** (require/module.exports). No TypeScript conversion. No ESM migration.
3. **Every new backend service MUST enforce project ownership** using the existing `verifyProjectOwnership(tx, ownerId, projectId)` pattern. Copy it from `requirementService.js`. Unauthorized/cross-project access returns 404 via the existing error-code pattern (`constants/errorCodes.js`).
4. **Follow the existing layering exactly**: `routes/ → controllers/ → services/ → validators/ → prisma`. One file per module per layer. Match naming of existing files.
5. **Schema changes only where this plan specifies.** Any other schema change: stop and ask.
6. **Prisma migrations**: use `npx prisma migrate dev --name <phase-name>`. Never `db push` on this project. Never edit applied migration files.
7. **Auth stays httpOnly-cookie JWT.** Do not move tokens to localStorage or Authorization headers.
8. **Frontend stays React 19 + Vite + Tailwind 3 with the existing CSS-variable theme** (`--devdoc-*` vars, dark mode support). New components must use the vars, not hardcoded colors.
9. **Allowed new dependencies** (do not add others without asking):
   - frontend: `@tanstack/react-query`, `@tiptap/react` + `@tiptap/starter-kit` + `@tiptap/extension-table` (+ table-row/cell/header), `reactflow`, `recharts`, `cmdk`, `plantuml-encoder`
   - backend: `jest`, `supertest` (dev), `natural` (Phase 11 only)
10. **After every phase**: `cd frontend && npm run build` must pass, `cd backend && node -e "require('./src/server.js')"` must not throw on load (or start server and hit `/health`), and `npm test` (once Phase 6 exists) must pass. Commit per phase with message `phase-N: <summary>`.
11. **Do not delete or rewrite working pages wholesale.** Migrate incrementally; keep the app runnable at every commit.
12. Windows dev environment. Use cross-platform commands in package.json scripts (no bash-only syntax).

---

## Phase 1 — Hygiene & Small Fixes

**Goal:** repo safety + low-risk corrections.

Tasks:
1. Ensure `.gitignore` covers `backend/.env`, `*.env`, `ruvector.db`, `.swarm/`, `.claude-flow/`, `graphify-out/cache/`. Run `git ls-files backend/.env` — if tracked, run `git rm --cached backend/.env` and commit. (History scrub is a MANUAL task — do not attempt filter-repo.)
2. Rename `ProjectDiagramsPlaceholder.jsx` → `ProjectDiagrams.jsx` (it is functional). Update import in `App.jsx`.
3. In `requirementService.js` and `useCaseService.js` code generation: wrap create in a retry-once-on-P2002 (regenerate code, retry create). Extract shared helper `backend/src/utils/nextCode.js`.
4. Add a global Express error handler in `server.js` if absent (map known error codes → status, else 500 with generic message; never leak stack traces in responses).
5. Collapse `DOC-002` (per-document completion INFO) in `validationService.js` into a single summary INFO result listing incomplete documents.

Acceptance: build passes, app boots, diagrams page still works, creating two requirements rapidly never 500s.

---

## Phase 2 — Config-Driven Validation Engine (highest priority)

**Goal:** the `ValidationRule` table becomes the live source of rules; profiles actually change validation behavior.

Tasks:
1. Populate `backend/src/data/templates/validationRules.js` with rule records for every currently-hardcoded rule (DOC-001, SEC-001, REQ-001, REQ-002, UC-001, UC-002, UC-003, TRC-001, TRC-002) — fields: `ruleCode`, `ruleName`, `ruleCategory`, `severity`, `checkKey`, `message` (template with `{placeholders}`), `suggestedFix`, `profileCode`, `isActive`. Create the full set for **each** profile (STANDARD_SOFTWARE, academic, company — read exact codes from `profiles.js`) so severity can differ per profile:
   - `TRC-001` (requirement with no links): **ERROR** in academic profile, WARNING in standard/company. (SDS FR5.5 alignment.)
2. Refactor `validationService.js`:
   - Build a **check registry**: `checks/{checkKey}.js` or a single map `checkKey → function(context) → findings[]`. Context = `{documents, sections, requirements, useCases, traceabilityLinks, designElements, testCases}`.
   - `runProjectValidation` loads the project **with its profile**, fetches `ValidationRule` where `profileId` matches and `isActive`, executes each rule's check, and uses the DB row's severity/message/suggestedFix (interpolate placeholders like `{code}`, `{sectionTitle}`).
   - Projects with no profile fall back to STANDARD_SOFTWARE rules.
   - Keep result shape and `ValidationResult` persistence identical.
3. Ensure `seed.js`'s `seedValidationRules()` seeds the new data. Adjust unique key handling: `ruleCode` is globally `@unique` in schema — since rules now vary per profile, change `ruleCode` uniqueness to `@@unique([profileId, ruleCode])` via migration, update seed upsert accordingly.
4. Update `ValidationEngine.jsx` only if response shape changed (it shouldn't).

Acceptance: `npx prisma migrate dev` clean; `npx prisma db seed` inserts rules (count > 0); running validation on a seeded test project returns same rule codes as before; flipping a rule's `isActive` to false in DB removes it from the next run; academic-profile project reports TRC-001 as ERROR.

---

## Phase 3 — Complete the Artifact Chain (Design Elements & Test Cases)

**Goal:** requirement → design → test traceability actually exists.

Tasks:
1. Backend: `designElementService/Controller/Routes/Validator` and `testCaseService/...` mirroring the requirement module. Codes: `DE-001...`, `TC-001...` via `utils/nextCode.js`. Mount at `/api/projects/:projectId/design-elements` and `/api/projects/:projectId/test-cases`. Full CRUD + list. Ownership scoped.
2. Traceability: extend `traceabilityService.js` supported pairs:
   - `REQUIREMENT → DESIGN_ELEMENT`, linkType `implemented_by`
   - `REQUIREMENT → TEST_CASE`, linkType `verified_by`
   Extend `/traceability/options` to return design elements and test cases.
3. New validation checkKeys + rule rows (all profiles):
   - `REQ-003` WARNING: FR with no `implemented_by` link.
   - `REQ-004` WARNING: FR with no `verified_by` link.
4. Frontend: `DesignElementRegistry.jsx` and `TestCaseRegistry.jsx` pages (clone RequirementRegistry structure + card/form components), routes + ProjectShell sidebar entries. Add the two new modes to `TRACEABILITY_MODES` in `TraceabilityMatrix.jsx`.

Acceptance: full chain creatable in UI (UC → REQ → DE → TC via links); validation flags uncovered FRs; PlantUML tree endpoint still works (extend `diagramService.js` to include DE/TC nodes and new link arrows).

---

## Phase 4 — Readiness Score v2 + Stale-Link Drift Detection

Tasks:
1. Replace flat-deduction scoring with weighted coverage ratios computed in the validation run:
   - `sectionCompletion` = completed required sections / required sections
   - `reqTraced` = requirements with ≥1 link / requirements
   - `frCovered` = FRs covered by a use case / FRs
   - `frImplemented` = FRs with implemented_by / FRs; `frVerified` = FRs with verified_by / FRs
   - `readinessScore = round(100 * (0.30*sectionCompletion + 0.25*reqTraced + 0.20*frCovered + 0.15*frImplemented + 0.10*frVerified))`
   - Empty denominators count as 0 contribution (not 1). Store the five component ratios in a new `ValidationRun.metrics Json?` column (migration).
2. Drift: add `lastVerifiedAt DateTime @default(now())` to `TraceabilityLink` (migration). New checkKey `TRC-003` WARNING: source or target artifact `updatedAt` > link `lastVerifiedAt`. New endpoint `PATCH /traceability/:linkId/verify` sets `lastVerifiedAt = now()` (ownership scoped). Add a "Re-verify" button on link list items.

Acceptance: score is 0 on empty project, 100 on a fully linked demo project; editing a linked requirement then validating produces TRC-003; re-verify clears it.

---

## Phase 5 — Semantic Lint Rules (quick wins)

New checkKeys + rule rows:
1. `QUA-001` WARNING — vague terms in requirement description/title. Wordlist in `backend/src/constants/vagueTerms.js`: fast, easy, user-friendly, simple, efficient, some, many, few, appropriate, adequate, flexible, robust, seamless, quickly, as needed, etc. Report the matched term per finding.
2. `QUA-002` INFO — requirement `acceptanceCriteria` is null/empty.
3. `QUA-003` INFO — FR description does not contain "shall" (statement-format check per SDS FR4.5).

Acceptance: seeding a requirement titled "System should be fast and easy" yields QUA-001 findings naming both terms.

---

## Phase 6 — Backend Test Suite

Tasks:
1. Install jest (+ supertest dev). `backend/package.json`: `"test": "jest"`.
2. Extract pure logic if needed so it's importable without DB: `nextCode`, `calculateReadinessScore`/metrics, `sortResults`, traceability pair support, vague-term scanner, PlantUML alias/label builders.
3. Write `backend/tests/*.test.js` covering at minimum the SDS Chapter-5 unit table: UT-01..UT-10 equivalents plus the new scoring and QUA rules. Target ≥ 25 assertions.
4. Optional if straightforward: supertest smoke on `/health`.

Acceptance: `npm test` green; tests do not require a live database.

---

## Phase 7 — Frontend Foundation (React Query + Design Primitives)

Tasks:
1. Install `@tanstack/react-query`; wrap app in `QueryClientProvider` in `main.jsx`.
2. Create `frontend/src/api/` query/mutation hooks per domain (`useProject`, `useRequirements`, `useCreateRequirement`, `useTraceabilityLinks`, `useValidationRuns`, ...) wrapping the existing `services/` fetchers. Key convention: `['projects', projectId, 'requirements']` etc. Mutations invalidate their list keys.
3. Migrate ALL pages off manual `useEffect` fetching. Delete dead loading/error state code.
4. Create `frontend/src/components/ui/`: `Button`, `Card`, `Badge`, `EmptyState`, `PageHeader`, `Skeleton`, `Modal`, `StatCard` — built on the `--devdoc-*` CSS vars, with focus-visible styles. Refactor existing pages to use them (mechanical, keep visuals close to current design).
5. Route-level code splitting: `React.lazy` + `Suspense` (Skeleton fallback) for all project pages.
6. Optimistic updates on traceability link create/delete.

Acceptance: build passes; no page uses raw `useEffect` fetch anymore; UI visually consistent; creating/deleting a link updates the list instantly.

---

## Phase 8 — Visual Traceability (Matrix Grid + Graph)

Tasks:
1. **Matrix grid view** on TraceabilityMatrix page (tab: "Grid | Builder | Audit"): rows = use cases (or requirements per selected mode), columns = targets; cell click toggles link create/delete (optimistic). Fully-unlinked rows/columns highlighted.
2. **Graph view** (new tab or `/traceability/graph`): `reactflow` rendering the full project graph — nodes grouped/colored by type (UC / FR / NFR / Section / DE / TC), edges labeled by linkType, orphan nodes ringed red, node click navigates to the artifact. Layout: simple layered (dagre optional — if adding dagre, it's allowed as reactflow companion).
3. **Render PlantUML**: on Diagrams page, encode generated text with `plantuml-encoder` and display `https://www.plantuml.com/plantuml/svg/{encoded}` in an `<img>`, keep copy/download of raw text.

Acceptance: toggling a grid cell creates/removes a real link; graph shows current project state and updates after changes; diagram image renders.

---

## Phase 9 — TipTap Editor + Inline Requirement Capture

Tasks:
1. Replace the `<textarea>` in `DocumentEditorPanel.jsx` with TipTap (StarterKit + Table extensions). Persist HTML in `DocumentSection.content` (backend already stores text — no schema change). Existing plain-text content must still load (render as paragraph).
2. Ribbon buttons drive TipTap commands (bold, italic, lists, table insert, undo/redo).
3. Debounced autosave (3s idle) reusing the existing save endpoint + "Saved • hh:mm" indicator; keep explicit Save / Save & Next.
4. **RequirementBlock**: custom TipTap node rendering a chip/card with code, title, type badge. Flow: user selects text → bubble-menu button "Register as requirement" → modal prefilled with selected text as title → on confirm call new endpoint `POST /api/projects/:projectId/requirements/from-section` `{sectionId, title, type, priority}` which (in one transaction) creates the requirement AND a `REQUIREMENT → DOCUMENT_SECTION described_by` link → insert RequirementBlock node at selection.
5. Guidance panel unchanged.

Acceptance: rich editing works incl. tables; autosave fires; inline capture creates requirement + link visible in registry and matrix; old documents still open.

---

## Phase 10 — Actionable Validation UX + Analytics

Tasks:
1. `ValidationResultCard.jsx`: use stored `targetType`/`targetId` for deep links — DOCUMENT_SECTION → editor scrolled/highlighted to section; REQUIREMENT/USE_CASE → registry with item highlighted; link rules → matrix with source preselected. Support via query params (e.g. `?highlight=<id>`).
2. Quick-fix buttons per ruleCode: REQ-002 → "Create covering use case" (prefilled modal, creates UC + covers link); TRC-001 → "Open in matrix"; SEC-001 → "Open section".
3. Validation page header: recharts severity donut + readiness trend line across stored runs; show metric ratio bars from `ValidationRun.metrics`.
4. Replace `ProjectAnalyticsPlaceholder` with a real Analytics page: readiness trend, per-document completion bars, artifact counts, coverage StatCards.
5. Guided empty state on ProjectWorkspace: 5-step readiness checklist (create doc → use cases → requirements → links → validate), steps auto-check from live data, each step links to its screen.

Acceptance: every ERROR/WARNING with a target navigates somewhere useful in one click; charts render from real run history.

---

## Phase 11 — Suggested Links (deterministic, no external AI)

Tasks:
1. Backend `suggestionService.js`: TF-IDF cosine similarity (`natural` lib) between unlinked requirement text (title+description) and (a) document section contents, (b) use case descriptions. `GET /api/projects/:projectId/traceability/suggestions` → top 5 above threshold 0.25, each `{sourceType, sourceId, targetType, targetId, linkType, score, reasonTerms}` — only pairs valid per supported modes and not already linked. Ownership scoped, read-only.
2. Frontend: "Suggested Links" panel on TraceabilityMatrix — cards with score + shared terms, Accept (creates link) / Dismiss (session-local).

Acceptance: seeded project with overlapping vocabulary produces sensible suggestions; accept creates a real link and removes the card.

---

## Phase 12 — Polish Pack (do only after 1–11 are green)

1. `cmdk` command palette (Ctrl+K): jump to documents, requirements, use cases, screens.
2. Demo seed project: extend `seed.js` with an optional `SEED_DEMO=true` path creating a small fully-linked sample project (owned by demo user) demonstrating 100 readiness.
3. Read-only share link: `ShareToken` model (`token`, `projectId`, `createdAt`, `expiresAt?`), `POST /api/projects/:id/share` returns URL `/shared/:token`; public route (no auth) rendering read-only validation report + graph. Rate-limit the public route.
4. Optional export MVP: server-side HTML→PDF of one document via headless Chromium ONLY IF environment allows; otherwise a print-optimized `/documents/:id/print` view + `window.print()`. Gate the button on zero ERROR findings in the latest run.

---

## Phase Order & Parallelization

Sequential spine: 1 → 2 → 3 → 4 → 6. 
Phase 5 can run parallel to 3/4 (after 2). 
Frontend track: 7 → 8/9/10 (8, 9, 10 independent after 7). 
11 requires 3+7. 12 last.

## Definition of Done (whole plan)
- All builds/tests green; every page real (zero "Placeholder" in user-facing routes except Versions/Docs/Help which remain and say "planned").
- Fresh clone + `.env` + `migrate dev` + `db seed` + two `npm run dev`s = working app.
- `git log` shows one commit per phase.
