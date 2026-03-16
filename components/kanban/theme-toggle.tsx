"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useKanbanStore } from "@/lib/store";

function getSystemTheme(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: "light" | "dark" | "system") {
  const resolved = theme === "system" ? getSystemTheme() : theme;
  document.documentElement.classList.toggle("dark", resolved === "dark");
}

export default function ThemeToggle() {
  const theme = useKanbanStore((s) => s.theme);
  const setTheme = useKanbanStore((s) => s.setTheme);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  function handleToggle() {
    const resolved = theme === "system" ? getSystemTheme() : theme;
    setTheme(resolved === "dark" ? "light" : "dark");
  }

  return (
    <Button variant="outline" size="sm" onClick={handleToggle} aria-label="다크모드 토글">
      {theme === "dark" || (theme === "system" && getSystemTheme() === "dark") ? "☀️" : "🌙"}
    </Button>
  );
}
