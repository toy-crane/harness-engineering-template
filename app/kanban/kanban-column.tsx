"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { KanbanCard } from "./kanban-card";
import { useKanbanStore, type ColumnId } from "./store";

const COLUMN_NAMES: Record<ColumnId, string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};

interface KanbanColumnProps {
  columnId: ColumnId;
  cardIds: string[];
  editingCardId: string | null;
  onCardEdit: (cardId: string) => void;
  onCardEditEnd: () => void;
  onDeleteRequest: (cardId: string, columnId: ColumnId) => void;
}

export function KanbanColumn({ columnId, cardIds, editingCardId, onCardEdit, onCardEditEnd, onDeleteRequest }: KanbanColumnProps) {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const cards = useKanbanStore((s) => s.cards);
  const addCard = useKanbanStore((s) => s.addCard);

  const handleAdd = () => {
    if (!title.trim()) {
      setError("제목을 입력해주세요");
      return;
    }
    addCard(title.trim(), columnId);
    setTitle("");
    setError("");
  };

  return (
    <div data-testid={`column-${columnId}`} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">{COLUMN_NAMES[columnId]}</h2>
        <Badge variant="secondary">{cardIds.length}</Badge>
      </div>
      <div className="flex flex-col gap-2">
        {cardIds.map((id) => {
          const card = cards[id];
          if (!card) return null;
          return (
            <KanbanCard
              key={id}
              card={card}
              column={columnId}
              isEditing={editingCardId === id}
              onEdit={() => onCardEdit(id)}
              onEditEnd={onCardEditEnd}
              onDelete={() => onDeleteRequest(id, columnId)}
            />
          );
        })}
      </div>
      <div className="flex gap-2">
        <Input
          placeholder="카드 제목 입력"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
        />
        <Button onClick={handleAdd}>추가</Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
