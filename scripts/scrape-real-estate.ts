import { chromium, type Page, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "..", "data");
const OUTPUT_FILE = path.join(DATA_DIR, "real-estate-listings.json");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

interface ScrapedREListing {
  address: string;
  city: string;
  state: string;
  askingPrice: number | null;
  propertyType: string;
  capRate: number | null;
  units: number | null;
  sqft: number | null;
  brokerName: string | null;
  listingUrl: string;
  source: string;
  scrapedAt: string;
}

function delay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min) + min);
  return new Promise((r) => setTimeout(r, ms));
}

function parsePrice(text: string | null): number | null {
  if (!text) return null;
  const cleaned = text.replace(/[^0-9.]/g, "");
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

function parseCapRate(text: string | null): number | null {
  if (!text) return null;
  const match = text.match(/([\d.]+)\s*%/);
  if (match) return parseFloat(match[1]);
  return null;
}

function parseSqft(text: string | null): number | null {
  if (!text) return null;
  const match = text.match(/([\d,]+)\s*(?:sf|sq\s*ft|sqft)/i);
  if (match) return parseInt(match[1].replace(/,/g, ""), 10);
  return null;
}

function parseUnits(text: string | null): number | null {
  if (!text) return null;
  const match = text.match(/(\d+)\s*(?:unit|space|suite)/i);
  if (match) return parseInt(match[1], 10);
  return null;
}

async function createStealthContext(): Promise<{ browser: ReturnType<typeof chromium.launch> extends Promise<infer T> ? T : never; context: BrowserContext }> {
  const browser = await chromium.launch({
    headless: false,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent: USER_AGENT,
    viewport: { width: 1440, height: 900 },
  });
  await context.addInitScript(() => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
  });
  return { browser, context };
}

async function dismissPopups(page: Page) {
  try {
    const selectors = [
      'button:has-text("Accept")',
      'button:has-text("Accept All")',
      'button:has-text("I Agree")',
      'button:has-text("Agree")',
      'button:has-text("Got it")',
      '[id*="cookie"] button',
      '[class*="cookie"] button',
      '[class*="accept"]',
      '[aria-label="Close"]',
      'button:has-text("Close")',
    ];
    for (const sel of selectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible({ timeout: 500 }).catch(() => false)) {
        await btn.click().catch(() => {});
        await delay(300, 600);
        break;
      }
    }
  } catch {
    // ignore
  }
}

async function scrapeCrexi(): Promise<ScrapedREListing[]> {
  console.log("🏗️ Starting Crexi scraper...");
  const results: ScrapedREListing[] = [];
  const { browser, context } = await createStealthContext();
  const page = await context.newPage();

  try {
    // Crexi search for Boston area, for sale, max $10M
    const url =
      "https://www.crexi.com/properties?searchQuery=Boston%2C%20MA&radius=100&maxPrice=10000000&transactionType=Sale";

    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      const pageUrl = pageNum === 1 ? url : `${url}&page=${pageNum}`;
      console.log(`  📄 Scraping page ${pageNum}/5...`);

      if (pageNum === 1) {
        await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      } else {
        // Navigate via pagination or URL
        await page.goto(pageUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
      }

      await delay(5000, 8000);
      await dismissPopups(page);

      // Scroll to load lazy content
      for (let i = 0; i < 5; i++) {
        await page.evaluate(() => window.scrollBy(0, 600));
        await delay(800, 1500);
      }

      // Extract cards using Crexi's actual DOM structure:
      // .cui-card-info-title = price
      // .cui-card-info-subtitle = property name
      // .cui-card-info-description = type • units • price/unit
      // .cui-card-info-text = full address
      // .cui-card-info-text-small = city, state zip
      // a.cui-card-cover-link = link
      const listings = await page.evaluate(() => {
        const links = document.querySelectorAll("a.cui-card-cover-link");
        const titles = document.querySelectorAll(".cui-card-info-title");
        const subtitles = document.querySelectorAll(".cui-card-info-subtitle");
        const descs = document.querySelectorAll(".cui-card-info-description");
        const texts = document.querySelectorAll(".cui-card-info-text");
        const smalls = document.querySelectorAll(".cui-card-info-text-small");

        const count = links.length;
        const items: Array<{
          price: string;
          name: string;
          description: string;
          fullAddress: string;
          cityStateZip: string;
          url: string;
        }> = [];

        for (let i = 0; i < count; i++) {
          items.push({
            price: titles[i]?.textContent?.trim() || "",
            name: subtitles[i]?.textContent?.trim() || "",
            description: descs[i]?.textContent?.trim() || "",
            fullAddress: texts[i]?.textContent?.trim() || "",
            cityStateZip: smalls[i]?.textContent?.trim() || "",
            url: (links[i] as HTMLAnchorElement).href || "",
          });
        }

        return items;
      });

      console.log(`    Found ${listings.length} listing cards`);

      for (const listing of listings) {
        // Parse city/state from cityStateZip like "Boston, MA 02101"
        let city = "";
        let state = "MA";
        if (listing.cityStateZip) {
          const parts = listing.cityStateZip.split(",").map((s: string) => s.trim());
          city = parts[0] || "";
          if (parts[1]) {
            const stateZip = parts[1].trim().split(/\s+/);
            if (stateZip[0]?.length === 2) state = stateZip[0].toUpperCase();
          }
        }

        // Parse property type and units from description like "Multifamily • 10 Units • $390,000/unit"
        const desc = listing.description || "";
        let propertyType = "Commercial";
        if (/multi/i.test(desc)) propertyType = "Multifamily";
        else if (/retail/i.test(desc)) propertyType = "Retail";
        else if (/office/i.test(desc)) propertyType = "Office";
        else if (/industr|warehouse/i.test(desc)) propertyType = "Industrial";
        else if (/mix/i.test(desc)) propertyType = "Mixed-Use";
        else if (/land|lot/i.test(desc)) propertyType = "Land";

        const item: ScrapedREListing = {
          address: listing.fullAddress || listing.name || "",
          city,
          state,
          askingPrice: parsePrice(listing.price),
          propertyType,
          capRate: parseCapRate(desc),
          units: parseUnits(desc),
          sqft: parseSqft(desc),
          brokerName: null,
          listingUrl: listing.url.split("?")[0] || listing.url, // Remove tracking params
          source: "Crexi",
          scrapedAt: new Date().toISOString(),
        };

        if (item.address && item.listingUrl) {
          results.push(item);
        }
      }

      if (listings.length === 0) {
        console.log("    No more listings, stopping pagination");
        break;
      }

      await delay(2000, 4000);
    }
  } catch (err) {
    console.error("  ❌ Crexi error:", (err as Error).message);
  } finally {
    await browser.close();
  }

  console.log(`  ✅ Crexi: ${results.length} total listings scraped`);
  return results;
}

async function main() {
  console.log("🚀 Real Estate Scraper Starting...\n");
  console.log("Note: LoopNet blocks headless browsers (Akamai WAF). Using Crexi as primary source.\n");

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const allResults = await scrapeCrexi();

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = allResults.filter((l) => {
    const key = l.listingUrl;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Filter to only Boston-area results (MA, NH, RI, CT within the search radius)
  const bostonAreaStates = new Set(["MA", "NH", "RI", "CT", "ME", "VT"]);
  const localResults = deduped.filter(
    (l) => bostonAreaStates.has(l.state) || !l.state
  );

  const output = {
    lastScraped: new Date().toISOString(),
    count: localResults.length,
    totalBeforeFilter: deduped.length,
    listings: localResults,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(
    `\n✅ Done! Wrote ${localResults.length} listings to ${OUTPUT_FILE} (${deduped.length} total, ${localResults.length} in New England)`
  );
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
