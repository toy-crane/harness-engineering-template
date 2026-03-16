"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useKanbanStore } from "@/lib/store";
import type { Card } from "@/lib/types";
import KanbanColumn from "./kanban-column";
import CardDetailModal from "./card-detail-modal";
import SearchBar from "./search-bar";
import FilterBar from "./filter-bar";
import ThemeToggle from "./theme-toggle";

export default function KanbanBoard() {
  const columns = useKanbanStore((s) => s.columns);
  const columnOrder = useKanbanStore((s) => s.columnOrder);
  const cards = useKanbanStore((s) => s.cards);
  const moveCard = useKanbanStore((s) => s.moveCard);
  const searchQuery = useKanbanStore((s) => s.searchQuery);
  const priorityFilter = useKanbanStore((s) => s.priorityFilter);
  const tagFilter = useKanbanStore((s) => s.tagFilter);
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

        const innerTarget = location.current.dropTargets.length > 1
          ? location.current.dropTargets[0]
          : null;

        let toIndex: number;
        if (innerTarget && innerTarget.data.cardId) {
          const targetCardId = innerTarget.data.cardId as string;
          const targetColumnId = (innerTarget.data.columnId ?? toColumnId) as string;
          const targetColumn = useKanbanStore.getState().columns[targetColumnId];
          toIndex = targetColumn.cardIds.indexOf(targetCardId);
        } else {
          const targetColumn = useKanbanStore.getState().columns[toColumnId];
          toIndex = targetColumn.cardIds.length;
        }

        moveCard(cardId, fromColumnId, toColumnId, toIndex);
      },
    });
  }, [moveCard]);

  const filterCard = useCallback(
    (card: Card): boolean => {
      if (searchQuery && !card.title.includes(searchQuery)) return false;
      if (priorityFilter !== "All" && card.priority !== priorityFilter) return false;
      if (tagFilter && !card.tags.includes(tagFilter)) return false;
      return true;
    },
    [searchQuery, priorityFilter, tagFilter]
  );

  const handleClickCardTitle = useCallback((cardId: string) => {
    setEditingCardId(cardId);
  }, []);

  const handleClickCard = useCallback((cardId: string) => {
    setSelectedCardId(cardId);
  }, []);

  return (
    <>
      <div className="flex flex-col gap-4 p-6">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <SearchBar />
            </div>
            <ThemeToggle />
          </div>
          <FilterBar />
        </div>
        <div className="flex gap-4 overflow-x-auto">
          {columnOrder.map((colId) => {
            const column = columns[colId];
            const columnCards = column.cardIds
              .map((id) => cards[id])
              .filter(Boolean)
              .filter(filterCard);
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
