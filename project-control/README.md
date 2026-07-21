# DevDoc — Project Control

This folder is the source of truth for the DevDoc rebuild. Every artefact — code, test, mockup, page, PR — should be traceable back to something here. If a decision isn't written down here, it hasn't been made.

## Why this folder exists

The two audits (`critics-views.md` v1 and v2) reached the same conclusion in different words: **DevDoc has an ambitious domain model wrapped in a prototype-grade application.** The individual code is mostly careful. The systemic problem is *rebuild-without-delete*, *proven-patterns-not-propagated*, and *two visual dialects that never merged*.

The fix is not more code. It's discipline about what gets built, in what order, against what spec. This folder is that discipline.

## Working principles (read these first)

1. **Subtract before you add.** Every new page starts with what's being deleted or replaced. If nothing is being replaced, ask why the page didn't already exist.
2. **One canonical implementation per concept.** One `Icon`, one grid class, one `ownership` helper, one create-form pattern, one skeleton, one error state.
3. **No new page until existing pages share code.** The next feature is not another registry — it's making the existing registries share their sort/search/row primitives.
4. **Every visible control does something real.** No dead links, no fake buttons, no "coming soon" copy on a routed page. Either it works or it isn't visible.
5. **Ground everything in the actual codebase.** PRDs, mockups, tests reference real file paths, real hook names, real endpoint contracts. Fantasy specs produce fantasy code.
6. **Show your work.** Every number the product displays (readiness score, coverage %, "N linked") must be inspectable — the user should be able to see the formula.
7. **The critical journey is the proof.** Register → login → create project → write section → add requirement → link → validate → share → open shared. Until this runs green end-to-end in CI, DevDoc is a demo, not a product.

## Folder map

```
project-control/
├── README.md                          ← this file, the index
├── CHANGELOG.md                       ← what's been built, when, against which PRD
├── foundations/
│   ├── devdoc-master-context.md       ← pre-existing project truth: identity, scope, chain, modules
│   └── devdoc-template-package-v1.md  ← pre-existing project truth: profiles, templates, sections, ERD, rule naming
├── prds/
│   ├── 00-PRD-master-scope.md         ← the whole product, users, goals, roadmap
│   ├── 01-PRD-frontend.md             ← design system, pages, interaction, a11y
│   ├── 02-PRD-backend.md              ← services, auth, error contract, security
│   ├── 03-PRD-database.md             ← schema, integrity, migrations, indexing
│   └── 04-PRD-api-comms-ai.md         ← REST conventions, pagination, PlantUML, AI stance
├── skills/
│   ├── SKILL-analyzer.md              ← how to audit the codebase
│   ├── SKILL-reviewer.md              ← how to review a PR against these PRDs
│   └── SKILL-test-case-author.md      ← how to write a test case for this project
├── testing/
│   ├── 00-test-strategy.md            ← layers, tooling, coverage targets
│   ├── 01-test-cases-master.md        ← the catalogue of tests we intend to write
│   └── PROMPT-codex-test-implementation.md ← copy into Codex to learn by doing
├── frontend-rebuild/
│   ├── 00-frontend-rebuild-plan.md    ← per-page plan for all 24 routed pages
│   ├── PROMPT-builder-page.md         ← the prompt the frontend builder uses per page
│   └── page-briefs/                   ← YOU DROP HTML MOCKUPS HERE (one per page)
└── templates/
    ├── 00-templates-guide.md          ← which templates exist and when to use each
    ├── page-brief-template.md         ← fill this in for each frontend page rebuild
    ├── test-case-template.md          ← use this for every test case
    └── prd-section-template.md        ← use this when adding to any PRD
```

## `foundations/` vs `prds/` — precedence [REVISED 2026-07-21]

**The user has declared the old planning documents void and this `prds/` structure the new, complete baseline.** This reverses the original precedence. `foundations/devdoc-master-context.md` and `foundations/devdoc-template-package-v1.md` are kept as **historical reference only** — they still contain accurate, verified facts (exact profile codes, exact schema field names, the gaps found when checked against the real repo), so they're worth reading, but they no longer outrank a PRD. If a PRD and a `foundations/` file disagree now, the **PRD wins**, and `foundations/` gets a note pointing to the correction — never the reverse.

Also now void, per the same instruction: the repo's old `docs/project-control/` folder (`devdoc-implementation-roadmap.md`, `devdoc-agent-coordination-rules.md`, and its own copy of `devdoc-master-context.md`) and `docs/template-package/devdoc-template-package-v1.md`. Those still exist as files on disk unless deleted separately — this folder's docs no longer defer to them, but removing the files themselves is a repo action, not a docs one. See `CHANGELOG.md` for the recommended cleanup.

Per `AGENTS.md` §3, the rule that still applies: report conflicts, don't silently pick — which is why `foundations/` is kept rather than deleted. Its content is still correct; its authority is what changed.

## How to use this folder

**To add or change scope** → edit the relevant PRD, then update `CHANGELOG.md`. Any PR whose scope isn't reflected in a PRD gets closed.

**To rebuild a frontend page** →
1. Open `frontend-rebuild/00-frontend-rebuild-plan.md`, find the page's row.
2. Fill in `templates/page-brief-template.md`, save as `frontend-rebuild/page-briefs/<page>.md`, and drop the HTML mockup next to it.
3. Give the builder agent `frontend-rebuild/PROMPT-builder-page.md` with the brief attached.
4. On completion, tick the page in the rebuild plan; add row(s) to `testing/01-test-cases-master.md`.

**To write test cases** → read `skills/SKILL-test-case-author.md`, use `templates/test-case-template.md`, log in `testing/01-test-cases-master.md`. If you're using Codex, feed it `testing/PROMPT-codex-test-implementation.md`.

**To review a PR** → run through `skills/SKILL-reviewer.md`. If you can't tick every box, the PR isn't ready.

**To audit the codebase** → use `skills/SKILL-analyzer.md`. The output format is the same as `critics-views-v2.md`, so it's directly comparable pass-over-pass.

## What's true today (grounded)

Verified against the repo at the start of this control folder:

- **Backend**: 46/46 pure-logic tests pass. **No HTTP, auth, or DB integration tests exist.** Every service correctly re-derives ownership. `assertProjectOwnership` is copy-pasted into 12+ files instead of imported once.
- **Frontend**: `vite build` passes. **No frontend tests exist** (`package.json` has only `dev`, `build`, `preview`). The consolidation pass (see `CHANGELOG.md`) removed 27 local `Icon` definitions, 5 placeholder routes, and centralized 401 handling in `apiRequest`. `useAuthGuard` is imported in 4 pages and now races with `apiRequest` — needs deletion.
- **Database**: 7 migrations applied. Schema is domain-correct. `TraceabilityLink` is polymorphic with no referential integrity. 3 free-form status/type strings should be enums (`Project.status`, `TestCase.status`, `DesignElement.elementType`, `TraceabilityLink.linkType`).
- **Documented-but-broken**: `AppSettings.jsx` advertises J/K keyboard shortcuts. `hooks/useKeyboardNav.js` exists but is imported nowhere.
- **Dead-but-more-functional**: `ProfilePlaceholder.jsx` and `ProjectSettingsPlaceholder.jsx` contain working password-change / share-link / delete-project flows that the live pages disable and label "backend endpoint doesn't exist yet." The endpoints exist. (The consolidation pass removed these placeholders — but the working sub-components need to be **ported** before deletion; see H8 in v2 critique.)

## Sequencing (aligned to critics-views-v2 §6)

1. **Security / data-integrity sprint.** DOMPurify in `DocumentPrint.jsx`. `ShareToken.expiresAt` default + revoke endpoint. `TraceabilityLink` cleanup on delete for design elements / test cases / business objectives. `tokenVersion` on JWTs. Login timing side-channel. Rate-limit proxy trust.
2. **Recover-then-delete sprint.** Port the working password-change / share-link / delete-project sub-components from the placeholder files into the live pages. Delete `useAuthGuard`. Then delete the placeholder files.
3. **Consistency sprint.** Extract `assertProjectOwnership`, `createAppError`, `useFormSubmit`. Propagate `sortAndSearch` to the four registries that don't use it. Propagate `components/ui` primitives to the workspace pages. Pick one HTTP verb for partial updates.
4. **Scale-readiness backlog.** Pagination on list endpoints. `actorId` on activity logs. DB enums for `TestCase.status`, `Project.status`, `TraceabilityLink.linkType`.

Every sprint has a corresponding test-case set in `testing/01-test-cases-master.md`. A sprint doesn't ship without its tests.

## Ownership

- **Muhammad Hassan** — sole developer, owns every module.

This is a solo project. "Ownership" in this folder means who signs off and writes tests, not a team split — Codex or a builder agent can produce a page or a service, but Hassan reviews it, tests it, and owns its PRD alignment.
