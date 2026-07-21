# Prompt — Frontend Builder (per-page)

**How to use:** paste this prompt into your builder agent (Codex, Claude, whatever). Attach the page brief and the HTML mockup. The builder returns exactly one working page implementation. Read the review notes at the bottom before merging anything it produces.

---

## Copy from here ↓

You are rebuilding one page of **DevDoc**, a documentation lifecycle management app. You will not touch any other page in this task.

## Context you MUST read before writing any code

1. `project-control/prds/01-PRD-frontend.md` — the design-system contract, the interaction patterns, the anti-patterns.
2. `project-control/prds/04-PRD-api-comms-ai.md` — the API contract for any endpoint this page calls.
3. `project-control/frontend-rebuild/page-briefs/{{PAGE_SLUG}}.md` — the brief for this specific page.
4. `project-control/frontend-rebuild/page-briefs/{{PAGE_SLUG}}.html` — the visual mockup for this page.
5. The **existing source file** for this page (`frontend/src/pages/{{PAGE_COMPONENT}}.jsx`) — read it whole. You are replacing it, not editing around it.
6. `frontend/src/components/ui/index.jsx` — the shared primitives library. Every button, card, modal, input, badge, skeleton, empty state comes from here.
7. `frontend/src/api/*.js` — the hooks. Look up the ones this page needs. Do not invent hook names.

Do not proceed until you have read all seven.

## Task

Rebuild **`{{PAGE_COMPONENT}}`** so it matches the brief and the mockup, uses only shared primitives, and satisfies every acceptance criterion listed in the brief.

## Non-negotiable rules

1. **Use `components/ui` primitives.** Every `Button`, `Card`, `Modal`, `Input`, `Select`, `Textarea`, `Badge`, `Icon`, `Toggle`, `Table`, `EmptyState`, `Skeleton`, `ErrorState`, `PageHeader`, `Gauge`, `SortSearchBar` comes from `components/ui`. If a shape you need isn't there, **stop and add it to `components/ui` first** — do not inline it.
2. **No local `function Icon()`.** Ever. Import `Icon` from `components/ui`.
3. **No inline `linear-gradient(var(--devdoc-grid-line)...)`.** Use `<GridBackground>` (or the `.devdoc-grid-bg` className) if the page needs blueprint paper.
4. **Colors via Tailwind theme, not bracket syntax.** Use `bg-devdoc-surface`, `text-devdoc-muted`. Do not use `bg-[var(--devdoc-surface)]` or inline `style={{ backgroundColor: "var(--devdoc-*)" }}`.
5. **Real hooks only.** Every network call uses the corresponding `frontend/src/api/*.js` hook. No raw `apiRequest`, no `useState`+`useEffect`+`fetch`.
6. **Every mutation has `onError`.** No silent failures. Show a toast via `useNotify()` on any mutation failure.
7. **Real controls only.** No `href="#"`, no `to="#"`, no disabled button whose comment says "backend doesn't support this yet" unless you verify with grep that the endpoint truly does not exist. If it exists, wire it up.
8. **Accessibility is part of the acceptance criteria.**
   - Every interactive element is focusable, has a visible focus ring.
   - Every custom widget has correct `aria-*` (matrix cell → `aria-pressed` + `aria-label`, dropdown → `role="listbox"` + arrow-key navigation, modal → focus trap).
   - Motion respects `prefers-reduced-motion` and `data-reduce-motion`.
9. **Responsive.** Layout works at 320 / 390 / 768 / 1024 / 1440. No horizontal scroll except on the traceability matrix.
10. **No inline SVG icons outside the `Icon` component.** If a specific icon path is needed, pass the path children to `<Icon>{...}</Icon>`.
11. **No decorative stamps.** No `rev 3.0`, no `SYS_STATUS: CRIT`, no fake instrument corners unless the corner reflects real system state.
12. **The file is a page, not a framework.** If it grows past ~400 lines, extract sub-components into `components/`. `DocumentEditorPanel.jsx` at 607 lines was the mistake — do not repeat it.

## What to write

The single file `frontend/src/pages/{{PAGE_COMPONENT}}.jsx`, plus any new sub-components in `frontend/src/components/` this page requires. Do not modify anything else.

If you need a new primitive in `components/ui`, add it there with its own test file, and note it in your response.

## What NOT to do

- Do not modify other pages.
- Do not modify hooks in `api/`.
- Do not modify services in `services/`.
- Do not add new dependencies to `package.json`.
- Do not modify `App.jsx` unless the brief explicitly says a route needs to change (it usually doesn't).
- Do not write tests in this task — that's a separate step, driven by `PROMPT-codex-test-implementation.md`.

## Output format

1. The **complete file(s)** you're creating or replacing.
2. A **list of shared primitives you used** (verify each exists in `components/ui`).
3. A **list of any new primitives you had to add to `components/ui`**, with rationale for why they didn't exist yet.
4. A **checklist of the acceptance criteria** from the brief, each marked done with the line/section that satisfies it.
5. A **note** on what test cases from `testing/01-test-cases-master.md` this page's behavior enables (do not write the tests — just cite the `TC-*` codes).

## Rejection criteria (do not submit if any of these are true)

- Any of the "non-negotiable rules" above is violated.
- An acceptance criterion from the brief is not satisfied.
- The file mixes `className` with inline `style` for colors.
- A local `function Icon()` appears in the file.
- The page hand-rolls a card / button / modal / skeleton that already exists in `components/ui`.
- Any control links to `#` or is disabled with a misleading comment.
- The file exceeds 400 lines with no sub-component extraction.

## Copy to here ↑

---

## Notes for the human (do not paste to builder)

**Why this prompt is strict:**

The audits found the frontend problem was not talent — it was drift. Every page was locally competent; the *system* was broken because each page reimplemented the same primitives with tiny variations. This prompt exists to make the shared primitives the *only* option.

**Review the builder's output against:**

1. `SKILL-reviewer.md` (the reviewer checklist)
2. The acceptance criteria in the page brief
3. Grep the file for: `function Icon(`, `href="#"`, `to="#"`, `bg-[var`, `linear-gradient(var(--devdoc-grid-line)`, `dangerouslySetInnerHTML`. Any hit is a rejection.
4. Import verify: every `import { X } from "../components/ui"` — X must actually be exported from `components/ui/index.jsx`.

**When the builder resists a rule:**

If the builder says "I can't achieve this look without an inline style" — the answer is almost always "then add a variant to the primitive". Push it back once. If it insists, look at the mockup with fresh eyes: probably the mockup asks for something we don't yet want to support (a bespoke card treatment that would fork the design system). Push back on the *mockup*, not the primitive.

**When the mockup and the PRD disagree:**

The PRD wins. Update the mockup to match. Never let the mockup override the PRD without a PRD change.

**How to iterate:**

1. First pass: builder returns a first draft.
2. You run through the reviewer checklist. Every failed item goes back to the builder as a single "please fix these items" prompt with the checklist items quoted.
3. Second pass typically clears all items.
4. Manual smoke-test in the browser at 320 / 768 / 1440.
5. If clean, merge and move on to the next page.

**Codex vs Claude for this task:**

Both work. Claude produces cleaner first drafts; Codex is faster in a tight IDE loop. Pick whichever fits your workflow — the prompt is the constant.

## Variables to substitute before pasting

- `{{PAGE_SLUG}}` — e.g. `requirement-registry`
- `{{PAGE_COMPONENT}}` — e.g. `RequirementRegistry`
