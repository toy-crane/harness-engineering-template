import { create } from "zustand"
import { persist } from "zustand/middleware"

export type Priority = "높음" | "중간" | "낮음" | ""

export interface Subtask {
  id: string
  text: string
  completed: boolean
}

export interface Card {
  id: string
  title: string
  description: string
  priority: Priority
  tags: string[]
  dueDate: string
  subtasks: Subtask[]
}

export interface Column {
  id: string
  name: string
  cardIds: string[]
}

export interface KanbanState {
  cards: Record<string, Card>
  columns: Column[]
  searchText: string
  priorityFilter: Priority | ""
  tagFilter: string
  version: number
}

export interface KanbanActions {
  addCard: (columnId: string, title: string) => string
  updateCard: (id: string, fields: Partial<Omit<Card, "id">>) => void
  deleteCard: (id: string, columnId: string) => void
  moveCard: (cardId: string, fromColumnId: string, toColumnId: string) => void
  addTag: (cardId: string, tag: string) => void
  removeTag: (cardId: string, tag: string) => void
  addSubtask: (cardId: string, text: string) => void
  toggleSubtask: (cardId: string, subtaskId: string) => void
  setSearchText: (text: string) => void
  setPriorityFilter: (priority: Priority | "") => void
  setTagFilter: (tag: string) => void
}

const INITIAL_COLUMNS: Column[] = [
  { id: "todo", name: "To Do", cardIds: [] },
  { id: "inprogress", name: "In Progress", cardIds: [] },
  { id: "done", name: "Done", cardIds: [] },
]

let cardIdCounter = 0
function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${++cardIdCounter}`
}

export const useKanbanStore = create<KanbanState & KanbanActions>()(
  persist(
    (set) => ({
      cards: {},
      columns: INITIAL_COLUMNS,
      searchText: "",
      priorityFilter: "",
      tagFilter: "",
      version: 1,

      addCard: (columnId, title) => {
        const id = generateId("card")
        const newCard: Card = {
          id,
          title,
          description: "",
          priority: "",
          tags: [],
          dueDate: "",
          subtasks: [],
        }
        set((state) => ({
          cards: { ...state.cards, [id]: newCard },
          columns: state.columns.map((col) =>
            col.id === columnId
              ? { ...col, cardIds: [...col.cardIds, id] }
              : col
          ),
        }))
        return id
      },

      updateCard: (id, fields) => {
        set((state) => ({
          cards: {
            ...state.cards,
            [id]: { ...state.cards[id], ...fields },
          },
        }))
      },

      deleteCard: (id, columnId) => {
        set((state) => {
          const { [id]: _removed, ...rest } = state.cards
          return {
            cards: rest,
            columns: state.columns.map((col) =>
              col.id === columnId
                ? { ...col, cardIds: col.cardIds.filter((cid) => cid !== id) }
                : col
            ),
          }
        })
      },

      moveCard: (cardId, fromColumnId, toColumnId) => {
        set((state) => ({
          columns: state.columns.map((col) => {
            if (col.id === fromColumnId) {
              return { ...col, cardIds: col.cardIds.filter((id) => id !== cardId) }
            }
            if (col.id === toColumnId) {
              return { ...col, cardIds: [...col.cardIds, cardId] }
            }
            return col
          }),
        }))
      },

      addTag: (cardId, tag) => {
        set((state) => {
          const card = state.cards[cardId]
          if (!card || card.tags.includes(tag)) return state
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...card, tags: [...card.tags, tag] },
            },
          }
        })
      },

      removeTag: (cardId, tag) => {
        set((state) => {
          const card = state.cards[cardId]
          if (!card) return state
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...card, tags: card.tags.filter((t) => t !== tag) },
            },
          }
        })
      },

      addSubtask: (cardId, text) => {
        set((state) => {
          const card = state.cards[cardId]
          if (!card) return state
          const subtask: Subtask = {
            id: generateId("subtask"),
            text,
            completed: false,
          }
          return {
            cards: {
              ...state.cards,
              [cardId]: { ...card, subtasks: [...card.subtasks, subtask] },
            },
          }
        })
      },

      toggleSubtask: (cardId, subtaskId) => {
        set((state) => {
          const card = state.cards[cardId]
          if (!card) return state
          return {
            cards: {
              ...state.cards,
              [cardId]: {
                ...card,
                subtasks: card.subtasks.map((s) =>
                  s.id === subtaskId ? { ...s, completed: !s.completed } : s
                ),
              },
            },
          }
        })
      },

      setSearchText: (text) => set({ searchText: text }),
      setPriorityFilter: (priority) => set({ priorityFilter: priority }),
      setTagFilter: (tag) => set({ tagFilter: tag }),
    }),
    {
      name: "kanban-storage",
      version: 1,
      partialize: (state) => ({
        cards: state.cards,
        columns: state.columns,
        version: state.version,
      }),
    }
  )
)

export function useFilteredCardIds(columnId: string) {
  return useKanbanStore((state) => {
    const column = state.columns.find((col) => col.id === columnId)
    if (!column) return []
    return column.cardIds.filter((cardId) => {
      const card = state.cards[cardId]
      if (!card) return false
      if (state.searchText && !card.title.includes(state.searchText)) return false
      if (state.priorityFilter && card.priority !== state.priorityFilter) return false
      if (state.tagFilter && !card.tags.includes(state.tagFilter)) return false
      return true
    })
  })
}
