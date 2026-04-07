"use client";

import { usePathname } from "next/navigation";
import { AuthGuard } from "@/components/layout/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/topbar";
import { CommandPalette } from "@/components/layout/command-palette";
import { KeyboardShortcuts } from "@/components/layout/keyboard-shortcuts";
import { MobileNav } from "@/components/layout/mobile-nav";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar - hidden on mobile */}
        <div className="hidden md:block">
          <Sidebar />
        </div>
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <TopBar />
          <main className="flex-1 overflow-y-auto p-3 pb-16 md:pb-3">
            {children}
          </main>
        </div>
      </div>
      
      {/* Mobile bottom navigation - hidden on desktop */}
      <MobileNav />
      
      <CommandPalette />
      <KeyboardShortcuts />
    </AuthGuard>
  );
}
