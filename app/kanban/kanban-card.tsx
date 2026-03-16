"use client";

import { useState, useRef, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardAction, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { useKanbanStore, type Card as CardType, type ColumnId, type Priority } from "./store";

interface KanbanCardProps {
  card: CardType;
  column: ColumnId;
  isEditing: boolean;
  onEdit: () => void;
  onEditEnd: () => void;
  onDelete: () => void;
}

export function KanbanCard({ card, column, isEditing, onEdit, onEditEnd, onDelete }: KanbanCardProps) {
  const updateCard = useKanbanStore((s) => s.updateCard);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description);
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [dueDate, setDueDate] = useState(card.dueDate);
  const [titleError, setTitleError] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitle(card.title);
    setDescription(card.description);
    setPriority(card.priority);
    setDueDate(card.dueDate);
  }, [card]);

  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        handleSave();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  });

  const handleSave = () => {
    if (!title.trim()) {
      setTitleError("제목을 입력해주세요");
      return;
    }
    updateCard(card.id, {
      title: title.trim(),
      description,
      priority,
      dueDate,
    });
    setTitleError("");
    onEditEnd();
  };

  if (!isEditing) {
    return (
      <Card data-testid="kanban-card" size="sm" className="cursor-pointer" onClick={onEdit}>
        <CardHeader>
          <CardTitle>{card.title}</CardTitle>
          <CardAction>
            <Button
              variant="ghost"
              size="icon-xs"
              aria-label="삭제"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <X />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary">{card.priority}</Badge>
            {card.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
            {card.dueDate && <Badge variant="outline">{card.dueDate}</Badge>}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="kanban-card" size="sm" ref={cardRef}>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div>
            <Label htmlFor={`title-${card.id}`}>제목</Label>
            <Input
              id={`title-${card.id}`}
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError) setTitleError("");
              }}
            />
            {titleError && <p className="mt-1 text-sm text-destructive">{titleError}</p>}
          </div>
          <div>
            <Label htmlFor={`desc-${card.id}`}>설명</Label>
            <Textarea
              id={`desc-${card.id}`}
              aria-label="설명"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor={`priority-${card.id}`}>우선순위</Label>
            <select
              id={`priority-${card.id}`}
              aria-label="우선순위"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
            >
              <option value="상">상</option>
              <option value="중">중</option>
              <option value="하">하</option>
            </select>
          </div>
          <div>
            <Label htmlFor={`due-${card.id}`}>마감일</Label>
            <Input
              id={`due-${card.id}`}
              type="date"
              aria-label="마감일"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div>
            <Label>태그</Label>
            <div className="flex flex-wrap gap-1">
              {card.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
            <Input placeholder="태그 입력" className="mt-1" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
