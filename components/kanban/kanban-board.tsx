"use client";

import { useState, useCallback, useEffect } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useKanbanStore } from "@/lib/store";
import KanbanColumn from "./kanban-column";
import CardDetailModal from "./card-detail-modal";

export default function KanbanBoard() {
  const columns = useKanbanStore((s) => s.columns);
  const columnOrder = useKanbanStore((s) => s.columnOrder);
  const cards = useKanbanStore((s) => s.cards);
  const moveCard = useKanbanStore((s) => s.moveCard);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  useEffect(() => {
    return monitorForElements({
      onDrop({ source, location }) {
        const destination = location.current.dropTargets[0];
        if (!destination) return;

        const cardId = source.data.cardId as string;
        const fromColumnId = source.data.columnId as string;
        const toColumnId = destination.data.columnId as string;

        if (!cardId || !toColumnId) return;

        // Determine drop index
        const innerTarget = location.current.dropTargets.length > 1
          ? location.current.dropTargets[0]
          : null;

        let toIndex: number;
        if (innerTarget && innerTarget.data.cardId) {
          // Dropped on a card — get its index
          const targetCardId = innerTarget.data.cardId as string;
          const targetColumnId = (innerTarget.data.columnId ?? toColumnId) as string;
          const targetColumn = useKanbanStore.getState().columns[targetColumnId];
          toIndex = targetColumn.cardIds.indexOf(targetCardId);
        } else {
          // Dropped on column — append to end
          const targetColumn = useKanbanStore.getState().columns[toColumnId];
          toIndex = targetColumn.cardIds.length;
        }

        moveCard(cardId, fromColumnId, toColumnId, toIndex);
      },
    });
  }, [moveCard]);

  const handleClickCardTitle = useCallback((cardId: string) => {
    setEditingCardId(cardId);
  }, []);

  const handleClickCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
  }, []);

  return (
    <>
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
      {selectedCardId && (
        <CardDetailModal
          cardId={selectedCardId}
          open={!!selectedCardId}
          onOpenChange={(open) => {
            if (!open) setSelectedCardId(null);
          }}
        />
      )}
    </>
  );
}
