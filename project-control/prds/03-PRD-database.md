# PRD 03 — Database

**Owner:** Hassan (sole developer)
**Depends on:** PRD 02 (backend uses this schema)
**Precedence:** [REVISED 2026-07-21 — `foundations/` is now historical reference, this PRD is the baseline] `ValidationProfile`, `Template`, `TemplateSection`, `ValidationRule` field-level shapes still match `foundations/devdoc-template-package-v1.md` §6, verified against the live schema — that file remains useful as the detailed record, but this PRD governs going forward. That file's §16 documents one still-unresolved conflict on validation-rule naming convention (spec says per-template-prefixed codes like `STD-SRS-C-001`; the actual implementation uses shared codes like `DOC-001` with per-profile severity overrides) — read it before changing `ValidationRule`; it hasn't been decided yet, just because `foundations/` lost precedence doesn't mean this conflict resolved itself.

---

## 1. Guiding principles

1. **The database enforces truth.** Anything the app must never allow (cross-tenant reads, dangling references, invalid enums) is enforced at the schema level. Application-level guards are defense-in-depth, not the primary guarantee.
2. **Enums are enums, not strings.** Any field with a finite set of values is a Prisma `enum`. JS-validator-only enforcement is a bug (M11).
3. **Every foreign key is indexed.** Every filter column is indexed. "We can add it later" is how projects hit their first slow-query wall.
4. **Cascade rules are deliberate.** Every relation declares `onDelete` explicitly. `Cascade` for child-of-project rows, `Restrict` for shared reference data. Never the default.
5. **Migrations are additive-first.** Never edit a shipped migration. New behavior gets a new migration. Rollback is by forward-migration.

## 2. Current schema state (verified at folder creation)

7 migrations applied. Core tables exist and are correctly modeled at a high level. Gaps identified by the audits:

- `TraceabilityLink` is polymorphic (`sourceType/sourceId + targetType/targetId`) with **no referential integrity**. If a requirement is deleted, links pointing at it become orphans (H4 backend fix cleans up on delete, but a script or bug can still create them).
- `Project.status`, `TestCase.status`, `DesignElement.elementType`, `TraceabilityLink.linkType` are `String` with JS-only validation (M11).
- `ActivityLog.actorId` is nullable and **always null** in practice (M10) — see PRD 02 §7.
- `ShareToken.expiresAt` exists but is never set (H3) — see PRD 02 §5.
- `ValidationResult` stores `ruleCode` but not a rule-message snapshot — historical findings can't be interpreted if a rule text changes.
- No composite indexes on the query paths that matter: `Requirement(projectId, createdAt)`, `TraceabilityLink(projectId, sourceType, sourceId)`, `ValidationRun(projectId, startedAt DESC)`.
- No index on `Project.ownerId` — every page load runs `ownerId = ?` and this is currently a full scan.

## 3. Traceability integrity strategy [ADDED — audit surfaced but no plan existed]

Polymorphic FKs are the audit's #1 database concern because DevDoc's central product claim is trustworthy traceability.

**Option A — Discriminated child tables (rejected).** One `RequirementLink`, one `UseCaseLink`, etc. with proper FKs. Rejected: multiplies table count, doesn't map cleanly to the graph views, kills the "one link" mental model users see.

**Option B — Application-transaction + DB check-constraint (chosen).** Two-part solution:

1. **Application-level (already required by PRD 02 §6):** every artefact delete runs `deleteMany` on `TraceabilityLink` in the same transaction.
2. **Database-level:** add a stored procedure or scheduled job (every 10 minutes in prod, on-demand in dev) that runs:
   ```sql
   DELETE FROM "TraceabilityLink"
   WHERE NOT EXISTS (…)  -- source or target row missing
   ```
   Any row deleted this way is a bug — log it to `SystemAudit` (new table, see §5) with the FK context so we can find the missing service transaction.

3. **New CHECK constraint** on `TraceabilityLink`:
   ```sql
   ALTER TABLE "TraceabilityLink" ADD CONSTRAINT tracelink_types_valid CHECK (
     "sourceType" IN ('BUSINESS_OBJECTIVE','USE_CASE','REQUIREMENT','DESIGN_ELEMENT','TEST_CASE','DOCUMENT_SECTION')
     AND "targetType" IN ('BUSINESS_OBJECTIVE','USE_CASE','REQUIREMENT','DESIGN_ELEMENT','TEST_CASE','DOCUMENT_SECTION')
     AND "linkType" IN ('initiates','covers','described_by','implemented_by','verified_by')
   );
   ```
   Prevents typos and future free-form strings from entering the graph.

**Not chosen:** trigger-based FK simulation. Too invisible to auditors and the ORM.

## 4. Indexes to add (Migration 8)

Explicitly listed here so the migration reviewer can check every one is present:

| Table | Index | Rationale |
|---|---|---|
| `Project` | `ownerId` | Every dashboard load |
| `Project` | `(ownerId, updatedAt DESC)` | Dashboard sort-by-recent |
| `Requirement` | `(projectId, createdAt)` | Registry list |
| `Requirement` | `(projectId, status)` | Filter by status |
| `UseCase` | `(projectId, createdAt)` | Registry list |
| `DesignElement` | `(projectId, createdAt)` | Registry list |
| `TestCase` | `(projectId, createdAt)` | Registry list |
| `TestCase` | `(projectId, status)` | Filter by status |
| `BusinessObjective` | `(projectId, createdAt)` | Registry list |
| `TraceabilityLink` | `(projectId, sourceType, sourceId)` | Graph walk from source |
| `TraceabilityLink` | `(projectId, targetType, targetId)` | Graph walk to target |
| `TraceabilityLink` | `projectId` | Total-project graph load |
| `ValidationRun` | `(projectId, startedAt DESC)` | Latest-run lookup, history page |
| `ValidationResult` | `runId` | Findings for a run |
| `Document` | `projectId` | Documents list |
| `DocumentSection` | `documentId` | Editor section load |
| `ActivityLog` | `(projectId, createdAt DESC)` | Activity feed |
| `ActivityLog` | `actorId` | Per-user audit query [ADDED] |
| `ShareToken` | `token` (unique) | Public lookup |
| `ShareToken` | `projectId` | Manage-shares list |

## 5. New tables introduced by these PRDs

### 5.1 `SystemAudit` [ADDED — for the traceability integrity job]
For DB-level guarantees we can't move to app-level (the traceability scrubber, missing constraints firing, etc.).

```prisma
model SystemAudit {
  id         String   @id @default(cuid())
  eventType  String   // ORPHANED_LINK_DELETED | CONSTRAINT_VIOLATION | ...
  meta       Json
  createdAt  DateTime @default(now())

  @@index([eventType, createdAt])
}
```

Retention: 90 days. Cleared by a scheduled job.

### 5.2 `SecurityEvent` [ADDED — PRD 02 §7 requires this for audit-trail semantics]
Auth events kept separate from `ActivityLog` (which is a UI feed).

```prisma
model SecurityEvent {
  id         String   @id @default(cuid())
  userId     String?
  event      String   // LOGIN_SUCCESS | LOGIN_FAILURE | LOGOUT | PW_CHANGE | REGISTER | REVOKE
  ip         String?
  userAgent  String?
  meta       Json?
  createdAt  DateTime @default(now())

  @@index([userId, createdAt])
  @@index([event, createdAt])
}
```

Retention: 180 days.

## 6. Enums to introduce (Migration 9)

Every `String` field with a finite domain becomes a real Prisma enum:

```prisma
enum ProjectStatus { ACTIVE ARCHIVED }
enum RequirementType { FR NFR }
enum RequirementStatus { PROPOSED APPROVED IMPLEMENTED VERIFIED }
enum RequirementPriority { HIGH MEDIUM LOW }
enum TestCaseStatus { DRAFT READY PASSED FAILED BLOCKED }   // BLOCKED added [ADDED]
enum DesignElementType { COMPONENT MODULE INTERFACE CLASS SERVICE }
enum ArtefactType { BUSINESS_OBJECTIVE USE_CASE REQUIREMENT DESIGN_ELEMENT TEST_CASE DOCUMENT_SECTION }
enum LinkType { initiates covers described_by implemented_by verified_by }
enum DocumentType { SCOPE SRS SDS STP }
enum SectionStatus { EMPTY DRAFT PARTIAL COMPLETE }         // PARTIAL added [ADDED]
enum ValidationSeverity { ERROR WARNING INFO }
enum ValidationRunStatus { RUNNING COMPLETED FAILED }
```

Then `TraceabilityLink.sourceType` becomes `ArtefactType`, `TraceabilityLink.linkType` becomes `LinkType`, and so on. The check-constraint from §3 becomes redundant (kept as belt-and-braces) once enums land.

Migration sequence:
1. Add enum types
2. Add temporary shadow columns with the enum type
3. Backfill from string columns (validate no unexpected values first)
4. Swap constraints
5. Drop string columns

Never do this in one destructive `ALTER COLUMN`.

## 7. Schema additions requested by product [ADDED — in-scope features gaining first-class support]

### 7.1 `Diagram` (Module 7 persistence — currently missing)
The UML Diagram Designer PRD 01 §5 promises "save diagrams by name". No such table today.

```prisma
model Diagram {
  id                  String   @id @default(cuid())
  projectId           String
  name                String
  language            String   // "plantuml" for v1
  source              String   // the code the user typed
  documentSectionId   String?  // optional link to a section
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt

  project             Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  documentSection     DocumentSection? @relation(fields: [documentSectionId], references: [id], onDelete: SetNull)

  @@index([projectId, updatedAt])
}
```

### 7.2 `UserPreference` [ADDED — power system settings, currently localStorage-only]
Right now theme / reduce-motion / text-scale are localStorage only, which means they don't sync across devices. In-scope because "Accessibility page" is a real page and the audit calls out that documented controls should work everywhere.

```prisma
model UserPreference {
  userId          String   @id
  theme           String   @default("system")   // "light" | "dark" | "system"
  reduceMotion    Boolean  @default(false)
  textScale       String   @default("default")  // "default" | "large" | "larger"
  highContrast    Boolean  @default(false)
  focusVisible    Boolean  @default(true)
  editorAutosave  Int      @default(3000)       // ms
  updatedAt       DateTime @updatedAt

  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

localStorage remains a write-through cache. Server is source of truth. `PATCH /api/me/preferences` writes. `GET /api/me/preferences` on app boot warms the cache.

### 7.3 `SavedView` [ADDED — small quality-of-life feature that consolidates registry state]
Registries currently reset filter/sort on every visit. This is documentation software — people revisit the same view repeatedly.

```prisma
model SavedView {
  id         String   @id @default(cuid())
  userId     String
  projectId  String
  scope      String   // "requirements" | "use-cases" | "traceability" | ...
  name       String
  config     Json     // { search, sort, filters }
  createdAt  DateTime @default(now())

  @@index([userId, projectId, scope])
}
```

Registry pages get a "Save this view" affordance. Small feature, big usability win.

### 7.4 `CodeModule` and the `implemented_in` link [ADDED 2026-07-21 — confirmed in-scope feature, see PRD 00 Module 5 and PRD 04 §4.4]

Supports Tier 1 of code-to-documentation drift detection: a user-linked file, tracked against its own git history, flagged when it moves without the link being re-verified.

```prisma
model CodeModule {
  id                 String   @id @default(cuid())
  projectId          String
  path               String              // relative path within the linked repo
  repoUrl            String?             // optional — local-only projects may have no remote
  lastVerifiedCommit String?             // commit hash at the time the link was created/confirmed
  lastCheckedAt      DateTime?           // when DevDoc last compared lastVerifiedCommit to HEAD
  status             CodeModuleStatus @default(UNVERIFIED)
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  project            Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)

  @@index([projectId, status])
}

enum CodeModuleStatus {
  UNVERIFIED     // linked, never checked
  CURRENT        // lastVerifiedCommit matches HEAD for this path
  POSSIBLY_STALE // path has changed since lastVerifiedCommit
}
```

- `ArtefactType` (PRD 03 §6) gains `CODE_MODULE` as a valid `TraceabilityLink` endpoint type.
- `LinkType` (PRD 03 §6) gains `implemented_in` — a `DESIGN_ELEMENT` or `REQUIREMENT` links to a `CODE_MODULE`.
- The staleness check itself is a backend job, not a database feature — it reads the linked repo's git log for the given path and compares the latest commit touching that path against `lastVerifiedCommit`. No file content is read for Tier 1; this is metadata only.
- `CodeModule` rows follow the same delete-cleanup rule as every other artefact (PRD 02 §6) — deleting a `CodeModule` removes its `TraceabilityLink` rows in the same transaction.
- This table exists for Tier 1 only. Tier 2 (semantic drift, PRD 04 §4.4) doesn't need new tables yet — it's not scheduled.

## 8. Migration policy

- **One migration = one PR.** Reviewers must see the `.sql` file, not just the schema diff.
- **Every migration is tested against a copy of production data structure** before merge. `pg_dump --schema-only` + real row samples.
- **Data migrations are separate from schema migrations.** Never mix `ALTER TABLE` and `UPDATE` in one migration script. `20260721_add_tokenVersion.sql` (schema) + `20260721_backfill_tokenVersion.sql` (data).
- **Idempotent seeds.** `prisma/seed.js` uses `upsert` throughout — already correct, keep it.

## 9. Seed data policy

Seeds serve three purposes; keep them distinct:

- **Reference data** (always seeded): `ValidationProfile`, `ValidationRule`, `Template`, `TemplateSection`. Idempotent upsert.
- **Demo data** (env-gated): `SEED_DEMO=true` → a demo user + populated project. For screenshots and manual testing only.
- **Test data**: never in seed. Created per-test via fixtures. See `testing/00-test-strategy.md`.

## 10. Backup and disaster recovery [ADDED — nobody has specified this]

Even a school project deserves this on the record:

- Production DB has daily automated backups, retained 14 days.
- Backups are tested by restoring to a scratch environment at least once per sprint.
- `.env.example` documents the connection string format; secrets never in the repo.
- The current `.secrets/` folder in the repo (visible in the extracted zip) is a **finding**: rotate any credential that ever lived there, add `.secrets/` to `.gitignore`, and don't commit env values ever again.

## 11. Ship criteria per migration

- [ ] Additive (no destructive `DROP` without a matching data-migration preceding it)
- [ ] Schema change and data backfill are separate migrations
- [ ] Every new FK has an index
- [ ] Every new column that's an enum in code is an enum in the DB
- [ ] `prisma db push --preview-feature` is not used against production
- [ ] Rollback plan documented in the PR (usually: forward-migration that reverts)
- [ ] `CHANGELOG.md` entry references PRD 03 §N
