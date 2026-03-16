"use client";

import { KanbanBoard } from "./kanban-board";
import { ThemeToggle } from "./theme-toggle";

export default function KanbanPage() {
  return (
    <main className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Kanban Board</h1>
        <ThemeToggle />
      </div>
      <KanbanBoard />
    </main>
  );
}
