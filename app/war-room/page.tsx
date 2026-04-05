"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { RefreshCw, Radio, Wifi, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewsFeed } from "@/components/war-room/news-feed";
import { ConflictTracker } from "@/components/war-room/conflict-tracker";
import { ThreatIndicators } from "@/components/war-room/threat-indicators";

interface Headline {
  id: string;
  text: string;
  timestamp: string;
  url: string;
  source: string;
}

export default function WarRoomPage() {
  const [headlines, setHeadlines] = useState<Headline[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());
  const [feedSource, setFeedSource] = useState("");
  const prevIdsRef = useRef<Set<string>>(new Set());

  const fetchFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/war-room/feed");
      const data = await res.json();
      const fetched: Headline[] = data.headlines || [];

      // Detect new headlines
      const currentIds = new Set(fetched.map((h) => h.id));
      if (prevIdsRef.current.size > 0) {
        const fresh = new Set(
          fetched
            .filter((h) => !prevIdsRef.current.has(h.id))
            .map((h) => h.id)
        );
        setNewIds(fresh);
        // Clear flash after 5s
        if (fresh.size > 0) {
          setTimeout(() => setNewIds(new Set()), 5000);
        }
      }
      prevIdsRef.current = currentIds;

      setHeadlines(fetched);
      setLastUpdated(new Date());
      setFeedSource(data.source || "");
    } catch (err) {
      console.error("[War Room] Feed fetch failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchFeed, 60_000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchFeed]);

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden">
      {/* Header with CRT effect */}
      <header className="relative border-b border-zinc-800 bg-zinc-950 px-4 py-3 shrink-0">
        {/* Subtle scanline overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.1) 2px, rgba(255,255,255,0.1) 4px)",
          }}
        />
        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Pulsing red dot */}
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <div>
              <h1 className="text-lg font-bold font-mono tracking-wider text-zinc-100">
                WAR ROOM
              </h1>
              <p className="text-[10px] font-mono text-zinc-500 tracking-wide">
                GEOPOLITICAL INTELLIGENCE • SOURCE: @DeItaone
                {feedSource && feedSource !== "Mock" && (
                  <span className="text-zinc-600"> via {feedSource}</span>
                )}
                {feedSource === "Mock" && (
                  <span className="text-amber-600"> • SIMULATED DATA</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Last updated */}
            {lastUpdated && (
              <span className="text-[10px] font-mono text-zinc-600">
                UPD {lastUpdated.toLocaleTimeString()}
              </span>
            )}

            {/* Auto-refresh toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-mono transition-colors border",
                autoRefresh
                  ? "border-green-500/30 bg-green-500/10 text-green-400"
                  : "border-zinc-700 bg-zinc-800 text-zinc-500"
              )}
            >
              {autoRefresh ? (
                <Wifi className="h-3 w-3" />
              ) : (
                <WifiOff className="h-3 w-3" />
              )}
              {autoRefresh ? "LIVE" : "PAUSED"}
            </button>

            {/* Manual refresh */}
            <button
              onClick={() => {
                setLoading(true);
                fetchFeed();
              }}
              className="flex items-center gap-1 px-2 py-1 rounded text-[10px] font-mono border border-zinc-700 bg-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600 transition-colors"
            >
              <RefreshCw
                className={cn("h-3 w-3", loading && "animate-spin")}
              />
              REFRESH
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* News Feed — main column */}
        <div className="flex-1 overflow-y-auto border-r border-zinc-800">
          <div className="sticky top-0 bg-zinc-950/90 backdrop-blur-sm border-b border-zinc-800/50 px-3 py-1.5 z-10">
            <div className="flex items-center gap-2">
              <Radio className="h-3 w-3 text-red-500" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">
                Live Feed — {headlines.length} headlines
              </span>
            </div>
          </div>
          {loading && headlines.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-5 w-5 animate-spin text-zinc-600 mx-auto mb-2" />
                <p className="text-[10px] font-mono text-zinc-600">
                  ESTABLISHING DATA LINK...
                </p>
              </div>
            </div>
          ) : (
            <NewsFeed headlines={headlines} newIds={newIds} />
          )}
        </div>

        {/* Right sidebar — Conflicts + Indicators */}
        <div className="w-72 shrink-0 overflow-y-auto bg-zinc-950 p-3 space-y-4">
          <ConflictTracker headlines={headlines} />
          <div className="h-px bg-zinc-800" />
          <ThreatIndicators />
        </div>
      </div>
    </div>
  );
}
