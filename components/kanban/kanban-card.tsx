"use client";

import type { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface KanbanCardProps {
  card: Card;
  onClickTitle: (cardId: string) => void;
  onClickCard: (cardId: string) => void;
}

export default function KanbanCard({ card, onClickTitle, onClickCard }: KanbanCardProps) {
  return (
    <div
      data-testid={`card-${card.id}`}
      className="cursor-pointer rounded-md border bg-card p-3 shadow-sm"
      onClick={() => onClickCard(card.id)}
    >
      <div className="flex flex-col gap-1">
        <span
          className="text-sm font-medium"
          onClick={(e) => {
            e.stopPropagation();
            onClickTitle(card.id);
          }}
        >
          {card.title}
        </span>
        {card.priority !== "None" && (
          <Badge variant="secondary" className="w-fit text-xs">
            {card.priority}
          </Badge>
        )}
        {card.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
        {card.subtasks.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {card.subtasks.filter((s) => s.completed).length}/{card.subtasks.length}
          </span>
        )}
      </div>
    </div>
  );
}
