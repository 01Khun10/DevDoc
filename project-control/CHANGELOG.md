# Changelog

Every meaningful change to DevDoc is logged here. Format is manual — not conventional-commits, not semver — because this is a living project, not a released library.

**Rule:** every merged PR adds one entry (or amends the current unreleased entry). Every entry cites the PRD sections it satisfies.

---

## Unreleased

### Sprint 0 — Truth & safety (in progress)

- Wired DOMPurify into `DocumentPrint` before rendering stored HTML (PRD 00 §6, PRD 01 §11).
- Enforced non-null share-token expiry with a safe backfill migration; creation defaults to 30 days, rejects past dates and dates beyond 365 days, and public reads reject expired tokens (PRD 02 §5).
- Removed unrouted `*Placeholder.jsx` pages and visible planned/coming-soon controls; removed advertised J/K/E/D shortcuts that are not implemented (PRD 00 §10 truthfulness exit condition).
- Added and passed TC-BE-SHARE-009 through TC-BE-SHARE-011. HTTP and frontend security coverage remain scheduled in the master catalogue.

## 2026-07-21 · Decision: validation-rule naming convention resolved

- **Resolved by the user:** the implemented shared rule-code scheme (`DOC-001`, `SEC-001`, ... — ~18 base rules seeded once per profile with per-profile `severityOverrides`) is canonical, not the originally-specified per-template-prefixed scheme (`STD-SRS-C-001`) in `foundations/devdoc-template-package-v1.md` §8. This was flagged as an open, undecided conflict in the 2026-07-17 foundations-integration pass and again in that file's own §16 status section.
- Updated `prds/02-PRD-backend.md` §8 to document the shared-code scheme as the real, canonical convention.
- Updated `foundations/devdoc-template-package-v1.md` §16 to mark the conflict `[RESOLVED]` — §8 of that file (the original per-template-prefix spec) is left unedited as historical record, per this project's own precedence rule (PRD wins, `foundations/` gets a note, never silently rewritten).
- No code changes required — the implementation already matches the now-canonical scheme.

## 2026-07-21 · New baseline declared — old planning docs void

- **The user has declared `docs/project-control/` (the repo's pre-existing folder — `devdoc-implementation-roadmap.md`, `devdoc-agent-coordination-rules.md`, and its own copy of `devdoc-master-context.md`) and `docs/template-package/devdoc-template-package-v1.md` void.** This `project-control/` folder (at repo root, alongside `backend/` and `frontend/`) is now the complete, approved baseline — the thing `AGENTS.md` §3 said didn't exist yet. It exists now.
- Reversed precedence in `README.md`, `prds/00-PRD-master-scope.md`, and `prds/03-PRD-database.md`: `foundations/devdoc-master-context.md` and `foundations/devdoc-template-package-v1.md` were previously "wins if it disagrees with a PRD." Now the PRDs win; `foundations/` is kept only as historical reference — its verified facts (profile codes, schema fields, the gaps found by checking against real code) are still accurate and worth reading, its *authority* is what changed.
- **Recommended repo cleanup (not done here — these are real files on the user's machine, this session only has the earlier-extracted copy):**
  - Delete `docs/project-control/` entirely (all three files) — superseded by this folder.
  - Delete `docs/template-package/devdoc-template-package-v1.md` — superseded by `project-control/foundations/devdoc-template-package-v1.md`, which has the same content plus a verified status section.
  - After deleting, regenerate the Graphify graph (`AGENTS.md` §4: "regenerate the graph after substantial accepted changes, not after every small edit") — its cached graph currently references the paths being removed.
  - `docs/devdoc-system-instruction-manual.md` (1,400 lines) was found in the same pass and has not been read yet — before deleting anything else in `docs/`, check whether this file is also superseded or still needed.

## 2026-07-21 · Sprint sequencing confirmed: build everything, then AI last

- Confirmed by the user: implement all deterministic stages first, leave architectural room for AI in every module, implement the AI layer only after everything else is done. Added as **Sprint 7 — AI integration layer** in `prds/00-PRD-master-scope.md` §10, explicitly gated on Sprints 0–6 being complete.
- Made "leave room for AI" concrete rather than a slogan — distinguished two things that instruction could mean, and picked one on purpose: **architectural room** (schema/API designed so the AI layer is additive later, no migration, no rewrite) vs. **visible UI room** (a "coming soon" panel sitting on a page doing nothing). Went with architectural room only — a visible placeholder would be the same decorative-promise pattern the audits flagged everywhere else in this project.
- Added a per-module table to `prds/04-PRD-api-comms-ai.md` §4.1 showing what already leaves room (most modules, as a side effect of already-good design — e.g. the suggestions endpoint's `algorithm` field means swapping TF-IDF for semantic scoring later changes zero API contract) versus what needs an explicit name reserved now (one table name reserved for Module 4's future quality-finding feature, one route path reserved for Module 1–3's future draft-assist).
- No schema changes, no new tables actually created — this pass only reserves names and confirms sequencing. Sprint 7 is when anything in this section gets built.

## 2026-07-21 · Correction: AI was always in scope, not a "no AI" product

- **Owning a mistake:** the original PRD 04 framed DevDoc as using "no generative AI" as a positive product principle, built by over-extending the audit's specific praise for the deterministic TF-IDF suggestion scorer into a whole-product stance. That was my error, not the user's intent. Corrected directly: the user confirmed AI was always intended across every module — what's actually sequenced is build order (deterministic core first, AI layer after or alongside), not whether AI exists at all.
- Rewrote PRD 04 §4 entirely: removed the "no AI" framing, added §4.1 — a per-module table of deterministic core (ships first) vs. AI layer (after/alongside), covering all 8 modules. Kept §4.2's house rules (show your work, disclose before data leaves the app, log to `SecurityEvent`, never let an AI layer replace its module's core function) — those were right in the original draft and didn't need correcting, just recontextualizing as "how AI gets integrated" rather than "why we're avoiding it."
- Fixed two stale cross-references that still asserted the old stance: PRD 04 §1's guiding principle #3 ("No LLM dependency") and §4.4's Tier-2 house-rules citation (which cited "off by default" as universal — corrected to match §4.2's actual rule 5, where the opt-in/disclosure requirement is specifically about data leaving the app, not about AI being inherently distrusted).
- Named non-goals from `foundations/devdoc-master-context.md` are unchanged by this correction — "full AI document generation," "AI-generated UML from code," and "custom rule builder" still hold. The correction is about assistive AI layered onto real modules, not blanket generation.

## 2026-07-21 · Solo ownership correction + Code Module scope decision

- **Ownership:** removed every "Dawood" reference across `project-control/` (README, all 5 PRDs, the frontend rebuild plan's 21 owner cells, testing strategy, both templates). This is a solo project — Hassan owns all 8 modules. "Owner" fields are kept in templates for if a collaborator joins later, but nothing currently assumes a second person.
- **Scope decision:** `Code Module` is confirmed in scope for the traceability chain (previously flagged as an open item against `foundations/devdoc-master-context.md`, which marked it optional/placeholder). Resolved by the user: code-to-documentation cross-referencing and drift detection is a real, needed feature.
- Designed as **two tiers**, specifically to reconcile this with the master context's own stated non-goal ("no full GitHub repository scanning") and PRD 04's original "no AI" framing — both real tensions, neither papered over:
  - **Tier 1 (v1, no AI):** user links a specific file to a Design Element/Requirement (`CodeModule` + `implemented_in` link type); DevDoc tracks the file's git commit hash and flags `POSSIBLY_STALE` if it's changed since the link was last verified. Pure git metadata, zero external calls.
  - **Tier 2 (backlog, disclosed, opt-in):** actual semantic drift checking — does the file still do what the doc says. Named explicitly rather than left vague; would reuse the same disclosure/opt-in/logging rules already established for PlantUML (PRD 04 §4.3) and any future AI feature (§4.2). Not scheduled.
- Softened PRD 04's opening claim from "DevDoc uses no generative AI" to "no generative AI that creates content on the user's behalf" — the narrower, now-accurate claim. DevDoc still never writes requirements, documents, or code for the user; it's now allowed to *read* both and report drift.
- New schema: `CodeModule` model + `CodeModuleStatus` enum (PRD 03 §7.4). New `ArtefactType`/`LinkType` values: `CODE_MODULE`, `implemented_in` (PRD 03 §6).
- Both open items in `foundations/devdoc-master-context.md`'s status section are now marked `[RESOLVED]` rather than left open.

## 2026-07-21 · Foundations folder integrated

- Added `project-control/foundations/` with `devdoc-master-context.md` and `devdoc-template-package-v1.md`, both pre-existing project-truth documents (uploaded by the user) that predate this control folder. Original text preserved unedited; status sections appended, not blended in.
- Confirmed `AGENTS.md` and `CLAUDE.md` exist at repo root and are the real cross-agent instruction files. Both establish: no 30% implementation boundary, no authoritative baseline claimed without user approval, conflicts get reported not silently resolved. This folder now explicitly follows that same precedence order.
- Removed the master context's dangling reference to "the 30 percent implementation plan" (confirmed retired per `AGENTS.md` §1) — noted as an update, not silently deleted.
- Verified the template package against the live repo. **Matches spec:** 3 profiles, 12 templates, folder structure, `TemplateSection`/`ValidationRule` schema fields, `DocumentType` enum, ERD-only-in-SDS placement, Doc-Linter required-section check. **Real gaps found:** `exampleText` is null in every section across all 12 templates (content task); `guidanceText` is generic boilerplate, not authored per-section (content task). **Open conflict, not resolved:** validation-rule naming convention in code (`DOC-001` + per-profile severity overrides) diverges from the spec's per-template prefix convention (`STD-SRS-C-001`) — needs a decision. **Frontend defect, own finding:** `ValidationEngine.jsx` and `SharedReport.jsx` render raw `ruleCode` to users, violating the template package's own Frontend Display Rule §4 — not fixed in this pass, flagged for the next touch on those files.
- Added precedence notes to `prds/00-PRD-master-scope.md` and `prds/03-PRD-database.md` pointing to `foundations/` for exact profile/template/schema field truth, so future work doesn't restate or drift from it.
- Flagged two open discrepancies for the user to resolve (not decided here): whether the `Code Module/File` chain step (in master context, omitted from PRD 00) should be added back; whether the 7-module list (master context) and 8-module list (PRD 00, split by ownership) should be reconciled into one.

---

## 2026-07-21 · Project-control folder initialized

- Added `project-control/` with README, five PRDs, three skills, test strategy + master case list, frontend rebuild plan, builder + Codex prompts, and templates.
- Grounded in the repo as of DevDoc.zip on 2026-07-21 and the audits `critics-views.md` (v1) and `critics-views-v2.md`.
- Establishes: guiding principles (subtract before add, one canonical implementation, every visible control real), five PRDs (master / frontend / backend / database / API+AI), the critical journey definition, per-page rebuild plan for all 24 routed pages, 89 planned test cases (61 P0 + 28 P1).
- Added scope items derived from the audits but not previously written down: `Diagram` persistence table (PRD 03 §7.1), `UserPreference` (PRD 03 §7.2), `SavedView` (PRD 03 §7.3), `SystemAudit` + `SecurityEvent` (PRD 03 §5), in-app `Notification` system (PRD 04 §6.3), OpenAPI documentation target (PRD 04 §11). Each marked `[ADDED]` in the PRD.
- Does not change any code. First subsequent PR: Sprint 0 (security + truth) starts here.

## 2026-07-17 · Consolidation pass

- Routed the real Profile, AppSettings, ProjectSettings, ProjectVersions, Documentation pages. Deleted 8 placeholder files.
- Extracted one canonical `Icon` in `components/ui`; removed 27 local `function Icon` copies from `pages/`.
- Added `.devdoc-grid-bg` / `.devdoc-grid-bg-fixed` classes to `index.css`.
- Stripped `rev 3.0` / `REV_3.0` stamps from Login, Register, Accessibility, Help, WelcomeOverlay.
- Centralized 401 handling in `apiRequest` (redirects to `/login` once, auth + public routes exempt). Added AbortSignal support.
- `vite build` verified green (13.03s / 10.72s).
- Recorded in `docs/CONSOLIDATION_PASS.md`.
- **Regression to fix next:** placeholder files were deleted before their working sub-components (`AccountInfoCard`, `SecurityCard`, `ShareLinkSection`, `DeleteConfirmModal`) were ported into the live pages. This is called out in the v2 audit as H8 and in PRD 00 §10 Sprint 1 as a first-priority recovery.

## 2026-07-20 · Backend baseline

- Prior work by the team: Express + Prisma backend, 46/46 pure-logic tests pass, no HTTP/auth/DB integration tests exist yet.
- Note: `.secrets/` folder was found in the extracted repo. Any credential ever committed to it should be rotated; `.secrets/` added to `.gitignore` before any subsequent commit.

## Entry template (copy for each PR)

```
## YYYY-MM-DD · {Short title}

- What changed, in a sentence.
- Satisfies: PRD 0X §Y (which sections).
- Test cases added: TC-...-001, TC-...-002 (status TODO → DONE).
- Files removed: {list, if any}.
- Migrations: {list, if any}.
```
