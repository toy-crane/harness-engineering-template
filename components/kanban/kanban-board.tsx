"use client";

import { useState, useCallback } from "react";
import { useKanbanStore } from "@/lib/store";
import KanbanColumn from "./kanban-column";

export default function KanbanBoard() {
  const columns = useKanbanStore((s) => s.columns);
  const columnOrder = useKanbanStore((s) => s.columnOrder);
  const cards = useKanbanStore((s) => s.cards);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const handleClickCardTitle = useCallback((cardId: string) => {
    setEditingCardId(cardId);
  }, []);

  const handleClickCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
  }, []);

  return (
    <div className="flex gap-4 overflow-x-auto p-6">
      {columnOrder.map((colId) => {
        const column = columns[colId];
        const columnCards = column.cardIds.map((id) => cards[id]).filter(Boolean);
        return (
          <KanbanColumn
            key={colId}
            column={column}
            cards={columnCards}
            onClickCardTitle={handleClickCardTitle}
            onClickCard={handleClickCard}
            editingCardId={editingCardId}
            onEditComplete={() => setEditingCardId(null)}
          />
        );
      })}
    </div>
  );
}
