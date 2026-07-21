# SKILL — Test Case Author

**Purpose:** teach the team (and Codex, when used) how to author *useful* test cases for DevDoc — the ones that would actually catch the bugs the audits flagged.

**Non-goal:** coverage percentage. A repo can hit 90% coverage and prove nothing about whether the product works. What matters is which layer, which behavior, and which failure mode.

---

## 1. The four layers (and which bug each layer catches)

| Layer | Tool | Catches | Doesn't catch |
|---|---|---|---|
| **Unit** | Vitest (frontend) / Jest (backend) | Pure logic — `nextCode`, `validationChecks`, `scoreReadiness`, sort/search helpers, form validators | Anything that hits the network, DB, or DOM |
| **Component** | Vitest + Testing Library | UI primitives, complex widgets, single-page flows | Server behavior, cross-page navigation |
| **HTTP / API** | Jest + Supertest | Endpoint contracts, ownership boundaries, validation error shapes, transaction semantics | UI, real database bugs |
| **E2E** | Playwright | Critical journeys, real cross-page behavior, real database, real cookies | Fine-grained edge cases (too slow) |

**Choose the highest layer that reproduces the bug, then move down for cheaper coverage.** If the bug is "user can't complete registration", write the E2E first — even if a unit test would run faster.

## 2. The Given / When / Then format

Every test — every one — is structured mentally as:

- **Given** — the world before the test runs (fixtures, DB state, mocks)
- **When** — the single action under test (a function call, an API request, a click)
- **Then** — the *behavior* observed (a value returned, a side-effect, a rendered element)

Not: "Then the mock was called." Test the visible effect. If the mock's call is the only thing you can assert on, the test is at the wrong layer.

## 3. Test file location

```
frontend/src/
├── pages/
│   ├── RequirementRegistry.jsx
│   └── RequirementRegistry.test.jsx        ← colocated
├── components/ui/
│   ├── Button.jsx
│   └── Button.test.jsx
├── hooks/
│   └── useAuth.test.js
└── test-utils/                             ← shared render helpers, MSW handlers
    ├── renderWithProviders.jsx
    └── mockHandlers.js
backend/src/
├── services/
│   ├── requirementService.js
│   └── requirementService.test.js          ← colocated pure-logic tests
└── tests/
    ├── http/
    │   ├── auth.test.js                    ← Supertest, one file per route family
    │   ├── requirements.test.js
    │   └── ownership.test.js               ← two-user matrix (see §5)
    └── setup/
        ├── testDb.js
        └── fixtures.js
e2e/
├── critical-journey.spec.ts
├── auth.spec.ts
└── validation.spec.ts
```

## 4. Naming

- File: `<subject>.test.js(x)` or `<journey>.spec.ts` for Playwright
- Describe block: the subject (`RequirementRegistry`, `POST /api/projects/:id/requirements`, `Critical journey`)
- Test name: **behavior**, not implementation. "shows an error toast when the update fails" — not "calls setError with the error message"

## 5. The two-user authorization matrix (the test that catches the class of bug reviews miss)

For every resource family (projects, requirements, use cases, business objectives, design elements, test cases, traceability links, documents, sections, validation runs, share tokens), write **one** parameterized Supertest suite:

```js
describe.each(RESOURCES)("Ownership: %s", (resource) => {
  test("user A creates a resource, user B cannot read it (404)", async () => { ... });
  test("user A creates a resource, user B cannot update it (404)", async () => { ... });
  test("user A creates a resource, user B cannot delete it (404)", async () => { ... });
  test("user A creates a resource, user B cannot list it in their own projects", async () => { ... });
});
```

This one file, if it stays green, is the single strongest evidence that the app is tenant-safe. Without it, every ownership check is on the honor system.

## 6. What deserves a test (positive rules)

- **Every branch of a validator.** If a validator has "required", "min length", "max length", "type mismatch", each has a test. Both success and failure.
- **Every service function's happy path + one error path.** The error path is often the interesting one (transaction rollback, unique-constraint violation, ownership mismatch).
- **Every mutation hook's `onError`.** The `RequirementRegistry.updateField` silent-fail is finding H7 — the exact bug a test would have caught.
- **Every "computed number" endpoint.** Assert that the formula fields are present and internally consistent (`sum(value × weight)` = `score / 100`). If the numbers stop adding up, the test fails.
- **Every route in the API PRD.** Even if the assertion is "returns 200 with the expected shape."
- **Every critical-journey step.** In an E2E, always.

## 7. What does NOT deserve a test

- Third-party libraries. Testing that React Query caches isn't your job.
- Simple property access. `expect(user.name).toBe("Ada")` after a hardcoded `{ name: "Ada" }` is testing that JavaScript works.
- Presentation-only styling (margins, colors) — that's what visual regression is for.
- Snapshot tests of large trees. They break on every whitespace change and nobody reads the diff. Prefer explicit assertions on the meaningful attributes.

## 8. Test data (fixtures)

- Backend HTTP tests spin up a **test Postgres database** (Docker in CI). Not SQLite. The audits are about integrity — SQLite has different constraint semantics, so tests would lie.
- Every test file starts with `beforeEach` that resets the schema (`prisma migrate reset --force`) or truncates the tables it touches.
- Users, projects, and one artefact of each type are created inline in each test — no shared "test fixture user" that all tests mutate. That path leads to test pollution.
- Passwords in tests are hardcoded (`Password123!`). Don't randomize; you want reproducible failures.

## 9. Mock policy

- **Frontend network calls:** mocked via MSW (Mock Service Worker). One shared handler set in `test-utils/mockHandlers.js`, overridden per-test where needed.
- **Backend Prisma calls in unit tests:** don't mock — use the test DB. Every unit test that touches Prisma is really an integration test; call it one.
- **Time:** if a test depends on "today", freeze time (`vi.useFakeTimers()`), don't hope.
- **Randomness:** likewise. Every non-deterministic input either becomes deterministic in the test or the test is rewritten.

## 10. Every test case has a code

For traceability, each test case is registered in `testing/01-test-cases-master.md` with a code like:

- `TC-FE-REG-001` — frontend / registries / test #1
- `TC-BE-AUTH-014` — backend / auth / test #14
- `TC-E2E-JOURNEY-001` — e2e / critical journey

The code appears in the test file as a doc comment above the `test()` call. This lets an audit reference the exact test that covers a claim.

## 11. How to write a test case (worked example)

**Scenario:** the audit's H7 finding — silent field-update failures in `RequirementRegistry`.

### Given / When / Then

- **Given** a signed-in user with one project containing one requirement (fixtures set up in `beforeEach`)
- **When** the user changes the requirement's status via the inline dropdown, **and** the mocked API returns a 500 error
- **Then** the requirement's status in the DOM reverts to its original value **and** a visible error message tells the user the save failed

### Which layer? Component. The bug lives in one page's interaction — Supertest wouldn't reach it, E2E is overkill.

### Test file

```jsx
// frontend/src/pages/RequirementRegistry.test.jsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { server, rest } from "../test-utils/mockHandlers";
import { renderWithProviders } from "../test-utils/renderWithProviders";
import RequirementRegistry from "./RequirementRegistry";

describe("RequirementRegistry", () => {
  // TC-FE-REG-004
  test("shows an error and reverts status when the update fails", async () => {
    server.use(
      rest.patch("*/api/projects/:id/requirements/:reqId", (req, res, ctx) =>
        res(ctx.status(500), ctx.json({ error: { code: "SERVER_ERROR", message: "Boom" } }))
      )
    );

    renderWithProviders(<RequirementRegistry />, { route: "/projects/p1/requirements" });

    const statusBadge = await screen.findByRole("button", { name: /status: proposed/i });
    await userEvent.click(statusBadge);
    await userEvent.click(screen.getByRole("option", { name: /approved/i }));

    // Then: user sees an error, and the badge reverts.
    expect(await screen.findByText(/could not update requirement/i)).toBeVisible();
    expect(screen.getByRole("button", { name: /status: proposed/i })).toBeVisible();
  });
});
```

Note the assertions: they test what the *user* sees, not what a mock was called with.

## 12. Ship criteria for a test suite

- [ ] Registered in `testing/01-test-cases-master.md` with a code
- [ ] Runs in under 10 seconds per file (backend HTTP) or under 60 seconds (E2E)
- [ ] Every `describe` block resets its own state — no order-dependence
- [ ] Zero `.only` / `.skip` / `xit` in the final PR
- [ ] Failing message is human-readable (custom matcher messages where useful)
- [ ] Runs in CI as part of the appropriate job
- [ ] `CHANGELOG.md` entry references the test-case codes it added
