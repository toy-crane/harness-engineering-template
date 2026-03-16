"use client";

import { useState } from "react";
import type { Card } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/lib/store";
import DeleteCardDialog from "./delete-card-dialog";

interface KanbanCardProps {
  card: Card;
  isEditing: boolean;
  onClickTitle: (cardId: string) => void;
  onClickCard: (cardId: string) => void;
  onEditComplete: () => void;
}

export default function KanbanCard({ card, isEditing, onClickTitle, onClickCard, onEditComplete }: KanbanCardProps) {
  const updateCard = useKanbanStore((s) => s.updateCard);
  const [editValue, setEditValue] = useState(card.title);

  function handleSaveTitle() {
    const trimmed = editValue.trim();
    if (trimmed) {
      updateCard(card.id, { title: trimmed });
    }
    onEditComplete();
  }

  return (
    <div
      data-testid={`card-${card.id}`}
      className="cursor-pointer rounded-md border bg-card p-3 shadow-sm"
      onClick={() => onClickCard(card.id)}
    >
      <div className="flex flex-col gap-1">
        {isEditing ? (
          <Input
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
              if (e.key === "Escape") onEditComplete();
            }}
            onBlur={handleSaveTitle}
            onClick={(e) => e.stopPropagation()}
            autoFocus
          />
        ) : (
          <span
            className="text-sm font-medium"
            onClick={(e) => {
              e.stopPropagation();
              setEditValue(card.title);
              onClickTitle(card.id);
            }}
          >
            {card.title}
          </span>
        )}
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
        <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
          <DeleteCardDialog cardId={card.id} />
        </div>
      </div>
    </div>
  );
}
