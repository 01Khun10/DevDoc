# PRD 00 — Master Scope

**Owner:** Hassan (sole developer)
**Status:** Living document — update on scope change. Per `AGENTS.md` §3, this PRD is a proposed working reference, not a declared authoritative baseline, until the user says otherwise.
**Last verified against repo:** at folder creation
**Precedence:** [REVISED 2026-07-21 — `foundations/` is now historical reference, this PRD is the baseline] Exact profile names, codes, document types, and template codes still match `foundations/devdoc-template-package-v1.md` §6 as of the last verification — that file remains useful as the detailed field-level record, but this PRD is the authoritative source going forward. The traceability chain and module-numbering discrepancies that were open against `foundations/devdoc-master-context.md` are resolved (see that file's status section) — Code Module is in scope, and the 8-module ownership-based list here is canonical.

---

## 1. Product identity

**DevDoc** is a documentation lifecycle workspace for software engineering teams and students. It treats documentation as *structured, linked, validatable data* — not free-form text.

A DevDoc project is a graph of typed artefacts (Business Objectives → Use Cases → Requirements → Design Elements → Code Modules → Test Cases) authored inside structured documents (Scope, SRS, SDS, STP) from templates, continuously validated by a rules engine (Doc-Linter), and shareable read-only via time-limited links.

**[UPDATED 2026-07-21 — resolves the open item in `foundations/devdoc-master-context.md`]** `Code Module` is confirmed in scope, not a placeholder — see Module 5 below for what it does and why it needs a phased build.

## 2. Users and jobs-to-be-done

| User | Primary job | Success looks like |
|---|---|---|
| Student on an FYP | Produce a defensible SRS/SDS/STP + traceability | Supervisor sees a linked, validated project via a share link |
| Small engineering team | Keep specs from drifting from code | A requirement changes; impacted design elements and tests are surfaced |
| Supervisor / reviewer | Judge whether a project is coherent | Open a share link, see readiness score, findings, and the trace graph |

**We are not building for:** large enterprise teams with existing ALM tools (Jira / Polarion). No ticketing, no sprints, no time tracking.

## 3. Core outcomes (in priority order)

1. **A project's documentation stays internally consistent** — links between artefacts are visible and validated.
2. **A user can prove that consistency to someone else** — via a share link + a readiness score whose formula is inspectable.
3. **Documentation authoring is guided, not blank-page** — templates, section-level guidance, inline requirement capture.
4. **Diagrams live alongside the artefacts they describe** — PlantUML for now, one code-and-preview studio.

## 4. Non-goals (things we're explicitly not doing)

- No LLM-generated documentation. The suggestion engine uses deterministic TF-IDF. This is a *feature*, not a limitation — see PRD 04 §4.
- No real-time collaboration. Single-user autosave only.
- No offline mode.
- No mobile-native app. Responsive web only (320 / 390 / 768 / 1024 / 1440).
- No plugin/extension surface.
- No public API. All endpoints are session-cookie authenticated and same-origin.

## 5. Feature scope by module (matches team split)

### Module 1–3 — Authentication, project management, documents
Register / login / logout / profile / password change with real revocation.
Project CRUD with real delete (typed-name confirmation).
Document creation from templates, section editor with autosave, print/export view gated on validation.
Share link with expiry, revoke, and last-access metadata.

### Module 4 — Requirements & artefact registries (Hassan)
Five registries: Business Objectives, Use Cases, Requirements (FR + NFR), Design Elements, Test Cases.
Each with inline status/priority editing where the domain supports it, sortable, searchable, deep-linkable via `?highlight=`.
Registry pattern shared, not five reimplementations.

### Module 5 — Traceability (Hassan)
Five views over one link model: Grid, Graph, Map (floor-plan), Builder, Suggestions.
Real referential integrity (see PRD 03 §3).
TF-IDF suggestions with visible match reasoning.

**Code Module linking + drift detection [ADDED 2026-07-21 — confirmed in scope by the user, not optional].** The chain's missing link: connecting a Design Element (or Requirement) to the actual file(s) in the codebase that implement it, then surfacing when documentation and code have drifted apart — the requirement says one thing, the linked file has since changed and may no longer match, or a design element has no linked code at all. This is a real, named feature, not vague "AI will handle it" — see PRD 04 §4.4 for the two-tier design (a deterministic staleness check that ships first, and a semantic drift check that's disclosed and opt-in). See PRD 03 §7.4 for the `CodeModule` schema addition this requires.

**This directly revises a stated non-goal.** `foundations/devdoc-master-context.md`'s scope decisions list "Full GitHub repository scanning" as explicitly out of first-implementation scope. The feature above is compatible with that non-goal only because of how it's scoped in PRD 04 §7 — it links specific files a user points at, not an automatic full-repo crawl. If the ambition grows beyond that (e.g., auto-discovering every file relevant to every artefact without the user linking them), that would cross back into "full repository scanning" and needs the non-goal formally revised, not just worked around.

### Module 6 — Validation engine / Doc-Linter (Hassan)
Rules as data (seeded `ValidationRule` rows).
Readiness score with **visible formula** — see PRD 04 §5.
Deep-links from finding to affected artefact.
Historical run snapshots, immutable.

### Module 7 — Diagram designer (Hassan)
PlantUML code editor + live preview.
One real project generator: traceability tree.
14 UML templates for author-from-scratch.
Data-disclosure notice when rendering via external `plantuml.com`.

### Module 8 — Analytics, versions, settings
Analytics page (artefact counts, readiness trend, per-document completion).
Versions page — validation run history (honest: full snapshots are not implemented).
Per-project settings and global app settings.

## 6. Non-functional requirements

| Category | Requirement | Verification |
|---|---|---|
| **Security** | JWT in httpOnly cookie, bcrypt cost 12, tokenVersion on revocation, DOMPurify on all `dangerouslySetInnerHTML`, share links expire, rate-limit trusts proxy config | Supertest suite (see PRD 02 §5) |
| **A11y** | WCAG 2.1 AA. All interactive elements keyboard-reachable with visible focus. Focus trap in modals. `aria-*` on all custom widgets. Reduced-motion honored | Axe scan per page + manual keyboard traversal per page |
| **Perf** | Lighthouse ≥ 85 on landing and dashboard. Editor input latency < 50ms at typical section length (~5KB). Validation run < 5s for a project with ≤ 200 artefacts | Playwright + Lighthouse-CI |
| **Responsiveness** | Every route usable at 320 / 390 / 768 / 1024 / 1440. No horizontal scroll except intentional (matrix grid) | Visual regression at 5 widths, Playwright |
| **Truthfulness** | Every visible control does something real or is not rendered. Every displayed number has a visible formula. No `href="#"` anywhere in `src/` | Grep check in CI (see PRD 04 §5) |
| **Data integrity** | No `TraceabilityLink` can point at a nonexistent or cross-project artefact. Verified at DB level, not just service level | DB constraint (see PRD 03 §3) |

## 7. Success metrics

- **Trust metric:** A supervisor evaluating a shared report can, without asking questions, understand what the readiness number means and see the underlying findings.
- **Consistency metric:** The end-to-end critical journey (§8) runs green in CI on every push.
- **Discipline metric:** Zero duplicate implementations of any primitive (icons, cards, grid backgrounds, ownership checks, error factories) across the codebase, verified by an analyzer pass (see `skills/SKILL-analyzer.md`).

## 8. The critical journey (the one thing that must always work)

This is the single path that proves the product works. It runs in Playwright against a real database in CI.

1. Register a new user
2. Log in
3. Create a new project (Standard profile)
4. Create a document from the SRS template
5. Write content into three sections (autosave verified)
6. Capture a requirement inline from selected text
7. Create a use case
8. Link the use case to the requirement (via Builder)
9. Run validation
10. Verify readiness score updates and no unexpected errors
11. Create a share link with a 24h expiry
12. Log out (verify token is revoked — old cookie can't be re-used)
13. Open the share link in a fresh session, verify read-only rendering
14. Revoke the share link
15. Verify the link no longer resolves

Until every step passes automatically end-to-end, DevDoc is a demo.

## 9. Out-of-scope for v1 (backlog)

- Multi-owner projects / project sharing with edit
- OAuth (Google / GitHub) login
- Import from Word / Confluence / Jira
- Custom validation rules per project
- Custom document templates authored in-app
- Export as .docx (PDF via browser print is v1)
- Self-hosted PlantUML rendering (v1 uses public plantuml.com with disclosure)

## 10. Roadmap (aligned to sequencing in README)

| Sprint | Duration | Exit condition |
|---|---|---|
| 0 — Truth & safety | 2–4 days | Zero fake controls, zero dead files, zero unrouted `Placeholder` pages in `pages/`, DOMPurify wired, share expiry enforced |
| 1 — Recover & propagate | 1 week | Live `Profile` / `ProjectSettings` have the working password-change / share / delete flows. `assertProjectOwnership`, `createAppError`, `sortAndSearch` extracted and imported everywhere. `useAuthGuard` deleted |
| 2 — Test proof | 1 week | Supertest auth+ownership suite passes for two users across every resource family. Playwright critical journey (§8) green in CI. `app` exported separately from `app.listen` |
| 3 — DB integrity | 1 week | `TraceabilityLink` has referential integrity. `Project.status`, `TestCase.status`, `TraceabilityLink.linkType` are DB enums. Indexes added per `PRD 03 §4` |
| 4 — Frontend architecture | 1–2 weeks | Every routed page uses `components/ui` primitives. Every registry uses shared `sortAndSearch`. Grid background is one CSS class everywhere. Validation formula visible on the page |
| 5 — Session & sharing hardening | 3–5 days | `tokenVersion` invalidates old JWTs on logout / password change. Share links have expiry UI, revoke UI, last-access metadata |
| 6 — Scale readiness | as-needed | Pagination on all list endpoints. `actorId` populated on activity log. PlantUML disclosure notice on diagram render |
| 7 — AI integration layer [ADDED 2026-07-21] | after everything above | Every module's AI layer from `PRD 04 §4.1` is implemented and shipped, one module at a time, following the house rules in `PRD 04 §4.2`. Not started until Sprints 0–6 are done — the deterministic core has to exist and be proven (tested, real, not a placeholder) before anything gets layered on top of it. See `PRD 04 §4.1` for what "architectural room" means per module and why the UI shows nothing for this sprint until it actually ships. |

No sprint ships without its tests. No sprint ships without its `CHANGELOG.md` entry pointing at the PRD sections it satisfies.

## 11. Definition of "done"

For any feature: (1) matches its PRD section, (2) has test cases in `testing/01-test-cases-master.md`, (3) tests pass in CI, (4) passes the reviewer checklist in `skills/SKILL-reviewer.md`, (5) `CHANGELOG.md` entry references the PRD sections, (6) no PRD section is left orange (partially built) at merge.

## 12. Definition of "not vibe-coded anymore" (from v1 audit)

Copied verbatim because it's the target:

> - One canonical implementation exists for each route and concept.
> - Visible features are real, not decorative promises.
> - Critical journeys are exercised automatically against the API and database.
> - Cross-user authorization is proven, not assumed.
> - Traceability integrity is enforced below the UI.
> - Validation results state exactly what they prove and what they do not.
> - Shared components reflect repeated product behavior rather than generated aesthetics.
> - Responsive and accessible behavior is regression-tested.
> - Documentation matches current behavior.
> - New work begins from an approved baseline and measurable acceptance criteria.

If this list stops being aspirational and starts being a description, we're done with sprint 4.
