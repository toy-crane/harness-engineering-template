"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
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
import { KanbanBoard } from "./kanban-board";
import { ThemeToggle } from "./theme-toggle";
import { useKanbanStore } from "./store";

export default function KanbanPage() {
  const cards = useKanbanStore((s) => s.cards);
  const columns = useKanbanStore((s) => s.columns);
  const importData = useKanbanStore((s) => s.importData);

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importError, setImportError] = useState("");
  const [importReady, setImportReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = JSON.stringify({ cards, columns }, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "kanban-board.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportDialogOpen(true);
    setImportError("");
    setImportReady(false);
  };

  const handleImportConfirm = () => {
    setImportReady(true);
    setImportDialogOpen(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".json") && file.type !== "application/json") {
      setImportError("올바른 형식의 파일이 아닙니다");
      if (fileInputRef.current) fileInputRef.current.value = "";
      setImportReady(false);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const text = ev.target?.result as string;
        const data = JSON.parse(text);
        if (!data.cards || !data.columns) {
          throw new Error("invalid format");
        }
        importData(data);
        setImportError("");
      } catch {
        setImportError("올바른 형식의 파일이 아닙니다");
      }

      if (fileInputRef.current) fileInputRef.current.value = "";
      setImportReady(false);
    };
    reader.readAsText(file);
  };

  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleExport}>
            내보내기
          </Button>
          <Button variant="outline" onClick={handleImportClick}>
            가져오기
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {importReady && (
        <input
          ref={fileInputRef}
          data-testid="import-file-input"
          type="file"
          accept=".json"
          onChange={handleFileChange}
          className="mb-4"
        />
      )}

      {importError && (
        <p className="mb-4 text-sm text-destructive">{importError}</p>
      )}

      <KanbanBoard />

      <AlertDialog
        open={importDialogOpen}
        onOpenChange={(open) => !open && setImportDialogOpen(false)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>가져오기</AlertDialogTitle>
            <AlertDialogDescription>
              기존 데이터가 모두 교체됩니다
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>취소</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm}>
              확인
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}
