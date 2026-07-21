# Prompt — Codex Test Implementation

**How to use this file:** paste this entire prompt into Codex (or another agent). Attach the referenced project files. Codex will produce a test file that you review, run, and merge. Read the notes at the bottom — this prompt is designed so you *learn* while Codex codes; do not skip the review.

---

## Copy from here ↓

You are implementing test cases for **DevDoc**, a documentation lifecycle management web app. Your job is to write one test file, not to modify production code.

## Context you must read first

1. `project-control/skills/SKILL-test-case-author.md` — the rules for how tests are structured in this project.
2. `project-control/testing/00-test-strategy.md` — the layers and tools we use.
3. `project-control/testing/01-test-cases-master.md` — the master list of test cases with codes.
4. `project-control/prds/00-PRD-master-scope.md` — what the product is supposed to do.
5. The PRD relevant to your test's subject (`01-PRD-frontend.md`, `02-PRD-backend.md`, etc.).
6. The **actual source file** the test targets. Read the whole file; do not skim.

Do not proceed until you have read all six.

## Task

Implement test case **`{{TC_CODE}}`** from `01-test-cases-master.md`.

Its description in that file is authoritative. If the description is ambiguous, stop and ask a clarifying question — do not guess.

## Rules

1. **Correct layer.** Match the layer specified in the master file (U / C / A / H / E). If you believe the layer is wrong, say so and stop; do not silently change layers.
2. **Colocate.** Frontend tests go next to the component/page they test. Backend HTTP tests go in `backend/src/tests/http/`. Playwright tests go in `e2e/`.
3. **Follow the naming convention** in the skill file. The test's `TC-*` code appears as a doc comment above the `test()` call.
4. **Given / When / Then.** Every test has a clear setup, a single action under test, and behavior-level assertions. Never assert that a mock was called if you can assert what the user sees instead.
5. **No `.only`, no `.skip`, no `xit`.**
6. **Fixtures are inline.** Do not reach for a shared test-fixture file if it doesn't already exist.
7. **The test must be able to fail.** Run it against the current code and confirm it either (a) passes because the code is correct, or (b) fails with a message that a human could act on. If it passes trivially — before any behavior exists to test — you've written the wrong test.
8. **Ownership tests are parameterized.** If you're writing a `TC-BE-AUTHZ-*` test, add it to the parameterized suite; do not create a new file.
9. **Do not modify production code.** If a test cannot be written because a helper is missing (e.g. `renderWithProviders`), stop and describe the helper you need. Do not add it yourself.

## Output

1. The **complete test file**, ready to save.
2. The **command** to run just this test (e.g. `npm run test -- RequirementRegistry`).
3. A **one-paragraph explanation** of what the test proves and what it does *not* prove.
4. A **note** on which line of `01-test-cases-master.md` needs to change from `TODO` to `WIP` (do not edit the file — the human does that).

## Rejection criteria (do not submit if any of these are true)

- The test would pass even if the code did nothing.
- The test asserts on a mock call rather than a visible effect.
- The test depends on real time (uses `new Date()` without freezing) or real randomness.
- The test touches unrelated code.
- The test has no `TC-*` code in a doc comment.

## When you're done

Return the file, the run command, the explanation, and the note. Then stop. Do not open a PR. Do not modify other tests.

## Copy to here ↑

---

## Notes for the human (do not paste to Codex)

**Why this prompt is structured this way:**

- It forces Codex to read the actual codebase and PRDs first — the audits fired because previous work skipped this step.
- It rejects Codex's most common failure mode ("write a test that only proves the mock was called"). If Codex hands you a test that asserts on mocks, reject and ask again.
- It keeps the human in the loop: Codex writes the test, you run it, you review it, you mark it WIP → DONE in the master file. This is how you *learn* the test-authoring skill instead of outsourcing it.

**How to grow from this prompt:**

1. Start with a `P0` from the master list — the failure modes matter more than the exercise.
2. When the test comes back, run it. Watch it fail on the buggy code path (if applicable). This is the moment you learn what the test proves.
3. Fix the code (or ask Codex to fix it in a separate prompt — never mix "write the test" and "write the fix" in one turn — a test written with knowledge of the fix is a tautology).
4. Watch the test go green. Move it to DONE in the master file with the PR link.

**When Codex hallucinates:**

- Hooks that don't exist ("`useRequirementsQuery`") — stop, tell it the real hook name.
- Assertions on internal library APIs — reject, ask for user-visible assertions.
- Wrapping every test in `try/catch` — the framework catches. Delete.

**When to escalate to a real code review instead:**

- If the test seems trivially right but you don't know *why*, don't merge. Ask a human or ask Codex to explain in one paragraph what each assertion proves. If it can't, the test is decorative.

## Optional variants of this prompt

Substitute `{{TC_CODE}}` with:

- `TC-BE-AUTH-009` — a good first backend HTTP test (session revocation)
- `TC-FE-REG-003` — a good first frontend component test (silent failure)
- `TC-E2E-JOURNEY-001` — Playwright critical journey (do this last)

The three above cover three layers; doing all three will teach you the shape of every other test in the repo.
