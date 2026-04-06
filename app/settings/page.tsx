"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Settings, MapPin, Database, Monitor, Bug, Info, Sun, Moon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const TARGET_TOWNS = [
  "Newton", "Wellesley", "Weston", "Dover", "Brookline",
  "Cambridge", "Somerville", "Quincy", "Framingham", "Waltham",
];

interface DataSource {
  name: string;
  status: "online" | "offline" | "degraded";
  lastRefreshed: string;
}

const DATA_SOURCES: DataSource[] = [
  { name: "Markets API (Yahoo Finance)", status: "online", lastRefreshed: "2026-04-05T21:30:00Z" },
  { name: "War Room Feed", status: "online", lastRefreshed: "2026-04-05T20:00:00Z" },
  { name: "Real Estate Scraper (Crexi)", status: "online", lastRefreshed: "2026-04-06T00:24:00Z" },
  { name: "Business Scraper (BFS)", status: "online", lastRefreshed: "2026-04-06T00:25:00Z" },
  { name: "Rates Data", status: "online", lastRefreshed: "2026-04-05T12:00:00Z" },
];

const STATUS_VARIANTS: Record<string, "up" | "down" | "warning"> = {
  online: "up",
  offline: "down",
  degraded: "warning",
};

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [density, setDensity] = useState<"compact" | "comfortable">("compact");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("zaxscape-density");
    if (saved === "comfortable") setDensity("comfortable");
  }, []);

  const toggleDensity = (d: "compact" | "comfortable") => {
    setDensity(d);
    localStorage.setItem("zaxscape-density", d);
  };

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold uppercase tracking-wider">Settings</h1>
      </div>

      {/* Geography */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <MapPin className="h-3 w-3" /> Geography
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Primary Zone</span>
            <span className="text-xs font-mono">Boston, MA · 100mi radius</span>
          </div>
          <div>
            <span className="text-xs text-muted-foreground">Target Towns</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {TARGET_TOWNS.map((town) => (
                <Badge key={town} variant="secondary">{town}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Database className="h-3 w-3" /> Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            {DATA_SOURCES.map((ds) => (
              <div key={ds.name} className="flex items-center justify-between py-1 border-b border-border/30 last:border-0">
                <span className="text-xs">{ds.name}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xxs text-muted-foreground">
                    {new Date(ds.lastRefreshed).toLocaleString()}
                  </span>
                  <Badge variant={STATUS_VARIANTS[ds.status]}>{ds.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Monitor className="h-3 w-3" /> Display
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs">Theme</span>
            {mounted && (
              <div className="flex gap-1">
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xxs transition-colors ${
                    theme === "dark" ? "bg-accent text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Moon className="h-3 w-3" /> Dark
                </button>
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-1 rounded-md border px-2 py-1 text-xxs transition-colors ${
                    theme === "light" ? "bg-accent text-foreground" : "text-muted-foreground"
                  }`}
                >
                  <Sun className="h-3 w-3" /> Light
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs">Density</span>
            <div className="flex gap-1">
              <button
                onClick={() => toggleDensity("compact")}
                className={`rounded-md border px-2 py-1 text-xxs transition-colors ${
                  density === "compact" ? "bg-accent text-foreground" : "text-muted-foreground"
                }`}
              >
                Compact
              </button>
              <button
                onClick={() => toggleDensity("comfortable")}
                className={`rounded-md border px-2 py-1 text-xxs transition-colors ${
                  density === "comfortable" ? "bg-accent text-foreground" : "text-muted-foreground"
                }`}
              >
                Comfortable
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scraper Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Bug className="h-3 w-3" /> Scraper Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between py-1 border-b border-border/30">
              <span className="text-xs">Real Estate Scraper</span>
              <div className="flex items-center gap-2">
                <span className="text-xxs text-muted-foreground font-mono">20 listings</span>
                <span className="text-xxs text-muted-foreground">Last: Apr 6, 2026</span>
                <Badge variant="up">OK</Badge>
              </div>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-xs">Business Scraper</span>
              <div className="flex items-center gap-2">
                <span className="text-xxs text-muted-foreground font-mono">90 listings</span>
                <span className="text-xxs text-muted-foreground">Last: Apr 6, 2026</span>
                <Badge variant="up">OK</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <Info className="h-3 w-3" /> About
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Version</span>
            <span className="text-xs font-mono">0.1.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Build Date</span>
            <span className="text-xs font-mono">2026-04-05</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Stack</span>
            <span className="text-xs font-mono">Next.js 14 · Supabase · Vercel</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
