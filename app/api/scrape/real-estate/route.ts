import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Cache scraped results in memory (server-side, resets on redeploy)
let cachedResults: ScrapedREResult[] = [];
let cachedAt = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 hour

interface ScrapedREResult {
  address: string;
  city: string;
  state: string;
  price: number | null;
  capRate: number | null;
  propertyType: string;
  units: number | null;
  sqft: number | null;
  broker: string | null;
  listingUrl: string;
  source: "LoopNet" | "Crexi";
}

async function scrapeCrexi(): Promise<ScrapedREResult[]> {
  const results: ScrapedREResult[] = [];
  
  try {
    // Crexi has a public search page — try fetching it
    const res = await fetch(
      "https://www.crexi.com/properties?searchQuery=Boston%2C+MA&radius=100&maxPrice=10000000&propertyTypes=multifamily,retail,office,industrial,mixed-use",
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

    // Try to extract JSON data embedded in the page (Crexi embeds listing data in script tags)
    const jsonMatch = html.match(/__NEXT_DATA__.*?({.*?})\s*<\/script>/) ||
                      html.match(/window\.__data\s*=\s*({.*?});/);
    
    if (jsonMatch) {
      try {
        const data = JSON.parse(jsonMatch[1]);
        // Navigate the data structure to find listings
        const listings = data?.props?.pageProps?.listings || 
                        data?.props?.pageProps?.searchResults?.results ||
                        data?.listings ||
                        [];
        
        for (const l of listings.slice(0, 50)) {
          results.push({
            address: l.address || l.streetAddress || "Unknown",
            city: l.city || "",
            state: l.state || "MA",
            price: l.price || l.askingPrice || null,
            capRate: l.capRate || null,
            propertyType: l.propertyType || l.type || "commercial",
            units: l.units || null,
            sqft: l.sqft || l.buildingSize || null,
            broker: l.broker?.name || l.brokerName || null,
            listingUrl: l.url || `https://www.crexi.com/properties/${l.id || l.slug || ""}`,
            source: "Crexi",
          });
        }
      } catch {
        // JSON parse failed — fall through
      }
    }

    // Fallback: try basic HTML parsing for listing cards
    if (results.length === 0) {
      const listingPattern = /<a[^>]*href="(\/properties\/[^"]+)"[^>]*>[\s\S]*?<\/a>/g;
      const pricePattern = /\$[\d,]+(?:\.\d{2})?/;
      const addressPattern = /(\d+[^<,]+),\s*([^<,]+),\s*([A-Z]{2})/;
      
      let match;
      while ((match = listingPattern.exec(html)) !== null) {
        const block = match[0];
        const url = `https://www.crexi.com${match[1]}`;
        const priceMatch = block.match(pricePattern);
        const addrMatch = block.match(addressPattern);
        
        if (addrMatch) {
          results.push({
            address: addrMatch[1].trim(),
            city: addrMatch[2].trim(),
            state: addrMatch[3],
            price: priceMatch ? parseInt(priceMatch[0].replace(/[$,]/g, "")) : null,
            capRate: null,
            propertyType: "commercial",
            units: null,
            sqft: null,
            broker: null,
            listingUrl: url,
            source: "Crexi",
          });
        }
      }
    }
  } catch (err) {
    console.error("[scrape/real-estate] Crexi fetch error:", err);
  }

  return results;
}

async function scrapeLoopNet(): Promise<ScrapedREResult[]> {
  const results: ScrapedREResult[] = [];

  try {
    const res = await fetch(
      "https://www.loopnet.com/search/commercial-real-estate/boston-ma/for-sale/",
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

    // LoopNet uses placards — try to extract from embedded JSON
    const scriptMatch = html.match(/window\.__INITIAL_DATA__\s*=\s*({.*?});/) ||
                        html.match(/"searchResults":\s*(\[.*?\])/);

    if (scriptMatch) {
      try {
        const data = JSON.parse(scriptMatch[1]);
        const listings = Array.isArray(data) ? data : data?.searchResults || data?.placard || [];

        for (const l of listings.slice(0, 50)) {
          const price = l.price || l.askingPrice || 0;
          if (price > 10000000) continue;

          results.push({
            address: l.address || l.streetAddress || l.title || "Unknown",
            city: l.city || "",
            state: l.state || "MA",
            price,
            capRate: l.capRate || null,
            propertyType: l.propertyType || l.subtype || "commercial",
            units: l.units || null,
            sqft: l.sqft || l.buildingSize || null,
            broker: l.broker || l.brokerName || null,
            listingUrl: l.url ? `https://www.loopnet.com${l.url}` : l.detailUrl || "",
            source: "LoopNet",
          });
        }
      } catch {
        // parse error
      }
    }
  } catch (err) {
    console.error("[scrape/real-estate] LoopNet fetch error:", err);
  }

  return results;
}

export async function GET() {
  // Return cached results if fresh
  if (cachedResults.length > 0 && Date.now() - cachedAt < CACHE_TTL) {
    return NextResponse.json({
      results: cachedResults,
      cached: true,
      cachedAt: new Date(cachedAt).toISOString(),
      count: cachedResults.length,
    });
  }

  // Scrape both sources in parallel
  const [crexiResults, loopnetResults] = await Promise.allSettled([
    scrapeCrexi(),
    scrapeLoopNet(),
  ]);

  const results: ScrapedREResult[] = [
    ...(crexiResults.status === "fulfilled" ? crexiResults.value : []),
    ...(loopnetResults.status === "fulfilled" ? loopnetResults.value : []),
  ];

  // Cache results
  if (results.length > 0) {
    cachedResults = results;
    cachedAt = Date.now();
  }

  return NextResponse.json({
    results,
    cached: false,
    count: results.length,
    sources: {
      crexi: crexiResults.status === "fulfilled" ? crexiResults.value.length : 0,
      loopnet: loopnetResults.status === "fulfilled" ? loopnetResults.value.length : 0,
    },
    message: results.length === 0
      ? "No results scraped — these sites may be blocking automated requests. Try the Paste URL feature to import individual listings."
      : undefined,
  });
}
