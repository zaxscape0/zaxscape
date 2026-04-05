"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/", shortcut: "1" },
  { name: "Markets", icon: TrendingUp, href: "/markets", shortcut: "2" },
  { name: "Portfolio", icon: Wallet, href: "/portfolio", shortcut: "3" },
  { name: "Rates", icon: Percent, href: "/rates", shortcut: "4" },
  { name: "Lenders", icon: Building2, href: "/lenders", shortcut: "5" },
  { name: "Businesses", icon: Store, href: "/businesses", shortcut: "6" },
  { name: "Real Estate", icon: Home, href: "/real-estate", shortcut: "7" },
  { name: "Deal Analyzer", icon: Calculator, href: "/deals", shortcut: "8" },
  { name: "Map", icon: Map, href: "/map", shortcut: "9" },
  { divider: true } as const,
  { name: "Alerts", icon: Bell, href: "/alerts" },
  { name: "Saved", icon: Bookmark, href: "/saved" },
  { name: "Notes", icon: StickyNote, href: "/notes" },
  { divider: true } as const,
  { name: "Settings", icon: Settings, href: "/settings" },
];

type NavItem =
  | { name: string; icon: React.ElementType; href: string; shortcut?: string; divider?: undefined }
  | { divider: true; name?: undefined; icon?: undefined; href?: undefined; shortcut?: undefined };

export function Sidebar() {
  const [collapsed, setCollapsed] = React.useState(false);
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex h-screen flex-col border-r bg-card transition-all duration-200",
        collapsed ? "w-12" : "w-48"
      )}
    >
      {/* Logo */}
      <div className="flex h-10 items-center border-b px-3">
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-foreground">
            ZAX<span className="text-primary">SCAPE</span>
          </span>
        )}
        {collapsed && (
          <span className="text-sm font-bold text-primary">Z</span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-1">
        {(navItems as NavItem[]).map((item, i) => {
          if (item.divider) {
            return (
              <div
                key={`div-${i}`}
                className="mx-2 my-1 h-px bg-border"
              />
            );
          }

          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href!);

          const linkContent = (
            <Link
              href={item.href!}
              className={cn(
                "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-xs transition-colors",
                isActive
                  ? "bg-accent text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.name}</span>
                  {item.shortcut && (
                    <kbd className="rounded bg-muted px-1 py-0.5 text-xxs font-mono text-muted-foreground">
                      {item.shortcut}
                    </kbd>
                  )}
                </>
              )}
            </Link>
          );

          if (collapsed) {
            return (
              <Tooltip key={item.href} delayDuration={0}>
                <TooltipTrigger asChild>
                  <div className="px-1 py-0.5">{linkContent}</div>
                </TooltipTrigger>
                <TooltipContent side="right" className="flex items-center gap-2">
                  {item.name}
                  {item.shortcut && (
                    <kbd className="rounded bg-muted px-1 py-0.5 text-xxs font-mono">
                      {item.shortcut}
                    </kbd>
                  )}
                </TooltipContent>
              </Tooltip>
            );
          }

          return (
            <div key={item.href} className="px-1 py-0.5">
              {linkContent}
            </div>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex h-8 items-center justify-center border-t text-muted-foreground hover:text-foreground"
      >
        {collapsed ? (
          <ChevronsRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronsLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}
