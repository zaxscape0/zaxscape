import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

let cachedResults: ScrapedBizResult[] = [];
let cachedAt = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface ScrapedBizResult {
  title: string;
  askingPrice: number | null;
  cashFlow: number | null;
  revenue: number | null;
  industry: string;
  city: string;
  state: string;
  broker: string | null;
  listingUrl: string;
  source: "BizBuySell";
}

async function scrapeBizBuySell(): Promise<ScrapedBizResult[]> {
  const results: ScrapedBizResult[] = [];

  try {
    const res = await fetch(
      "https://www.bizbuysell.com/massachusetts-businesses-for-sale/",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: AbortSignal.timeout(15000),
      }
    );

    if (!res.ok) return results;

    const html = await res.text();

    // BizBuySell listing cards have a relatively parseable structure
    // Try to find listing blocks
    const listingBlocks = html.split(/class="listing/gi).slice(1);

    for (const block of listingBlocks.slice(0, 50)) {
      try {
        // Extract URL
        const urlMatch = block.match(/href="(\/Business-Opportunity\/[^"]+|\/listing\/[^"]+)"/i);
        const listingUrl = urlMatch
          ? `https://www.bizbuysell.com${urlMatch[1]}`
          : "";

        // Extract title
        const titleMatch = block.match(/<h\d[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/h\d>/i) ||
                          block.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                          block.match(/<h\d[^>]*>([^<]+)<\/h\d>/i);
        const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

        if (!title) continue;

        // Extract price
        const priceMatch = block.match(/(?:asking|price)[^$]*\$\s*([\d,]+)/i) ||
                          block.match(/\$\s*([\d,]+)/);
        const askingPrice = priceMatch
          ? parseInt(priceMatch[1].replace(/,/g, ""))
          : null;

        // Extract cash flow
        const cfMatch = block.match(/cash\s*flow[^$]*\$\s*([\d,]+)/i);
        const cashFlow = cfMatch
          ? parseInt(cfMatch[1].replace(/,/g, ""))
          : null;

        // Extract revenue
        const revMatch = block.match(/revenue[^$]*\$\s*([\d,]+)/i) ||
                        block.match(/gross[^$]*\$\s*([\d,]+)/i);
        const revenue = revMatch
          ? parseInt(revMatch[1].replace(/,/g, ""))
          : null;

        // Extract location
        const locMatch = block.match(/([A-Za-z\s]+),\s*(MA|Massachusetts|NH|RI|CT)/i);
        const city = locMatch ? locMatch[1].trim() : "";
        const state = locMatch ? (locMatch[2].length > 2 ? "MA" : locMatch[2]) : "MA";

        // Determine industry from title/content
        const lowerBlock = (title + " " + block).toLowerCase();
        let industry = "Services";
        if (/laundro|wash|clean/i.test(lowerBlock)) industry = "Laundromat";
        else if (/auto|car wash|mechanic|body shop/i.test(lowerBlock)) industry = "Auto";
        else if (/restaurant|food|pizza|cafe|bar|grill|bakery/i.test(lowerBlock)) industry = "Restaurant/Food";
        else if (/hvac|plumb|electric|roof|landscap|construct/i.test(lowerBlock)) industry = "HVAC/Trades";
        else if (/franchise/i.test(lowerBlock)) industry = "Franchise";
        else if (/retail|store|shop/i.test(lowerBlock)) industry = "Retail";
        else if (/tech|software|saas|digital|web/i.test(lowerBlock)) industry = "Tech/SaaS";
        else if (/health|medical|dental|therapy|pharma/i.test(lowerBlock)) industry = "Healthcare";
        else if (/manufactur|machine|fabricat/i.test(lowerBlock)) industry = "Manufacturing";

        results.push({
          title,
          askingPrice,
          cashFlow,
          revenue,
          industry,
          city,
          state,
          broker: null,
          listingUrl,
          source: "BizBuySell",
        });
      } catch {
        continue;
      }
    }
  } catch (err) {
    console.error("[scrape/businesses] BizBuySell fetch error:", err);
  }

  return results;
}

export async function GET() {
  // Return cached if fresh
  if (cachedResults.length > 0 && Date.now() - cachedAt < CACHE_TTL) {
    return NextResponse.json({
      results: cachedResults,
      cached: true,
      cachedAt: new Date(cachedAt).toISOString(),
      count: cachedResults.length,
    });
  }

  const results = await scrapeBizBuySell();

  if (results.length > 0) {
    cachedResults = results;
    cachedAt = Date.now();
  }

  return NextResponse.json({
    results,
    cached: false,
    count: results.length,
    message: results.length === 0
      ? "No results scraped — BizBuySell may be blocking automated requests. Try the Paste URL feature to import individual listings."
      : undefined,
  });
}
