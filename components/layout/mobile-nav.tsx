"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  TrendingUp,
  Wallet,
  Calculator,
  MoreHorizontal,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";

const mobileNavItems = [
  { name: "Dashboard", icon: LayoutDashboard, href: "/" },
  { name: "Markets", icon: TrendingUp, href: "/markets" },
  { name: "Portfolio", icon: Wallet, href: "/portfolio" },
  { name: "Deals", icon: Calculator, href: "/deals" },
];

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {mobileNavItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs transition-colors",
                isActive
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.name}</span>
            </Link>
          );
        })}

        {/* More button that opens full sidebar */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 rounded-md px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <MoreHorizontal className="h-5 w-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-80 p-0">
            <div className="h-full">
              <Sidebar isMobile />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}