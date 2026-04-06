"use client";

import { QuoteData } from "@/lib/use-market-data";
import { formatNumber, formatPercent, formatVolume } from "@/lib/format";

interface IndexOverviewProps {
  data: Record<string, QuoteData>;
  loading: boolean;
}

const INDEX_SYMBOLS = [
  { symbol: "SPY", label: "S&P 500" },
  { symbol: "QQQ", label: "Nasdaq" },
  { symbol: "DIA", label: "Dow Jones" },
  { symbol: "IWM", label: "Russell 2K" },
  { symbol: "TLT", label: "20Y Treasury" },
  { symbol: "UVXY", label: "VIX" },
];

export function IndexOverview({ data, loading }: IndexOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {INDEX_SYMBOLS.map((idx) => (
          <div
            key={idx.symbol}
            className="rounded-md border bg-card p-3 animate-pulse"
          >
            <div className="h-3 w-16 bg-muted rounded mb-2" />
            <div className="h-5 w-20 bg-muted rounded mb-1" />
            <div className="h-3 w-12 bg-muted rounded" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
      {INDEX_SYMBOLS.map((idx) => {
        const quote = data[idx.symbol];
        if (!quote || quote.error) {
          return (
            <div key={idx.symbol} className="rounded-md border bg-card p-3">
              <p className="text-xxs text-muted-foreground">{idx.label}</p>
              <p className="text-xs text-muted-foreground mt-1">No data</p>
            </div>
          );
        }

        const isUp = quote.change >= 0;
        const colorClass = isUp ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]";

        return (
          <div key={idx.symbol} className="rounded-md border bg-card p-3">
            <p className="text-xxs font-medium text-muted-foreground uppercase tracking-wider">
              {idx.label}
            </p>
            <p className="mt-1 text-base font-bold tabular-nums font-mono">
              {formatNumber(quote.price, 2)}
            </p>
            <div className="mt-0.5 flex items-center gap-2">
              <span className={`text-xs font-mono tabular-nums ${colorClass}`}>
                {isUp ? "+" : ""}
                {formatNumber(quote.change, 2)}
              </span>
              <span className={`text-xs font-mono tabular-nums ${colorClass}`}>
                ({formatPercent(quote.changePct)})
              </span>
            </div>
            <div className="mt-1.5 grid grid-cols-2 gap-x-2 text-xxs text-muted-foreground tabular-nums font-mono">
              <div>O: {formatNumber(quote.open, 2)}</div>
              <div>H: {formatNumber(quote.high, 2)}</div>
              <div>L: {formatNumber(quote.low, 2)}</div>
              <div>V: {formatVolume(quote.volume)}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export { INDEX_SYMBOLS };
