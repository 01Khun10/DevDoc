# PRD 04 — API, Communications, AI Integration

**Owner:** Hassan (sole developer)
**Depends on:** PRD 00, PRD 02, PRD 03

---

## 1. Guiding principles

1. **One convention per concept.** One HTTP verb for partial updates. One error shape. One pagination pattern. One list-envelope. Consistency > cleverness.
2. **The API is not public.** All endpoints are same-origin, cookie-authenticated. No CORS wildcard, no API keys, no third-party access. If that changes, this PRD changes first.
3. **AI is real scope, sequenced deliberately.** [CORRECTED 2026-07-21] AI belongs in every module (§4.1) — but always as a layer added after or alongside a module's deterministic core, never as a substitute for one. The suggestion engine ships as deterministic TF-IDF first; a semantic upgrade is planned scope, not a maybe. See §4.
4. **Everything the user sees is inspectable.** The API returns the formula, not just the number. This is how "documentation that proves itself" stops being a marketing claim.
5. **No PII in URLs, no secrets in query strings.** Cookies for auth, POST bodies for share-link creation, path params for IDs.

## 2. REST conventions

### 2.1 URL structure

```
/api/auth/*                                    ← auth lifecycle
/api/me                                        ← current user
/api/me/preferences                            ← [ADDED] see PRD 03 §7.2
/api/projects                                  ← project list / create
/api/projects/:id                              ← project read / update / delete
/api/projects/:id/overview                     ← denormalized project summary
/api/projects/:id/requirements                 ← requirement list / create
/api/projects/:id/requirements/:reqId          ← requirement read / update / delete
/api/projects/:id/use-cases[/:ucId]
/api/projects/:id/business-objectives[/:boId]
/api/projects/:id/design-elements[/:deId]
/api/projects/:id/test-cases[/:tcId]
/api/projects/:id/traceability-links[/:linkId]
/api/projects/:id/traceability/options         ← lookup data for the builder
/api/projects/:id/traceability/suggestions     ← TF-IDF suggested links
/api/projects/:id/documents[/:docId]
/api/projects/:id/documents/:docId/sections/:sectionId
/api/projects/:id/documents/from-template
/api/projects/:id/templates                    ← available templates for this project
/api/projects/:id/validation/runs              ← trigger run / list history
/api/projects/:id/validation/runs/:runId       ← run detail
/api/projects/:id/diagrams[/:diagramId]        ← [ADDED per PRD 03 §7.1]
/api/projects/:id/diagrams/plantuml/traceability-tree  ← generator endpoint
/api/projects/:id/share-tokens                 ← list / create
/api/projects/:id/share-tokens/:tokenId/revoke ← revoke
/api/projects/:id/analytics                    ← [ADDED — currently derived client-side]
/api/projects/:id/activity                     ← activity feed
/api/projects/:id/saved-views[/:viewId]        ← [ADDED per PRD 03 §7.3]
/api/shared/:token                             ← public read-only
/api/search                                    ← global search across user's projects
```

### 2.2 HTTP verbs (fixes M15)

**Rule:** partial update is always `PATCH`. Full replacement is `PUT`. `POST` for create. `DELETE` for delete.

Today's inconsistency: business objectives use `PATCH`, other artefacts use `PUT` for what is semantically a `PATCH` (validator builds a partial update payload). All artefact updates become `PATCH` in sprint 3.

### 2.3 Response envelopes

**Single resource:**
```json
{ "data": { ... } }
```

**Collection:**
```json
{
  "data": [ ... ],
  "pagination": {
    "total": 143,
    "page": 1,
    "pageSize": 50,
    "totalPages": 3
  }
}
```

Currently: some endpoints return a bare array, some return `{ data, pagination }`, some return the resource inline. Standardize on the envelope. Migration: version this — add `X-API-Version: 2` header, keep the old shape until frontend cuts over, then remove.

### 2.4 Error responses (already partly done — keep the shape)

```json
{
  "error": {
    "code": "REQUIREMENT_NOT_FOUND",
    "message": "Requirement not found",
    "fields": {                    ← only on 400 validation errors
      "title": "Title is required"
    }
  }
}
```

- `code` is machine-readable, stable
- `message` is user-facing English, may change
- `fields` maps to form field names when applicable
- Never a stack trace. Never internal DB errors. Never library-specific messages.
- Log the real error server-side with request ID; return the request ID in the response header (`X-Request-Id`) so a user can quote it in a bug report

### 2.5 Status codes

- `200` — read succeeded, mutation returned the updated resource
- `201` — created (POST returning the new resource)
- `204` — deleted (no body)
- `400` — validation failure (has `error.fields`)
- `401` — not authenticated (session missing/expired)
- `403` — authenticated but forbidden (rare — ownership checks return 404 for tenant isolation, not 403)
- `404` — not found (also used for cross-tenant reads — do not signal "exists but not yours")
- `409` — conflict (duplicate email, name collision on unique field)
- `422` — semantic error (validation ran but rejected — e.g., "share expiry too far in future"). Use sparingly; most rejections are `400`.
- `429` — rate-limited (returns `Retry-After` header)
- `500` — unexpected

## 3. Pagination (fixes M9)

**Every list endpoint that can grow unbounded gets pagination.** That's requirements, use cases, design elements, test cases, business objectives, traceability links, validation runs, activity log, search.

Query params:
- `?page=1` (1-indexed, default 1)
- `?pageSize=50` (default 50, max 200)
- Sort/filter as documented per endpoint

Frontend registry pages render "Load more" or numbered pagination based on `totalPages`. Default page size is high enough that a typical FYP project never sees pagination — the point is scale-readiness, not UX friction.

## 4. AI integration

**[CORRECTED 2026-07-21]** Earlier drafts of this PRD framed DevDoc as a "no AI" product, citing the audit's praise for the TF-IDF suggestion scorer as if it were a whole-product principle. That was my error, not the user's intent — the audit praised one specific deterministic component; it never said the product should have no AI anywhere. The actual, corrected position: **AI was always part of the scope, across every module.** What's genuinely sequenced is *when* each module's AI layer gets built — after or alongside its deterministic core, never before it exists, because you can't meaningfully layer AI on a module that doesn't have real data and real behavior yet.

The rule that survives from the earlier draft, and the one that actually matters: **build the deterministic, provable core of a module first. Add its AI layer once the core is real, either right after or in parallel with other work — never as a substitute for the core.** A module's AI layer should make something that already works better, faster, or smarter — not stand in for a feature that was never built underneath it.

### 4.1 AI layer by module

This is the roadmap the earlier draft was missing. "Core" is what ships without AI and must work correctly on its own. "AI layer" is what gets added later, once the core is proven — sequencing per module is a build-order decision, made when that module is actually being worked, not fixed in stone here.

| Module | Deterministic core (ships first, always) | AI layer (after or alongside the core) |
|---|---|---|
| 1–3 Auth, projects, documents | Register/login, project CRUD, template-based document creation, section editor with autosave | Assist filling a section from the user's rough notes — a draft, never a final answer, always shown as a suggestion the user accepts/edits/rejects. Never full auto-generation of a document (stays a non-goal per `foundations/devdoc-master-context.md`). |
| 4 Requirements & artefact registries | Five registries, inline status/priority editing, real CRUD | Requirement-quality review — flag ambiguous wording, vague terms ("fast", "secure" with no number), missing acceptance criteria; suggest a rephrasing the user can accept or ignore. This was already named as "not v1" in the earlier draft — it's the same feature, just now understood as planned scope rather than a maybe. |
| 5 Traceability | Grid/Graph/Map/Builder, real referential integrity, TF-IDF suggestions | Two things: (a) upgrade suggestion matching from TF-IDF keyword overlap to semantic similarity for cases where two artefacts mean the same thing in different words: (b) Code Module drift detection Tier 2 (§4.4) — does the linked file still do what the doc claims. |
| 6 Validation / Doc-Linter | Rules as seeded data, readiness score with a visible formula | Plain-language explanation of *why* a finding matters for this specific project (not just the canned `suggestedFix` string) — grounded in the actual finding data, not a general lecture. |
| 7 Diagram designer | PlantUML editor + live preview, one deterministic generator (traceability tree), 14 templates | Diagram cleanup assistance (naming, layout suggestions) on a diagram the user already wrote. Auto-generating a diagram from source code stays a non-goal (`foundations/devdoc-master-context.md`) — this is refinement of what the user authored, not generation from scratch. |
| 8 Analytics, versions, settings | Artefact counts, readiness trend, per-document completion, run history | A plain-language project-health summary ("your biggest gap right now is: 6 requirements have no linked test case") built from the same numbers the page already shows — narrative on top of real data, not a new data source. |

None of the AI-layer column is scheduled yet — that's a per-module decision made when the team gets to that module. What's now fixed is that **it's real scope, not a maybe**, and every one of them follows the same house rules below regardless of which module or when.

**[ADDED 2026-07-21] "Leave room for AI in every module" means architectural room, not visible UI.** Two different things could satisfy that instruction, and only one of them is right for this project:

- **Architectural room (do this now, in every module as it's built):** design the schema and API so the AI layer is *additive* later — no migration that breaks existing data, no API version bump, no rewrite of what already shipped. This is quiet, structural, and invisible to the user until Sprint 7 actually ships something.
- **Visible UI room (do NOT do this):** a "AI Insights — coming soon" tab, panel, or badge sitting on a page for six sprints doing nothing. That's the exact decorative-promise pattern the audits flagged everywhere else in this project (`critics-views.md`, `critics-views-v2.md` H8/H10) — a control that exists to be seen, not to work. If it wouldn't pass `PRD 01 §11`'s anti-pattern list today, adding it now as a "placeholder" doesn't make it acceptable.

So per module, here's what "leaving room" concretely means — and the good news is most of this is already true, by virtue of decisions already made elsewhere in these PRDs:

| Module | What already leaves room (no action needed) | What to actively reserve now |
|---|---|---|
| 1–3 Auth, projects, documents | `DocumentSection.content` is already a free-form HTML field — an AI-drafted suggestion just writes into the same field a human would. No schema change needed. | Reserve the route shape `POST /api/projects/:id/documents/:docId/sections/:sectionId/ai-draft` in naming only — don't build it, just don't let anything else claim that path. |
| 4 Requirements & artefact registries | None yet. | Reserve the table name `RequirementQualityFinding` (id, requirementId, message, suggestion, createdAt) as a name nobody else uses — whether it's ever a persisted table or a computed-on-demand response is a Sprint 7 decision, not now. |
| 5 Traceability | **Already fully ready** — the suggestions response shape (`PRD 04 §5.2`: `score`, `reasonTerms`, `algorithm`) already carries an `algorithm` field. Swapping `"tf-idf-v1"` for a semantic scorer later changes zero API contract, zero frontend code. This is what "leaving room" looks like when it's done right from day one. |
| 6 Validation / Doc-Linter | `ValidationResult.message` and `.suggestedFix` already exist as free text — an AI explanation is a richer version of the same field, not a new one. | None — compute-on-demand is cleaner here than a stored column that sits empty for six sprints. |
| 7 Diagram designer | `Diagram.source` (`PRD 03 §7.1`) is already the field an AI cleanup pass would read and rewrite. No schema change needed. | None. |
| 8 Analytics, versions, settings | The narrative summary is computed from numbers the page already fetches (`PRD 02 §8`'s readiness breakdown, `useProjectOverview`'s counts). No new data source, no schema change. | None. |

The pattern worth noticing: **most modules already leave room, because the underlying data model was designed to be honest and inspectable in the first place** (free-text fields instead of rigid enums where content varies, a documented `algorithm` field instead of a hardcoded scoring method). Leaving room for AI turned out to mostly be a side effect of building the deterministic core well — not a separate task bolted on top.

### 4.2 House rules for every AI feature (unchanged from the earlier draft — these were right)

The part of the original draft worth keeping wasn't "don't use AI" — it was the discipline around *how* AI gets integrated once it is. Every AI layer in §4.1, whenever it's built, must:

1. **Show its work.** The suggestion, the explanation, the drift flag — whatever it produces — is never a bare claim. TF-IDF already does this right (reason terms, a real score); every AI layer replacing or extending a deterministic piece must keep that same transparency, not regress to a black box.
2. **Be disclosed.** If project data leaves the local application for any reason — a call to an external model, a call to Graphify/Gemini per `AGENTS.md` §4 — the user sees exactly what's being sent, before it's sent, on the page where it happens. Same standard already set for PlantUML (§4.3).
3. **Log to `SecurityEvent`** (PRD 03 §5.2) — every external AI call is auditable after the fact, not just disclosed in the moment.
4. **Never replace the deterministic core.** An AI-layer feature failing, being unavailable, or being turned off must never break the module's core function. If semantic suggestion-matching (§4.1, Module 5) is down, TF-IDF suggestions still work. The AI layer is additive, always.
5. **Default reflects genuine scope, not distrust.** Earlier draft said "off by default, opt-in per project" for every AI feature as if AI were inherently risky. That's not the corrected position — a module's AI layer defaults on once it's built and tested, the same way any other real feature would. What stays consistently opt-out-able is anything that sends data to an *external* service (Gemini, a hosted model, plantuml.com) — that's a data-leaves-the-app decision, not an AI-specific one, and it's already covered by rule 2.

### 4.3 PlantUML rendering (external service — needs disclosure)

The current implementation encodes user code and renders via `https://www.plantuml.com/plantuml/svg/`. This is **not AI**, but it *is* an external service call with user-authored content.

**Required disclosure (add before v1):**

- The Diagram Designer page shows a persistent notice: "Diagrams are rendered via plantuml.com. Your diagram source is sent to a public service for rendering."
- Preferences UI: opt-out per project (defaults on because rendering is core). If off, the preview shows a "rendering disabled — enable in settings" message with a link.
- Long-term (out of v1 scope): self-hosted PlantUML server bundled with DevDoc, controlled by env var.

### 4.4 Code Module linking & drift detection [ADDED 2026-07-21 — confirmed in scope, see PRD 00 Module 5]

The traceability chain's final gap: connecting a Design Element to the actual code that implements it, and knowing when that connection has gone stale. This is built in two tiers, on purpose — the first ships without any AI at all, the second is the fuller "cross-reference everything and find drift" capability, kept separate and disclosed because it's a materially different kind of feature.

**Why phased, not one feature:** the master context's own non-goals list (`foundations/devdoc-master-context.md`) rules out "full GitHub repository scanning" for the first implementation. Tier 1 below is compatible with that non-goal — it links specific files a user points at, nothing crawls the repo automatically. Tier 2 is closer to what the non-goal was actually guarding against, so it's named explicitly, kept optional, and disclosed rather than silently built in.

**Tier 1 — deterministic staleness (v1, no AI, ships first).**

- New artefact type `CodeModule`: a path (or set of paths) inside a connected repository, linked to one Design Element or Requirement via a new `TraceabilityLink` type (`implemented_in`).
- On link creation, DevDoc records the file's current commit hash (`lastVerifiedCommit`).
- A scheduled or on-demand check compares `lastVerifiedCommit` against the file's current commit hash (via a local git read — DevDoc needs read access to the repo, not GitHub API scanning of the whole org). If they differ, the link is flagged `POSSIBLY_STALE` and it surfaces as a Doc-Linter finding ("`DE-07` may be out of date — its linked file changed on `<date>`").
- No content of the file is read for this tier. No AI, no external call, no semantic judgment — just "has this file moved since we last agreed it matched."
- This is real, buildable now, and satisfies "find gaps, find links, know when things go stale" without touching the non-goal.

**Tier 2 — semantic drift check (backlog, disclosed, opt-in, not v1).**

- Goes further: actually reads the linked file's content (and optionally the requirement/design element text) and judges whether they still describe the same thing — not just "did the file change" but "does the file still do what the doc says."
- This is the part that genuinely needs either a local model or a disclosed external call — a TF-IDF score can't judge semantic equivalence between prose and code the way it can judge keyword overlap between two artefact titles.
- **AGENTS.md already documents approved tooling for exactly this kind of work** — Graphify (a knowledge-graph layer over the codebase) with an optional Gemini backend for "semantic extraction." That's currently scoped as a *development-time* tool the coding agents use to understand the repo, not a shipped end-user product feature. Tier 2 would be the point where that capability gets exposed *to the user*, inside the product, which is a bigger decision than reusing an existing dev tool.
- Must follow every rule in §4.2: shows its work, disclosed before any data leaves the app, logged to `SecurityEvent`, and never a substitute for Tier 1's core function if it's ever unavailable — the same standard already set for PlantUML in §4.3.
- Not scheduled yet. Named here so it doesn't quietly become "the AI does everything" without anyone deciding that on purpose.

## 5. The "show your work" contract [ADDED — how §4 principle becomes an API rule]

Any endpoint returning a computed value must return the computation, not just the result.

### 5.1 Readiness score

Not:
```json
{ "readinessScore": 74 }
```

But:
```json
{
  "readinessScore": 74,
  "readinessBreakdown": {
    "sectionsComplete":     { "value": 0.85, "weight": 0.20, "contributes": 17 },
    "requirementsTraced":   { "value": 0.70, "weight": 0.30, "contributes": 21 },
    "coveredByUseCase":     { "value": 0.60, "weight": 0.20, "contributes": 12 },
    "implementedByDesign":  { "value": 0.75, "weight": 0.15, "contributes": 11.25 },
    "verifiedByTest":       { "value": 0.80, "weight": 0.15, "contributes": 12 }
  },
  "formula": "score = ceil(sum(value_i × weight_i) × 100)",
  "computedAt": "2026-07-21T13:00:00.000Z",
  "ruleSetVersion": "v1.2"
}
```

The `ValidationEngine` page renders this breakdown as an expandable panel — see PRD 01 §5.5.

### 5.2 Suggested links

Not:
```json
{ "suggestions": [{ "sourceId": "...", "targetId": "..." }] }
```

But:
```json
{
  "suggestions": [
    {
      "sourceType": "USE_CASE",
      "sourceId": "uc-01",
      "sourceCode": "UC-01",
      "targetType": "REQUIREMENT",
      "targetId": "fr-12",
      "targetCode": "FR-12",
      "linkType": "covers",
      "score": 0.87,
      "reasonTerms": ["login", "session", "authenticate"],
      "algorithm": "tf-idf-v1"
    }
  ]
}
```

## 6. Communications channels

DevDoc has three:

### 6.1 HTTP API (this document)
The primary channel. Same-origin, cookie auth, JSON.

### 6.2 The share-link surface
Public, unauthenticated, read-only. Governed by a `ShareToken`. Rate-limited independently of authenticated endpoints.

- Response shape mirrors the private overview but strips ownership metadata (owner name, share-tokens list) and edit affordances.
- CORS: same as private API (no wildcard even for shared reads).
- Rate limit: 30 requests / minute / token — enough for a supervisor clicking through, low enough to hurt a scraper.

### 6.3 Notifications [ADDED — currently vaporware in AppSettings]

The `AppSettings` page today advertises notification toggles labeled "planned." Either build it or remove it. PRD position: **build it small**.

- **In-app only for v1.** No email, no push, no webhooks.
- Backend: `Notification` table (`id`, `userId`, `kind`, `payload`, `readAt`, `createdAt`).
- Kinds for v1: `VALIDATION_COMPLETED`, `SHARE_LINK_ACCESSED`.
- Endpoints:
  - `GET /api/me/notifications?unread=true`
  - `POST /api/me/notifications/:id/read`
  - `POST /api/me/notifications/read-all`
- Frontend: a bell icon in the top bar with an unread count; a drop-down list; clicking a notification navigates to the relevant page.
- Poll on focus + every 60s while the tab is visible. No websockets for v1.
- The AppSettings toggles then actually control which kinds are generated.

## 7. Global search (currently exists — spec it here for parity)

- `GET /api/search?q=<term>` — searches projects, requirements, use cases, design elements, test cases, business objectives across the caller's projects.
- Response grouped by category with per-category cap (top 5 each).
- Case-insensitive prefix + substring match on `title + code + description` for v1.
- Rate-limited (60/min/user).
- Not a public API; not full-text with ranking beyond the frontmatter of each artefact.

## 8. Realtime / websockets

**Not in v1.** Autosave is a REST call. Notifications poll. If we add multi-user collaboration later, that's the trigger to add a websocket layer, not before.

## 9. Idempotency and safe retries

Any mutation client-side that could be double-fired on flaky network must be idempotent:

- `POST /api/projects/:id/share-tokens` accepts an optional `Idempotency-Key` header; server dedupes for 10 minutes.
- `POST /api/projects/:id/validation/runs` returns the currently-running run if one exists rather than starting a second (see PRD 02 §8 — DB-enforced).
- `PATCH` requests are idempotent by definition — repeated PATCH with the same body has the same effect.

## 10. Backwards-compatibility promise

The API is not public, but the frontend depends on it and lives in a separate deploy path. The rule for the two of them:

- The frontend targets a minimum `X-API-Version` and asserts on it at boot.
- Never remove a field in a minor release. Mark it deprecated in the OpenAPI spec (see §11), stop reading it in the next major, remove it in the one after that.
- Add fields freely.
- New endpoints anytime.

## 11. Documentation format [ADDED]

The API deserves a machine-readable spec. Two options:

- **OpenAPI 3.1** (recommended): `backend/openapi.yaml`, generated or hand-authored, served at `/api/docs` in dev only. Postman / Insomnia can import it.
- Ad-hoc markdown: acceptable if OpenAPI feels heavy for v1, but Sprint 3 upgrades it.

Every route mentioned in this PRD must have an OpenAPI entry by end of Sprint 2.

## 12. Ship criteria per endpoint

- [ ] URL matches the pattern in §2.1
- [ ] Verb matches §2.2
- [ ] Response envelope per §2.3
- [ ] Error shape per §2.4
- [ ] Pagination if it's a list endpoint that can grow
- [ ] "Show your work" §5 if it returns a computed number
- [ ] OpenAPI entry
- [ ] Supertest coverage (see PRD 02 §11)
- [ ] Rate limit configured
- [ ] Owner check (or explicitly documented as public)
- [ ] `CHANGELOG.md` entry references PRD 04 §N
