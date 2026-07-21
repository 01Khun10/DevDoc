# SKILL — Analyzer

**When to invoke:** at the end of every sprint, before merging a significant PR, or whenever a suspicion arises that the codebase is drifting. Not a linter — a *pattern* audit.

**Output:** a document following the shape of `critics-views-v2.md` in the project root. It should be directly comparable to previous audits so the team can see whether things are improving or drifting.

---

## 1. What this skill exists for

Linters catch syntax problems. Type-checkers catch shape problems. Tests catch behavior problems. **Nothing except a human-shaped audit catches "we built two of the same thing".** DevDoc's audits found exactly this class of problem — a Grade-A implementation of the wrong thing (two auth-guard paths, three graph implementations, seven placeholder pages more functional than their live replacements).

This skill is how DevDoc keeps its audit pass every sprint instead of hoping.

## 2. Scope of an analyzer pass

- **Four full-file reads**, not excerpts:
  1. Backend auth / infrastructure (`backend/src/controllers/authController.js`, `middleware/`, `utils/`, `server.js`, rate limiters)
  2. Backend domain (`backend/src/services/*Service.js`, `prisma/schema.prisma`, one route sample)
  3. Frontend data / state (`frontend/src/api/*.js`, `services/*Service.js`, `context/*Context.jsx`)
  4. Frontend pages / components (`frontend/src/pages/*.jsx`, `components/`, `layouts/`, `App.jsx`)
- **Cross-check with grep**: any suspected duplicate or dead file gets verified by `grep -rn "<symbol>" .` across the repo — a file is only "dead" if it has zero import sites.
- **Cross-check with the routing table**: every page that exists must be reachable from `App.jsx`. Every route in `App.jsx` must resolve to a real file.

## 3. Method (do it in this order)

**Step 1 — Inventory.**
Enumerate all pages, all services, all routes, all hooks, all components. Record file paths and line counts. This is the raw material.

**Step 2 — Ownership check.** For every backend endpoint that touches project data, confirm `assertProjectOwnership` (or its inline equivalent) is called *in the same query* as the fetch/mutation. If it's a separate `findFirst` followed by a `findMany` without ownership on the second query, that's a **critical** finding.

**Step 3 — Duplication pass.**
Grep for helpers that look duplicated. Common patterns:
- `function createXxxError` (should be one)
- `function Icon` in `pages/` (should be zero)
- `linear-gradient(var(--devdoc-grid-line)` (should be zero, use the class)
- The same rate-limit config repeated
- `ownerId === ...` outside the shared helper

Each occurrence is a finding; the count is a metric.

**Step 4 — Dead-code pass.**
For every file in `pages/`, `components/`, `hooks/`, `api/`, `services/`:
```
grep -rln "<filename-without-extension>" src/ | grep -v "^src/<path-to-that-file>"
```
Zero results outside the file itself → confirmed dead. Cross-reference with `App.jsx` routing.

**Step 5 — Fake-control pass.**
- `grep -rn 'href="#"' frontend/src/`
- `grep -rn 'to="#"' frontend/src/`
- `grep -rn "disabled" frontend/src/pages/` and inspect: any `disabled` button with a comment about a missing backend endpoint — verify the endpoint's existence with a route grep. If it exists, that's a `HIGH` finding (H8 in v2).

**Step 6 — Design-dialect pass.**
- `grep -rn "function Icon" frontend/src/pages/` — should be zero
- `grep -rn 'className.*style={{' frontend/src/pages/` — mixed className + inline style
- `grep -rn 'bg-\[var(' frontend/src/pages/` — bracket-syntax color usage (post-sprint-4 antipattern)
- `grep -rln 'import.*from "../components/ui"' frontend/src/pages/` vs total page count — how many pages use the shared library at all?

**Step 7 — Fake-decoration pass.** [ADDED]
Blueprint aesthetic is one thing; fake instrument stamps are another. Grep for:
- `REV_3` / `rev 3.0` / `SYS_STATUS` / `SYS_DOC_ID` in `pages/`
- Anything with `STATUS: CRIT` or similar that isn't fed by real system state

Findings from this pass go under "vibecode fingerprint" in the report, not "critical". They're cheap to fix.

**Step 8 — "Documented but broken" pass.**
For every claim the app makes to the user (accessibility features, keyboard shortcuts, coming-soon labels), verify the claim's truth in the code. If `AppSettings` lists a J/K keyboard shortcut, `useKeyboardNav` must be imported by at least one page that actually renders lists. Otherwise it's H10.

**Step 9 — "Show your work" pass.**
For every number the frontend displays (readiness, coverage %, N linked, N traced), find the API call that produced it. If the API returns a bare number without a breakdown, that's a `MEDIUM` finding.

**Step 10 — Write it up.**
Use `critics-views-v2.md` as the template. Include:
- Executive summary (2 paragraphs, honest, calibrated)
- Priority-1 table
- Findings by severity (Critical / High / Medium / Low)
- Dead-code inventory
- What's done well (this is not optional — a review that's all criticism is untrustworthy)
- Vibecode fingerprint patterns
- Suggested sequencing

## 4. Severity rubric

- **Critical** — active vulnerability or data-loss vector. Users at risk right now.
- **High** — functional gap, security defense-in-depth missing, silent data corruption possible, or user-facing lie (documented control that doesn't work; disabled button whose endpoint exists).
- **Medium** — duplication that will drift, missing indexes, missing enums, missing pagination — not urgent but real cost.
- **Low / Nit** — style, ergonomics, doc gaps. Not blocking; suggested.

Do not inflate severity to make findings look important. Do not deflate to make the codebase look better than it is. If unsure, describe the impact concretely; the reviewer can rank.

## 5. What the analyzer does NOT do

- Doesn't judge code style beyond correctness (no naming/formatting nits).
- Doesn't propose implementations. Findings only. Proposals live in PRDs.
- Doesn't refactor code. That's a separate task.
- Doesn't rerun tests. Trusts the CI signal.
- Doesn't score / grade. The codebase isn't a student assignment.

## 6. Output location and versioning

- Save as `docs/audits/critics-views-vN.md` where N is the next integer.
- Never edit a previous audit. New audit, new file.
- The introduction cites the previous audit and calls out what changed (better, worse, unchanged).
- Package the audit as a discussion PR: reviewers agree on the priority-1 items before any code changes.

## 7. When Codex or another agent runs this skill

Feed it this file + the current repo. Its output must be a full audit document in the same format, saved to the audits folder. Its own limitations are stated in the executive summary ("I read files X, Y, Z; I did not run any tests"). Never let a summary claim more than it verified.

## 8. Metric to track over time

The single most useful number to graph across audits:

- Count of **High** findings, sprint over sprint. It should trend down.

If it trends up, the sprints aren't the right sprints.
