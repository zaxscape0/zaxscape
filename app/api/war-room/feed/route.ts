import { NextResponse } from "next/server";

export const runtime = "edge";
export const revalidate = 60;

interface Headline {
  id: string;
  text: string;
  timestamp: string;
  url: string;
  source: string;
}

let cachedData: { headlines: Headline[]; fetchedAt: number } | null = null;
const CACHE_TTL = 60_000; // 60 seconds

async function fetchFromRSSHub(): Promise<Headline[]> {
  const res = await fetch("https://rsshub.app/twitter/user/DeItaone", {
    headers: { "User-Agent": "ZaxScape/1.0" },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`RSSHub ${res.status}`);
  const xml = await res.text();
  return parseRSS(xml, "rsshub");
}

async function fetchFromNitter(): Promise<Headline[]> {
  // Try multiple nitter instances
  const instances = [
    "https://nitter.privacydev.net",
    "https://nitter.poast.org",
    "https://nitter.net",
  ];
  for (const base of instances) {
    try {
      const res = await fetch(`${base}/DeItaone/rss`, {
        headers: { "User-Agent": "ZaxScape/1.0" },
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      return parseRSS(xml, "nitter");
    } catch {
      continue;
    }
  }
  throw new Error("All nitter instances failed");
}

async function fetchFromSyndication(): Promise<Headline[]> {
  const res = await fetch(
    "https://syndication.twitter.com/srv/timeline-profile/screen-name/DeItaone",
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
      },
      signal: AbortSignal.timeout(8000),
    }
  );
  if (!res.ok) throw new Error(`Syndication ${res.status}`);
  const html = await res.text();

  const headlines: Headline[] = [];
  // Extract tweet text from syndication HTML
  const tweetRegex =
    /data-tweet-id="(\d+)"[\s\S]*?<p[^>]*class="[^"]*tweet-text[^"]*"[^>]*>([\s\S]*?)<\/p>/g;
  let match;
  while ((match = tweetRegex.exec(html)) !== null) {
    const id = match[1];
    const text = match[2].replace(/<[^>]+>/g, "").trim();
    if (text) {
      headlines.push({
        id,
        text,
        timestamp: new Date().toISOString(),
        url: `https://x.com/DeItaone/status/${id}`,
        source: "@DeItaone",
      });
    }
  }
  if (headlines.length === 0) throw new Error("No tweets parsed from syndication");
  return headlines;
}

async function fetchFromReutersFTBloomberg(): Promise<Headline[]> {
  const feeds = [
    { url: "https://news.google.com/rss/search?q=site:reuters.com+geopolitics+OR+war+OR+military+OR+sanctions&hl=en-US&gl=US&ceid=US:en", source: "Reuters" },
    { url: "https://news.google.com/rss/search?q=site:ft.com+geopolitics+OR+war+OR+military+OR+sanctions&hl=en-US&gl=US&ceid=US:en", source: "Financial Times" },
    { url: "https://news.google.com/rss/search?q=site:bloomberg.com+geopolitics+OR+war+OR+military+OR+sanctions&hl=en-US&gl=US&ceid=US:en", source: "Bloomberg" },
    { url: "https://feeds.reuters.com/Reuters/worldNews", source: "Reuters" },
    { url: "https://www.ft.com/rss/home/us", source: "Financial Times" },
  ];
  
  const allHeadlines: Headline[] = [];
  
  for (const feed of feeds) {
    try {
      const res = await fetch(feed.url, {
        headers: { "User-Agent": "ZaxScape/1.0" },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) continue;
      const xml = await res.text();
      const parsed = parseRSS(xml, feed.source);
      // Override source to show actual outlet
      for (const h of parsed) {
        h.source = feed.source;
      }
      allHeadlines.push(...parsed);
    } catch {
      continue;
    }
  }
  
  // Sort by timestamp descending, deduplicate by text similarity
  allHeadlines.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Simple dedup — skip if first 50 chars match
  const seen = new Set<string>();
  const deduped = allHeadlines.filter(h => {
    const key = h.text.substring(0, 50).toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  if (deduped.length === 0) throw new Error("No headlines from Reuters/FT/Bloomberg");
  return deduped.slice(0, 50);
}

function parseRSS(xml: string, source: string): Headline[] {
  const headlines: Headline[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(xml)) !== null) {
    const content = match[1];
    const title = extractTag(content, "title");
    const link = extractTag(content, "link");
    const pubDate = extractTag(content, "pubDate");
    const guid = extractTag(content, "guid") || link || `${source}-${headlines.length}`;
    const description = extractTag(content, "description");
    const text = title || description?.replace(/<[^>]+>/g, "").trim() || "";
    if (text) {
      headlines.push({
        id: guid,
        text,
        timestamp: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        url: link || "#",
        source: "@DeItaone",
      });
    }
  }
  return headlines;
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(?:<!\\[CDATA\\[)?([\\s\\S]*?)(?:\\]\\]>)?<\\/${tag}>`);
  const m = regex.exec(xml);
  return m ? m[1].trim() : "";
}

export async function GET() {
  // Check cache
  if (cachedData && Date.now() - cachedData.fetchedAt < CACHE_TTL) {
    return NextResponse.json({
      headlines: cachedData.headlines,
      cached: true,
      fetchedAt: new Date(cachedData.fetchedAt).toISOString(),
    });
  }

  // Try sources in order
  const sources = [
    { name: "RSSHub", fn: fetchFromRSSHub },
    { name: "Nitter", fn: fetchFromNitter },
    { name: "Syndication", fn: fetchFromSyndication },
    { name: "Reuters/FT/Bloomberg", fn: fetchFromReutersFTBloomberg },
    
  ];

  let headlines: Headline[] = [];
  let usedSource = "";

  for (const source of sources) {
    try {
      headlines = await source.fn();
      if (headlines.length > 0) {
        usedSource = source.name;
        break;
      }
    } catch (err) {
      console.warn(`[War Room] ${source.name} failed:`, err);
      continue;
    }
  }

  // If still empty, use mock
  // No fallback to mock — show empty state if all sources fail

  cachedData = { headlines, fetchedAt: Date.now() };

  return NextResponse.json({
    headlines,
    source: usedSource,
    cached: false,
    fetchedAt: new Date().toISOString(),
  });
}
