"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

const NAV_SHORTCUTS: Record<string, string> = {
  "1": "/",
  "2": "/markets",
  "3": "/portfolio",
  "4": "/rates",
  "5": "/lenders",
  "6": "/businesses",
  "7": "/real-estate",
  "8": "/deals",
  "9": "/map",
};

const SHORTCUT_HELP = [
  { keys: "1–9", description: "Navigate sidebar modules" },
  { keys: "⌘K / Ctrl+K", description: "Open command palette" },
  { keys: "Esc", description: "Close modals & panels" },
  { keys: "R", description: "Refresh current page data" },
  { keys: "/", description: "Focus search" },
  { keys: "?", description: "Show this help" },
];

export function KeyboardShortcuts() {
  const router = useRouter();
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.tagName === "SELECT" || target.isContentEditable;

      // ? for help - works everywhere except inputs
      if (e.key === "?" && !isInput) {
        e.preventDefault();
        setShowHelp((prev) => !prev);
        return;
      }

      // Esc to close
      if (e.key === "Escape") {
        setShowHelp(false);
        return;
      }

      // Don't intercept when typing in inputs
      if (isInput) return;

      // Number keys for navigation
      if (NAV_SHORTCUTS[e.key] && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        router.push(NAV_SHORTCUTS[e.key]);
        return;
      }

      // R to refresh
      if (e.key === "r" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        // Dispatch a custom event that pages can listen to
        window.dispatchEvent(new CustomEvent("zaxscape:refresh"));
        return;
      }

      // / to focus search
      if (e.key === "/" && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        const searchInput = document.querySelector<HTMLInputElement>('[data-search-input]');
        if (searchInput) {
          searchInput.focus();
        }
        return;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  if (!showHelp) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowHelp(false)}>
      <div className="w-full max-w-sm rounded-md border bg-card p-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold">Keyboard Shortcuts</h2>
          <button onClick={() => setShowHelp(false)} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="space-y-1.5">
          {SHORTCUT_HELP.map((s) => (
            <div key={s.keys} className="flex items-center justify-between py-1">
              <span className="text-xs text-muted-foreground">{s.description}</span>
              <kbd className="rounded bg-muted px-1.5 py-0.5 text-xxs font-mono text-muted-foreground">
                {s.keys}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
