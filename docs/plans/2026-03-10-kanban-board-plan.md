# Kanban Board Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Trello 스타일의 칸반 Todo 앱을 단일 페이지에 구현한다.

**Architecture:** `useReducer` + Context로 상태 관리, `@atlaskit/pragmatic-drag-and-drop`으로 드래그 앤 드롭, localStorage로 데이터 유지. 서버 컴포넌트(`app/page.tsx`)가 클라이언트 컴포넌트(`KanbanBoard`)를 렌더링하는 구조.

**Tech Stack:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, @atlaskit/pragmatic-drag-and-drop, Vitest, React Testing Library

**Design Doc:** `docs/plans/2026-03-10-kanban-board-design.md`
**Requirements:** `artifacts/example/requirements.md`

**Vercel Best Practices 적용:**
- `bundle-dynamic-imports`: KanbanBoard를 next/dynamic으로 로드 (클라이언트 전용)
- `rerender-derived-state-no-effect`: 필터링된 카드 목록은 렌더 시 useMemo로 파생
- `rerender-functional-setstate`: 리듀서 패턴으로 자연스럽게 충족
- `client-localstorage-schema`: localStorage 데이터에 버전 키 포함
- `rendering-conditional-render`: 삼항 연산자 사용

---

### Task 1: 프로젝트 의존성 설치

**Files:**
- Modify: `package.json`

**Step 1: 의존성 설치**

Run:
```bash
bun add @atlaskit/pragmatic-drag-and-drop @atlaskit/pragmatic-drag-and-drop-hitbox
```

**Step 2: 설치 확인**

Run: `bun run build`
Expected: 빌드 성공

**Step 3: Commit**

```bash
git add package.json bun.lock
git commit -m "chore: add pragmatic-drag-and-drop dependencies"
```

---

### Task 2: Dialog UI 컴포넌트 추가

CardFormModal에 필요한 Dialog 컴포넌트를 shadcn/ui로 추가한다.

**Files:**
- Create: `components/ui/dialog.tsx`

**Step 1: shadcn Dialog 추가**

Run:
```bash
bunx shadcn@latest add dialog
```

프롬프트가 나오면 기본값으로 진행한다.

**Step 2: 컴포넌트 확인**

`components/ui/dialog.tsx` 파일이 생성되었는지 확인한다.

**Step 3: Commit**

```bash
git add components/ui/dialog.tsx
git commit -m "feat: add dialog UI component"
```

---

### Task 3: 타입 정의 및 리듀서 구현 — 테스트 작성

순수 로직인 보드 리듀서를 TDD로 구현한다.

**Files:**
- Create: `lib/kanban/types.ts`
- Create: `lib/kanban/board-reducer.ts`
- Create: `__tests__/board-reducer.test.tsx`

**Step 1: 타입 정의 파일 작성**

```typescript
// lib/kanban/types.ts
export type Priority = "high" | "medium" | "low"
export type ColumnId = "todo" | "in-progress" | "done"

export const COLUMNS: { id: ColumnId; title: string }[] = [
  { id: "todo", title: "Todo" },
  { id: "in-progress", title: "In Progress" },
  { id: "done", title: "Done" },
]

export interface Card {
  id: string
  title: string
  priority: Priority
  tags: string[]
  columnId: ColumnId
  order: number
  createdAt: number
}

export interface BoardState {
  cards: Card[]
  searchQuery: string
  priorityFilter: Priority | null
  tagFilter: string | null
  darkMode: boolean
}

export type BoardAction =
  | { type: "ADD_CARD"; payload: { title: string; priority: Priority; tags: string[] } }
  | { type: "DELETE_CARD"; payload: { id: string } }
  | { type: "UPDATE_CARD"; payload: { id: string; title: string; priority: Priority; tags: string[] } }
  | { type: "MOVE_CARD"; payload: { cardId: string; toColumnId: ColumnId; toIndex: number } }
  | { type: "REORDER_CARD"; payload: { cardId: string; toIndex: number } }
  | { type: "SET_SEARCH"; payload: string }
  | { type: "SET_PRIORITY_FILTER"; payload: Priority | null }
  | { type: "SET_TAG_FILTER"; payload: string | null }
  | { type: "TOGGLE_DARK_MODE" }
```

**Step 2: 리듀서 단위 테스트 작성**

```typescript
// __tests__/board-reducer.test.tsx
import { describe, it, expect, vi, beforeEach } from "vitest"
import { boardReducer, createInitialState } from "@/lib/kanban/board-reducer"
import type { BoardState, Card } from "@/lib/kanban/types"

// crypto.randomUUID mock
vi.stubGlobal("crypto", { randomUUID: () => "test-uuid" })

describe("boardReducer", () => {
  let initialState: BoardState

  beforeEach(() => {
    initialState = createInitialState()
  })

  describe("ADD_CARD", () => {
    it("adds a card to the todo column", () => {
      const state = boardReducer(initialState, {
        type: "ADD_CARD",
        payload: { title: "New Task", priority: "medium", tags: ["bug"] },
      })

      expect(state.cards).toHaveLength(1)
      expect(state.cards[0]).toMatchObject({
        title: "New Task",
        priority: "medium",
        tags: ["bug"],
        columnId: "todo",
      })
    })

    it("assigns incremental order within the todo column", () => {
      let state = boardReducer(initialState, {
        type: "ADD_CARD",
        payload: { title: "First", priority: "low", tags: [] },
      })
      state = boardReducer(state, {
        type: "ADD_CARD",
        payload: { title: "Second", priority: "low", tags: [] },
      })

      const todoCards = state.cards.filter((c) => c.columnId === "todo")
      expect(todoCards[1].order).toBeGreaterThan(todoCards[0].order)
    })
  })

  describe("DELETE_CARD", () => {
    it("removes the card by id", () => {
      let state = boardReducer(initialState, {
        type: "ADD_CARD",
        payload: { title: "To Delete", priority: "low", tags: [] },
      })
      const cardId = state.cards[0].id

      state = boardReducer(state, { type: "DELETE_CARD", payload: { id: cardId } })
      expect(state.cards).toHaveLength(0)
    })
  })

  describe("UPDATE_CARD", () => {
    it("updates the card fields", () => {
      let state = boardReducer(initialState, {
        type: "ADD_CARD",
        payload: { title: "Original", priority: "low", tags: [] },
      })
      const cardId = state.cards[0].id

      state = boardReducer(state, {
        type: "UPDATE_CARD",
        payload: { id: cardId, title: "Updated", priority: "high", tags: ["feature"] },
      })

      expect(state.cards[0]).toMatchObject({
        title: "Updated",
        priority: "high",
        tags: ["feature"],
      })
    })
  })

  describe("MOVE_CARD", () => {
    it("moves a card to a different column", () => {
      let state = boardReducer(initialState, {
        type: "ADD_CARD",
        payload: { title: "Move me", priority: "medium", tags: [] },
      })
      const cardId = state.cards[0].id

      state = boardReducer(state, {
        type: "MOVE_CARD",
        payload: { cardId, toColumnId: "in-progress", toIndex: 0 },
      })

      expect(state.cards[0].columnId).toBe("in-progress")
    })
  })

  describe("REORDER_CARD", () => {
    it("reorders cards within the same column", () => {
      let state = initialState
      // Add 3 cards
      state = boardReducer(state, { type: "ADD_CARD", payload: { title: "A", priority: "low", tags: [] } })

      // Reset mock for unique IDs
      let idCounter = 0
      vi.stubGlobal("crypto", { randomUUID: () => `uuid-${++idCounter}` })

      state = boardReducer(state, { type: "ADD_CARD", payload: { title: "B", priority: "low", tags: [] } })
      state = boardReducer(state, { type: "ADD_CARD", payload: { title: "C", priority: "low", tags: [] } })

      const lastCard = state.cards[state.cards.length - 1]

      state = boardReducer(state, {
        type: "REORDER_CARD",
        payload: { cardId: lastCard.id, toIndex: 0 },
      })

      const todoCards = state.cards
        .filter((c) => c.columnId === "todo")
        .sort((a, b) => a.order - b.order)
      expect(todoCards[0].id).toBe(lastCard.id)
    })
  })

  describe("Filters", () => {
    it("sets search query", () => {
      const state = boardReducer(initialState, { type: "SET_SEARCH", payload: "test" })
      expect(state.searchQuery).toBe("test")
    })

    it("sets priority filter", () => {
      const state = boardReducer(initialState, { type: "SET_PRIORITY_FILTER", payload: "high" })
      expect(state.priorityFilter).toBe("high")
    })

    it("sets tag filter", () => {
      const state = boardReducer(initialState, { type: "SET_TAG_FILTER", payload: "bug" })
      expect(state.tagFilter).toBe("bug")
    })
  })

  describe("TOGGLE_DARK_MODE", () => {
    it("toggles dark mode", () => {
      const state = boardReducer(initialState, { type: "TOGGLE_DARK_MODE" })
      expect(state.darkMode).toBe(true)

      const state2 = boardReducer(state, { type: "TOGGLE_DARK_MODE" })
      expect(state2.darkMode).toBe(false)
    })
  })
})
```

**Step 3: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/board-reducer.test.tsx`
Expected: FAIL — `boardReducer` 모듈이 없음

**Step 4: 리듀서 구현**

```typescript
// lib/kanban/board-reducer.ts
import type { BoardState, BoardAction, Card } from "./types"

export function createInitialState(savedCards?: Card[], savedDarkMode?: boolean): BoardState {
  return {
    cards: savedCards ?? [],
    searchQuery: "",
    priorityFilter: null,
    tagFilter: null,
    darkMode: savedDarkMode ?? false,
  }
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case "ADD_CARD": {
      const todoCards = state.cards.filter((c) => c.columnId === "todo")
      const maxOrder = todoCards.length > 0 ? Math.max(...todoCards.map((c) => c.order)) : -1

      const newCard: Card = {
        id: crypto.randomUUID(),
        title: action.payload.title,
        priority: action.payload.priority,
        tags: action.payload.tags,
        columnId: "todo",
        order: maxOrder + 1,
        createdAt: Date.now(),
      }

      return { ...state, cards: [...state.cards, newCard] }
    }

    case "DELETE_CARD":
      return { ...state, cards: state.cards.filter((c) => c.id !== action.payload.id) }

    case "UPDATE_CARD":
      return {
        ...state,
        cards: state.cards.map((c) =>
          c.id === action.payload.id
            ? { ...c, title: action.payload.title, priority: action.payload.priority, tags: action.payload.tags }
            : c
        ),
      }

    case "MOVE_CARD": {
      const { cardId, toColumnId, toIndex } = action.payload
      const card = state.cards.find((c) => c.id === cardId)
      if (!card) return state

      const targetCards = state.cards
        .filter((c) => c.columnId === toColumnId && c.id !== cardId)
        .sort((a, b) => a.order - b.order)

      targetCards.splice(toIndex, 0, { ...card, columnId: toColumnId })
      const reordered = targetCards.map((c, i) => ({ ...c, order: i }))

      const otherCards = state.cards.filter(
        (c) => c.id !== cardId && c.columnId !== toColumnId
      )

      return { ...state, cards: [...otherCards, ...reordered] }
    }

    case "REORDER_CARD": {
      const { cardId, toIndex } = action.payload
      const card = state.cards.find((c) => c.id === cardId)
      if (!card) return state

      const columnCards = state.cards
        .filter((c) => c.columnId === card.columnId && c.id !== cardId)
        .sort((a, b) => a.order - b.order)

      columnCards.splice(toIndex, 0, card)
      const reordered = columnCards.map((c, i) => ({ ...c, order: i }))

      const otherCards = state.cards.filter((c) => c.columnId !== card.columnId)

      return { ...state, cards: [...otherCards, ...reordered] }
    }

    case "SET_SEARCH":
      return { ...state, searchQuery: action.payload }

    case "SET_PRIORITY_FILTER":
      return { ...state, priorityFilter: action.payload }

    case "SET_TAG_FILTER":
      return { ...state, tagFilter: action.payload }

    case "TOGGLE_DARK_MODE":
      return { ...state, darkMode: !state.darkMode }

    default:
      return state
  }
}
```

**Step 5: 테스트 실행 — 통과 확인**

Run: `bun run vitest run __tests__/board-reducer.test.tsx`
Expected: ALL PASS

**Step 6: Commit**

```bash
git add lib/kanban/types.ts lib/kanban/board-reducer.ts __tests__/board-reducer.test.tsx
git commit -m "feat: add board types and reducer with tests"
```

---

### Task 4: BoardContext 및 Provider 구현

**Files:**
- Create: `lib/kanban/board-context.tsx`
- Create: `__tests__/board-context.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/board-context.test.tsx
import { render, screen, act } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { BoardProvider, useBoard } from "@/lib/kanban/board-context"

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    clear: () => { store = {} },
  }
})()
vi.stubGlobal("localStorage", localStorageMock)

function TestConsumer() {
  const { state, dispatch } = useBoard()
  return (
    <div>
      <span data-testid="card-count">{state.cards.length}</span>
      <span data-testid="dark-mode">{state.darkMode ? "dark" : "light"}</span>
      <button onClick={() => dispatch({ type: "ADD_CARD", payload: { title: "Test", priority: "medium", tags: [] } })}>
        Add Card
      </button>
      <button onClick={() => dispatch({ type: "TOGGLE_DARK_MODE" })}>
        Toggle Dark
      </button>
    </div>
  )
}

describe("BoardContext", () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  it("provides initial empty state", () => {
    render(<BoardProvider><TestConsumer /></BoardProvider>)
    expect(screen.getByTestId("card-count")).toHaveTextContent("0")
  })

  it("dispatches actions and updates state", async () => {
    render(<BoardProvider><TestConsumer /></BoardProvider>)

    await userEvent.click(screen.getByText("Add Card"))
    expect(screen.getByTestId("card-count")).toHaveTextContent("1")
  })

  it("persists cards to localStorage on change", async () => {
    render(<BoardProvider><TestConsumer /></BoardProvider>)

    await userEvent.click(screen.getByText("Add Card"))
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "kanban-board",
      expect.any(String)
    )
  })

  it("loads saved cards from localStorage", () => {
    const savedCards = [{ id: "1", title: "Saved", priority: "low", tags: [], columnId: "todo", order: 0, createdAt: 0 }]
    localStorageMock.getItem.mockImplementation((key: string) => {
      if (key === "kanban-board") return JSON.stringify(savedCards)
      return null
    })

    render(<BoardProvider><TestConsumer /></BoardProvider>)
    expect(screen.getByTestId("card-count")).toHaveTextContent("1")
  })
})
```

**Step 2: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/board-context.test.tsx`
Expected: FAIL

**Step 3: BoardContext 구현**

```typescript
// lib/kanban/board-context.tsx
"use client"

import { createContext, useContext, useReducer, useEffect, type ReactNode } from "react"
import { boardReducer, createInitialState } from "./board-reducer"
import type { BoardState, BoardAction } from "./types"

interface BoardContextValue {
  state: BoardState
  dispatch: React.Dispatch<BoardAction>
}

const BoardContext = createContext<BoardContextValue | null>(null)

function loadCards() {
  if (typeof window === "undefined") return undefined
  try {
    const saved = localStorage.getItem("kanban-board")
    return saved ? JSON.parse(saved) : undefined
  } catch {
    return undefined
  }
}

function loadDarkMode() {
  if (typeof window === "undefined") return undefined
  try {
    const saved = localStorage.getItem("kanban-dark-mode")
    return saved ? JSON.parse(saved) : undefined
  } catch {
    return undefined
  }
}

export function BoardProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(
    boardReducer,
    undefined,
    () => createInitialState(loadCards(), loadDarkMode())
  )

  useEffect(() => {
    localStorage.setItem("kanban-board", JSON.stringify(state.cards))
  }, [state.cards])

  useEffect(() => {
    localStorage.setItem("kanban-dark-mode", JSON.stringify(state.darkMode))
    document.documentElement.classList.toggle("dark", state.darkMode)
  }, [state.darkMode])

  return (
    <BoardContext value={{ state, dispatch }}>
      {children}
    </BoardContext>
  )
}

export function useBoard() {
  const context = useContext(BoardContext)
  if (!context) {
    throw new Error("useBoard must be used within a BoardProvider")
  }
  return context
}
```

**Step 4: 테스트 실행 — 통과 확인**

Run: `bun run vitest run __tests__/board-context.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add lib/kanban/board-context.tsx __tests__/board-context.test.tsx
git commit -m "feat: add BoardContext with localStorage persistence"
```

---

### Task 5: 필터링 유틸리티 구현

**Files:**
- Create: `lib/kanban/filter-cards.ts`
- Create: `__tests__/filter-cards.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/filter-cards.test.tsx
import { describe, it, expect } from "vitest"
import { filterCards, getUniqueTagsFromCards } from "@/lib/kanban/filter-cards"
import type { Card } from "@/lib/kanban/types"

const cards: Card[] = [
  { id: "1", title: "Fix login bug", priority: "high", tags: ["bug"], columnId: "todo", order: 0, createdAt: 0 },
  { id: "2", title: "Add dark mode", priority: "medium", tags: ["feature"], columnId: "todo", order: 1, createdAt: 1 },
  { id: "3", title: "Update docs", priority: "low", tags: ["docs", "bug"], columnId: "done", order: 0, createdAt: 2 },
]

describe("filterCards", () => {
  it("returns all cards when no filters applied", () => {
    expect(filterCards(cards, "", null, null)).toHaveLength(3)
  })

  it("filters by search query (case-insensitive partial match)", () => {
    expect(filterCards(cards, "fix", null, null)).toHaveLength(1)
    expect(filterCards(cards, "FIX", null, null)).toHaveLength(1)
  })

  it("filters by priority", () => {
    expect(filterCards(cards, "", "high", null)).toHaveLength(1)
  })

  it("filters by tag", () => {
    expect(filterCards(cards, "", null, "bug")).toHaveLength(2)
  })

  it("applies multiple filters with AND logic", () => {
    expect(filterCards(cards, "", "low", "bug")).toHaveLength(1)
  })
})

describe("getUniqueTagsFromCards", () => {
  it("returns unique sorted tags", () => {
    expect(getUniqueTagsFromCards(cards)).toEqual(["bug", "docs", "feature"])
  })
})
```

**Step 2: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/filter-cards.test.tsx`
Expected: FAIL

**Step 3: 구현**

```typescript
// lib/kanban/filter-cards.ts
import type { Card, Priority } from "./types"

export function filterCards(
  cards: Card[],
  searchQuery: string,
  priorityFilter: Priority | null,
  tagFilter: string | null
): Card[] {
  return cards.filter((card) => {
    if (searchQuery && !card.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false
    }
    if (priorityFilter && card.priority !== priorityFilter) {
      return false
    }
    if (tagFilter && !card.tags.includes(tagFilter)) {
      return false
    }
    return true
  })
}

export function getUniqueTagsFromCards(cards: Card[]): string[] {
  const tags = new Set<string>()
  for (const card of cards) {
    for (const tag of card.tags) {
      tags.add(tag)
    }
  }
  return [...tags].sort()
}
```

**Step 4: 테스트 실행 — 통과 확인**

Run: `bun run vitest run __tests__/filter-cards.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add lib/kanban/filter-cards.ts __tests__/filter-cards.test.tsx
git commit -m "feat: add card filtering utilities with tests"
```

---

### Task 6: Spec 수용 기준 테스트 작성

요구사항(artifacts/example/requirements.md)에서 도출한 수용 기준 테스트를 작성한다. 이 테스트는 불변 계약이므로 구현이 이 테스트를 통과하도록 해야 한다.

**Files:**
- Create: `__tests__/kanban-board.spec.test.tsx`

**Step 1: Spec 테스트 작성**

```typescript
// __tests__/kanban-board.spec.test.tsx
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, beforeEach, vi } from "vitest"
import KanbanBoard from "@/components/kanban/kanban-board"

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: () => { store = {} },
  }
})()
vi.stubGlobal("localStorage", localStorageMock)

describe("Kanban Board — Acceptance Criteria", () => {
  beforeEach(() => {
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  describe("칸반 보드 칼럼", () => {
    it("3개의 고정 칼럼(Todo, In Progress, Done)이 가로로 나열된다", () => {
      render(<KanbanBoard />)
      expect(screen.getByText("Todo")).toBeInTheDocument()
      expect(screen.getByText("In Progress")).toBeInTheDocument()
      expect(screen.getByText("Done")).toBeInTheDocument()
    })
  })

  describe("카드 CRUD", () => {
    it("카드를 추가하면 Todo 칼럼에 나타난다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      await user.click(screen.getByRole("button", { name: /카드 추가/i }))

      const dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "새로운 카드")
      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      const todoColumn = screen.getByTestId("column-todo")
      expect(within(todoColumn).getByText("새로운 카드")).toBeInTheDocument()
    })

    it("빈 제목으로는 카드를 추가할 수 없다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      await user.click(screen.getByRole("button", { name: /카드 추가/i }))

      const dialog = screen.getByRole("dialog")
      const saveButton = within(dialog).getByRole("button", { name: /저장/i })
      await user.click(saveButton)

      // 모달이 닫히지 않고 에러 메시지가 표시되어야 한다
      expect(screen.getByRole("dialog")).toBeInTheDocument()
    })

    it("카드를 삭제할 수 있다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      // 카드 추가
      await user.click(screen.getByRole("button", { name: /카드 추가/i }))
      const dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "삭제할 카드")
      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      // 카드 클릭하여 편집 모달 열기
      await user.click(screen.getByText("삭제할 카드"))

      const editDialog = screen.getByRole("dialog")
      await user.click(within(editDialog).getByRole("button", { name: /삭제/i }))

      expect(screen.queryByText("삭제할 카드")).not.toBeInTheDocument()
    })

    it("카드를 인라인 편집(모달)할 수 있다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      // 카드 추가
      await user.click(screen.getByRole("button", { name: /카드 추가/i }))
      const dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "원래 제목")
      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      // 카드 클릭하여 편집
      await user.click(screen.getByText("원래 제목"))

      const editDialog = screen.getByRole("dialog")
      const titleInput = within(editDialog).getByLabelText(/제목/i)
      await user.clear(titleInput)
      await user.type(titleInput, "수정된 제목")
      await user.click(within(editDialog).getByRole("button", { name: /저장/i }))

      expect(screen.getByText("수정된 제목")).toBeInTheDocument()
      expect(screen.queryByText("원래 제목")).not.toBeInTheDocument()
    })
  })

  describe("카드 속성", () => {
    it("카드에 우선순위(High/Medium/Low)가 색상으로 구분되어 표시된다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      await user.click(screen.getByRole("button", { name: /카드 추가/i }))
      const dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "High 카드")

      // 우선순위를 High로 선택
      await user.click(within(dialog).getByRole("combobox", { name: /우선순위/i }))
      await user.click(screen.getByRole("option", { name: /high/i }))

      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      // 우선순위 뱃지가 표시되어야 한다
      const todoColumn = screen.getByTestId("column-todo")
      expect(within(todoColumn).getByText(/high/i)).toBeInTheDocument()
    })

    it("카드에 태그를 추가할 수 있다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      await user.click(screen.getByRole("button", { name: /카드 추가/i }))
      const dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "Tagged Card")
      await user.type(within(dialog).getByLabelText(/태그/i), "디자인{Enter}")
      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      const todoColumn = screen.getByTestId("column-todo")
      expect(within(todoColumn).getByText("디자인")).toBeInTheDocument()
    })
  })

  describe("검색과 필터", () => {
    it("카드 제목으로 검색하면 해당하지 않는 카드가 숨겨진다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      // 카드 2개 추가
      await user.click(screen.getByRole("button", { name: /카드 추가/i }))
      let dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "로그인 수정")
      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      await user.click(screen.getByRole("button", { name: /카드 추가/i }))
      dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "디자인 변경")
      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      // 검색
      await user.type(screen.getByPlaceholderText(/검색/i), "로그인")

      expect(screen.getByText("로그인 수정")).toBeInTheDocument()
      expect(screen.queryByText("디자인 변경")).not.toBeInTheDocument()
    })
  })

  describe("다크모드", () => {
    it("다크모드를 토글할 수 있다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      await user.click(screen.getByRole("button", { name: /다크/i }))
      expect(document.documentElement.classList.contains("dark")).toBe(true)

      await user.click(screen.getByRole("button", { name: /라이트/i }))
      expect(document.documentElement.classList.contains("dark")).toBe(false)
    })
  })

  describe("데이터 유지", () => {
    it("카드를 추가하면 localStorage에 저장된다", async () => {
      const user = userEvent.setup()
      render(<KanbanBoard />)

      await user.click(screen.getByRole("button", { name: /카드 추가/i }))
      const dialog = screen.getByRole("dialog")
      await user.type(within(dialog).getByLabelText(/제목/i), "저장 테스트")
      await user.click(within(dialog).getByRole("button", { name: /저장/i }))

      expect(localStorageMock.setItem).toHaveBeenCalledWith("kanban-board", expect.stringContaining("저장 테스트"))
    })

    it("localStorage에 저장된 카드가 새로고침 후에도 유지된다", () => {
      const savedCards = [
        { id: "1", title: "유지된 카드", priority: "medium", tags: [], columnId: "todo", order: 0, createdAt: 0 },
      ]
      localStorageMock.getItem.mockImplementation((key: string) => {
        if (key === "kanban-board") return JSON.stringify(savedCards)
        return null
      })

      render(<KanbanBoard />)
      expect(screen.getByText("유지된 카드")).toBeInTheDocument()
    })
  })
})
```

**Step 2: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/kanban-board.spec.test.tsx`
Expected: FAIL — KanbanBoard 컴포넌트가 아직 없음

**Step 3: Commit**

```bash
git add __tests__/kanban-board.spec.test.tsx
git commit -m "test: add kanban board acceptance criteria spec tests"
```

---

### Task 7: CardItem 컴포넌트 구현

**Files:**
- Create: `components/kanban/card-item.tsx`
- Create: `__tests__/card-item.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/card-item.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { CardItem } from "@/components/kanban/card-item"
import type { Card } from "@/lib/kanban/types"

const card: Card = {
  id: "1",
  title: "Test Card",
  priority: "high",
  tags: ["bug", "feature"],
  columnId: "todo",
  order: 0,
  createdAt: Date.now(),
}

describe("CardItem", () => {
  it("renders card title", () => {
    render(<CardItem card={card} onClick={vi.fn()} />)
    expect(screen.getByText("Test Card")).toBeInTheDocument()
  })

  it("renders priority badge", () => {
    render(<CardItem card={card} onClick={vi.fn()} />)
    expect(screen.getByText(/high/i)).toBeInTheDocument()
  })

  it("renders tags as badges", () => {
    render(<CardItem card={card} onClick={vi.fn()} />)
    expect(screen.getByText("bug")).toBeInTheDocument()
    expect(screen.getByText("feature")).toBeInTheDocument()
  })

  it("calls onClick when card is clicked", async () => {
    const onClick = vi.fn()
    render(<CardItem card={card} onClick={onClick} />)

    await userEvent.click(screen.getByText("Test Card"))
    expect(onClick).toHaveBeenCalledWith(card)
  })
})
```

**Step 2: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/card-item.test.tsx`
Expected: FAIL

**Step 3: 구현**

```typescript
// components/kanban/card-item.tsx
"use client"

import { useRef, useEffect, useState } from "react"
import { draggable, dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter"
import { attachClosestEdge, extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge"
import { Card as CardUI, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Card } from "@/lib/kanban/types"

const PRIORITY_COLORS: Record<string, string> = {
  high: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  low: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
}

interface CardItemProps {
  card: Card
  onClick: (card: Card) => void
}

export function CardItem({ card, onClick }: CardItemProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [closestEdge, setClosestEdge] = useState<string | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const dragCleanup = draggable({
      element: el,
      getInitialData: () => ({ cardId: card.id, columnId: card.columnId }),
      onDragStart: () => setIsDragging(true),
      onDrop: () => setIsDragging(false),
    })

    const dropCleanup = dropTargetForElements({
      element: el,
      getData: ({ input, element }) => {
        return attachClosestEdge(
          { cardId: card.id, columnId: card.columnId },
          { input, element, allowedEdges: ["top", "bottom"] }
        )
      },
      onDragEnter: ({ self }) => {
        setClosestEdge(extractClosestEdge(self.data))
      },
      onDrag: ({ self }) => {
        setClosestEdge(extractClosestEdge(self.data))
      },
      onDragLeave: () => setClosestEdge(null),
      onDrop: () => setClosestEdge(null),
    })

    return () => {
      dragCleanup()
      dropCleanup()
    }
  }, [card.id, card.columnId])

  return (
    <div className="relative">
      {closestEdge === "top" && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500 -translate-y-0.5" />
      )}
      <CardUI
        ref={ref}
        size="sm"
        className={`cursor-pointer transition-opacity ${isDragging ? "opacity-50" : ""}`}
        onClick={() => onClick(card)}
      >
        <CardContent className="flex flex-col gap-2">
          <span className="font-medium text-sm">{card.title}</span>
          <div className="flex flex-wrap gap-1">
            <Badge className={PRIORITY_COLORS[card.priority]}>
              {card.priority}
            </Badge>
            {card.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
      </CardUI>
      {closestEdge === "bottom" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500 translate-y-0.5" />
      )}
    </div>
  )
}
```

**Step 4: 테스트 실행 — 통과 확인**

Run: `bun run vitest run __tests__/card-item.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add components/kanban/card-item.tsx __tests__/card-item.test.tsx
git commit -m "feat: add CardItem component with drag-and-drop"
```

---

### Task 8: CardFormModal 컴포넌트 구현

**Files:**
- Create: `components/kanban/card-form-modal.tsx`
- Create: `__tests__/card-form-modal.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/card-form-modal.test.tsx
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { CardFormModal } from "@/components/kanban/card-form-modal"

describe("CardFormModal", () => {
  it("renders form fields when open", () => {
    render(<CardFormModal open onOpenChange={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)

    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByLabelText(/제목/i)).toBeInTheDocument()
    expect(within(dialog).getByRole("combobox", { name: /우선순위/i })).toBeInTheDocument()
    expect(within(dialog).getByLabelText(/태그/i)).toBeInTheDocument()
  })

  it("calls onSave with form data when submitted", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<CardFormModal open onOpenChange={vi.fn()} onSave={onSave} onDelete={vi.fn()} />)

    const dialog = screen.getByRole("dialog")
    await user.type(within(dialog).getByLabelText(/제목/i), "New Card")
    await user.click(within(dialog).getByRole("button", { name: /저장/i }))

    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New Card" })
    )
  })

  it("does not submit when title is empty", async () => {
    const onSave = vi.fn()
    const user = userEvent.setup()
    render(<CardFormModal open onOpenChange={vi.fn()} onSave={onSave} onDelete={vi.fn()} />)

    const dialog = screen.getByRole("dialog")
    await user.click(within(dialog).getByRole("button", { name: /저장/i }))

    expect(onSave).not.toHaveBeenCalled()
    expect(screen.getByRole("dialog")).toBeInTheDocument()
  })

  it("populates form when editing an existing card", () => {
    const card = { id: "1", title: "Existing", priority: "high" as const, tags: ["bug"], columnId: "todo" as const, order: 0, createdAt: 0 }
    render(<CardFormModal open onOpenChange={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} card={card} />)

    const dialog = screen.getByRole("dialog")
    expect(within(dialog).getByLabelText(/제목/i)).toHaveValue("Existing")
  })

  it("shows delete button only when editing", () => {
    render(<CardFormModal open onOpenChange={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)
    expect(screen.queryByRole("button", { name: /삭제/i })).not.toBeInTheDocument()
  })

  it("shows delete button when editing a card", () => {
    const card = { id: "1", title: "Existing", priority: "high" as const, tags: [], columnId: "todo" as const, order: 0, createdAt: 0 }
    render(<CardFormModal open onOpenChange={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} card={card} />)
    expect(screen.getByRole("button", { name: /삭제/i })).toBeInTheDocument()
  })

  it("adds tags by pressing Enter", async () => {
    const user = userEvent.setup()
    render(<CardFormModal open onOpenChange={vi.fn()} onSave={vi.fn()} onDelete={vi.fn()} />)

    const dialog = screen.getByRole("dialog")
    await user.type(within(dialog).getByLabelText(/태그/i), "디자인{Enter}")

    expect(within(dialog).getByText("디자인")).toBeInTheDocument()
  })
})
```

**Step 2: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/card-form-modal.test.tsx`
Expected: FAIL

**Step 3: 구현**

CardFormModal 컴포넌트를 구현한다. Dialog UI 컴포넌트를 사용하여 카드 추가/편집 폼을 구현한다.
주요 기능:
- 제목 필수 입력, 빈 제목 시 에러 메시지
- 우선순위 Select (기본값 medium)
- 태그 자유 입력 (Enter로 추가, 클릭으로 제거)
- 편집 모드에서 삭제 버튼
- 기존 카드 데이터로 폼 초기화

구현 시 `Dialog`, `Input`, `Select`, `Badge`, `Button` shadcn 컴포넌트를 활용한다. `existingTags` prop으로 자동완성 후보를 받는다.

**Step 4: 테스트 실행 — 통과 확인**

Run: `bun run vitest run __tests__/card-form-modal.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add components/kanban/card-form-modal.tsx __tests__/card-form-modal.test.tsx
git commit -m "feat: add CardFormModal component with validation"
```

---

### Task 9: Column 컴포넌트 구현

**Files:**
- Create: `components/kanban/column.tsx`
- Create: `__tests__/column.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/column.test.tsx
import { render, screen } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import { Column } from "@/components/kanban/column"
import type { Card } from "@/lib/kanban/types"

const cards: Card[] = [
  { id: "1", title: "Card A", priority: "high", tags: [], columnId: "todo", order: 0, createdAt: 0 },
  { id: "2", title: "Card B", priority: "low", tags: [], columnId: "todo", order: 1, createdAt: 1 },
]

describe("Column", () => {
  it("renders column title and card count", () => {
    render(<Column id="todo" title="Todo" cards={cards} onCardClick={vi.fn()} />)
    expect(screen.getByText("Todo")).toBeInTheDocument()
    expect(screen.getByText("2")).toBeInTheDocument()
  })

  it("renders cards sorted by order", () => {
    render(<Column id="todo" title="Todo" cards={cards} onCardClick={vi.fn()} />)
    expect(screen.getByText("Card A")).toBeInTheDocument()
    expect(screen.getByText("Card B")).toBeInTheDocument()
  })

  it("renders empty column with drop zone", () => {
    render(<Column id="done" title="Done" cards={[]} onCardClick={vi.fn()} />)
    expect(screen.getByText("Done")).toBeInTheDocument()
    expect(screen.getByTestId("column-done")).toBeInTheDocument()
  })
})
```

**Step 2: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/column.test.tsx`
Expected: FAIL

**Step 3: 구현**

Column 컴포넌트를 구현한다.
- 칼럼 헤더 (이름 + 카드 수 Badge)
- CardList 영역 (`dropTargetForElements` 적용)
- CardItem 렌더링 (order 정렬)
- `data-testid="column-{id}"` 속성 부여
- 빈 칼럼에도 최소 높이로 드롭 가능

**Step 4: 테스트 실행 — 통과 확인**

Run: `bun run vitest run __tests__/column.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add components/kanban/column.tsx __tests__/column.test.tsx
git commit -m "feat: add Column component with drop target"
```

---

### Task 10: BoardHeader 컴포넌트 구현

**Files:**
- Create: `components/kanban/board-header.tsx`
- Create: `__tests__/board-header.test.tsx`

**Step 1: 테스트 작성**

```typescript
// __tests__/board-header.test.tsx
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, it, expect, vi } from "vitest"
import { BoardHeader } from "@/components/kanban/board-header"

describe("BoardHeader", () => {
  const defaultProps = {
    searchQuery: "",
    onSearchChange: vi.fn(),
    priorityFilter: null as null,
    onPriorityFilterChange: vi.fn(),
    tagFilter: null as null,
    onTagFilterChange: vi.fn(),
    availableTags: ["bug", "feature"],
    darkMode: false,
    onToggleDarkMode: vi.fn(),
    onAddCard: vi.fn(),
  }

  it("renders search input", () => {
    render(<BoardHeader {...defaultProps} />)
    expect(screen.getByPlaceholderText(/검색/i)).toBeInTheDocument()
  })

  it("renders add card button", () => {
    render(<BoardHeader {...defaultProps} />)
    expect(screen.getByRole("button", { name: /카드 추가/i })).toBeInTheDocument()
  })

  it("renders dark mode toggle", () => {
    render(<BoardHeader {...defaultProps} />)
    expect(screen.getByRole("button", { name: /다크/i })).toBeInTheDocument()
  })

  it("calls onSearchChange when typing in search", async () => {
    const onSearchChange = vi.fn()
    render(<BoardHeader {...defaultProps} onSearchChange={onSearchChange} />)

    await userEvent.type(screen.getByPlaceholderText(/검색/i), "test")
    expect(onSearchChange).toHaveBeenCalled()
  })

  it("calls onAddCard when add button is clicked", async () => {
    const onAddCard = vi.fn()
    render(<BoardHeader {...defaultProps} onAddCard={onAddCard} />)

    await userEvent.click(screen.getByRole("button", { name: /카드 추가/i }))
    expect(onAddCard).toHaveBeenCalled()
  })
})
```

**Step 2: 테스트 실행 — 실패 확인**

Run: `bun run vitest run __tests__/board-header.test.tsx`
Expected: FAIL

**Step 3: 구현**

BoardHeader 컴포넌트를 구현한다.
- 검색 Input (placeholder: "검색...")
- 우선순위 필터 Select ("전체", "High", "Medium", "Low")
- 태그 필터 Select (availableTags에서 동적 생성)
- 다크모드 토글 Button (다크 모드일 때 "라이트 모드", 아닐 때 "다크 모드")
- "+ 카드 추가" Button
- 반응형: 모바일에서는 flex-wrap

**Step 4: 테스트 실행 — 통과 확인**

Run: `bun run vitest run __tests__/board-header.test.tsx`
Expected: ALL PASS

**Step 5: Commit**

```bash
git add components/kanban/board-header.tsx __tests__/board-header.test.tsx
git commit -m "feat: add BoardHeader with search, filters, dark mode toggle"
```

---

### Task 11: KanbanBoard 메인 컴포넌트 조립

모든 컴포넌트를 조립하여 칸반 보드를 완성한다.

**Files:**
- Create: `components/kanban/kanban-board.tsx`

**Step 1: 구현**

KanbanBoard 컴포넌트를 구현한다.
- `BoardProvider`로 래핑
- `monitorForElements` (`@atlaskit/pragmatic-drag-and-drop`)로 드래그 앤 드롭 이벤트 핸들링
- `useMemo`로 필터링된 카드 파생 (`filterCards` 사용)
- `useMemo`로 uniqueTags 파생 (`getUniqueTagsFromCards` 사용)
- 칼럼별 카드 분배 (`columnId` 필터 + `order` 정렬)
- CardFormModal 상태 관리 (open/close, 편집 대상 카드)
- `"use client"` 지시어
- `export default`로 내보내기

주요 구조:
```
BoardProvider
  BoardHeader (props drilling: search, filters, dark mode, add card)
  <div className="flex gap-4 overflow-x-auto"> (가로 스크롤)
    Column × 3 (COLUMNS.map)
  </div>
  CardFormModal (open, card, onSave, onDelete)
```

**Step 2: spec 테스트 실행**

Run: `bun run vitest run __tests__/kanban-board.spec.test.tsx`
Expected: 대부분 PASS (드래그 앤 드롭 관련 테스트는 통합 테스트 범위)

**Step 3: 전체 테스트 실행**

Run: `bun run vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add components/kanban/kanban-board.tsx
git commit -m "feat: assemble KanbanBoard with all components"
```

---

### Task 12: 페이지 연결 및 최종 통합

**Files:**
- Modify: `app/page.tsx`

**Step 1: page.tsx 수정**

```typescript
// app/page.tsx
import dynamic from "next/dynamic"

const KanbanBoard = dynamic(() => import("@/components/kanban/kanban-board"), {
  ssr: false,
})

export default function Page() {
  return <KanbanBoard />
}
```

`ssr: false`로 클라이언트 전용 로드 — localStorage 접근 시 hydration mismatch 방지. (`bundle-dynamic-imports` 규칙 적용)

**Step 2: 빌드 확인**

Run: `bun run build`
Expected: 빌드 성공

**Step 3: 전체 테스트 실행**

Run: `bun run vitest run`
Expected: ALL PASS

**Step 4: Commit**

```bash
git add app/page.tsx
git commit -m "feat: connect KanbanBoard to page with dynamic import"
```

---

### Task 13: 시각적 확인 및 다크모드 스타일링

**Step 1: 개발 서버 실행**

Run: `bun run dev`

**Step 2: 브라우저에서 확인**

다음 시나리오를 브라우저에서 확인:
- 3개 칼럼이 가로로 나열되는지
- 카드 추가/편집/삭제가 정상 동작하는지
- 우선순위 색상이 구분되는지
- 드래그 앤 드롭이 동작하는지
- 다크모드 토글이 동작하는지
- 검색/필터가 동작하는지
- 새로고침 후 데이터가 유지되는지

**Step 3: 스타일 조정이 필요하면 수정**

**Step 4: Commit**

```bash
git add -A
git commit -m "refactor: polish kanban board styles"
```

---

## 미결정 질문

1. **드래그 중 시각적 피드백**: opacity 감소 외에 드래그 프리뷰(ghost) 커스텀이 필요한가? (기본 브라우저 드래그 프리뷰로 시작)
2. **모바일 대응**: 모바일에서 칼럼을 가로 스크롤로 처리할지, 세로 스택으로 전환할지 (현재: 가로 스크롤)
3. **카드 수 제한**: 칼럼당 또는 전체 카드 수 제한이 필요한가? (현재: 제한 없음)
4. **태그 자동완성 UI**: 단순 datalist vs 커스텀 드롭다운 (현재: 자유 입력 + Enter)
