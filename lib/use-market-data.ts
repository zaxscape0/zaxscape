"use client";

import { useState, useEffect, useCallback } from "react";

export interface QuoteData {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  change: number;
  changePct: number;
  marketCap?: number;
  currency: string;
  exchange: string;
  timestamps: number[];
  closes: (number | null)[];
  opens: (number | null)[];
  highs: (number | null)[];
  lows: (number | null)[];
  volumes: (number | null)[];
  error?: string;
}

export function useMarketData(symbols: string[], range = "1d", interval = "5m", refreshInterval = 60000) {
  const [data, setData] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (symbols.length === 0) return;
    try {
      const res = await fetch(
        `/api/markets/quote?symbols=${symbols.join(",")}&range=${range}&interval=${interval}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (e) {
      console.error(e);
      setError("Failed to load market data");
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbols.join(","), range, interval]);

  useEffect(() => {
    fetchData();
    const timer = setInterval(fetchData, refreshInterval);
    return () => clearInterval(timer);
  }, [fetchData, refreshInterval]);

  return { data, loading, error, refetch: fetchData };
}
