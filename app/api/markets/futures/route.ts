import { NextResponse } from "next/server";

/**
 * Live market futures via Yahoo Finance v8 API (no key required).
 * Returns an array of { symbol, name, price, change, changePct }.
 * Cached server-side for 30s to avoid hammering Yahoo.
 */

const SYMBOLS = [
  { yahoo: "ES=F", name: "S&P 500", display: "ES" },
  { yahoo: "NQ=F", name: "Nasdaq 100", display: "NQ" },
  { yahoo: "YM=F", name: "Dow", display: "YM" },
  { yahoo: "RTY=F", name: "Russell 2K", display: "RTY" },
  { yahoo: "%5EVIX", name: "VIX", display: "VIX" },
  { yahoo: "%5ETNX", name: "10Y Yield", display: "TNX" },
  { yahoo: "BTC-USD", name: "Bitcoin", display: "BTC" },
  { yahoo: "GC=F", name: "Gold", display: "GC" },
  { yahoo: "CL=F", name: "Oil (WTI)", display: "CL" },
];

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

let cached: CacheEntry | null = null;
const CACHE_TTL = 30_000;

export async function GET() {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const symbolStr = SYMBOLS.map((s) => s.yahoo).join(",");
    const url = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbolStr}&fields=regularMarketPrice,regularMarketChange,regularMarketChangePercent,regularMarketPreviousClose`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      console.error(`Yahoo Finance returned ${res.status}`);
      return NextResponse.json({ error: "Upstream error" }, { status: 502 });
    }

    const json = await res.json();
    const quotes = json?.quoteResponse?.result ?? [];

    const results = SYMBOLS.map((sym) => {
      const raw = sym.yahoo.replace("%5E", "^");
      const q = quotes.find(
        (r: Record<string, unknown>) => r.symbol === raw
      );
      if (!q) {
        return {
          symbol: sym.display,
          name: sym.name,
          price: null,
          change: null,
          changePct: null,
        };
      }
      return {
        symbol: sym.display,
        name: sym.name,
        price: q.regularMarketPrice ?? null,
        change: q.regularMarketChange ?? null,
        changePct: q.regularMarketChangePercent ?? null,
      };
    });

    cached = { data: results, timestamp: Date.now() };
    return NextResponse.json(results);
  } catch (e) {
    console.error("Futures fetch error:", e);
    return NextResponse.json({ error: "Failed to fetch futures" }, { status: 500 });
  }
}
