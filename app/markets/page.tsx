"use client";

import { useState } from "react";
import { useMarketData } from "@/lib/use-market-data";
import { IndexOverview, INDEX_SYMBOLS } from "@/components/markets/index-overview";
import { WatchlistTable } from "@/components/markets/watchlist-table";
import { StockDetail } from "@/components/markets/stock-detail";
import { EconomicIndicators } from "@/components/markets/economic-indicators";
import { RefreshCw } from "lucide-react";

const WATCHLIST_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "NVDA", "META", "TSLA", "BRK-B",
  "JPM", "V", "UNH", "XOM", "O", "SCHD", "VNQ", "SPY",
];

const ALL_SYMBOLS = [
  ...INDEX_SYMBOLS.map((s) => s.symbol),
  ...WATCHLIST_SYMBOLS,
];

export default function MarketsPage() {
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null);
  const { data, loading, error, refetch } = useMarketData(ALL_SYMBOLS, "1d", "5m");

  const selectedQuote = selectedSymbol ? data[selectedSymbol] : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-wider">Markets</h1>
        <button
          onClick={refetch}
          className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
        >
          <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 border border-destructive/20 px-3 py-2 text-xs text-red-400 font-mono">
          {error}
        </div>
      )}

      {/* Index Overview */}
      <section>
        <h2 className="mb-2 text-xxs font-medium uppercase tracking-wider text-muted-foreground">
          Major Indices
        </h2>
        <IndexOverview data={data} loading={loading} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main: Watchlist + Detail */}
        <div className="space-y-4 lg:col-span-2">
          <section>
            <h2 className="mb-2 text-xxs font-medium uppercase tracking-wider text-muted-foreground">
              Watchlist
            </h2>
            <WatchlistTable
              data={data}
              loading={loading}
              onSelectSymbol={setSelectedSymbol}
              selectedSymbol={selectedSymbol}
            />
          </section>

          {/* Stock Detail Panel */}
          {selectedQuote && !selectedQuote.error && (
            <section>
              <StockDetail
                quote={selectedQuote}
                onClose={() => setSelectedSymbol(null)}
              />
            </section>
          )}
        </div>

        {/* Sidebar: Economic Indicators */}
        <div>
          <h2 className="mb-2 text-xxs font-medium uppercase tracking-wider text-muted-foreground">
            Economic Data
          </h2>
          <EconomicIndicators />
        </div>
      </div>
    </div>
  );
}
