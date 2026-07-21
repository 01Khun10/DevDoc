# Test case brief — {{TC-CODE}}

> Most test cases only need a row in `testing/01-test-cases-master.md`. Use this template only for tests that deserve a full brief: E2E journeys, security tests, tests that cross multiple resources, or tests where the given/when/then is more than three lines.

---

## Identity

- **Code:** {{TC-BE-AUTHZ-001}}
- **Layer:** {{U | C | A | H | E}}
- **Priority:** {{P0 | P1 | P2}}
- **Owner:** {{Hassan | Codex}}
- **Master file row:** {{link or line reference in `01-test-cases-master.md`}}
- **PRD it enforces:** {{PRD 02 §6}}

## What this test proves

> One sentence. The single behavioral fact this test would fail on if the code drifted.

{{...}}

## What this test does NOT prove

> Be honest. This is what stops a test suite from lying about coverage.

{{e.g. "This test does not exercise the DB transaction path — only the HTTP behavior. See TC-BE-TRACE-004 for the transaction assertion."}}

## Given

> The world before the test runs. Every setup step, explicit.

- {{A test Postgres database seeded via `beforeEach` with two users: `alice` and `bob`.}}
- {{Alice owns a project with one requirement.}}
- {{Bob is signed in.}}

## When

> The single action under test. One sentence.

{{Bob sends `PATCH /api/projects/{alice_project_id}/requirements/{alice_req_id}` with a new title.}}

## Then

> Behavior observed. Assert what a user (or another service) would observe.

- {{Response status is 404.}}
- {{Response body has `error.code === "PROJECT_NOT_FOUND"` (never leaks "exists but forbidden").}}
- {{The requirement's title in the database is unchanged.}}
- {{An `ActivityLog` entry is NOT created for this attempt.}}

## Setup / teardown

- Fixtures: {{`fixtures.twoUsers()`, `fixtures.requirement(user, project)`}}
- Cleanup: {{`prisma migrate reset --force` in `afterEach` or targeted deletes}}
- External services mocked: {{yes/no — which}}

## File

`{{backend/src/tests/http/ownership.test.js}}`

## Anti-patterns for this test (do not do)

- Asserting `expect(mockAuthMiddleware).toHaveBeenCalled()` — this test's behavior is the 404, not the middleware invocation
- Sharing users across tests — bob's failure to reach alice's data must not depend on order

## Estimated run time

< {{500ms}}

## Depends on (fixtures, helpers, other tests)

- Helpers: {{`fixtures.twoUsers()` must exist}}
- Precedes: {{This test is a good template for TC-BE-AUTHZ-002 through -005 in the parameterized suite}}
