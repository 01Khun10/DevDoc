# Test Cases — Master Catalogue

Every test case has a code, a layer, an owner, and a status. This file is the single source of truth for "what tests exist and what tests are planned". A PR adds tests → this file gets rows.

Status legend: **TODO** (not written) · **WIP** (in progress) · **DONE** (green in CI) · **FLAKY** (quarantined)

Layer legend: **U** unit · **C** component · **A** a11y · **H** HTTP/Supertest · **E** E2E/Playwright

---

## Backend — Authentication (BE-AUTH)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-BE-AUTH-001 | Register with valid email + strong password returns 201 with user, session cookie set | H | P0 | TODO |
| TC-BE-AUTH-002 | Register with existing email returns 409, does not create user | H | P0 | TODO |
| TC-BE-AUTH-003 | Register with weak password returns 400 with `fields.password` error | H | P0 | TODO |
| TC-BE-AUTH-004 | Register with 73-byte password returns 400 (bcrypt limit) | H | P1 | TODO |
| TC-BE-AUTH-005 | Register with 200-char name returns 400 | H | P1 | TODO |
| TC-BE-AUTH-006 | Login with correct credentials returns 200 with session cookie | H | P0 | TODO |
| TC-BE-AUTH-007 | Login with wrong password returns 401 (generic error message) | H | P0 | TODO |
| TC-BE-AUTH-008 | Login with nonexistent email returns 401 in the same timing window as wrong-password | H | P0 | TODO |
| TC-BE-AUTH-009 | Logout increments tokenVersion; old cookie no longer authenticates | H | P0 | TODO |
| TC-BE-AUTH-010 | Password change increments tokenVersion; old cookie no longer authenticates | H | P0 | TODO |
| TC-BE-AUTH-011 | JWT signed with `algorithms: [HS256]` is verified; algorithm swap is rejected | U | P1 | TODO |
| TC-BE-AUTH-012 | PATCH /api/auth/me with missing name field does NOT overwrite existing name with null | H | P0 | TODO |
| TC-BE-AUTH-013 | Login rate limit blocks after 10 attempts in 15 min | H | P1 | TODO |
| TC-BE-AUTH-014 | Origin header not in whitelist → state-changing request rejected | H | P1 | TODO |

## Backend — Two-User Authorization Matrix (BE-AUTHZ)

Parameterized across resource families: project, requirement, use-case, business-objective, design-element, test-case, traceability-link, document, document-section, validation-run, share-token, saved-view, notification, diagram.

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-BE-AUTHZ-001 | User B cannot GET /api/projects/{user_A_project_id} → 404 | H | P0 | TODO |
| TC-BE-AUTHZ-002 | User B cannot PATCH user A's resource → 404 | H | P0 | TODO |
| TC-BE-AUTHZ-003 | User B cannot DELETE user A's resource → 404 | H | P0 | TODO |
| TC-BE-AUTHZ-004 | User B's GET list of their own projects does not include user A's projects | H | P0 | TODO |
| TC-BE-AUTHZ-005 | User B cannot POST a resource under user A's project → 404 | H | P0 | TODO |

## Backend — Sharing (BE-SHARE)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-BE-SHARE-001 | Create share token with 24h expiry succeeds, returns token + expiresAt | H | P0 | TODO |
| TC-BE-SHARE-002 | Create share token without expiry defaults to +30 days | H | P0 | TODO |
| TC-BE-SHARE-003 | Create share token with expiresAt > +365 days returns 400 | H | P1 | TODO |
| TC-BE-SHARE-004 | Public GET /api/shared/:token returns read-only project data | H | P0 | TODO |
| TC-BE-SHARE-005 | Public GET after expiresAt returns 404 | H | P0 | TODO |
| TC-BE-SHARE-006 | Revoke share token: subsequent GET /api/shared/:token returns 404 | H | P0 | TODO |
| TC-BE-SHARE-007 | Public GET increments accessCount and updates lastAccessedAt | H | P1 | TODO |
| TC-BE-SHARE-008 | Public rate limit: 31st request in a minute returns 429 | H | P1 | TODO |
| TC-BE-SHARE-009 | Share service defaults new tokens to a 30-day expiry | U | P0 | DONE |
| TC-BE-SHARE-010 | Share service rejects expiry beyond 365 days | U | P1 | DONE |
| TC-BE-SHARE-011 | Share service rejects an expired token before loading report data | U | P0 | DONE |

## Backend — Traceability integrity (BE-TRACE)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-BE-TRACE-001 | Deleting a requirement removes its outgoing and incoming traceability links (transaction) | H | P0 | TODO |
| TC-BE-TRACE-002 | Deleting a design element removes its links (H4 fix) | H | P0 | TODO |
| TC-BE-TRACE-003 | Deleting a test case removes its links (H4 fix) | H | P0 | TODO |
| TC-BE-TRACE-004 | Deleting a business objective removes its links (H4 fix) | H | P0 | TODO |
| TC-BE-TRACE-005 | Deleting a use case removes its links | H | P0 | TODO |
| TC-BE-TRACE-006 | Creating a link where the target belongs to a different project returns 404 | H | P0 | TODO |
| TC-BE-TRACE-007 | Suggestion returns algorithm identifier and reasonTerms | H | P1 | TODO |
| TC-BE-TRACE-008 | DB CHECK constraint rejects a link with invalid linkType (bypasses service) | H | P1 | TODO |

## Backend — Validation engine (BE-VAL)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-BE-VAL-001 | Running validation returns readinessScore + readinessBreakdown with weights summing to 1.0 | H | P0 | TODO |
| TC-BE-VAL-002 | Score matches formula: sum(value_i × weight_i) × 100 rounded | H | P0 | TODO |
| TC-BE-VAL-003 | Second concurrent "Run validation" for the same project does not create a second RUNNING row | H | P0 | TODO |
| TC-BE-VAL-004 | Validation run stores rule message snapshot; changing rule text does not alter historical findings | H | P1 | TODO |
| TC-BE-VAL-005 | Deleting a link that fails a rule then re-running validation removes the finding | H | P1 | TODO |

## Backend — Document editing (BE-DOC)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-BE-DOC-001 | Create document from SRS template creates all template sections | H | P0 | TODO |
| TC-BE-DOC-002 | Update section content persists and returns updated section | H | P0 | TODO |
| TC-BE-DOC-003 | Get linked artefacts for a section returns the correct code chips | H | P0 | TODO |
| TC-BE-DOC-004 | Print/export view is available for the document owner | H | P1 | TODO |

## Backend — Activity log (BE-ACT)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-BE-ACT-001 | Every artefact create/update/delete logs an entry with actorId populated | H | P1 | TODO |
| TC-BE-ACT-002 | Business objective mutations log activity (audit M14) | H | P1 | TODO |
| TC-BE-ACT-003 | Activity list endpoint paginates | H | P1 | TODO |

---

## Frontend — Auth (FE-AUTH)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-AUTH-001 | Login form: submitting with valid credentials navigates to /dashboard | C | P0 | TODO |
| TC-FE-AUTH-002 | Login form: server 401 shows an inline error, form remains submittable | C | P0 | TODO |
| TC-FE-AUTH-003 | Login form: password show/hide toggle actually toggles input type | C | P1 | TODO |
| TC-FE-AUTH-004 | Register form: password strength meter matches backend rules | C | P0 | TODO |
| TC-FE-AUTH-005 | Register form: mismatched confirm-password blocks submit with an inline error | C | P0 | TODO |
| TC-FE-AUTH-006 | Any authenticated page: 401 response triggers redirect to /login (once, not race) | C | P0 | TODO |

## Frontend — Design system primitives (FE-UI)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-UI-001 | Button primary/secondary/ghost/danger variants render with correct roles and disabled behavior | C | P0 | TODO |
| TC-FE-UI-002 | Modal traps focus, Esc closes, focus returns to opener | C | P0 | TODO |
| TC-FE-UI-003 | Input renders label + helper + error with aria-describedby wiring | C | P0 | TODO |
| TC-FE-UI-004 | Toggle: click toggles, keyboard Space toggles, role="switch" + aria-checked correct | C | P0 | TODO |
| TC-FE-UI-005 | Skeleton set: parent has aria-busy while loading, unset when populated | C | P1 | TODO |
| TC-FE-UI-006 | Icon: renders one SVG with aria-hidden when no label; parent provides label context | C | P1 | TODO |
| TC-FE-UI-007 | SortSearchBar: search input debounces, sort select emits change | C | P1 | TODO |

## Frontend — Registry pattern (FE-REG)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-REG-001 | RequirementRegistry loads and displays rows for a project | C | P0 | TODO |
| TC-FE-REG-002 | Inline status update sends PATCH and shows updated status | C | P0 | TODO |
| TC-FE-REG-003 | Inline status update failure reverts UI and shows an error toast (audit H7) | C | P0 | TODO |
| TC-FE-REG-004 | ?highlight=<id> scrolls to and rings the row for 2500ms | C | P1 | TODO |
| TC-FE-REG-005 | Same behavior in UseCaseRegistry, DesignElementRegistry, TestCaseRegistry, BusinessObjectiveRegistry (parameterized) | C | P0 | TODO |
| TC-FE-REG-006 | All five registries import sortAndSearch from RegistryControls (import assertion) | U | P1 | TODO |

## Frontend — Editor (FE-EDIT)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-EDIT-001 | Typing in a section updates the save indicator to "Unsaved" | C | P0 | TODO |
| TC-FE-EDIT-002 | Autosave fires 3s after typing stops; indicator becomes "Saving…" then "Saved · HH:MM" | C | P0 | TODO |
| TC-FE-EDIT-003 | Switching section with unsaved changes prompts confirmation | C | P0 | TODO |
| TC-FE-EDIT-004 | Select text → capture as requirement creates the requirement and inserts the code chip | C | P0 | TODO |
| TC-FE-EDIT-005 | Export button disabled when latest validation has errors; tooltip explains why | C | P0 | TODO |
| TC-FE-EDIT-006 | DocumentPrint sanitizes HTML via DOMPurify — script tag in content does not execute (audit H5) | C | P0 | TODO |

## Frontend — Traceability (FE-TRACE)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-TRACE-001 | Grid cell click toggles a link and calls the correct endpoint | C | P0 | TODO |
| TC-FE-TRACE-002 | Grid cell has aria-pressed reflecting linked state (audit M19) | C | P0 | TODO |
| TC-FE-TRACE-003 | Builder tab: pick source + target + linkType, create link, appears in existing-links list | C | P0 | TODO |
| TC-FE-TRACE-004 | Suggestions tab: accept a suggestion creates the link, removes it from the list | C | P1 | TODO |
| TC-FE-TRACE-005 | Map view marks orphan artefacts with a red corner tick | C | P1 | TODO |

## Frontend — Validation (FE-VAL)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-VAL-001 | Run validation triggers the scan-line animation and populates findings | C | P0 | TODO |
| TC-FE-VAL-002 | Readiness gauge sweeps to the new score | C | P0 | TODO |
| TC-FE-VAL-003 | Formula breakdown panel is expandable and shows weights + values that sum to the score | C | P0 | TODO |
| TC-FE-VAL-004 | Deep-link from a finding navigates to the affected artefact with ?highlight= | C | P1 | TODO |
| TC-FE-VAL-005 | Reduced-motion: scan-line animation is not rendered | C | P1 | TODO |

## Frontend — Settings (FE-SET)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-SET-001 | ProjectSettings: change name + description; toast confirms save | C | P0 | TODO |
| TC-FE-SET-002 | ProjectSettings: create share link with expiry — real endpoint, shows copyable URL | C | P0 | TODO |
| TC-FE-SET-003 | ProjectSettings: revoke share link — button disables, list marks revoked | C | P0 | TODO |
| TC-FE-SET-004 | ProjectSettings: delete project with typed-name confirmation — cannot submit until typed | C | P0 | TODO |
| TC-FE-SET-005 | AppSettings: change theme immediately re-themes the app | C | P0 | TODO |
| TC-FE-SET-006 | AppSettings: reduce-motion toggle sets data-reduce-motion; Accessibility page reads the same value | C | P0 | TODO |
| TC-FE-SET-007 | Profile: change password with correct current password succeeds and re-authenticates the session | C | P0 | TODO |

## Frontend — Accessibility (FE-A11Y)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-A11Y-001 | Every routed page: Axe scan reports zero violations | A | P0 | TODO |
| TC-FE-A11Y-002 | Modal: focus enters modal on open, returns to opener on close | C | P0 | TODO |
| TC-FE-A11Y-003 | Every custom dropdown supports Arrow-Up/Down navigation | C | P0 | TODO |
| TC-FE-A11Y-004 | Every page: Tab traversal reaches all interactive elements in DOM order | C | P1 | TODO |
| TC-FE-A11Y-005 | Text-scale=larger does not clip layout at 1440px | A | P1 | TODO |

## Frontend — Truthfulness sweep (FE-TRUE)

| Code | Description | Layer | Priority | Status |
|---|---|---|---|---|
| TC-FE-TRUE-001 | Grep `href="#"` in frontend/src returns zero results | U | P0 | TODO |
| TC-FE-TRUE-002 | Grep `to="#"` in frontend/src returns zero results | U | P0 | TODO |
| TC-FE-TRUE-003 | Every J/K/E/D shortcut advertised in AppSettings actually works on registries and the editor | E | P0 | TODO |
| TC-FE-TRUE-004 | No pages/*Placeholder.jsx file is imported anywhere | U | P0 | TODO |
| TC-FE-TRUE-005 | No `function Icon(` in pages/ (audit M20 root cause) | U | P0 | TODO |

---

## End-to-End (E2E-*)

| Code | Description | Priority | Status |
|---|---|---|---|
| TC-E2E-JOURNEY-001 | The full critical journey (PRD 00 §8) runs green | P0 | TODO |
| TC-E2E-AUTH-001 | Register → verify email uniqueness → login → logout → cannot re-use cookie | P0 | TODO |
| TC-E2E-SHARE-001 | Create share link → open in incognito → revoke → refresh → 404 | P0 | TODO |
| TC-E2E-EDITOR-001 | Type content → wait 3s → refresh → content persisted (autosave proof) | P0 | TODO |
| TC-E2E-VAL-001 | Run validation → verify readiness score updates → verify formula panel renders | P0 | TODO |
| TC-E2E-RESPONSIVE-001 | Every critical page renders without horizontal scroll at 320, 390, 768, 1024, 1440 | P1 | TODO |

---

## Counts

- P0 total: 63
- P1 total: 29
- Total: 92 planned test cases

Update this file every PR. When a TC moves to DONE, cite it in the `CHANGELOG.md` entry.
