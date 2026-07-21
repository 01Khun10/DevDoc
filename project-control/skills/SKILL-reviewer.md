# SKILL — Reviewer

**When to invoke:** every PR, without exception. Even trivial ones.

**Output:** an approval, changes requested, or rejection with reasons that quote the failing checklist item. If you can't tick every applicable box, the PR is not ready to merge.

---

## 1. What reviewing actually catches

Code review catches *this* class of bug:
- The submission works, but adds a fifth `function Icon()` because the author didn't know the shared one existed.
- The submission works, but its test doesn't actually test the change — it re-tests the mock.
- The submission works, but silently changes a public API shape without touching PRD 04.
- The submission works, but the failure case is a `throw` that no `try/catch` catches.

Types and CI catch the mechanical bugs. Review catches the *drift*. That's the job.

## 2. The checklist

### 2.1 Scope
- [ ] The change matches a section of a PRD. If it doesn't, either the PRD is updated in this PR or the PR is closed.
- [ ] The PR title cites the PRD section (e.g. `[PRD 01 §5.1] Registry: extract sortAndSearch`).
- [ ] Only one concern per PR. Refactor + feature + test in one PR is a rejection.

### 2.2 Subtract-before-add
- [ ] If this PR duplicates a helper that could be extracted, either extract it in this PR or open a follow-up issue with the exact locations listed.
- [ ] If this PR renders a page or a component, no `pages/*Placeholder.jsx` file remains that duplicates it. If one remains, it's ported-then-deleted **in this PR**.
- [ ] If this PR adds an icon inline, either it's added to `components/ui`'s `Icon` component's usage or it's already there. No fresh local `function Icon()`.

### 2.3 Design-system compliance
- [ ] Every color is `--devdoc-*` via Tailwind theme (no `text-[var(...)]` bracket syntax after sprint 4).
- [ ] Uses `components/ui` primitives for buttons, cards, modals, inputs, badges.
- [ ] Grid background is `.devdoc-grid-bg` class, not inline `linear-gradient`.
- [ ] No fake ornamentation: no `rev 3.0`, `REV_3`, `SYS_STATUS: CRIT`, or similar stamps whose value isn't driven by real state.

### 2.4 Backend correctness
- [ ] Every project-scoped endpoint calls `assertProjectOwnership` (or its shared equivalent) in the same query that fetches or mutates.
- [ ] Every multi-row mutation is inside `prisma.$transaction`.
- [ ] Every user-facing error uses `createAppError` and the shared codes. No `throw new Error("...")` reaching the client.
- [ ] Every mutation logs to `ActivityLog` with real `actorId`.
- [ ] No `req.body` spread into a Prisma `data` object.

### 2.5 API contract compliance
- [ ] URL matches PRD 04 §2.1.
- [ ] Verb matches §2.2 (PATCH for partial, PUT for replacement).
- [ ] Response envelope per §2.3.
- [ ] Error shape per §2.4.
- [ ] List endpoints paginate (§3).
- [ ] Computed numbers return the formula ("show your work" §5).
- [ ] OpenAPI entry updated.

### 2.6 Frontend truthfulness
- [ ] No `href="#"`, no `to="#"`, no button whose comment says "backend doesn't support this yet" when it does.
- [ ] Every displayed control has an actual effect or is not visible.
- [ ] No documented feature (Accessibility page claims, keyboard shortcuts advertised in Settings) without a working implementation.
- [ ] `dangerouslySetInnerHTML` is behind DOMPurify.

### 2.7 Tests
- [ ] Every branch of behavior added has a test.
- [ ] Every test asserts the *behavior*, not the *mock* (a common failure: `expect(mockFn).toHaveBeenCalled()` when the point was to check the visible output).
- [ ] The test file uses the correct layer (see `SKILL-test-case-author.md`).
- [ ] Test cases are logged in `testing/01-test-cases-master.md`.

### 2.8 Accessibility
- [ ] Every new interactive element is keyboard-reachable, has visible focus, and reads correctly with a screen reader.
- [ ] Custom widgets have correct `aria-*` (e.g. `aria-pressed` on toggle buttons, `role="dialog"` on modals).
- [ ] Motion respects `prefers-reduced-motion` and `data-reduce-motion`.
- [ ] `vitest-axe` scan on the changed page: zero violations.

### 2.9 Responsive
- [ ] Renders correctly at 320 / 390 / 768 / 1024 / 1440.
- [ ] No horizontal scroll except intentional (matrix grid).

### 2.10 Documentation
- [ ] `CHANGELOG.md` has an entry citing the PRD section(s).
- [ ] If a new pattern is introduced, it's documented in the appropriate PRD, not just used.
- [ ] If a decision was made (chose PATCH over PUT here, chose in-app notification over email), it's in the PR description or the PRD.

## 3. Rejection reasons (things that stop a review dead)

Regardless of what else looks good, reject if any of:

- **Silent duplication of an existing helper.** Even if the local copy is correct, review calls it out and asks for extraction — because the alternative is where drift comes from.
- **A test that would pass even if the code did nothing.** Common with mocked hooks. Test the effect, not the mock.
- **A page introduced without a test.**
- **A schema change without a migration file.**
- **A migration that mixes schema + data mutation in one script.**
- **A feature added that isn't in any PRD.** Either add it to the PRD in this PR or move it to a future PR.
- **A "TODO" comment.** Convert to an issue and reference the issue number.

## 4. What is not a rejection reason

- Naming preferences that don't cause confusion.
- Formatting nits that the formatter didn't catch.
- The reviewer's aesthetic preference.
- "I would have done it differently." If it's correct, in-scope, and passes the checklist, it merges.

## 5. Style of feedback

Copied from the audit voice — this is the register we want:

- **Concrete.** "Line 87 — this shadows the shared `Icon`. Delete the local declaration and import from `components/ui`."
- **Positive when warranted.** "The transaction rollback path here is exactly right — the same pattern applies to `designElementService.delete` and would fix H4."
- **Never sarcastic.** The critique is about the code, not the coder.
- **Cite the PRD section**, not just "the PRD says so". If the PRD doesn't say so, the PR isn't the place to argue — that's a PRD-change PR.

## 6. When Codex / another agent runs this skill

- The agent produces a review comment with the checklist filled in — each item ticked, flagged, or marked N/A with a reason.
- The agent quotes file:line for every failing item.
- The agent does not resolve merge conflicts, run the tests, or push commits — review is a *reading* task.
- A human confirms before merge. Every agent review is signed with the agent name so trust builds over time.

## 7. Metric to track

- Count of PRs that shipped without a full checklist pass, sprint over sprint. Target: zero. Anything above zero is a review-culture problem, not a checklist problem.
