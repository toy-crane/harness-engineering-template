"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useKanbanStore } from "@/lib/store";

interface AddCardFormProps {
  columnTitle: string;
}

export default function AddCardForm({ columnTitle }: AddCardFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");
  const addCard = useKanbanStore((s) => s.addCard);

  function handleConfirm() {
    try {
      addCard(columnTitle, title);
      setTitle("");
      setError("");
      setIsOpen(false);
    } catch (e) {
      setError((e as Error).message);
    }
  }

  function handleCancel() {
    setTitle("");
    setError("");
    setIsOpen(false);
  }

  if (!isOpen) {
    return (
      <Button variant="ghost" size="sm" className="w-full" onClick={() => setIsOpen(true)}>
        추가
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        placeholder="제목을 입력하세요"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleConfirm();
          if (e.key === "Escape") handleCancel();
        }}
        autoFocus
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
      <div className="flex gap-2">
        <Button size="sm" onClick={handleConfirm}>
          확인
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          취소
        </Button>
      </div>
    </div>
  );
}
