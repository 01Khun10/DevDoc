# PRD 02 — Backend

**Owner:** Hassan (sole developer — all services)
**Depends on:** PRD 00, PRD 03 (database), PRD 04 (API contract)

---

## 1. Guiding principles

1. **Ownership is derived per query, never trusted.** Every resource endpoint re-derives `project.ownerId === req.user.id` in the same Prisma query that fetches or mutates. No separate skippable check. This is the app's #1 correctness property and it's already right — do not break it.
2. **Multi-step writes get transactions.** Anything that touches ≥ 2 rows in a way that must be atomic (requirement + link cleanup, document-from-template creation, validation run) runs under `prisma.$transaction`.
3. **One helper per concern.** `assertProjectOwnership`, `createAppError`, `logActivity`, `verifyRateLimit`. When you write the same 10-line block for the third time, extract it — that's the M12 audit finding.
4. **Error responses have one shape.** Client gets `{ error: { code, message, fields? } }`. Every controller funnels through `sendError` / `sendUnexpectedError`. Nothing leaks internal shapes or stack traces.
5. **Validation lives in validators, not controllers.** Controllers do routing + calling. Validators do parsing + normalization. Services do business logic + persistence. M4 audit finding: `updateProfile` / `changePassword` hand-roll validation inline — that's out.

## 2. Service layer architecture

```
routes/           ← Express router, one file per resource
  authRoutes.js
  projectRoutes.js
  requirementRoutes.js
  ... etc.
controllers/      ← thin: parse req, call validator, call service, sendResponse
  authController.js
  projectController.js
  ...
validators/       ← Joi (or hand-rolled) schemas + normalizers
  authValidator.js
  requirementValidator.js
  ...
services/         ← ALL business logic + Prisma calls. Nothing else touches Prisma.
  authService.js
  projectService.js
  requirementService.js
  useCaseService.js
  businessObjectiveService.js
  designElementService.js
  testCaseService.js
  traceabilityService.js
  validationService.js
  documentService.js
  templateService.js
  diagramService.js
  shareService.js
  searchService.js
  suggestionService.js
utils/            ← shared helpers, NEVER Prisma
  errors.js       ← createAppError, error codes
  ownership.js    ← assertProjectOwnership (the shared helper)
  activityLog.js  ← logActivity
  token.js        ← JWT sign / verify with algorithm pinning
  rateLimits.js   ← named rate limiters
middleware/       ← Express middleware
  authenticate.js ← reads cookie, verifies JWT, attaches req.user
  requireAuth.js  ← guard for authenticated routes
prisma/
  schema.prisma
  seed.js
server.js         ← builds and exports `app`. Only the entrypoint calls listen.
```

## 3. The three shared helpers (extract these first — audit M12, M13)

### 3.1 `utils/ownership.js`

```js
// One function, imported by every resource service.
export async function assertProjectOwnership(prisma, projectId, userId) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { id: true }
  });
  if (!project) throw createAppError("PROJECT_NOT_FOUND", "Project not found");
  return project;
}
```

Every service replaces its local copy with this import. Currently duplicated across 12+ files. Not currently exploitable (every copy is correct) — the risk is future edits.

### 3.2 `utils/errors.js`

```js
export function createAppError(code, message, details) {
  const error = new Error(message);
  error.code = code;
  if (details) error.details = details;
  return error;
}

export const ERROR_CODES = {
  PROJECT_NOT_FOUND: { status: 404, message: "Project not found" },
  REQUIREMENT_NOT_FOUND: { status: 404, message: "Requirement not found" },
  // ... one entry per domain error code
};
```

Every `createRequirementError` / `createUseCaseError` / etc. is deleted in favor of this. That's the M13 finding.

### 3.3 `utils/rateLimits.js`

```js
export const authLoginLimiter = createLimiter({ windowMs: 15 * 60_000, max: 10 });
export const authAuxLimiter = createLimiter({ windowMs: 15 * 60_000, max: 60 });
export const shareLimiter = createLimiter({ windowMs: 60_000, max: 30 });
```

Named limiters — never inline config in routes.

## 4. Authentication lifecycle

### 4.1 Cookie contract

- Name: `devdoc_session`
- Options: `httpOnly`, `secure` in production, `sameSite=lax`, `path=/`
- Value: JWT signed with `JWT_SECRET` (env, no fallback — throw at boot if missing)
- Claims: `{ sub: userId, tokenVersion: user.tokenVersion, iat, exp }` — expiry 7 days

### 4.2 Session revocation (fixes H1)

The user model gets `tokenVersion: Int @default(0)`. The `authenticate` middleware:

```js
const decoded = jwt.verify(token, secret, { algorithms: ["HS256"] });  // fixes M5
const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
if (!user || user.tokenVersion !== decoded.tokenVersion) throw 401;
req.user = user;
```

- **Logout**: `prisma.user.update({ where: { id }, data: { tokenVersion: { increment: 1 } } })` + clear cookie
- **Password change**: same increment inside the transaction that updates the hash
- **Manual revoke** (future): `POST /api/auth/revoke-sessions`

Cost: one extra DB read per authenticated request. Acceptable at DevDoc's target scale.

### 4.3 Timing side-channel (fixes M1)

Login must run bcrypt.compare **regardless of whether the email exists**, against a fixed dummy hash. Same total time for "bad email" and "bad password". Same error message.

### 4.4 Password validation (fixes M2, M3)

- Min 8 chars (existing), max 72 bytes (bcrypt limit)
- Reject if byte-length > 72 with a clear message ("Password too long — max 72 bytes")
- Same rules on register + change-password — one validator function used by both
- Name: max 100 chars, trimmed, non-empty on register
- Frontend password-strength meter must match backend rules — no fake "strong" for passwords the backend calls minimal

### 4.5 CSRF (M7 — defense in depth)

Rely on `SameSite=Lax` (current), but add explicit Origin/Referer check on state-changing routes (`POST`/`PATCH`/`PUT`/`DELETE`). Reject if not in `CORS_ALLOWED_ORIGINS`.

### 4.6 Rate limits (fixes M6)

- Configure `app.set("trust proxy", process.env.TRUST_PROXY || 1)` when behind a reverse proxy. Documented in `.env.example` and the deployment runbook.
- Never a single blanket `/api/auth` limiter. Split:
  - `/api/auth/login`, `/api/auth/register` → strict (10 / 15min)
  - `/api/auth/me`, `/api/auth/logout` → lenient (60 / 15min)
  - `/api/auth/change-password` → strict (5 / 15min)
- One `POST /api/shared/*` limiter distinct from auth.

## 5. Sharing (fixes H3)

- `ShareToken` model gains: `expiresAt DateTime` (not null on creation), `revokedAt DateTime?`, `lastAccessedAt DateTime?`, `accessCount Int @default(0)`
- Creation endpoint takes `expiresAt` param — default is +30 days, cap is +365 days
- Revoke endpoint: `POST /api/projects/:id/share-tokens/:tokenId/revoke` — sets `revokedAt`
- Read endpoint (`GET /api/shared/:token`): checks `expiresAt > now`, `revokedAt IS NULL`, updates `lastAccessedAt` and `accessCount`
- Every share-link creation logs an activity entry (see §7)
- The frontend `ProjectSettings` page recovers the working UI from `ProjectSettingsPlaceholder.jsx` (H8 finding — port then delete)

## 6. Traceability integrity (fixes H4)

**All** three artefact deletes must run inside a transaction that also cleans up `TraceabilityLink` rows referencing that artefact — same pattern already in `requirementService`, `useCaseService`. Applies to:

- `designElementService.deleteDesignElement`
- `testCaseService.deleteTestCase`
- `businessObjectiveService.deleteBusinessObjective`

Pattern:

```js
return prisma.$transaction(async (tx) => {
  await tx.traceabilityLink.deleteMany({
    where: {
      OR: [
        { sourceType: "DESIGN_ELEMENT", sourceId: id },
        { targetType: "DESIGN_ELEMENT", targetId: id },
      ]
    }
  });
  return tx.designElement.delete({ where: { id } });
});
```

Also see PRD 03 §3 for the DB-level fix.

## 7. Activity log

Currently: `actorId` field exists but is written as `null` on every entry (M10). This makes the log a feed, not an audit trail.

- Fix: `logActivity(prisma, { projectId, actorId: req.user.id, action, targetType, targetId, meta })` — `actorId` never null when a `req.user` exists.
- Add `logActivity` call to `businessObjectiveService` create/update/delete (M14 — the copy-paste that dropped this step).
- Log ambitions per action:
  - Auth events: register, login (success + failure), logout, password change, name change → *separate `SecurityEvent` table if we go compliance-mode; for now goes to `ActivityLog` with `projectId: null`*
  - Share events: link created, link revoked, link accessed
  - Every artefact CUD
  - Every validation run start / complete

Decide **once**: activity log is either (a) a UI feed or (b) an audit trail. Currently pretending to be both. PRD position: **(a) UI feed only**. If we want audit, we add `SecurityEvent` with retention policy. Don't overload one table.

## 8. Validation engine

- Rules stored as `ValidationRule` rows (existing pattern). Do not hardcode.
- **Rule code naming convention [RESOLVED 2026-07-21]:** `ruleCode` uses the implemented shared scheme — short domain codes (`DOC-001`, `SEC-001`, `REQ-001`, ...), ~18 base rules seeded once per profile with per-profile `severityOverrides`, not 12× duplicated profile-prefixed codes. This is canonical now, decided by the user, resolving the divergence from `foundations/devdoc-template-package-v1.md` §8 (which specified a per-template-prefix scheme like `STD-SRS-C-001` — that section is kept unedited as historical spec, superseded by this decision). Do not migrate the code to the prefixed scheme; do not add new prefixed-style codes.
- A validation run is atomic: `RUNNING → COMPLETED | FAILED` with a rollback-equivalent path already in place.
- **Formula transparency** (PRD 00 §3): readiness score returns as an object, not a bare number:
  ```json
  {
    "score": 74,
    "breakdown": {
      "sectionsComplete": { "value": 0.85, "weight": 0.2 },
      "requirementsTraced": { "value": 0.70, "weight": 0.3 },
      "coveredByUseCase": { "value": 0.60, "weight": 0.2 },
      "implementedByDesign": { "value": 0.75, "weight": 0.15 },
      "verifiedByTest": { "value": 0.80, "weight": 0.15 }
    },
    "formula": "score = sum(value_i × weight_i) × 100"
  }
  ```
- `ValidationResult` stores rule identity **plus** the rule's message snapshot at run time (M17 in v1 audit — rule provenance). If a rule is renamed later, historical findings still explain themselves.
- Concurrency: two simultaneous "Run validation" clicks for the same project must not create two conflicting runs. Use `SELECT ... FOR UPDATE` on the project row inside the transaction, or a unique constraint on `(projectId, status="RUNNING")`.

## 9. Server bootstrap (fixes v1 audit "server cannot be integration-tested")

`server.js` must export `app` and never call `app.listen`. A separate `index.js` calls `listen`. This is the enabling change for the entire Supertest suite:

```js
// server.js
import express from "express";
// ...
export function buildApp() {
  const app = express();
  // ... middleware, routes
  return app;
}

// index.js
import { buildApp } from "./server.js";
const app = buildApp();
app.listen(process.env.PORT || 5000);
```

Tests import `buildApp()`, get a fresh app per test run.

## 10. Security checklist (v2 audit alignment)

| Item | Status today | Sprint |
|---|---|---|
| bcrypt cost 12 | ✅ done | — |
| JWT in httpOnly cookie | ✅ done | — |
| No JWT algorithm pinning | ❌ M5 | 1 |
| No `tokenVersion` / session revocation | ❌ H1 | 1 |
| Timing side-channel on login | ❌ M1 | 1 |
| Password max length | ❌ M2 | 1 |
| Name max length | ❌ M3 | 1 |
| Rate-limit trust-proxy config | ❌ M6 | 1 |
| CORS whitelist from env | ✅ done | — |
| No CSRF token | ⚠️ M7 (SameSite-Lax is baseline) | 2 |
| Ownership re-derivation per query | ✅ done | — |
| No mass-assignment | ✅ done | — |
| Multi-step writes atomic | ✅ done | — |
| Share links have expiry | ❌ H3 | 1 |
| Share links revocable | ❌ H3 | 1 |
| `TraceabilityLink` DB-level integrity | ❌ | 3 (DB) |
| `TraceabilityLink` service-level cleanup on all deletes | ❌ H4 | 1 |
| DOMPurify on `dangerouslySetInnerHTML` | ❌ H5 (frontend) | 1 |
| Activity log has `actorId` | ❌ M10 | 2 |
| Auth error details never leak stack traces | ✅ done | — |
| `dompurify` declared but unused | ❌ H5 (frontend) | 1 |

## 11. Testing (backend-specific)

See `testing/00-test-strategy.md`. Backend layers:

- **Unit** (Jest): validators, `nextCode.js`, `validationChecks.js`, `suggestionScoring`. Already at 46/46 — do not regress.
- **HTTP integration** (Jest + Supertest against a test Postgres): every route, every method, every ownership boundary.
- **Auth suite**: register/login/logout/change-password/session-expiry/tokenVersion-revocation. Currently zero tests here (§2 audit).
- **Two-user authorization suite**: for every resource, verify user B cannot read / update / delete user A's resource. Parameterized — one test file, ~15 resource families.

## 12. Ship criteria per feature

- [ ] Controller ≤ 20 lines: parse, validate, call service, respond
- [ ] Validator handles all normalization
- [ ] Service uses `assertProjectOwnership`, `createAppError`, transaction for multi-write
- [ ] Every mutation logs to activity with `actorId`
- [ ] Test file exists: unit for pure logic, Supertest for HTTP + auth
- [ ] Two-user authz test covers this resource
- [ ] `CHANGELOG.md` entry references PRD 02 §N
