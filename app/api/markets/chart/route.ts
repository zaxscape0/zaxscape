import { NextRequest, NextResponse } from "next/server";

const cache = new Map<string, { data: unknown; timestamp: number }>();

const INTRADAY_RANGES = new Set(["1d", "5d"]);

function getCacheTTL(range: string): number {
  return INTRADAY_RANGES.has(range) ? 60_000 : 300_000;
}

const VALID_RANGES = new Set(["1d", "5d", "1mo", "3mo", "6mo", "ytd", "1y", "5y"]);
const VALID_INTERVALS = new Set(["1m", "2m", "5m", "15m", "30m", "60m", "1h", "1d", "1wk", "1mo"]);

async function fetchYahooChart(symbol: string, range: string, interval: string) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}&includePrePost=false`;

  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    },
  });

  if (!res.ok) {
    throw new Error(`Yahoo Finance returned ${res.status}`);
  }

  return res.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol");
  const range = searchParams.get("range") ?? "1d";
  const interval = searchParams.get("interval") ?? "5m";

  if (!symbol) {
    return NextResponse.json({ error: "Missing symbol parameter" }, { status: 400 });
  }

  if (!VALID_RANGES.has(range)) {
    return NextResponse.json({ error: "Invalid range" }, { status: 400 });
  }

  if (!VALID_INTERVALS.has(interval)) {
    return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
  }

  const cacheKey = `chart:${symbol}:${range}:${interval}`;
  const cached = cache.get(cacheKey);
  const ttl = getCacheTTL(range);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return NextResponse.json(cached.data);
  }

  try {
    const data = await fetchYahooChart(symbol, range, interval);
    const chart = data?.chart?.result?.[0];

    if (!chart) {
      return NextResponse.json({ error: "No data available" }, { status: 404 });
    }

    const meta = chart.meta;
    const quotes = chart.indicators?.quote?.[0] ?? {};
    const timestamps: number[] = chart.timestamp ?? [];

    const result = {
      symbol: meta.symbol,
      name: meta.shortName || meta.longName || symbol,
      price: meta.regularMarketPrice,
      previousClose: meta.chartPreviousClose ?? meta.previousClose,
      open: meta.regularMarketOpen,
      high: meta.regularMarketDayHigh,
      low: meta.regularMarketDayLow,
      volume: meta.regularMarketVolume,
      avgVolume: meta.averageDailyVolume3Month,
      marketCap: meta.marketCap,
      currency: meta.currency,
      exchange: meta.exchangeName,
      change: meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.previousClose),
      changePct:
        ((meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.previousClose)) /
          (meta.chartPreviousClose ?? meta.previousClose)) *
        100,
      timestamps,
      open_series: quotes.open ?? [],
      high_series: quotes.high ?? [],
      low_series: quotes.low ?? [],
      close_series: quotes.close ?? [],
      volume_series: quotes.volume ?? [],
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });

    return NextResponse.json(result);
  } catch (e) {
    console.error("Chart API error:", e);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
