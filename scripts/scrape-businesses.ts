import { chromium, type Page, type BrowserContext } from "playwright";
import * as fs from "fs";
import * as path from "path";

const DATA_DIR = path.join(__dirname, "..", "data");
const OUTPUT_FILE = path.join(DATA_DIR, "business-listings.json");

const USER_AGENT =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36";

interface ScrapedBizListing {
  title: string;
  askingPrice: number | null;
  cashFlow: number | null;
  revenue: number | null;
  industry: string;
  city: string;
  state: string;
  brokerName: string | null;
  brokerCompany: string | null;
  listingUrl: string;
  daysListed: number | null;
  source: string;
  scrapedAt: string;
}

function delay(min: number, max: number): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min) + min);
  return new Promise((r) => setTimeout(r, ms));
}

function parseMoney(text: string | null): number | null {
  if (!text) return null;
  // Handle "$2,600,000" or "$1M - $5M" (take first number)
  const cleaned = text.replace(/[^0-9.,MKBmkb]/g, "");
  if (!cleaned) return null;

  // Handle M/K suffixes
  const suffixMatch = text.match(/\$?([\d,.]+)\s*(M|K|B)/i);
  if (suffixMatch) {
    const num = parseFloat(suffixMatch[1].replace(/,/g, ""));
    const suffix = suffixMatch[2].toUpperCase();
    if (suffix === "M") return num * 1_000_000;
    if (suffix === "K") return num * 1_000;
    if (suffix === "B") return num * 1_000_000_000;
  }

  const num = parseFloat(cleaned.replace(/,/g, ""));
  return isNaN(num) ? null : num;
}

async function createStealthContext(): Promise<{
  browser: ReturnType<typeof chromium.launch> extends Promise<infer T> ? T : never;
  context: BrowserContext;
}> {
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
      'button:has-text("Agree")',
      'button:has-text("I Agree")',
      'button:has-text("Got it")',
      'button:has-text("No Thanks")',
      '[class*="accept"]',
      '[id*="cookie"] button',
      '[class*="cookie"] button',
      '[class*="consent"] button',
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

async function scrapeBusinessesForSale(): Promise<ScrapedBizListing[]> {
  console.log("💼 Starting BusinessesForSale.com scraper...");
  const results: ScrapedBizListing[] = [];
  const { browser, context } = await createStealthContext();
  const page = await context.newPage();

  try {
    const baseUrl =
      "https://www.businessesforsale.com/us/search/businesses-for-sale-in-Massachusetts";

    for (let pageNum = 1; pageNum <= 5; pageNum++) {
      const url = pageNum === 1 ? baseUrl : `${baseUrl}?page=${pageNum}`;
      console.log(`  📄 Scraping page ${pageNum}/5... (${url})`);

      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
      await delay(3000, 5000);
      await dismissPopups(page);

      // Wait for results
      await page
        .waitForSelector(".result, .result-title", { timeout: 10000 })
        .catch(() => console.log("    ⚠️ No result elements found"));

      // Extract listings from BusinessesForSale.com
      // Structure: .result contains .result-title a (title/link), and text with financials
      const listings = await page.evaluate(() => {
        const resultEls = document.querySelectorAll(".result");
        const items: Array<{
          title: string;
          url: string;
          fullText: string;
        }> = [];

        resultEls.forEach((r) => {
          const titleEl = r.querySelector(".result-title a, h3 a, h2 a");
          if (titleEl) {
            items.push({
              title: titleEl.textContent?.trim() || "",
              url: (titleEl as HTMLAnchorElement).href || "",
              fullText: r.textContent?.replace(/\s+/g, " ").trim() || "",
            });
          }
        });

        return items;
      });

      console.log(`    Found ${listings.length} listing cards`);

      for (const listing of listings) {
        // Skip franchise listings that don't have real financials
        if (/franchise fee/i.test(listing.fullText) && !/asking price/i.test(listing.fullText)) {
          continue;
        }

        const text = listing.fullText;

        // Parse financials from text like:
        // "Asking Price: $2,250,000 Revenue: $2,600,000 Cash Flow: $417,000"
        const priceMatch = text.match(/asking\s*price[:\s]*\$?([\d,]+(?:\.\d+)?)/i);
        const revenueMatch = text.match(/revenue[:\s]*\$?([\d,]+(?:\.\d+)?(?:\s*[MKB])?)/i);
        const cashFlowMatch = text.match(/cash\s*flow[:\s]*\$?([\d,]+(?:\.\d+)?(?:\s*[MKB])?)/i);

        // Parse location
        let city = "Massachusetts";
        let state = "MA";
        const locationMatch = text.match(/location[:\s]*([^,]+),\s*(\w+)/i);
        if (locationMatch) {
          city = locationMatch[1].trim();
          const stateCandidate = locationMatch[2].trim();
          if (stateCandidate.length === 2) state = stateCandidate.toUpperCase();
        }

        // Try to determine industry from title and description
        let industry = "Services";
        const titleLower = listing.title.toLowerCase();
        if (/restaurant|food|pizza|cafe|bakery|catering/i.test(titleLower)) industry = "Restaurant/Food";
        else if (/laundro/i.test(titleLower)) industry = "Laundromat";
        else if (/auto|car wash|mechanic|body shop/i.test(titleLower)) industry = "Auto";
        else if (/hvac|plumb|electric|roofing|construction|trade/i.test(titleLower)) industry = "HVAC/Trades";
        else if (/franchise/i.test(titleLower)) industry = "Franchise";
        else if (/retail|store|shop/i.test(titleLower)) industry = "Retail";
        else if (/tech|saas|software|digital/i.test(titleLower)) industry = "Tech/SaaS";
        else if (/health|medical|dental|vet|pharma/i.test(titleLower)) industry = "Healthcare";
        else if (/manufactur|fabricat/i.test(titleLower)) industry = "Manufacturing";

        const askingPrice = priceMatch ? parseMoney(priceMatch[1]) : null;
        const revenue = revenueMatch ? parseMoney(revenueMatch[0]) : null;
        const cashFlow = cashFlowMatch ? parseMoney(cashFlowMatch[0]) : null;

        results.push({
          title: listing.title,
          askingPrice,
          cashFlow,
          revenue,
          industry,
          city,
          state,
          brokerName: null,
          brokerCompany: null,
          listingUrl: listing.url,
          daysListed: null,
          source: "BusinessesForSale",
          scrapedAt: new Date().toISOString(),
        });
      }

      // Check if there are more pages
      const hasNext = await page
        .locator('a:has-text("Next"), a[rel="next"], .pagination a:has-text(">")')
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      if (!hasNext && pageNum < 5) {
        console.log("    No more pages available");
        break;
      }

      await delay(2000, 5000);
    }
  } catch (err) {
    console.error("  ❌ BusinessesForSale error:", (err as Error).message);
  } finally {
    await browser.close();
  }

  console.log(`  ✅ BusinessesForSale: ${results.length} total listings scraped`);
  return results;
}

async function main() {
  console.log("🚀 Business Scraper Starting...\n");
  console.log(
    "Note: BizBuySell/BizQuest block headless browsers (Akamai WAF). Using BusinessesForSale.com.\n"
  );

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const allResults = await scrapeBusinessesForSale();

  // Deduplicate by URL
  const seen = new Set<string>();
  const deduped = allResults.filter((l) => {
    if (!l.listingUrl || seen.has(l.listingUrl)) return false;
    seen.add(l.listingUrl);
    return true;
  });

  const output = {
    lastScraped: new Date().toISOString(),
    count: deduped.length,
    listings: deduped,
  };

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
  console.log(`\n✅ Done! Wrote ${deduped.length} listings to ${OUTPUT_FILE}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
