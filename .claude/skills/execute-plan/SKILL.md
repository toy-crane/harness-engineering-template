---
name: execute-plan
description: Execute plan.md Tasks directly as Team Lead. Follow CLAUDE.md → Testing for TDD discipline, implement each Task with one commit, then present to the user for review. Triggered by "/execute-plan", "execute plan", "start implementation", etc.
argument-hint: "feature name"
---

# Execute Plan

You are the **Team Lead**. You implement Tasks directly in the main context, one Task at a time, and adjust based on user feedback at the end. You do not delegate implementation to sub-agents.

## Core Principles

- **Spec conformance is the goal, process is the means** — The sole objective is matching spec.md's Success Criteria. The process can be freely adjusted to achieve that goal
- **Team Lead implements and adjusts** — The Team Lead writes code directly and is responsible for responding to user feedback. All judgment calls stay with the Team Lead
- **Scope of flexible judgment** — The Team Lead decides based on the situation: reordering/merging Tasks, ignoring feedback outside spec scope, switching approaches, escalating to the user, etc.
- **Record decisions with harness signals** — Judgment calls are recorded in `artifacts/<feature>/decisions.md` using the `references/decisions-template.md` format (entries start as `Pending` and resolve to `Success` / `Partial` / `Failure` once their effect is observable). Emphasize the **Harness Signal** field so future harness updates can learn from each execution

## Step 1: Check Prerequisites

Extract the feature name from $ARGUMENTS.

- `artifacts/<feature>/plan.md` — If missing, output "Please run `/draft-plan` first." and stop
- Read `artifacts/<feature>/spec.md`
- `artifacts/<feature>/wireframe.html` — Reference if present
- Read each SKILL.md listed in plan.md's Required Skills
- Read `references/decisions-template.md` — Confirm decisions.md recording format

Follow `CLAUDE.md` → Testing for RED → GREEN discipline. On failures, find the root cause, do not work around it.

## Step 2: Order Tasks

Analyze the Task list in plan.md.

1. Identify dependencies between Tasks (shared files, import relationships, data flow)
2. Determine execution order — sequential, dependency-first
3. Briefly output the order

Record the order and rationale in decisions.md.

## Step 3: Execute Tasks

Implement Tasks one at a time, in the order from Step 2. For each Task:

1. Read the Acceptance Criteria
2. Apply TDD (RED → GREEN) where it fits
3. Implement the minimum code to satisfy the criteria
4. Run `bun run build` and any touched tests
5. Create one conventional commit per Task
6. Mark the Task complete in plan.md

On any failure, find the root cause — do not work around it. Record judgment calls (spec ambiguity, scope changes, recovery paths, user escalation) in decisions.md with a Harness Signal.

## Step 4: Human Review

After all Tasks complete, present a summary to the user:

- Task-by-task Acceptance Criteria status (pass / partial / fail)
- `bun run build` and test results
- Observable outcomes per spec.md Scenario

Ask the user to verify the feature against spec.md. On feedback, fix directly and re-verify. Record judgments in decisions.md.

If refactoring feels warranted, optionally run `/simplify` and re-verify.

## Step 5: Done

Report results to the user:

- **Execution summary**: Total Task count, commits created
- **Scenario coverage**: Which spec.md Scenarios are observably satisfied
- **Decision log**: Provide decisions.md path — update all remaining `Pending` results before reporting, and include a brief summary of the **Harness Signal** entries so future harness tuning has usable input
