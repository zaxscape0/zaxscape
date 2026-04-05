import { NextRequest, NextResponse } from "next/server";

const BATCHDATA_API_KEY =
  process.env.BATCHDATA_API_KEY || "mIrYIqeBpQ5RVHmNniSlrJvQHGHgab8smQrsKjHx";

const ENDPOINTS = [
  "https://api.batchdata.com/api/v1/property/skip-trace",
  "https://api.batchdata.com/api/v1/skip-trace",
  "https://api.batchdata.com/api/v1/people/skip-trace",
];

function parseOwnerName(ownerName: string): { firstName: string; lastName: string } {
  if (!ownerName) return { firstName: "", lastName: "" };

  // Remove common prefixes
  let name = ownerName
    .replace(/^(Estate of|Trust of|The)\s+/i, "")
    .replace(/\s+(Trust|LLC|Inc|Corp|LP|LLP)\.?$/i, "")
    .trim();

  // Handle "Last, First" format
  if (name.includes(",")) {
    const [last, first] = name.split(",").map((s) => s.trim());
    return { firstName: first || "", lastName: last || "" };
  }

  // Handle "First & Second Last" or "First and Second Last"
  if (name.includes("&") || name.toLowerCase().includes(" and ")) {
    name = name.split(/\s*[&]\s*|\s+and\s+/i)[0].trim();
  }

  // Simple "First Last" or "First Middle Last"
  const parts = name.split(/\s+/);
  if (parts.length === 1) return { firstName: parts[0], lastName: "" };
  if (parts.length === 2) return { firstName: parts[0], lastName: parts[1] };
  // 3+ words: first is first, last is last
  return { firstName: parts[0], lastName: parts[parts.length - 1] };
}

interface SkipTracePhone {
  number: string;
  type: string;
}

interface SkipTraceResult {
  phones: SkipTracePhone[];
  emails: string[];
  mailingAddress: string | null;
}

function normalizeResponse(data: Record<string, unknown>): SkipTraceResult {
  const phones: SkipTracePhone[] = [];
  const emails: string[] = [];
  let mailingAddress: string | null = null;

  // BatchData nests results under results.persons[] or results[]
  const results =
    (data as any)?.results?.persons ||
    (data as any)?.results?.results ||
    (data as any)?.results ||
    (data as any)?.persons ||
    [];

  const personList = Array.isArray(results) ? results : [results];

  for (const person of personList) {
    // Phones
    const phoneList =
      person?.phones || person?.phoneNumbers || person?.phone_numbers || [];
    for (const ph of Array.isArray(phoneList) ? phoneList : []) {
      const number =
        ph?.number || ph?.phoneNumber || ph?.phone_number || ph?.phone || "";
      const type =
        ph?.type || ph?.phoneType || ph?.phone_type || ph?.lineType || "unknown";
      if (number) {
        phones.push({
          number: String(number).replace(/\D/g, "").replace(/^1(\d{10})$/, "$1"),
          type: String(type).toLowerCase(),
        });
      }
    }

    // Emails
    const emailList =
      person?.emails || person?.emailAddresses || person?.email_addresses || [];
    for (const em of Array.isArray(emailList) ? emailList : []) {
      const addr = typeof em === "string" ? em : em?.email || em?.address || "";
      if (addr && !emails.includes(addr)) emails.push(addr);
    }

    // Mailing address
    if (!mailingAddress) {
      const addr =
        person?.mailingAddress ||
        person?.mailing_address ||
        person?.currentAddress ||
        person?.current_address ||
        null;
      if (addr) {
        if (typeof addr === "string") {
          mailingAddress = addr;
        } else {
          const parts = [
            addr.street || addr.streetAddress || addr.address,
            addr.city,
            addr.state,
            addr.zip || addr.zipCode || addr.postalCode,
          ].filter(Boolean);
          if (parts.length > 0) mailingAddress = parts.join(", ");
        }
      }
    }
  }

  return { phones, emails, mailingAddress };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ownerName, address, city, state, zip } = body;

    if (!ownerName || !address) {
      return NextResponse.json(
        { error: "ownerName and address are required" },
        { status: 400 }
      );
    }

    const { firstName, lastName } = parseOwnerName(ownerName);

    const payload = {
      requests: [
        {
          firstName,
          lastName,
          address: {
            street: address,
            city: city || "",
            state: state || "",
            zip: zip || "",
          },
        },
      ],
    };

    let lastError = "";

    for (const endpoint of ENDPOINTS) {
      try {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": BATCHDATA_API_KEY,
          },
          body: JSON.stringify(payload),
        });

        if (res.status === 404) {
          lastError = `${endpoint} returned 404`;
          continue;
        }

        if (!res.ok) {
          const errText = await res.text().catch(() => "");
          lastError = `${endpoint} returned ${res.status}: ${errText}`;
          // Don't try other endpoints for auth errors
          if (res.status === 401 || res.status === 403) {
            return NextResponse.json(
              { error: `API auth error: ${res.status}` },
              { status: 502 }
            );
          }
          continue;
        }

        const data = await res.json();
        const normalized = normalizeResponse(data);
        return NextResponse.json(normalized);
      } catch (err: unknown) {
        lastError = `${endpoint} failed: ${err instanceof Error ? err.message : String(err)}`;
        continue;
      }
    }

    return NextResponse.json(
      { error: `All endpoints failed. Last error: ${lastError}` },
      { status: 502 }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { error: `Request error: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
