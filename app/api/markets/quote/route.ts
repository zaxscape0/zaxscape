import { NextRequest, NextResponse } from "next/server";

// Simple in-memory cache
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 60_000; // 60 seconds

async function fetchYahooQuote(symbol: string, range = "1d", interval = "5m") {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${range}&interval=${interval}`;

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
  const symbols = searchParams.get("symbols")?.split(",") ?? [];
  const range = searchParams.get("range") ?? "1d";
  const interval = searchParams.get("interval") ?? "5m";

  if (symbols.length === 0) {
    return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
  }

  try {
    const results: Record<string, unknown> = {};

    await Promise.all(
      symbols.map(async (symbol) => {
        const cacheKey = `${symbol}:${range}:${interval}`;
        const cached = cache.get(cacheKey);

        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
          results[symbol] = cached.data;
          return;
        }

        try {
          const data = await fetchYahooQuote(symbol, range, interval);
          const chart = data?.chart?.result?.[0];

          if (!chart) {
            results[symbol] = { error: "No data" };
            return;
          }

          const meta = chart.meta;
          const quotes = chart.indicators?.quote?.[0] ?? {};
          const timestamps = chart.timestamp ?? [];

          const parsed = {
            symbol: meta.symbol,
            name: meta.shortName || meta.longName || symbol,
            price: meta.regularMarketPrice,
            previousClose: meta.chartPreviousClose ?? meta.previousClose,
            open: quotes.open?.[0],
            high: Math.max(...(quotes.high?.filter(Boolean) ?? [0])),
            low: Math.min(...(quotes.low?.filter((v: number | null) => v != null) ?? [Infinity])),
            volume: meta.regularMarketVolume,
            change: meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.previousClose),
            changePct: ((meta.regularMarketPrice - (meta.chartPreviousClose ?? meta.previousClose)) / (meta.chartPreviousClose ?? meta.previousClose)) * 100,
            marketCap: meta.marketCap,
            currency: meta.currency,
            exchange: meta.exchangeName,
            timestamps,
            closes: quotes.close ?? [],
            opens: quotes.open ?? [],
            highs: quotes.high ?? [],
            lows: quotes.low ?? [],
            volumes: quotes.volume ?? [],
          };

          cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
          results[symbol] = parsed;
        } catch (e) {
          console.error(e);
          results[symbol] = { error: `Failed to fetch ${symbol}` };
        }
      })
    );

    return NextResponse.json(results);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
