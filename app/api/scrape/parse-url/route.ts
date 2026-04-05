import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface ParsedListing {
  type: "real-estate" | "business";
  source: string;
  data: Record<string, string | number | null>;
}

function parsePrice(text: string): number | null {
  const match = text.match(/\$\s*([\d,]+(?:\.\d+)?)\s*(?:M|Million)?/i);
  if (!match) return null;
  let num = parseFloat(match[1].replace(/,/g, ""));
  if (/M|Million/i.test(match[0])) num *= 1_000_000;
  return num;
}



function detectSource(url: string): string {
  if (url.includes("loopnet.com")) return "LoopNet";
  if (url.includes("crexi.com")) return "Crexi";
  if (url.includes("bizbuysell.com")) return "BizBuySell";
  return "Unknown";
}

function parseLoopNetHTML(html: string, url: string): ParsedListing {
  const data: Record<string, string | number | null> = {};

  // Title / address
  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  data.address = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : null;

  // Price
  const priceMatch = html.match(/(?:Price|Asking)[^$]*\$\s*([\d,.]+)\s*(M|Million)?/i) ||
                     html.match(/class="[^"]*price[^"]*"[^>]*>[^$]*\$\s*([\d,.]+)/i);
  if (priceMatch) {
    let p = parseFloat(priceMatch[1].replace(/,/g, ""));
    if (priceMatch[2]) p *= 1_000_000;
    data.askingPrice = p;
  }

  // Cap rate
  const capMatch = html.match(/cap\s*rate[^%]*([\d.]+)\s*%/i);
  data.capRate = capMatch ? parseFloat(capMatch[1]) : null;

  // Property type
  const typeMatch = html.match(/(?:property|type)[^:]*:\s*([A-Za-z\s-]+)/i);
  data.propertyType = typeMatch ? typeMatch[1].trim() : null;

  // Units
  const unitsMatch = html.match(/([\d]+)\s*(?:units?|apartments?)/i);
  data.units = unitsMatch ? parseInt(unitsMatch[1]) : null;

  // Sqft
  const sqftMatch = html.match(/([\d,]+)\s*(?:SF|sq\s*ft|square\s*feet)/i);
  data.sqft = sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, "")) : null;

  // City/State from address or breadcrumb
  const locMatch = (data.address as string || "").match(/([^,]+),\s*([A-Z]{2})\s*\d{5}?/);
  if (locMatch) {
    data.city = locMatch[1].trim();
    data.state = locMatch[2];
  }

  // NOI
  const noiMatch = html.match(/NOI[^$]*\$\s*([\d,.]+)/i);
  data.noi = noiMatch ? parsePrice(noiMatch[0]) : null;

  data.sourceUrl = url;

  return { type: "real-estate", source: "LoopNet", data };
}

function parseCrexiHTML(html: string, url: string): ParsedListing {
  const data: Record<string, string | number | null> = {};

  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  data.address = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : null;

  const priceSection = html.match(/(?:Price|Asking)[^$]*\$\s*([\d,.]+)\s*(M)?/i) ||
                       html.match(/\$\s*([\d,.]+)\s*(M)?/i);
  if (priceSection) {
    let p = parseFloat(priceSection[1].replace(/,/g, ""));
    if (priceSection[2]) p *= 1_000_000;
    data.askingPrice = p;
  }

  const capMatch = html.match(/cap\s*rate[^%]*([\d.]+)\s*%/i);
  data.capRate = capMatch ? parseFloat(capMatch[1]) : null;

  const sqftMatch = html.match(/([\d,]+)\s*(?:SF|sq\s*ft)/i);
  data.sqft = sqftMatch ? parseInt(sqftMatch[1].replace(/,/g, "")) : null;

  const unitsMatch = html.match(/([\d]+)\s*(?:units?)/i);
  data.units = unitsMatch ? parseInt(unitsMatch[1]) : null;

  data.sourceUrl = url;

  return { type: "real-estate", source: "Crexi", data };
}

function parseBizBuySellHTML(html: string, url: string): ParsedListing {
  const data: Record<string, string | number | null> = {};

  const titleMatch = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
  data.title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : null;

  // Asking price
  const priceMatch = html.match(/(?:asking|price)[^$]*\$\s*([\d,]+)/i);
  data.askingPrice = priceMatch ? parseInt(priceMatch[1].replace(/,/g, "")) : null;

  // Cash flow
  const cfMatch = html.match(/cash\s*flow[^$]*\$\s*([\d,]+)/i);
  data.sdeCashFlow = cfMatch ? parseInt(cfMatch[1].replace(/,/g, "")) : null;

  // Revenue
  const revMatch = html.match(/(?:gross\s*)?revenue[^$]*\$\s*([\d,]+)/i);
  data.revenue = revMatch ? parseInt(revMatch[1].replace(/,/g, "")) : null;

  // Location
  const locMatch = html.match(/([A-Za-z\s]+),\s*(MA|NH|RI|CT|VT|ME)\b/i);
  data.city = locMatch ? locMatch[1].trim() : null;
  data.state = locMatch ? locMatch[2].toUpperCase() : null;

  // Business type / industry
  const catMatch = html.match(/(?:category|industry|type)[^:]*:\s*([^<\n]+)/i);
  data.industry = catMatch ? catMatch[1].trim() : null;

  // Employees
  const empMatch = html.match(/(?:employees?|staff)[^:]*:\s*(\d+)/i);
  data.employees = empMatch ? parseInt(empMatch[1]) : null;

  // Year established
  const yearMatch = html.match(/(?:established|since|founded)[^:]*:\s*(\d{4})/i);
  data.yearEstablished = yearMatch ? parseInt(yearMatch[1]) : null;

  // Reason for sale
  const reasonMatch = html.match(/(?:reason\s*for\s*sale)[^:]*:\s*([^<\n]+)/i);
  data.reasonForSale = reasonMatch ? reasonMatch[1].trim() : null;

  data.sourceUrl = url;

  return { type: "business", source: "BizBuySell", data };
}

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    const source = detectSource(url);
    if (source === "Unknown") {
      return NextResponse.json(
        { error: "Unsupported URL. Supported: LoopNet, Crexi, BizBuySell" },
        { status: 400 }
      );
    }

    // Fetch the listing page
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Failed to fetch URL (HTTP ${res.status}). The site may be blocking automated requests.` },
        { status: 422 }
      );
    }

    const html = await res.text();

    let parsed: ParsedListing;
    switch (source) {
      case "LoopNet":
        parsed = parseLoopNetHTML(html, url);
        break;
      case "Crexi":
        parsed = parseCrexiHTML(html, url);
        break;
      case "BizBuySell":
        parsed = parseBizBuySellHTML(html, url);
        break;
      default:
        return NextResponse.json({ error: "Unsupported source" }, { status: 400 });
    }

    return NextResponse.json({
      parsed,
      message: "Parsed listing data. Review and edit before saving.",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Parse failed: ${message}` },
      { status: 500 }
    );
  }
}
