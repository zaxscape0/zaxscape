import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { AppShell } from "@/components/layout/app-shell";
import { SavedProvider } from "@/lib/saved-store";
import { NotesProvider } from "@/lib/notes-store";
import { PortfolioProvider } from "@/lib/portfolio-store";
import { AlertsProvider } from "@/lib/alerts-store";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "ZaxScape — Financial Command Center",
  description: "Personal financial command center & local market intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            <AuthProvider>
              <SavedProvider>
                <NotesProvider>
                  <PortfolioProvider>
                    <AlertsProvider>
                      <AppShell>{children}</AppShell>
                    </AlertsProvider>
                  </PortfolioProvider>
                </NotesProvider>
              </SavedProvider>
            </AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
