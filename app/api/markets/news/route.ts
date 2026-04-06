import { NextRequest, NextResponse } from "next/server";

const FINNHUB_KEY = process.env.FINNHUB_API_KEY || "";

const cache: Record<string, { data: NewsItem[]; fetchedAt: number }> = {};
const CACHE_TTL = 300_000; // 5 min

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  summary?: string;
  image?: string;
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  if (!FINNHUB_KEY) {
    return NextResponse.json({ error: "FINNHUB_API_KEY not configured" }, { status: 500 });
  }

  const sym = symbol.toUpperCase().replace("^", "");

  if (cache[sym] && Date.now() - cache[sym].fetchedAt < CACHE_TTL) {
    return NextResponse.json({ news: cache[sym].data, cached: true });
  }

  try {
    // Get date range: last 7 days
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 7 * 86400000).toISOString().split("T")[0];

    const res = await fetch(
      `https://finnhub.io/api/v1/company-news?symbol=${encodeURIComponent(sym)}&from=${from}&to=${to}&token=${FINNHUB_KEY}`
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch news" }, { status: 502 });
    }

    const articles = await res.json();

    const news: NewsItem[] = (articles || []).slice(0, 8).map(
      (a: { headline: string; url: string; source: string; datetime: number; summary: string; image: string }) => ({
        title: a.headline,
        url: a.url,
        source: a.source,
        publishedAt: new Date(a.datetime * 1000).toISOString(),
        summary: a.summary?.substring(0, 200),
        image: a.image,
      })
    );

    cache[sym] = { data: news, fetchedAt: Date.now() };
    return NextResponse.json({ news, cached: false });
  } catch (e) {
    console.error("Finnhub news error:", e);
    return NextResponse.json({ error: "Failed to fetch news" }, { status: 500 });
  }
}
