"use client";

import { useRef, useEffect, useState } from "react";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import type { Column, Card } from "@/lib/types";
import KanbanCard from "./kanban-card";
import AddCardForm from "./add-card-form";

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onClickCardTitle: (cardId: string) => void;
  onClickCard: (cardId: string) => void;
  editingCardId: string | null;
  onEditComplete: () => void;
}

export default function KanbanColumn({ column, cards, onClickCardTitle, onClickCard, editingCardId, onEditComplete }: KanbanColumnProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    return dropTargetForElements({
      element: el,
      getData: () => ({ columnId: column.id }),
      onDragEnter: () => setIsDragOver(true),
      onDragLeave: () => setIsDragOver(false),
      onDrop: () => setIsDragOver(false),
    });
  }, [column.id]);

  return (
    <div
      ref={ref}
      data-testid={`column-${column.title}`}
      className={`flex min-w-72 flex-1 flex-col gap-3 rounded-lg p-4 ${isDragOver ? "bg-muted" : "bg-muted/50"}`}
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{column.title}</h2>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </div>
      <div className="flex min-h-8 flex-col gap-2">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            isEditing={editingCardId === card.id}
            onClickTitle={onClickCardTitle}
            onClickCard={onClickCard}
            onEditComplete={onEditComplete}
          />
        ))}
      </div>
      <AddCardForm columnTitle={column.title} />
    </div>
  );
}
