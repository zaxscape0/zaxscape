import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: unknown; timestamp: number }>();

const INTRADAY_RANGES = new Set(["1d", "5d"]);

function getCacheTTL(range: string): number {
  return INTRADAY_RANGES.has(range) ? 60_000 : 300_000;
}

// Map our range/interval params to Yahoo Finance format
const YAHOO_RANGE_MAP: Record<string, { range: string; interval: string }> = {
  "1d":  { range: "1d",  interval: "5m"  },
  "5d":  { range: "5d",  interval: "15m" },
  "1mo": { range: "1mo", interval: "1h"  },
  "3mo": { range: "3mo", interval: "1d"  },
  "6mo": { range: "6mo", interval: "1d"  },
  "ytd": { range: "ytd", interval: "1d"  },
  "1y":  { range: "1y",  interval: "1d"  },
  "5y":  { range: "5y",  interval: "1wk" },
};

const VALID_RANGES = new Set(Object.keys(YAHOO_RANGE_MAP));

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") ?? "1d";

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  if (!VALID_RANGES.has(range)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  const sym = symbol.toUpperCase();
  const cacheKey = `chart:${sym}:${range}`;
  const cached = cache.get(cacheKey);
  const ttl = getCacheTTL(range);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return NextResponse.json(cached.data);
  }

  try {
    const yahooParams = YAHOO_RANGE_MAP[range];
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(sym)}?range=${yahooParams.range}&interval=${yahooParams.interval}&includePrePost=false`;

    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
    });

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 502 });
    }

    const json = await res.json();
    const chartResult = json?.chart?.result?.[0];

    if (!chartResult) {
      return NextResponse.json({ error: "No data available" }, { status: 404 });
    }

    const meta = chartResult.meta;
    const timestamps: number[] = chartResult.timestamp ?? [];
    const indicators = chartResult.indicators?.quote?.[0] ?? {};

    const openSeries: (number | null)[] = indicators.open ?? [];
    const highSeries: (number | null)[] = indicators.high ?? [];
    const lowSeries: (number | null)[] = indicators.low ?? [];
    const closeSeries: (number | null)[] = indicators.close ?? [];
    const volumeSeries: (number | null)[] = indicators.volume ?? [];

    // Filter out null entries
    const validIndices: number[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (closeSeries[i] != null) validIndices.push(i);
    }

    const filteredTimestamps = validIndices.map((i) => timestamps[i]);
    const filteredOpen = validIndices.map((i) => openSeries[i]);
    const filteredHigh = validIndices.map((i) => highSeries[i]);
    const filteredLow = validIndices.map((i) => lowSeries[i]);
    const filteredClose = validIndices.map((i) => closeSeries[i]);
    const filteredVolume = validIndices.map((i) => volumeSeries[i]);

    const lastClose = filteredClose[filteredClose.length - 1] ?? 0;
    const previousClose = meta.chartPreviousClose ?? meta.previousClose ?? 0;
    const price = meta.regularMarketPrice ?? lastClose;
    const change = previousClose ? price - previousClose : 0;
    const changePct = previousClose ? (change / previousClose) * 100 : 0;

    // Compute session high/low from data
    const allHighs = filteredHigh.filter((v): v is number => v != null);
    const allLows = filteredLow.filter((v): v is number => v != null);
    const totalVolume = filteredVolume.reduce((a: number, b) => a + (b ?? 0), 0);

    const result = {
      symbol: sym,
      name: meta.longName || meta.shortName || sym,
      price,
      previousClose,
      open: meta.regularMarketDayLow != null ? filteredOpen[0] ?? 0 : 0,
      high: allHighs.length ? Math.max(...allHighs) : meta.regularMarketDayHigh ?? 0,
      low: allLows.length ? Math.min(...allLows) : meta.regularMarketDayLow ?? 0,
      volume: totalVolume,
      avgVolume: meta.averageDailyVolume3Month ?? 0,
      marketCap: meta.marketCap ?? 0,
      change,
      changePct,
      currency: meta.currency ?? "USD",
      exchange: meta.fullExchangeName ?? meta.exchangeName ?? "",
      timestamps: filteredTimestamps,
      open_series: filteredOpen,
      high_series: filteredHigh,
      low_series: filteredLow,
      close_series: filteredClose,
      volume_series: filteredVolume,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Chart API error:", e);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
