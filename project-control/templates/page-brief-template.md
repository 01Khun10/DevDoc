# Page brief — {{PageName}}

> Fill this in before writing (or asking the builder to write) any code.
> Delete quoted-guidance lines like this once you understand them.
> If any section is genuinely N/A, write "N/A — <reason>". Empty sections are a review reject.

---

## 1. Identity

- **Route:** `{{/absolute/path}}`
- **Component name:** `{{PascalCase}}`
- **Module:** {{1 auth / 2 projects / 3 documents / 4 registries / 5 traceability / 6 validation / 7 diagrams / 8 misc}}
- **Owner:** Hassan (sole developer — kept as a field in case a collaborator joins later)
- **Wave:** {{1–6, from 00-frontend-rebuild-plan.md}}
- **Files being replaced:** `frontend/src/pages/{{...}}.jsx` (line count: {{N}})
- **Files being deleted after this ships:** {{list any placeholder / dead file superseded}}

## 2. Purpose

> One paragraph. What is this page for, and what does a user leave it having done? If you can't finish this in three sentences, the page's purpose isn't clear enough to build.

{{...}}

## 3. Current-state notes (grounded in the repo)

> What's specifically wrong with the current implementation? Cite audit findings by code (H7, M19, etc.) where relevant. This is what tells the builder what to *stop* doing.

- {{e.g. "Inline-updates have no `onError` (H7) — mutation must gain a toast on failure"}}
- {{e.g. "Renders a local `function Icon` — must import from `components/ui`"}}
- {{e.g. "Uses `title` attribute on grid cells instead of `aria-pressed` + `aria-label` (M19)"}}

## 4. Mockup

- **File:** `{{page-slug}}.html` (place next to this brief)
- **Notes on the mockup:** {{any parts of the mockup that are aspirational / need a design-token override / represent a stretch goal}}

> If the mockup shows something the PRD forbids (bracket-syntax colors, decorative fake stamps, an inlined icon set), note it here explicitly. The builder must know which parts of the mockup to *not* copy literally.

## 5. Data contract

- **Read hooks:** `{{useX, useY from api/z.js}}`
- **Mutation hooks:** `{{useCreateX, useUpdateY, useDeleteZ}}`
- **URL params consumed:** `{{:id, ?highlight=...}}`
- **Global state consumed:** `{{useAuth, useNotify, useProject}}`

> If a hook does not exist yet, do NOT make one up. Stop and open an issue for it, or defer the page until the hook exists.

## 6. Interactions (behavior spec)

> One numbered line per user-observable behavior. This is the behavioral truth of the page.

1. {{On mount, page fetches the list via `useX` and renders a skeleton while loading.}}
2. {{Empty state shows on zero rows with a primary CTA.}}
3. {{Row hover exposes the delete action; clicking prompts for confirmation via `<Modal>`.}}
4. {{Inline status edit fires `useUpdateY`; on error, shows a red toast and reverts the row.}}
5. {{`?highlight=<id>` scrolls to and rings that row for 2500ms.}}
6. {{...}}

## 7. States to design and test

- [ ] Loading (`Skeleton` from `components/ui`)
- [ ] Empty (`EmptyState`)
- [ ] Error (fetch failed — `ErrorState` with retry)
- [ ] Populated (typical)
- [ ] Populated (edge — 100+ rows if pagination applies)
- [ ] Search-empty (populated but no matches)
- [ ] Mutation pending (inline spinner on the row)
- [ ] Mutation failed (toast + revert)

## 8. Accessibility contract

- [ ] Tab reaches every control in DOM order
- [ ] Every interactive element has visible focus
- [ ] Custom widgets (dropdowns, matrix cells, toggles) have correct `aria-*`
- [ ] Modal traps focus, `Esc` closes, focus returns to opener
- [ ] Reduced motion honored (`prefers-reduced-motion` and `data-reduce-motion`)
- [ ] `data-text-scale=large` does not clip layout
- [ ] Every `Icon` is either decorative (`aria-hidden`) or has a label via its parent

## 9. Responsive breakpoints

Verify layout at: **320 · 390 · 768 · 1024 · 1440**.

- Behavior at 320: {{"the sidebar collapses to a bottom sheet"}}
- Any intentional horizontal scroll: {{yes/no — where}}

## 10. Acceptance criteria (testable)

- [ ] Every non-negotiable rule in `PROMPT-builder-page.md` is met
- [ ] Every interaction in §6 is present and works
- [ ] Every state in §7 renders correctly
- [ ] Axe scan: zero violations
- [ ] Grep in this file: `function Icon(` = 0, `href="#"` = 0, `to="#"` = 0, `bg-[var(` = 0, `style={{.*var(--devdoc` = 0
- [ ] Uses only `components/ui` primitives (list them in §11)
- [ ] Test cases {{TC-...}} logged in `testing/01-test-cases-master.md`

## 11. Shared primitives used

List them here so the reviewer can verify with a grep of the file's imports:

- `Icon`, `Button`, `Card`, `Modal`, `Input`, `Select`, `Badge`, `EmptyState`, `Skeleton`, `PageHeader`, `SortSearchBar`, ...

## 12. New primitives introduced (if any)

> Rare. If the page needs a shape not in the library yet, name it here, describe its props, and add it to `components/ui` *before* the page uses it.

- {{`<StatusPill status="draft" />` — three variants, no interactive behavior. Added to components/ui/StatusPill.jsx.}}

## 13. Do-not list

Explicit — the builder is prone to reintroducing these:

- Do not add a local `function Icon()`.
- Do not use `bg-[var(--devdoc-*)]` bracket syntax.
- Do not mix `className` with inline `style` for colors.
- Do not use `href="#"` or `to="#"`.
- Do not add a "coming soon" label to a routed control — either wire it or remove it.
- Do not introduce a decorative fake stamp (REV_3, SYS_STATUS: CRIT).
- Do not go past 400 lines without extracting sub-components.

## 14. Dependencies on other pages / infra

- {{e.g. "Depends on shared `RegistryRow` component landing first"}}
- {{e.g. "Depends on Tailwind theme mapping (global blocker)"}}

## 15. Test cases this page enables

> Cite the codes from `testing/01-test-cases-master.md`. Do not write the tests here — just claim the row.

- TC-FE-...-001
- TC-FE-...-002
- ...
