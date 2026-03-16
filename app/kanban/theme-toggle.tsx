"use client";

import { useEffect, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("kanban-theme");
    if (saved === "dark") {
      setIsDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("kanban-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("kanban-theme", "light");
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={toggle}
        aria-label="다크모드 토글"
      />
      <Label htmlFor="theme-toggle">다크모드</Label>
    </div>
  );
}
