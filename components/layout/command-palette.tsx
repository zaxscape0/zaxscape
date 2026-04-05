"use client";

import * as React from "react";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Percent,
  Building2,
  Store,
  Home,
  Calculator,
  Map,
  Bell,
  Bookmark,
  StickyNote,
  Settings,
  Plus,
  Search,
} from "lucide-react";

const modules = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", shortcut: "D" },
  { name: "Markets", icon: TrendingUp, href: "/markets", shortcut: "M" },
  { name: "Portfolio", icon: Wallet, href: "/portfolio", shortcut: "P" },
  { name: "Rates", icon: Percent, href: "/rates", shortcut: "R" },
  { name: "Lenders", icon: Building2, href: "/lenders", shortcut: "L" },
  { name: "Businesses", icon: Store, href: "/businesses", shortcut: "B" },
  { name: "Real Estate", icon: Home, href: "/real-estate", shortcut: "E" },
  { name: "Deal Analyzer", icon: Calculator, href: "/deals", shortcut: "A" },
  { name: "Map", icon: Map, href: "/map" },
  { name: "Alerts", icon: Bell, href: "/alerts" },
  { name: "Saved", icon: Bookmark, href: "/saved" },
  { name: "Notes", icon: StickyNote, href: "/notes" },
  { name: "Settings", icon: Settings, href: "/settings" },
];

const quickActions = [
  { name: "Analyze Deal", icon: Calculator, action: "analyze-deal" },
  { name: "Add Listing", icon: Plus, action: "add-listing" },
  { name: "Add Rate", icon: Percent, action: "add-rate" },
  { name: "New Note", icon: StickyNote, action: "new-note" },
];

export function CommandPalette() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = React.useCallback(
    (command: () => void) => {
      setOpen(false);
      command();
    },
    []
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setOpen(false)}
      />
      <div className="fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2">
        <Command
          className="rounded-lg border bg-popover text-popover-foreground shadow-2xl"
          loop
        >
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <Command.Input
              placeholder="Search modules, tickers, actions..."
              className="flex h-10 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-1">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>
            <Command.Group
              heading="Navigation"
              className="px-1 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {modules.map((mod) => (
                <Command.Item
                  key={mod.href}
                  value={mod.name}
                  onSelect={() => runCommand(() => router.push(mod.href))}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  <mod.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{mod.name}</span>
                  {mod.shortcut && (
                    <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-xxs font-mono text-muted-foreground">
                      {mod.shortcut}
                    </kbd>
                  )}
                </Command.Item>
              ))}
            </Command.Group>
            <Command.Separator className="mx-1 my-1 h-px bg-border" />
            <Command.Group
              heading="Quick Actions"
              className="px-1 py-1.5 text-xs font-medium text-muted-foreground"
            >
              {quickActions.map((action) => (
                <Command.Item
                  key={action.action}
                  value={action.name}
                  onSelect={() =>
                    runCommand(() => {
                      // TODO: implement quick actions
                      console.log("Action:", action.action);
                    })
                  }
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm aria-selected:bg-accent"
                >
                  <action.icon className="h-4 w-4 text-muted-foreground" />
                  <span>{action.name}</span>
                </Command.Item>
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}
