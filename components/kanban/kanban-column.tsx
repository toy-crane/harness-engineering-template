"use client";

import type { Column, Card } from "@/lib/types";
import KanbanCard from "./kanban-card";
import AddCardForm from "./add-card-form";

interface KanbanColumnProps {
  column: Column;
  cards: Card[];
  onClickCardTitle: (cardId: string) => void;
  onClickCard: (cardId: string) => void;
}

export default function KanbanColumn({ column, cards, onClickCardTitle, onClickCard }: KanbanColumnProps) {
  return (
    <div
      data-testid={`column-${column.title}`}
      className="flex min-w-72 flex-1 flex-col gap-3 rounded-lg bg-muted/50 p-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{column.title}</h2>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </div>
      <div className="flex flex-col gap-2">
        {cards.map((card) => (
          <KanbanCard
            key={card.id}
            card={card}
            onClickTitle={onClickCardTitle}
            onClickCard={onClickCard}
          />
        ))}
      </div>
      <AddCardForm columnTitle={column.title} />
    </div>
  );
}
