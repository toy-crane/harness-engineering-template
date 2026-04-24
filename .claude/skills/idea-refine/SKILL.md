---
name: idea-refine
description: Refines ideas iteratively. Refine ideas through structured divergent and convergent thinking. Use "idea-refine" or "ideate" to trigger.
---

# Idea Refine

Refines raw ideas into sharp, actionable concepts worth building through structured divergent and convergent thinking.

## How It Works

1. **Understand & Expand (Divergent):** Restate the idea, ask sharpening questions, and generate variations.
2. **Evaluate & Converge:** Cluster ideas, stress-test them, and surface hidden assumptions.
3. **Sharpen & Ship:** Produce a concrete markdown one-pager moving work forward.

## Process

Guide the user through three phases. This is a conversation, not a template — adapt based on what they say.

### Phase 1: Understand & Expand

1. **Restate the idea** as a crisp "How Might We" problem statement. This forces clarity on what's actually being solved.

2. **Ask 3-5 sharpening questions** using `AskUserQuestion`. Focus on: who is this for, what does success look like, what are the real constraints, what's been tried before, why now. If the user's invocation already answers these, confirm and move on — don't re-ask what's already clear.

3. **Generate 5-8 variations** using these lenses. Each variation must have a named lens and a reason it exists — don't just list ideas.
   - **Inversion:** What if we did the opposite?
   - **Constraint removal:** What if budget/time/tech weren't factors?
   - **Audience shift:** What if this were for a different user?
   - **Combination:** What if we merged this with an adjacent idea?
   - **Simplification:** What's the version that's 10x simpler?
   - **10x version:** What would this look like at massive scale?
   - **Expert lens:** What would domain experts find obvious?

4. **If inside a codebase:** Use `Glob`, `Grep`, and `Read` to scan for existing architecture, patterns, and constraints. Ground variations in what actually exists.

Additional frameworks to draw from selectively:
- **SCAMPER** — best for improving existing products
- **First Principles** — best for breaking out of incremental thinking
- **JTBD** — best for understanding the real problem
- **Pre-mortem** — best for stress-testing in Phase 2

### Phase 2: Evaluate & Converge

After the user reacts to Phase 1:

1. **Cluster** the ideas that resonated into 2-3 distinct directions.

2. **Stress-test** each direction on three axes:
   - **User value:** Painkiller (acute, frequent, people seek it out) or vitamin (nice-to-have, won't change behavior)? What's the current workaround?
   - **Feasibility:** Technical cost, resource requirements, time-to-value. What's the hardest part?
   - **Differentiation** (strongest to weakest): new capability → 10x improvement → new audience → new context → better UX → cheaper

3. **Surface hidden assumptions** in three categories:
   - **Must Be True** — if wrong, kills the idea. Validate before building.
   - **Should Be True** — significantly impacts success. Adjust approach if wrong.
   - **Might Be True** — secondary. Don't validate until core is proven.

Be honest, not supportive. If an idea is weak, say so with kindness. Push back on complexity, question real value.

### Phase 3: Sharpen & Ship

Produce a markdown one-pager. The MVP should test the **riskiest assumption first**.

```markdown
# [Idea Name]

## Problem Statement
[One-sentence "How Might We" framing]

## Recommended Direction
[The chosen direction and why — 2-3 paragraphs max]

## Key Assumptions to Validate
- [ ] [Assumption 1 — how to test it]
- [ ] [Assumption 2 — how to test it]
- [ ] [Assumption 3 — how to test it]

## MVP Scope
[The minimum version that tests the core assumption. What's in, what's out.]

## Not Doing (and Why)
- [Thing 1] — [reason]
- [Thing 2] — [reason]
- [Thing 3] — [reason]

## Open Questions
- [Question that needs answering before building]
```

The **"Not Doing" list is the most valuable part.** Focus is about saying no to good ideas. Make the trade-offs explicit.

Ask the user if they'd like to save to `artifacts/[feature-name]/idea.md`. Only save if they confirm.

## Quality Standards

1. Restatement changes the frame — not just rephrasing the user's words
2. Questions diagnose before prescribing — each question determines which type of problem this is
3. Variations have reasons — each explains why it exists via its named lens
4. The skill has opinions — recommend directions, don't just list neutral options
5. Phase 2 is honest — call out low differentiation or high complexity
6. Output is actionable — things to do, not things to think about
7. "Not Doing" list is specific and reasoned — not vague deferrals
8. Adapts to context — reference codebase architecture when inside a project

## Tone

Direct, thoughtful, slightly provocative.
