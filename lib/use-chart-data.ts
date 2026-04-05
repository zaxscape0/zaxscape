"use client";

import { useState, useEffect, useCallback } from "react";

export interface ChartDataPoint {
  timestamp: number;
  time: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
}

export interface ChartResponse {
  symbol: string;
  name: string;
  price: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  avgVolume: number;
  marketCap: number;
  currency: string;
  exchange: string;
  change: number;
  changePct: number;
  data: ChartDataPoint[];
}

export type TimeRange = "1D" | "5D" | "1M" | "3M" | "6M" | "YTD" | "1Y" | "5Y";

export const RANGE_CONFIG: Record<TimeRange, { range: string; interval: string }> = {
  "1D": { range: "1d", interval: "5m" },
  "5D": { range: "5d", interval: "15m" },
  "1M": { range: "1mo", interval: "1h" },
  "3M": { range: "3mo", interval: "1d" },
  "6M": { range: "6mo", interval: "1d" },
  "YTD": { range: "ytd", interval: "1d" },
  "1Y": { range: "1y", interval: "1d" },
  "5Y": { range: "5y", interval: "1wk" },
};

function formatTimeLabel(ts: number, timeRange: TimeRange): string {
  const d = new Date(ts * 1000);
  if (timeRange === "1D") {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  if (timeRange === "5D") {
    return d.toLocaleDateString("en-US", { weekday: "short", hour: "numeric", minute: "2-digit" });
  }
  if (timeRange === "1M" || timeRange === "3M") {
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" });
}

export function useChartData(symbol: string | null, timeRange: TimeRange) {
  const [data, setData] = useState<ChartResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChart = useCallback(async () => {
    if (!symbol) return;
    setLoading(true);
    setError(null);

    const config = RANGE_CONFIG[timeRange];

    try {
      const res = await fetch(
        `/api/markets/chart?symbol=${encodeURIComponent(symbol)}&range=${config.range}&interval=${config.interval}`
      );
      if (!res.ok) throw new Error("Failed to fetch chart data");
      const json = await res.json();

      const points: ChartDataPoint[] = (json.timestamps as number[]).map(
        (ts: number, i: number) => ({
          timestamp: ts,
          time: formatTimeLabel(ts, timeRange),
          open: json.open_series[i] ?? null,
          high: json.high_series[i] ?? null,
          low: json.low_series[i] ?? null,
          close: json.close_series[i] ?? null,
          volume: json.volume_series[i] ?? null,
        })
      ).filter((p: ChartDataPoint) => p.close != null);

      setData({
        symbol: json.symbol,
        name: json.name,
        price: json.price,
        previousClose: json.previousClose,
        open: json.open,
        high: json.high,
        low: json.low,
        volume: json.volume,
        avgVolume: json.avgVolume,
        marketCap: json.marketCap,
        currency: json.currency,
        exchange: json.exchange,
        change: json.change,
        changePct: json.changePct,
        data: points,
      });
    } catch (e) {
      console.error(e);
      setError("Failed to load chart data");
    } finally {
      setLoading(false);
    }
  }, [symbol, timeRange]);

  useEffect(() => {
    fetchChart();
    // Refresh intraday every 60s
    const isIntraday = timeRange === "1D" || timeRange === "5D";
    const refreshMs = isIntraday ? 60_000 : 300_000;
    const timer = setInterval(fetchChart, refreshMs);
    return () => clearInterval(timer);
  }, [fetchChart, timeRange]);

  return { data, loading, error, refetch: fetchChart };
}
