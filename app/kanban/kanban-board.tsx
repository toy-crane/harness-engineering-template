"use client";

import { useState } from "react";
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
import { KanbanColumn } from "./kanban-column";
import { useKanbanStore, type ColumnId } from "./store";

const COLUMNS: ColumnId[] = ["todo", "in-progress", "done"];

export function KanbanBoard() {
  const columns = useKanbanStore((s) => s.columns);
  const cards = useKanbanStore((s) => s.cards);
  const deleteCard = useKanbanStore((s) => s.deleteCard);

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    cardId: string;
    columnId: ColumnId;
  } | null>(null);

  const handleDeleteConfirm = () => {
    if (deleteTarget) {
      deleteCard(deleteTarget.cardId, deleteTarget.columnId);
      setDeleteTarget(null);
    }
  };

  const cardToDelete = deleteTarget ? cards[deleteTarget.cardId] : null;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid grid-cols-3 gap-6">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col}
            columnId={col}
            cardIds={columns[col]}
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
