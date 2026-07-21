# Test Strategy

**Purpose:** the single source of truth for how DevDoc is tested. Every layer, every tool, every job in CI.

**Non-goal:** achieving a coverage percentage.

---

## 1. What we're testing for

The audits identified three failure modes tests must prevent:

1. **Tenant boundary violations.** User A can read/write user B's data.
2. **Data integrity gaps.** Orphaned links, missing transactions, silent update failures.
3. **User-facing lies.** Documented features that don't work, disabled controls whose backends exist, computed numbers with no visible formula.

Tests that don't address one of these three failure modes are lower-priority than tests that do.

## 2. Layers and tooling

| Layer | Tool | Runs in | Runs against |
|---|---|---|---|
| **Backend unit** | Jest | CI + `npm run test:unit` in `backend/` | `node`, no DB |
| **Backend HTTP** | Jest + Supertest | CI + `npm run test:http` | Test Postgres via Docker |
| **Frontend unit / component** | Vitest + React Testing Library | CI + `npm run test` in `frontend/` | `jsdom`, MSW for network |
| **Frontend accessibility** | `vitest-axe` | CI + `npm run test:a11y` | `jsdom`, snapshot Axe scan |
| **End-to-end** | Playwright | CI + `npm run test:e2e` (Docker Compose spin-up) | Real backend + real Postgres |
| **Visual regression** | Playwright screenshots (v2) | Nightly | 5 widths per critical page |

Type-checking (`tsc --noEmit` if we adopt TS, `eslint --max-warnings 0` today) runs as a **gate**, not a test — it blocks CI but isn't a test suite.

## 3. CI jobs

```
lint            ← eslint, prettier check
type            ← tsc if TS, otherwise noop
test-be-unit    ← backend Jest unit
test-be-http    ← backend Supertest against dockerized Postgres
test-fe-unit    ← frontend Vitest
test-fe-a11y    ← frontend Axe scans
test-e2e        ← Playwright critical journey
build           ← vite build
```

`test-e2e` runs on the `main` branch and on any PR touching `frontend/**` or `backend/**`. Nightly runs the full suite plus visual regression. A PR merges only when all jobs pass.

## 4. The critical journey (Playwright)

Detailed in PRD 00 §8. Reproduced here for the tester:

1. Register a new user (unique email per run)
2. Log in
3. Create a project (Standard profile)
4. Create a document from the SRS template
5. Write into three sections; verify autosave indicator
6. Select text; capture as a requirement inline
7. Create a use case
8. Open Traceability → Builder; link the use case to the requirement
9. Run validation; assert readiness score is present and the breakdown fields sum correctly
10. Create a share link with a 24-hour expiry
11. Log out; assert old cookie no longer authenticates
12. Open the share link in an incognito context; assert read-only rendering with the same readiness score
13. Log back in; revoke the share link
14. Assert the share URL now returns 404

If any step regresses, the PR that introduced it doesn't merge.

## 5. Coverage targets (behavioral, not percentage)

- **Every route in PRD 04 §2.1** has at least a Supertest smoke.
- **Every mutation hook in `frontend/src/api/`** has a success test and an error test.
- **Every routed page** has a mount-smoke test and a keyboard-nav test.
- **Every `components/ui` primitive** has one interaction test.
- **Every validator branch** has a test.
- **Every "show your work" endpoint** has a test asserting the formula fields.

## 6. Test data policy

- Backend HTTP suites use a Dockerized Postgres. Each test file resets its own schema via `prisma migrate reset --force`.
- Test users are created per-test — no long-lived shared user.
- Passwords are hardcoded, deterministic.
- Fixtures live in `backend/src/tests/setup/fixtures.js`; they build objects, they don't own state.
- E2E has a `test-seed` script that creates a demo user + minimal project. Tests may also create their own data mid-flight.

## 7. Flake policy

- A test that fails intermittently is quarantined into `.flaky/` and gets a linked issue within 24 hours.
- After 3 quarantined-flake days without a fix, the test is deleted, not kept red. A quarantined test that no one owns is noise pretending to be signal.
- E2E flakes are the exception — they should be treated as bugs in the *product* until proven otherwise. Real-timing bugs are the ones users hit.

## 8. Local development workflow

- `npm run test` in either package runs its unit tier in watch mode.
- `docker compose up test-db` boots a scratch Postgres on port 5433 for Supertest.
- `npm run test:e2e:headed` runs Playwright with a visible browser for debugging.

## 9. What CI enforces that local doesn't

- Zero test skips / onlys.
- Zero warnings from Vitest / Jest.
- No new tests added without a `TC-*` code in the description.
- Playwright critical journey ran to completion in the last 24h against `main` — otherwise `main` is broken and PRs to it are queued.

## 10. Onboarding a contributor (Codex, or anyone else who joins later)

Order of operations:

1. Read `skills/SKILL-test-case-author.md`.
2. Pick a `TODO` test case from `testing/01-test-cases-master.md`.
3. Write the test in the correct layer file.
4. Run it locally; watch it fail on real code (never accept a green test you didn't first see fail).
5. Move it from TODO to DONE in the master file.
6. PR with the test-case code in the description.

If Codex is doing this work, feed it `PROMPT-codex-test-implementation.md`.
