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

async function fetchFallbackNews(): Promise<Headline[]> {
  // Use GNews free tier as fallback
  try {
    const res = await fetch(
      "https://gnews.io/api/v4/search?q=geopolitics+OR+military+OR+sanctions+OR+war&lang=en&max=30&apikey=demo",
      { signal: AbortSignal.timeout(8000) }
    );
    if (!res.ok) throw new Error(`GNews ${res.status}`);
    const data = await res.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data.articles || []).map((a: any, i: number) => ({
      id: `gnews-${i}-${Date.now()}`,
      text: a.title || "",
      timestamp: a.publishedAt || new Date().toISOString(),
      url: a.url || "#",
      source: "GNews (fallback)",
    }));
  } catch {
    // Return mock data as absolute fallback so the UI isn't empty
    return generateMockHeadlines();
  }
}

function generateMockHeadlines(): Headline[] {
  const now = Date.now();
  const items = [
    "BREAKING: Pentagon confirms additional military assets deployed to Eastern Mediterranean",
    "EU announces new round of sanctions targeting Russian energy sector",
    "China conducts military exercises near Taiwan strait, Taiwan defense ministry says",
    "Gold surges past $2,400 as geopolitical tensions escalate in Middle East",
    "Ukraine claims successful drone strike on Russian military depot in Crimea",
    "UN Security Council to hold emergency session on Red Sea shipping attacks",
    "Iran nuclear talks stall as IAEA reports enrichment above agreed limits",
    "North Korea fires ballistic missile toward Sea of Japan, South Korea military says",
    "Oil prices spike 3% on concerns over Strait of Hormuz shipping lanes",
    "NATO increases readiness level for Eastern European defense forces",
    "Houthi rebels claim attack on commercial vessel in Red Sea",
    "Russia-Ukraine ceasefire negotiations set to resume in Istanbul",
    "Defense stocks rally — LMT, RTX, NOC all up over 2%",
    "VIX spikes to 22 amid escalating global tensions",
    "US sanctions new entities linked to Iranian drone program",
  ];
  return items.map((text, i) => ({
    id: `mock-${i}-${now}`,
    text,
    timestamp: new Date(now - i * 180_000).toISOString(), // 3 min apart
    url: "#",
    source: "@DeItaone (simulated)",
  }));
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
    { name: "Fallback", fn: fetchFallbackNews },
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
  if (headlines.length === 0) {
    headlines = generateMockHeadlines();
    usedSource = "Mock";
  }

  cachedData = { headlines, fetchedAt: Date.now() };

  return NextResponse.json({
    headlines,
    source: usedSource,
    cached: false,
    fetchedAt: new Date().toISOString(),
  });
}
