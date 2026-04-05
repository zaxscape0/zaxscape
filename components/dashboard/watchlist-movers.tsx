"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { watchlistMovers } from "@/lib/mock-data";
import { cn, formatPct, formatNumber } from "@/lib/utils";
import { TrendingUp } from "lucide-react";

export function WatchlistMovers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <TrendingUp className="h-3.5 w-3.5" />
          Watchlist Movers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {watchlistMovers.map((item) => {
            const isUp = item.changePct >= 0;
            return (
              <div
                key={item.symbol}
                className="flex items-center gap-2 rounded px-2 py-1 text-xs hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <span className="font-mono font-semibold w-12">
                  {item.symbol}
                </span>
                <span className="flex-1 text-muted-foreground truncate">
                  {item.name}
                </span>
                <span className="font-mono tabular-nums">
                  {formatNumber(item.price)}
                </span>
                <span
                  className={cn(
                    "font-mono tabular-nums w-16 text-right",
                    isUp ? "text-up" : "text-down"
                  )}
                >
                  {formatPct(item.changePct)}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
