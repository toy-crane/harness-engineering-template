## Overview
Explain in 1-2 sentences the problem this feature solves and the observable change for the user.

## Scope

### Included
- What the user will experience this time

### Excluded
- What is intentionally left out and the reason why

## Scenarios

### 1. Scenario Title
- **Given** — initial state of the user or system
- **When** — the user takes an action
- **Then** — an observable result occurs

Success Criteria:
- [ ] Concrete input → observable output (in UI, API response, or persisted state)
- [ ] Concrete input → observable output

### 2. Scenario Title
- **Given** — ...
- **When** — ...
- **Then** — ...

Success Criteria:
- [ ] ...

(3-5 scenarios)

## Invariants (optional)
Rules that must hold across all scenarios. Typical categories:
- **Security / privacy**: rules about who can or cannot see what, regardless of access path
- **Performance**: response time or load thresholds that apply system-wide
- **Data consistency**: invariants that must remain true after any operation

Omit this section if no such rules apply to this feature.

## Dependencies
Features or external systems that must exist before this work begins. (Environment setup belongs in plan.md, not here.)

## Undecided Items
- Items that were asked but the user could not decide on

---

## Writing Rules

- **WHAT only, no HOW.** Do not mention FSD slices, file paths, table or column names, test types, or implementation libraries. Those decisions belong in plan.md.
- **Success Criteria must be observable.** Internal state, function calls, or DB row shape are not allowed — only what the user, an API consumer, or a test harness can observe externally.
- **Each Success Criteria bullet maps to at least one test case.** Keep them concrete (real values, not placeholders).
- **Excluded items need a reason.** Future readers must understand why something was deferred.
- **Undecided Items only record items the user explicitly could not decide.** Do not silently fill ambiguous requirements.
