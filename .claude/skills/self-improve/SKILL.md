---
name: self-improve
description: Detect repeated patterns during execution and propose Skill/Hook/Rule changes. Triggered by "/self-improve", "improve harness", "promote repeated patterns", etc.
---

# Harness Improvement

## Step 1: Collect Repeated Patterns

Read all `artifacts/*/decisions.md` files. Prioritize analysis of `fail`/`partial` results, and look for recurring decisions across multiple features.

Additionally, reference the following sources:
- Repeated types of feedback from the Evaluator
- Cases that required manual intervention
- The same mistakes repeated across multiple Tasks

## Step 2: Classify Promotion Targets

Classify each pattern into the appropriate mechanism:

| Repetition Type | Promotion Target |
|-----------------|-----------------|
| Same constraint violation repeated | Rule |
| Something that must be caught 100% mechanically | Hook |
| Incorrect usage pattern (needs to teach the correct method) | Skill |
| Architecture decision change | CLAUDE.md |

Propose new Skills per library/tool unit (separate detailed topics into references/).

## Step 3: Propose Changes

Present each proposal to the user:
- What was repeated (evidence)
- Which mechanism to promote to
- Specific content (file path + content draft)

Apply only user-approved proposals (Ask-first).
