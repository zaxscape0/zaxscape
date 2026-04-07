"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { formatPct, formatNumber } from "@/lib/utils";

interface FuturesQuote {
  symbol: string;
  name: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
}

function Skeleton() {
  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2 min-w-[180px] animate-pulse">
      <div className="flex-1 space-y-1.5">
        <div className="h-3 w-16 rounded bg-muted" />
        <div className="h-4 w-20 rounded bg-muted" />
        <div className="h-3 w-12 rounded bg-muted" />
      </div>
    </div>
  );
}

function LiveMarketCard({ data }: { data: FuturesQuote }) {
  const isUp = (data.changePct ?? 0) >= 0;
  const priceDecimals = !data.price
    ? 2
    : data.price < 100
      ? 3
      : 2;

  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2 min-w-[180px]">
      <div className="flex-1 min-w-0">
        <div className="text-xxs font-medium text-muted-foreground truncate">
          {data.name}
        </div>
        <div className="font-mono text-sm font-semibold tabular-nums">
          {data.price != null ? formatNumber(data.price, priceDecimals) : "—"}
        </div>
        <div
          className={cn(
            "font-mono text-xxs tabular-nums",
            isUp ? "text-up" : "text-down"
          )}
        >
          {data.changePct != null ? formatPct(data.changePct) : "—"}
        </div>
      </div>
      {/* Live indicator dot */}
      <div className={cn(
        "h-1.5 w-1.5 rounded-full shrink-0",
        isUp ? "bg-up" : "bg-down"
      )} />
    </div>
  );
}

export function LiveMarkets() {
  const [quotes, setQuotes] = useState<FuturesQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchFutures() {
      try {
        const res = await fetch("/api/markets/futures");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (mounted && Array.isArray(data)) {
          setQuotes(data);
        }
      } catch (e) {
        console.error("Failed to fetch futures:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchFutures();
    // Refresh every 30 seconds
    const interval = setInterval(fetchFutures, 30_000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} />
        ))}
      </div>
    );
  }

  if (quotes.length === 0) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        Market data unavailable
      </div>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {quotes.map((q) => (
        <LiveMarketCard key={q.symbol} data={q} />
      ))}
    </div>
  );
}
