# Templates — Guide

**Purpose:** every recurring artefact in `project-control/` has a template. If you find yourself writing the same skeleton twice, we make it a template.

**Rule:** never edit a template file's content while filling one out — copy first, then edit the copy.

---

## What lives here

| Template | When to use | Output location |
|---|---|---|
| `page-brief-template.md` | Rebuilding a frontend page. Fill this in *before* the builder writes any code. | `frontend-rebuild/page-briefs/<page-slug>.md` |
| `test-case-template.md` | Authoring a test case in detail — most only need a row in `01-test-cases-master.md`, but complex ones (E2E journeys, security tests) benefit from a full brief. | `testing/case-briefs/<TC-CODE>.md` (create the folder if it doesn't exist) |
| `prd-section-template.md` | Adding a new section to any PRD. Keeps voice, structure, and detail level consistent across sprints. | Paste into the target PRD |

## Templates we haven't made yet (make one only when you need it *twice*)

- Migration brief template — for the SQL + Prisma pair per DB change. Add when we've done three migrations and see a stable shape.
- Sprint retrospective template — after the first sprint retro reveals what we actually want to record.
- Audit follow-up template — first time we run `SKILL-analyzer.md` a second time, we'll extract the diff-format that emerges.

Do not premature-template. Templates that don't fit reality get ignored, and ignored process is worse than no process.

## How to use a template (three-step)

1. **Copy.** Duplicate the template file with the right name (see table above).
2. **Fill.** Replace every `{{PLACEHOLDER}}` with real content. Delete guidance comments (`> lines starting with `>`) once you understand them.
3. **Cite.** In the PR that acts on the filled template, cite it: `See frontend-rebuild/page-briefs/requirement-registry.md`.

## Style rules for filled templates

- **Concrete over abstract.** "The status dropdown must have `role='listbox'`" beats "accessibility should be handled."
- **Cite file paths, hook names, endpoint URLs.** Fantasy specs produce fantasy code — the audits are proof.
- **Explicit "do not" list.** As useful as the "do" list — see how PRD 01 §11 lists anti-patterns.
- **Acceptance criteria are testable.** If you can't imagine the test that would prove it, the criterion isn't specific enough.

## When to update a template

- The template caused a filled-in brief to be *wrong* → fix the template.
- Every filled-in brief drops a section → drop that section from the template.
- Every filled-in brief adds a section → promote it to the template.

Template drift is the same enemy as code drift — one canonical version, updated deliberately.
