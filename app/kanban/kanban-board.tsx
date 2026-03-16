"use client";

import { useState, useMemo } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KanbanColumn } from "./kanban-column";
import { useKanbanStore, type ColumnId } from "./store";

const COLUMNS: ColumnId[] = ["todo", "in-progress", "done"];

export function KanbanBoard() {
  const columns = useKanbanStore((s) => s.columns);
  const cards = useKanbanStore((s) => s.cards);
  const deleteCard = useKanbanStore((s) => s.deleteCard);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{
    cardId: string;
    columnId: ColumnId;
  } | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    Object.values(cards).forEach((card) => {
      card.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [cards]);

  const filteredColumns = useMemo(() => {
    const result: Record<ColumnId, string[]> = {
      todo: [],
      "in-progress": [],
      done: [],
    };

    for (const col of COLUMNS) {
      result[col] = columns[col].filter((id) => {
        const card = cards[id];
        if (!card) return false;
        if (searchText && !card.title.includes(searchText)) return false;
        if (priorityFilter && card.priority !== priorityFilter) return false;
        if (tagFilter && !card.tags.includes(tagFilter)) return false;
        return true;
      });
    }

    return result;
  }, [columns, cards, searchText, priorityFilter, tagFilter]);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteCard(deleteTarget.cardId, deleteTarget.columnId);
      setDeleteTarget(null);
    }
  };

  const cardToDelete = deleteTarget ? cards[deleteTarget.cardId] : null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap gap-4">
        <Input
          placeholder="검색"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="max-w-xs"
        />
        <div>
          <Label htmlFor="priority-filter" className="sr-only">우선순위 필터</Label>
          <select
            id="priority-filter"
            aria-label="우선순위 필터"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          >
            <option value="">우선순위 전체</option>
            <option value="상">상</option>
            <option value="중">중</option>
            <option value="하">하</option>
          </select>
        </div>
        <div>
          <Label htmlFor="tag-filter" className="sr-only">태그 필터</Label>
          <select
            id="tag-filter"
            aria-label="태그 필터"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="flex h-8 rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm"
          >
            <option value="">태그 전체</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col}
            columnId={col}
            cardIds={filteredColumns[col]}
            editingCardId={editingCardId}
            onCardEdit={setEditingCardId}
            onCardEditEnd={() => setEditingCardId(null)}
            onDeleteRequest={(cardId, columnId) =>
              setDeleteTarget({ cardId, columnId })
            }
          />
        ))}
      </div>

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              {cardToDelete
                ? `'${cardToDelete.title}' 카드를 삭제합니다.`
                : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
