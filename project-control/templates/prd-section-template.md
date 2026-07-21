# PRD section template

> Use when adding a new section to any PRD. Paste, replace placeholders, delete guidance comments.
> Voice: direct, grounded, testable. See existing PRD sections for the register.

---

## §{{N}}. {{Section title}}

### Purpose

> One paragraph. Why this section exists, in the voice of the audit: honest about what it addresses and what it doesn't.

{{...}}

### Principle

> Optional. One or two short principles the section codifies. Use when the section is establishing a convention (e.g. "All colors come from `--devdoc-*` variables"). Omit for pure spec sections.

- {{...}}

### Contract

> The concrete rules. Prefer a table if there are >3 rules; prose otherwise.

| Item | Rule | Verification |
|---|---|---|
| {{...}} | {{...}} | {{how a reviewer or test proves this rule}} |

### Anti-patterns (reviewer auto-rejects)

- {{Explicit "do not" list. As useful as the "do" list — this is where drift is prevented.}}

### Ship criteria

- [ ] {{...}}
- [ ] {{...}}
- [ ] `CHANGELOG.md` entry references this PRD section

### Related

- Links to other PRD sections that depend on or are depended on by this one.
- Related test-case codes in `testing/01-test-cases-master.md`.

### [ADDED] flag

> If this section is Claude-added / builder-added rather than derived from an audit finding or explicit user request, tag it `[ADDED]` in the title (e.g. `## §7.3 Saved Views [ADDED]`). This lets the team distinguish scope that came from a spec revision vs scope that emerged during writing. See PRD 03 §7 for examples.
