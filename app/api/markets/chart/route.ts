import { NextRequest, NextResponse } from "next/server";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "";

const cache = new Map<string, { data: unknown; timestamp: number }>();

const INTRADAY_RANGES = new Set(["1d", "5d"]);

function getCacheTTL(range: string): number {
  return INTRADAY_RANGES.has(range) ? 60_000 : 300_000;
}

// Map our range param to Finnhub resolution + from/to timestamps
function getRangeParams(range: string): { resolution: string; from: number; to: number } {
  const now = Math.floor(Date.now() / 1000);
  const day = 86400;

  switch (range) {
    case "1d":
      return { resolution: "5", from: now - day, to: now };
    case "5d":
      return { resolution: "15", from: now - 5 * day, to: now };
    case "1mo":
      return { resolution: "60", from: now - 30 * day, to: now };
    case "3mo":
      return { resolution: "D", from: now - 90 * day, to: now };
    case "6mo":
      return { resolution: "D", from: now - 180 * day, to: now };
    case "ytd": {
      const jan1 = Math.floor(new Date(new Date().getFullYear(), 0, 1).getTime() / 1000);
      return { resolution: "D", from: jan1, to: now };
    }
    case "1y":
      return { resolution: "D", from: now - 365 * day, to: now };
    case "5y":
      return { resolution: "W", from: now - 5 * 365 * day, to: now };
    default:
      return { resolution: "D", from: now - 30 * day, to: now };
  }
}

const VALID_RANGES = new Set(["1d", "5d", "1mo", "3mo", "6mo", "ytd", "1y", "5y"]);

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

  if (!FINNHUB_KEY) {
    return NextResponse.json({ error: "FINNHUB_API_KEY not configured" }, { status: 500 });
  }

  const sym = symbol.toUpperCase();
  const cacheKey = `chart:${sym}:${range}`;
  const cached = cache.get(cacheKey);
  const ttl = getCacheTTL(range);

  if (cached && Date.now() - cached.timestamp < ttl) {
    return NextResponse.json(cached.data);
  }

  try {
    const { resolution, from, to } = getRangeParams(range);

    // Fetch candles + quote in parallel
    const [candleRes, quoteRes] = await Promise.all([
      fetch(
        `https://finnhub.io/api/v1/stock/candle?symbol=${encodeURIComponent(sym)}&resolution=${resolution}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
      ),
      fetch(
        `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${FINNHUB_KEY}`
      ),
    ]);

    if (!candleRes.ok) {
      return NextResponse.json({ error: "Failed to fetch candle data" }, { status: 502 });
    }

    const candle = await candleRes.json();
    const quote = quoteRes.ok ? await quoteRes.json() : {};

    if (candle.s === "no_data" || !candle.t) {
      return NextResponse.json({ error: "No data available" }, { status: 404 });
    }

    const result = {
      symbol: sym,
      name: sym,
      price: quote.c || candle.c?.[candle.c.length - 1] || 0,
      previousClose: quote.pc || 0,
      open: quote.o || candle.o?.[0] || 0,
      high: quote.h || Math.max(...(candle.h || [0])),
      low: quote.l || Math.min(...(candle.l || [Infinity])),
      volume: candle.v?.reduce((a: number, b: number) => a + b, 0) || 0,
      change: quote.d || 0,
      changePct: quote.dp || 0,
      currency: "USD",
      exchange: "",
      timestamps: candle.t,
      open_series: candle.o,
      high_series: candle.h,
      low_series: candle.l,
      close_series: candle.c,
      volume_series: candle.v,
    };

    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (e) {
    console.error("Chart API error:", e);
    return NextResponse.json({ error: "Failed to fetch chart data" }, { status: 500 });
  }
}
