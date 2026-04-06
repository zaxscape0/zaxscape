import { NextRequest, NextResponse } from "next/server";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "";

const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 30_000; // 30 seconds

async function fetchFinnhubQuote(symbol: string) {
  const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub returned ${res.status}`);
  return res.json();
}

async function fetchFinnhubProfile(symbol: string) {
  const url = `https://finnhub.io/api/v1/stock/profile2?symbol=${encodeURIComponent(symbol)}&token=${FINNHUB_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  return res.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbols = searchParams.get("symbols")?.split(",") ?? [];

  if (symbols.length === 0) {
    return NextResponse.json({ error: "Missing symbols parameter" }, { status: 400 });
  }

  if (!FINNHUB_KEY) {
    return NextResponse.json({ error: "FINNHUB_API_KEY not configured" }, { status: 500 });
  }

  try {
    const results: Record<string, unknown> = {};

    // Process sequentially to respect rate limits (60/min)
    for (const symbol of symbols.slice(0, 20)) {
      const sym = symbol.trim().toUpperCase();
      const cacheKey = `quote:${sym}`;
      const cached = cache.get(cacheKey);

      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        results[sym] = cached.data;
        continue;
      }

      try {
        const [quote, profile] = await Promise.all([
          fetchFinnhubQuote(sym),
          fetchFinnhubProfile(sym),
        ]);

        // Finnhub quote: c=current, d=change, dp=change%, o=open, h=high, l=low, pc=prev close, t=timestamp
        if (!quote || quote.c === 0) {
          results[sym] = { error: "No data" };
          continue;
        }

        const parsed = {
          symbol: sym,
          name: profile?.name || sym,
          price: quote.c,
          previousClose: quote.pc,
          open: quote.o,
          high: quote.h,
          low: quote.l,
          change: quote.d,
          changePct: quote.dp,
          marketCap: profile?.marketCapitalization ? profile.marketCapitalization * 1_000_000 : null,
          currency: profile?.currency || "USD",
          exchange: profile?.exchange || "",
          industry: profile?.finnhubIndustry || "",
          logo: profile?.logo || "",
          // Keep these empty for backward compat — chart endpoint provides series data
          timestamps: [],
          closes: [],
          opens: [],
          highs: [],
          lows: [],
          volumes: [],
        };

        cache.set(cacheKey, { data: parsed, timestamp: Date.now() });
        results[sym] = parsed;
      } catch (e) {
        console.error(`Finnhub quote error for ${sym}:`, e);
        results[sym] = { error: `Failed to fetch ${sym}` };
      }
    }

    return NextResponse.json(results);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
