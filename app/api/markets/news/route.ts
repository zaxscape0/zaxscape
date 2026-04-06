import { NextRequest, NextResponse } from "next/server";

// Cache news per symbol for 5 minutes
const cache: Record<string, { data: NewsItem[]; fetchedAt: number }> = {};
const CACHE_TTL = 300_000;

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

function parseRSSItems(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = extractTag(content, "title");
    const link = extractTag(content, "link");
    const pubDate = extractTag(content, "pubDate");
    if (title && link) {
      items.push({
        title: title.replace(/<[^>]+>/g, "").trim(),
        url: link,
        source,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
      });
    }
  }
  return items;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`);
  const m = regex.exec(xml);
  return m ? m[1].trim() : "";
}

export async function GET(req: NextRequest) {
  const symbol = req.nextUrl.searchParams.get("symbol");
  if (!symbol) {
    return NextResponse.json({ error: "symbol required" }, { status: 400 });
  }

  const sym = symbol.toUpperCase().replace("^", "");

  // Check cache
  if (cache[sym] && Date.now() - cache[sym].fetchedAt < CACHE_TTL) {
    return NextResponse.json({ news: cache[sym].data, cached: true });
  }

  const allNews: NewsItem[] = [];

  // Sources: Google News filtered by site for Reuters, Bloomberg, FT, Yahoo Finance
  const feeds = [
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(sym)}+site:reuters.com&hl=en-US&gl=US&ceid=US:en`, source: "Reuters" },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(sym)}+site:bloomberg.com&hl=en-US&gl=US&ceid=US:en`, source: "Bloomberg" },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(sym)}+site:ft.com&hl=en-US&gl=US&ceid=US:en`, source: "Financial Times" },
    { url: `https://news.google.com/rss/search?q=${encodeURIComponent(sym)}+site:finance.yahoo.com&hl=en-US&gl=US&ceid=US:en`, source: "Yahoo Finance" },
  ];

  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "ZaxScape/1.0" },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const items = parseRSSItems(xml, feed.source);
      allNews.push(...items);
    } catch {
      continue;
    }
  }

  // Sort by date, deduplicate by title prefix
  allNews.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const seen = new Set<string>();
  const deduped = allNews.filter((n) => {
    const key = n.title.substring(0, 40).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const top5 = deduped.slice(0, 5);
  cache[sym] = { data: top5, fetchedAt: Date.now() };

  return NextResponse.json({ news: top5, cached: false });
}
