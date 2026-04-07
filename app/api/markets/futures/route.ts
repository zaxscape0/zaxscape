import { NextResponse } from "next/server";

/**
 * Live market futures via Yahoo Finance v8 chart API.
 * Returns an array of { symbol, name, price, change, changePct }.
 * Cached server-side for 30s.
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

async function fetchChart(yahooSymbol: string) {
  const url = `https://query2.finance.yahoo.com/v8/finance/chart/${yahooSymbol}?range=1d&interval=5m`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });
  if (!res.ok) return null;
  const json = await res.json();
  const meta = json?.chart?.result?.[0]?.meta;
  if (!meta) return null;
  return {
    price: meta.regularMarketPrice ?? null,
    previousClose: meta.chartPreviousClose ?? meta.previousClose ?? null,
  };
}

export async function GET() {
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  try {
    const results = await Promise.all(
      SYMBOLS.map(async (sym) => {
        try {
          const data = await fetchChart(sym.yahoo);
          if (!data || data.price == null) {
            return {
              symbol: sym.display,
              name: sym.name,
              price: null,
              change: null,
              changePct: null,
            };
          }
          const change =
            data.previousClose != null
              ? data.price - data.previousClose
              : null;
          const changePct =
            change != null && data.previousClose
              ? (change / data.previousClose) * 100
              : null;
          return {
            symbol: sym.display,
            name: sym.name,
            price: data.price,
            change: change != null ? Math.round(change * 100) / 100 : null,
            changePct:
              changePct != null ? Math.round(changePct * 100) / 100 : null,
          };
        } catch {
          return {
            symbol: sym.display,
            name: sym.name,
            price: null,
            change: null,
            changePct: null,
          };
        }
      })
    );

    cached = { data: results, timestamp: Date.now() };
    return NextResponse.json(results);
  } catch (e) {
    console.error("Futures fetch error:", e);
    return NextResponse.json(
      { error: "Failed to fetch futures" },
      { status: 500 }
    );
  }
}
