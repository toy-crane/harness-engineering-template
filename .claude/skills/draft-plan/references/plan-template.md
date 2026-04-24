# <Feature> Implementation Plan

## Architecture Decisions

| Decision | Choice | Reason |
|----------|--------|--------|

## Infrastructure Resources

Runtime resources outside application code that this feature needs to exist. Leave empty with "None" if nothing applies.

| Resource | Type | Declared in | Creation Task |
|----------|------|-------------|---------------|
|          |      |             |               |

Type examples: Storage bucket · Cron job · Edge function · Env var · OAuth provider · Webhook · Email sender

## Data Model

### EntityName
- field (required)
- field → RelatedEntity[]

## Required Skills

| Skill | Applicable Task | Purpose |
|-------|-----------------|---------|

## Affected Files

| File Path | Change Type | Related Task |
|-----------|-------------|--------------|

Change Type: New | Modify | Delete

## Tasks

### Task 1: (Title — one vertical slice, no "and")

- **Covers**: Scenario 1 (full) | Scenario 2 (partial — happy path only)
- **Size**: S (1-2 files) | M (3-5 files)
- **Dependencies**: None | Task N (reason), Task M (reason)
- **References**:
  - (skill name — keywords)
  - (external document URL)
  - (project file path)
- **Implementation targets**:
  - `features/<slice>/ui/<component>.tsx`
  - `features/<slice>/ui/<component>.test.tsx` (colocated; `app/**/__tests__/` for App Router pages)
- **Acceptance**:
  - [ ] Concrete input → observable result (one line per Success Criteria covered)
  - [ ] Concrete input → observable result
- **Verification**:
  - `bun run test:unit -- <pattern>` (or `bun run test:db` for DB-only changes)
  - `bun run build`
  - Browser MCP (`mcp__claude-in-chrome__*`) — for tasks with user-visible UI changes; navigate the affected route(s), assert observable outcomes, save evidence to `artifacts/<feature>/evidence/<task-N>.<ext>`

---

### Checkpoint: After Tasks 1-N
- [ ] All tests pass: `bun run test`
- [ ] Build succeeds: `bun run build`
- [ ] (vertical slice description) works end-to-end

---

## Undecided Items
