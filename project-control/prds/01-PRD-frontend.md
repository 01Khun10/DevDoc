# PRD 01 — Frontend

**Owner:** Hassan (sole developer — all pages)
**Depends on:** PRD 00, PRD 04 (API contract)

---

## 1. Guiding principles

1. **One dialect.** There is one design system. Every routed page uses `components/ui` primitives. Pages that hand-roll their own card/badge/input are broken by definition.
2. **Every primitive exists once.** `Icon`, `GridBackground`, `Card`, `PageHeader`, `Modal`, `EmptyState`, `Skeleton`, `Badge`, `Table`, `Toggle`, `SortSearchBar`, `StatCard`, `Gauge`, `SeverityDonut`. If a page needs a shape not in this list, add it to the list first, then use it.
3. **CSS variables are the theme.** All colors reference `--devdoc-*`. Tailwind config maps them into theme colors (`bg-devdoc-surface`, `text-devdoc-muted`) so we don't write `text-[var(--devdoc-muted)]` bracket syntax anywhere. See §6.
4. **Every visible control does something real.** No `to="#"`, no `href="#"`, no disabled buttons on a routed page that hide "the backend endpoint doesn't exist" if it does exist.
5. **Show your work.** Any number a user sees (readiness, coverage %, N linked, autosave time) links to the calculation.
6. **Keyboard is first-class.** Every interactive element is Tab-reachable with a visible focus ring. Modal traps focus. `Esc` closes. Every custom widget (dropdown, listbox, matrix cell) has correct `aria-*`.
7. **Reduced-motion is honored.** Every transition, animation, and scroll effect degrades cleanly when `prefers-reduced-motion: reduce` or `data-reduce-motion="true"` on `<html>`.

## 2. Design system contract

### 2.1 Palette (the Blueprint theme)

Defined in `src/index.css`:

- **Canvas / surfaces**: `--devdoc-bg`, `--devdoc-surface`, `--devdoc-surface-inset`, `--devdoc-surface-hover`
- **Text**: `--devdoc-text`, `--devdoc-text-secondary`, `--devdoc-muted`, `--devdoc-subtle`
- **Borders**: `--devdoc-border`, `--devdoc-border-strong`, `--devdoc-border-focus`
- **Primary / highlight**: `--devdoc-primary`, `--devdoc-primary-soft`, `--devdoc-highlight`, `--devdoc-highlight-soft`
- **Semantic**: `--devdoc-success`, `--devdoc-warning`, `--devdoc-error`, `--devdoc-info` (+ `-soft` variants)
- **Artefact type**: `--devdoc-artifact-{bo,uc,fr,nfr,sec,de,tc}`
- **Grid**: `--devdoc-grid-line`

Two themes: light (default `:root`) and dark (`[data-theme="dark"]`). Both must be maintained.

### 2.2 Typography

- **Headlines** (`.font-headline`): Space Grotesk, weights 500 / 600 / 700
- **Body**: Inter, weights 400 / 500
- **Mono** (`.font-mono`): JetBrains Mono, weights 400 / 500 — for codes (FR-012), timestamps, technical labels
- Sentence case throughout. `UPPERCASE MONO WITH WIDE TRACKING` reserved for section eyebrows (max one per page).

### 2.3 Shape and motion

- Radius: 6px (`rounded-md`), 8px (`rounded-lg`), full for pills / avatars
- Borders: hairline (`1px solid var(--devdoc-border)`)
- Motion: 120–180ms ease-out for local interactions, 250–400ms for entrance / reveal
- Focus ring: 2px `--devdoc-border-focus`, offset 2px
- One elevation lift on hover for cards: `translateY(-2px)` + soft shadow

### 2.4 Iconography

- One `Icon` component in `components/ui/index.jsx`
- Icons are inline SVG paths from a curated set (lucide-style stroke geometry) — no icon-font dependency
- Default size 16px; explicit sizes 14 / 18 / 20 / 24 allowed. No other sizes.

### 2.5 Grid background

- One class in `index.css`: `.devdoc-grid-bg` (24×24) and `.devdoc-grid-bg-fixed` (attached)
- No inline `linear-gradient(...)` copies anywhere in `pages/`

## 3. Component inventory (`components/ui/`)

Every page composes from these. If a page needs something not here, first PR the primitive.

| Component | Purpose | a11y contract |
|---|---|---|
| `Icon` | Inline SVG wrapper | `aria-hidden="true"` when decorative; parent provides label |
| `Button` | 4 variants (primary / secondary / ghost / danger), 3 sizes | Real `<button>` element; `disabled` prevents click *and* `aria-disabled` |
| `Input`, `Textarea`, `Select` | Form field with label / helper / error | `aria-invalid` and `aria-describedby` wired |
| `Modal` | Centered dialog | Focus trap, focus return, `Esc` closes, `role="dialog"`, `aria-modal` |
| `Card` | Container with optional header / footer / interactive lift | If `interactive`, becomes `<button>` or `<Link>` |
| `PageHeader` | Eyebrow + title + description + actions row | `<h1>` for title |
| `Table` | Rows / columns with sort headers | Sort headers are `<button>` with `aria-sort` |
| `Badge` | Status pill (tone: primary / success / warning / error / muted) | Text visible; no color-only meaning |
| `EmptyState` | Grid-paper block with icon / message / CTA | Focus lands on the CTA when the state appears |
| `Skeleton` + `SkeletonText` + `SkeletonCard` + `PageSkeleton` | Loading placeholders | `aria-busy="true"` on parent while loading |
| `ErrorState` | Retry-able error block | Retry button focusable |
| `StatCard` | Number + label + optional trend | Semantic `<dl>` |
| `Toggle` | Switch with label + hint | `role="switch"` + `aria-checked` |
| `SortSearchBar` | Search input + sort select (per registry) | Standard input labeling |
| `GridBackground` | Wrapping element with `.devdoc-grid-bg` | — |
| `Gauge` | Readiness circle | Text alternative in `aria-label` |
| `SeverityDonut` | Errors / warnings / info donut | Text alternative |
| `Tooltip` | Real accessible tooltip | Radix or headless — do not use `title` attribute alone |

**Anti-pattern:** page files with local `function Icon(...)`, `function Card(...)`, `function Skeleton(...)`. These are audit findings.

## 4. Page inventory (all 24 routed pages)

| Route | Component | Module | Uses shared ui? | Test coverage tier |
|---|---|---|---|---|
| `/` | `LandingPage` | 8 | Partial | e2e |
| `/login` | `Login` | 1 | ⚠ needs rework | e2e + unit (validation) |
| `/register` | `Register` | 1 | ⚠ needs rework | e2e + unit (validation) |
| `/shared/:token` | `SharedReport` | 8 | ⚠ needs rework | e2e (read-only public) |
| `/dashboard` | `Dashboard` | 2 | ⚠ needs rework | e2e |
| `/profile` | `Profile` | 1 | ⚠ needs rework — must recover password change | unit + e2e |
| `/settings` | `AppSettings` | 8 | ⚠ needs rework | unit |
| `/help` | `Help` | 8 | ⚠ needs rework | smoke |
| `/docs` | `Documentation` | 8 | ⚠ needs rework | smoke |
| `/about` | `About` | 8 | ⚠ needs rework | smoke |
| `/accessibility` | `Accessibility` | 8 | ⚠ needs rework | axe + unit |
| `/projects/:id` | `ProjectWorkspace` | 2 | ⚠ needs rework | e2e |
| `.../business-objectives` | `BusinessObjectiveRegistry` | 4 | ✅ (uses `RegistryControls`) | unit + e2e |
| `.../use-cases` | `UseCaseRegistry` | 4 | ⚠ needs registry-pattern refactor | unit + e2e |
| `.../requirements` | `RequirementRegistry` | 4 | ⚠ needs registry-pattern refactor + `onError` | unit + e2e |
| `.../design-elements` | `DesignElementRegistry` | 4 | ⚠ needs registry-pattern refactor + `onError` | unit + e2e |
| `.../test-cases` | `TestCaseRegistry` | 4 | ⚠ needs registry-pattern refactor | unit + e2e |
| `.../documents` | `DocumentsLibrary` | 3 | ⚠ needs rework | e2e |
| `.../templates` | `TemplateLibrary` | 3 | ⚠ needs rework | e2e |
| `.../documents/:documentId` | `DocumentEditor` | 3 | ⚠ god-component — split | e2e (autosave) |
| `.../documents/:documentId/print` | `DocumentPrint` | 3 | ⚠ **DOMPurify blocker** | e2e + security unit |
| `.../traceability` | `TraceabilityMatrix` | 5 | ⚠ needs a11y + registry-pattern | unit + e2e |
| `.../validation` | `ValidationEngine` | 6 | ⚠ needs formula-panel | unit + e2e |
| `.../diagrams` | `ProjectDiagrams` (rebrand to `UmlDiagramDesigner`) | 7 | ⚠ needs disclosure notice | smoke |
| `.../analytics` | `ProjectAnalytics` | 8 | ⚠ needs rework | smoke |
| `.../versions` | `ProjectVersions` | 8 | ⚠ needs rework | smoke |
| `.../settings` | `ProjectSettings` | 2 | ⚠ needs rework — must recover share + delete | unit + e2e |

⚠ = every workspace page hand-rolls its own `Card` / `Button` / inline styles. This is the M20 audit finding. Every ⚠ becomes ✅ after its rebuild per `frontend-rebuild/00-frontend-rebuild-plan.md`.

## 5. Interaction patterns (used by multiple pages)

### 5.1 Registry pattern
Used by 5 pages (all registries). Shared elements:

- Page header with title + count + primary "Add X" action
- `SortSearchBar` with type filter tabs where applicable (Requirements: FR/NFR/All)
- Single card containing bordered rows (52px tall) — not floating cards
- Row: hover-checkbox / code chip (mono, type-colored) / title + description / inline-editable badges / link chip / row-actions on hover
- `?highlight=<id>` on arrival scrolls to and rings that row for 2500ms
- Bulk-select bottom bar when ≥1 selected
- Drawer (right sheet) for create/edit — reuses `Modal` variant

All five registries must import `sortAndSearch` from `components/RegistryControls.jsx` and use the same row component. This is the M17 audit finding: pattern exists, wasn't propagated.

### 5.2 Editor pattern
Three-pane, no grid paper (calm working surface):
- Left rail: section navigator with completion ticks
- Center: TipTap editor with ribbon (Bold/Italic/Heading/List/Table/Undo/Redo)
- Right rail: guidance + linked artefacts (collapsible)
- Top bar: save state indicator (`Saving…` / `Unsaved` / `Saved · HH:MM`), export button (gated on validation errorCount === 0), focus mode toggle
- Bottom: Prev / Save & next
- `DocumentEditorPanel.jsx` is a god-component (H11). Split into: `EditorToolbar`, `EditorSurface`, `InlineRequirementCapture`, `WritingLinter`, `RibbonTabs`.

### 5.3 Traceability pattern
Five tabs sharing a mode selector (BO→UC, UC→FR, FR→DE, FR→TC, UC→section):
- Grid — clickable matrix cells (`aria-pressed`, `aria-label`)
- Graph — SVG two-column with dimension-line links
- Map — floor-plan cells on grid paper
- Builder — two pickers + create button
- Suggestions — TF-IDF cards with visible match reasoning

### 5.4 Deep-link highlight
Standard `?highlight=<id>` query param on registries + editor. Handler: scroll into center, apply 2px focus ring for 2500ms, then remove. Uses `useSearchParams`.

### 5.5 Validation scan
The one bit of theatre we keep: when the user clicks "Run validation", a cyan scan-line sweeps down the findings list once, findings appearing in its wake. Respect `prefers-reduced-motion` — under reduced motion the scan is skipped and findings appear together with a subtle fade.

## 6. Tailwind + CSS variable strategy

Audit finding: right now the codebase has both `bg-white` (Tailwind default) and `bg-[var(--devdoc-surface)]` (arbitrary bracket) mixed with inline `style={{ backgroundColor: "var(--devdoc-surface)" }}`. This is why light/dark theming is inconsistent.

**Fix (must happen in sprint 4):** Extend `tailwind.config.js`:

```js
theme: {
  extend: {
    colors: {
      devdoc: {
        bg: "var(--devdoc-bg)",
        surface: "var(--devdoc-surface)",
        text: "var(--devdoc-text)",
        muted: "var(--devdoc-muted)",
        primary: "var(--devdoc-primary)",
        // ...one entry per --devdoc-* variable
      }
    }
  }
}
```

Then pages write `bg-devdoc-surface text-devdoc-muted border-devdoc-border` — no bracket syntax, no inline styles. Autocomplete works. Dark mode is automatic because the CSS variable is themed.

**Anti-pattern after sprint 4:** any element with both `className` and `style={{ backgroundColor: "var(--devdoc-*)" }}` — reviewer rejects.

## 7. State strategy

- **Server state**: React Query. Every resource has a hook file in `api/`. Hooks call service functions in `services/*Service.js`. Pages do not call `apiRequest` directly (M17 audit finding: three fetching idioms coexist).
- **Auth state**: React Context (`AuthContext`). `useAuth()` gives `{ user, isLoading, login, register, logout }`. The context is the *only* source of session identity. Query cache is cleared on logout.
- **UI state**: local `useState` / `useReducer` in the page. No global UI state store.
- **Session expiry policy** (fixed in consolidation pass): `apiRequest` handles 401 for non-auth endpoints — redirects to `/login`. `useAuthGuard` is deleted (H6 audit finding).
- **Form state**: sprint-3 helper `useFormSubmit` collapses the ~5 near-identical create-form implementations.

## 8. Accessibility contract (WCAG 2.1 AA)

Every page must satisfy:

1. **Keyboard**: Every interactive element reachable via Tab in DOM order. Focus visible. `Esc` closes modals / dropdowns.
2. **Screen reader**: `<main>`, `<nav>`, `<header>` landmarks on every page. `<h1>` per page, headings nest correctly.
3. **Custom widgets** (dropdown, matrix cell, toggle, tabs): correct ARIA roles and states. Verified with Axe.
4. **Color**: contrast ≥ 4.5:1 for normal text, 3:1 for large text and UI components. Enforced by design tokens.
5. **Motion**: `prefers-reduced-motion: reduce` + `data-reduce-motion="true"` disable non-essential animation.
6. **Text scale**: `data-text-scale="large" | "larger"` scales root font-size; layouts must not clip.
7. **Focus management**: on route change, focus moves to `<main>` heading. On modal open, focus enters modal.

The `Accessibility` page exposes these as user controls. Every claim it makes must be true across every routed page — no more advertising J/K keyboard shortcuts that don't work (H10 audit finding).

## 9. Testing (frontend-specific)

See PRD `testing/00-test-strategy.md` for the full plan. Frontend-owned test types:

- **Unit** (Vitest): utility functions, hooks that don't hit the network (mock `apiRequest`), pure components
- **Component** (Vitest + Testing Library): `components/ui/*` primitives, complex widgets (matrix, editor toolbar)
- **A11y** (`vitest-axe`): each routed page renders without violations in a Vitest snapshot
- **E2E** (Playwright): the critical journey (PRD 00 §8) + one journey per major feature

**Coverage targets** (not %):
- Every `components/ui` primitive: one interaction test each
- Every hook in `api/`: one success test + one error test
- Every routed page: one smoke test that mounts without error + one keyboard-navigation test
- Critical journey: one Playwright suite that runs against a real backend

## 10. Ship criteria per page

A page is "done" when:

- [ ] Uses `components/ui` primitives only (no local `Card`/`Icon`/etc.)
- [ ] All colors reference `--devdoc-*` via Tailwind theme (no inline `style` for colors after sprint 4)
- [ ] Every visible control has a real target
- [ ] Axe scan: zero violations
- [ ] Keyboard traversal: Tab reaches every control, `Esc` closes overlays
- [ ] Loading / empty / error / populated states all designed and tested
- [ ] Responsive at 320 / 390 / 768 / 1024 / 1440 (no horizontal scroll except matrix)
- [ ] Test cases logged in `testing/01-test-cases-master.md`
- [ ] `CHANGELOG.md` entry references PRD 01 §N and the page brief

## 11. Anti-patterns (reviewer auto-rejects)

- Local `function Icon()` — even if it looks fine
- Inline `linear-gradient(var(--devdoc-grid-line) ...)` — use the class
- `bg-[var(--devdoc-surface)]` bracket syntax after sprint 4
- Both `className` and `style={{ color: '...' }}` on the same element
- `href="#"` or `to="#"` anywhere in `src/`
- `disabled` button whose comment says "backend endpoint doesn't exist" when it does
- `dangerouslySetInnerHTML` without DOMPurify
- Fake decorative stamps ("REV_3.0", "SYS_STATUS: CRIT" without a real system status)
- Registry page not using `sortAndSearch`
- New page without a test in `testing/01-test-cases-master.md`
