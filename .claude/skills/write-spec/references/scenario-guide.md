# Scenario Writing Guide

## The single criterion

> "Can a developer write a test from this sentence alone?"

If the answer is no, the scenario is too vague or describes implementation rather than observable behavior.

---

## 1. Given / When / Then

| Field | Write | Allowed | Prohibited |
|---|---|---|---|
| **Given** | Observable preconditions: screen state, data count, applied filters | "A list showing 3 to-do items", "The search field contains 'milk'" | "todos.length === 3", "isLoading is true" |
| **When** | A specific UI element and the action on it (click, type, drag) | "Click the 'Delete' button", "Enter 'Meeting notes' in the Title field" | "Call deleteTodo()", "Dispatch the SUBMIT action" |
| **Then** | A result that can be asserted from outside the component | "'2 to-do items' text is displayed", "Empty list message appears" | "todos.length === 2", "The API was called" |

### Good
```
Given  A to-do form with the title field empty
When   Click the "Add" button
Then   "Please enter a title" error message is displayed
```

### Bad
```
Given  formState.title is an empty string
When   Trigger a submit event
Then   The validation error is set
```

The bad version describes internal state and function calls. A test written from it would have to mock the component's internals, which is brittle and tells you nothing about user behavior.

---

## 2. Success Criteria

Each Success Criteria bullet is a concrete pair: **input → observable output**. One bullet should map cleanly to one (or a small number of) test assertions.

### Allowed observable outputs

| Type | Example |
|---|---|
| Visible text | `"Item added"` appears |
| Element count | 3 cards render |
| Element existence | The "Delete" button is shown |
| Field value | Title field contains "Buy milk" |
| Visual state expressible in a class or attribute | Strikethrough on completed items |
| API response shape (when the feature exposes an API) | `200 { id: <new-id> }` |

### Prohibited outputs

| Type | Why |
|---|---|
| Internal state (Zustand store, React state, signals) | A user cannot observe it |
| Function-call assertions (`mockFn was called`) | Implementation-coupled, breaks on refactor |
| Raw DB rows or service-layer return values | Server internals, not user-observable behavior |

### Good
```
Success Criteria:
- [ ] title="Buy milk" → an item with text "Buy milk" appears, list count becomes 1
- [ ] empty title → "Please enter a title" appears under the field
```

### Bad
```
Success Criteria:
- [ ] title="Buy milk" → todos array becomes [{ id: 1, title: "Buy milk", done: false }]
- [ ] title="Buy milk" → addTodo() was called once with { title: "Buy milk" }
```

---

## 3. When to use Invariants instead of a Scenario

Some rules cannot be expressed as a single Given/When/Then because they apply to *every* path. Three categories belong in the Invariants section, not as scenarios:

| Category | Example |
|---|---|
| **Security / privacy** | "Another user's private drafts are never visible through any path (UI, URL, search, RSS)" |
| **Performance** | "Every page reaches first contentful paint within 2 seconds on a 4G connection" |
| **Data consistency** | "The displayed upvote count always matches the number of votes recorded" |

If you find yourself writing a near-identical Then in three or more scenarios, that rule probably belongs in Invariants.

If a feature has none of these cross-cutting rules, omit the Invariants section entirely.
