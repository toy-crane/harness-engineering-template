---
name: sketch-wireframe
description: Generate an HTML wireframe based on spec.md. Visually verify layout and run a feedback loop. Use only in projects that include UI features. Triggered by "/sketch-wireframe", "wireframe", "layout check", etc.
argument-hint: "feature name"
---

# Wireframe: Spec → HTML Wireframe

## What Is a Wireframe

A tool for verifying component placement, information hierarchy, and screen-to-screen flow. It is NOT a tool for verifying visual design (colors, themes), business logic, or technical behavior.

## Constraints

- Read the feature's scenarios from `artifacts/<feature>/spec.md`. If the file does not exist, output "Please run `/write-spec <feature>` first." and stop
- Do not modify spec.md directly. If changes are needed, stop the wireframe and return to `/write-spec`

## Style

- Use 5 CSS variables (`--w-bg`, `--w-border`, `--w-text`, `--w-muted`, `--w-fill`) and text/labels to distinguish states. Do not use any other colors
- Mobile-first, Tailwind v4 utilities only. Responsive via `@container` + `@md:` prefix
- Lucide icons: `<i data-lucide="icon-name"></i>`
- System monospace font
- If custom classes are needed, add them in a `<style>` block with `w-` prefix

## Step 1: Check Existing Screens and References

If the project has an existing implementation, read the related component code to understand the layout structure. When adding elements to an existing screen, build the wireframe based on the existing layout.

If reference images exist in the `artifacts/<feature>/references/` directory, read them. Extract layout structure (component placement, information hierarchy, screen division method) from the images and apply it to wireframe generation in Step 2. Ignore visual design (colors, fonts, shadows, etc.) and reference only the structure.

## Step 2: Base Screens

1. Read this skill's `assets/template.html` to obtain the HTML boilerplate
2. Follow the insertion patterns in the template.html comments (`NAV_BUTTONS`, `SCREEN_CONTENT`) to generate base screens
3. Write Screen Notes at the bottom of each screen: trigger (entry condition), interaction (key actions), transition (conditions for navigating to other screens)

Output: `artifacts/<feature>/wireframe.html`

Server start: `Bash(run_in_background): bunx vite artifacts/<feature> --port=3456`. Vite auto-bumps to the next free port if 3456 is taken — read the background output and use the actual `Local:` URL it prints.

Feedback loop:
- Direct the user to check `http://localhost:<actual-port>/wireframe.html` (verify both sides with Mobile/Desktop toggle)
- Receive user feedback and modify wireframe.html

Once the layout is finalized, proceed to Step 3.

## Step 3: Scenario Screens

Add remaining scenarios as tabs on top of the finalized layout.

Criteria for adding screens:
- Scenarios requiring new element placement or layout structure → create as a new screen
- Scenarios that only differ in data/state from an existing screen → map the scenario number to that screen's `data-scenario`

Rules:
- Specify scenario numbers in the `data-scenario` attribute using the form `scenario-N` (do not put numbers in the body text)
- Use the concrete values from each scenario's Success Criteria as the example data
- Screen Notes: describe only screen flow (entry conditions, transitions, element roles). Validation rules and business logic belong in spec.md

Verify with the same feedback loop.

## Step 4: Coverage Verification

Check that no scenarios with visual changes in spec.md are missing from the wireframe screens. Report any omissions to the user. Non-visual scenarios (data storage, validation logic, etc.) are not wireframe coverage targets.

## Done

After completion, ask the user whether to proceed with `/draft-plan <feature>`.
