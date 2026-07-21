# Frontend Rebuild Plan

**Purpose:** one row per routed page. When you (or the builder) work on a page, this is the source of truth for its current state, the mockup expected, its acceptance criteria, and its owner.

**Workflow per page:**
1. Pick a page from the table below.
2. Copy `templates/page-brief-template.md` → `frontend-rebuild/page-briefs/<page-slug>.md`.
3. Fill in the brief. Attach your HTML mockup as `<page-slug>.html` next to it.
4. Feed the builder `PROMPT-builder-page.md` with the brief.
5. Review against `SKILL-reviewer.md`.
6. Register test cases in `testing/01-test-cases-master.md` (they already exist as TODOs — flip to WIP → DONE).
7. Tick the row here.
8. Update `CHANGELOG.md`.

---

## Global blockers (fix these before any per-page work)

- [ ] Tailwind theme mapping for `--devdoc-*` variables (PRD 01 §6) — after this, every rebuild avoids the bracket-syntax antipattern.
- [ ] Extract shared primitives that aren't in `components/ui` yet: `GridBackground`, `Gauge`, `SeverityDonut`, `SortSearchBar` (used by every registry).
- [ ] Extract `useFormSubmit` hook so create-forms stop duplicating the same 30 lines.
- [ ] Wire DOMPurify into `DocumentPrint.jsx` (H5 — security blocker).
- [ ] Delete `useAuthGuard` after confirming `apiRequest`'s 401 handler covers all cases (H6).
- [ ] Recover `AccountInfoCard`, `SecurityCard`, `ShareLinkSection`, `DeleteConfirmModal` from the ex-placeholder files into `components/`, then re-import into `Profile.jsx` and `ProjectSettings.jsx`.

Once the above is done, per-page work stops re-solving the same problems.

---

## Per-page table

Legend: **State** = current fidelity to PRD 01. **Mockup** = HTML brief present. **Test** = TCs written.

| # | Route | Page component | Owner | State | Mockup | Tests | Notes |
|---|---|---|---|---|---|---|---|
| 1 | `/` | LandingPage | Hassan | ⚠ | ☐ | ☐ | Needs the "linked chain" hero band + honest feature grid |
| 2 | `/login` | Login | Hassan | ⚠ | ☐ | ☐ | Remove Terms consent leftover; keep demo login |
| 3 | `/register` | Register | Hassan | ⚠ | ☐ | ☐ | Password meter must match backend rules |
| 4 | `/dashboard` | Dashboard | Hassan | ⚠ | ☐ | ☐ | Empty state + real welcome overlay |
| 5 | `/profile` | Profile | Hassan | ⚠ | ☐ | ☐ | **Recover password change from placeholder** |
| 6 | `/settings` | AppSettings | Hassan | ⚠ | ☐ | ☐ | Wire real notification toggles or remove |
| 7 | `/help` | Help | Hassan | ⚠ | ☐ | ☐ | Real FAQ, remove decorative stamp |
| 8 | `/docs` | Documentation | Hassan | ⚠ | ☐ | ☐ | Left-nav + article + on-this-page rail |
| 9 | `/about` | About | Hassan | ⚠ | ☐ | ☐ | Keep team title-block (real credit) |
| 10 | `/accessibility` | Accessibility | Hassan | ⚠ | ☐ | ☐ | Every listed shortcut must work |
| 11 | `/shared/:token` | SharedReport | Hassan | ⚠ | ☐ | ☐ | Read-only, honest failure states |
| 12 | `/projects/:id` | ProjectWorkspace | Hassan | ⚠ | ☐ | ☐ | Readiness gauge + checklist + activity |
| 13 | `.../business-objectives` | BusinessObjectiveRegistry | Hassan | ⚠ | ☐ | ☐ | Blocked on BO backend endpoints |
| 14 | `.../use-cases` | UseCaseRegistry | Hassan | ⚠ | ☐ | ☐ | Registry pattern refactor |
| 15 | `.../requirements` | RequirementRegistry | Hassan | ⚠ | ☐ | ☐ | Registry pattern + `onError` fix |
| 16 | `.../design-elements` | DesignElementRegistry | Hassan | ⚠ | ☐ | ☐ | Registry pattern + `onError` fix |
| 17 | `.../test-cases` | TestCaseRegistry | Hassan | ⚠ | ☐ | ☐ | Registry pattern refactor |
| 18 | `.../documents` | DocumentsLibrary | Hassan | ⚠ | ☐ | ☐ | Use `Card` primitive |
| 19 | `.../templates` | TemplateLibrary | Hassan | ⚠ | ☐ | ☐ | Preview panel real |
| 20 | `.../documents/:documentId` | DocumentEditor | Hassan | ⚠ | ☐ | ☐ | **Split god-component (H11)** |
| 21 | `.../documents/:documentId/print` | DocumentPrint | Hassan | ⚠ | ☐ | ☐ | **DOMPurify blocker** |
| 22 | `.../traceability` | TraceabilityMatrix | Hassan | ⚠ | ☐ | ☐ | Fix a11y (aria-pressed) |
| 23 | `.../validation` | ValidationEngine | Hassan | ⚠ | ☐ | ☐ | Add formula panel |
| 24 | `.../diagrams` | ProjectDiagrams | Hassan | ⚠ | ☐ | ☐ | Add PlantUML disclosure notice + save-diagram (new backend, PRD 03 §7.1) |
| 25 | `.../analytics` | ProjectAnalytics | Hassan | ⚠ | ☐ | ☐ | Use `Card`, share Gauge primitive |
| 26 | `.../versions` | ProjectVersions | Hassan | ⚠ | ☐ | ☐ | Honest run-history + coming-soon |
| 27 | `.../settings` | ProjectSettings | Hassan | ⚠ | ☐ | ☐ | **Recover share-link + delete from placeholder** |
| — | 404 | NotFound | Hassan | ✅ | — | ☐ | — |
| — | Global error | ErrorBoundary | Hassan | ✅ | — | ☐ | — |
| — | Welcome overlay | WelcomeOverlay | Hassan | ✅ | — | ☐ | Component, not page |

Legend for **State**: ✅ done · ⚠ needs rebuild · ⛔ blocked

---

## Sequencing recommendation

Do these in order, not in parallel:

**Wave 1 — the trust foundation** (blockers unblocked)
- Global blockers (top of file)
- #22 Traceability (fix a11y; other pages depend on the accessible-widget pattern)
- #23 Validation (formula panel — this is the product promise)
- #21 DocumentPrint (security)

**Wave 2 — the recoveries**
- #5 Profile (recover password change)
- #27 ProjectSettings (recover share-link + delete-project)
- These prove the "recover before delete" method works

**Wave 3 — the registries** (one refactor, apply five times)
- Extract `sortAndSearch` + shared `RegistryRow`
- #15 RequirementRegistry (most complex — pattern reference)
- #14 UseCaseRegistry, #16 DesignElementRegistry, #17 TestCaseRegistry (parallel builders)
- #13 BusinessObjectiveRegistry (last — needs BO backend first)

**Wave 4 — the workspace**
- #12 ProjectWorkspace
- #20 DocumentEditor (split into ~5 sub-components)
- #18 DocumentsLibrary, #19 TemplateLibrary

**Wave 5 — the periphery**
- All the account / settings / help / docs pages
- Analytics, Versions
- Landing polish

**Wave 6 — the showpieces (final polish)**
- Landing hero (3D or premium 2D — decide later)
- Shared report (read-only fidelity to the internal report)

Each wave ends when its pages are ticked here **and** their tests are DONE.

---

## What "done" looks like at scale

The whole plan is done when:

- Every row above is ticked.
- Every ⚠ is now ✅.
- Every routed page uses `components/ui` primitives.
- Grep for `function Icon(` in `pages/` returns zero.
- Grep for `href="#"` in `src/` returns zero.
- Every P0 test in the master file is DONE.
- The critical journey E2E is green in CI.

Then run a fresh `SKILL-analyzer.md` pass. Compare High-severity finding count against v2 audit. If it's meaningfully lower, ship. If not, another wave.
