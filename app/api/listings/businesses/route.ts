import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "data", "business-listings.json");

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({
        lastScraped: null,
        count: 0,
        listings: [],
        message: "No scraped data yet. Run: npm run scrape:biz",
      });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to read listings data", detail: (err as Error).message },
      { status: 500 }
    );
  }
}
