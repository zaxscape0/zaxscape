export interface Lender {
  id: string;
  name: string;
  type: "bank" | "credit_union" | "mortgage_co";
  city: string;
  website: string;
  phone: string;
}

export interface RateEntry {
  id: string;
  lenderId: string;
  product: "30yr" | "15yr" | "ARM" | "HELOC" | "jumbo" | "investor";
  rate: number;
  apr: number;
  points: number;
  dateCaptured: string;
  source: string;
}

export const PRODUCT_LABELS: Record<string, string> = {
  "30yr": "30-Year Fixed",
  "15yr": "15-Year Fixed",
  ARM: "5/1 ARM",
  HELOC: "HELOC",
  jumbo: "Jumbo",
  investor: "Investor",
};

export const seedLenders: Lender[] = [
  {
    id: "1",
    name: "Rockland Trust",
    type: "bank",
    city: "Rockland, MA",
    website: "rocklandtrust.com",
    phone: "(781) 878-6100",
  },
  {
    id: "2",
    name: "Eastern Bank",
    type: "bank",
    city: "Boston, MA",
    website: "easternbank.com",
    phone: "(800) 327-8376",
  },
  {
    id: "3",
    name: "Leader Bank",
    type: "bank",
    city: "Arlington, MA",
    website: "leaderbank.com",
    phone: "(781) 646-3900",
  },
  {
    id: "4",
    name: "DCU Federal Credit Union",
    type: "credit_union",
    city: "Marlborough, MA",
    website: "dcu.org",
    phone: "(508) 263-6700",
  },
  {
    id: "5",
    name: "Citizens Bank",
    type: "bank",
    city: "Providence, RI",
    website: "citizensbank.com",
    phone: "(800) 922-9999",
  },
  {
    id: "6",
    name: "Webster Bank",
    type: "bank",
    city: "Stamford, CT",
    website: "websterbank.com",
    phone: "(800) 325-2424",
  },
];

export const seedRates: RateEntry[] = [
  // Rockland Trust
  { id: "r1", lenderId: "1", product: "30yr", rate: 6.25, apr: 6.35, points: 0, dateCaptured: "2026-04-03", source: "Website" },
  { id: "r2", lenderId: "1", product: "15yr", rate: 5.625, apr: 5.75, points: 0, dateCaptured: "2026-04-03", source: "Website" },
  { id: "r3", lenderId: "1", product: "ARM", rate: 5.875, apr: 6.45, points: 0, dateCaptured: "2026-04-03", source: "Website" },
  // Eastern Bank
  { id: "r4", lenderId: "2", product: "30yr", rate: 6.375, apr: 6.45, points: 0, dateCaptured: "2026-04-02", source: "Website" },
  { id: "r5", lenderId: "2", product: "HELOC", rate: 7.99, apr: 7.99, points: 0, dateCaptured: "2026-04-02", source: "Phone" },
  { id: "r6", lenderId: "2", product: "investor", rate: 7.25, apr: 7.38, points: 0.5, dateCaptured: "2026-04-01", source: "Phone" },
  // Leader Bank
  { id: "r7", lenderId: "3", product: "30yr", rate: 6.125, apr: 6.22, points: 0.25, dateCaptured: "2026-04-04", source: "Website" },
  { id: "r8", lenderId: "3", product: "15yr", rate: 5.5, apr: 5.62, points: 0.25, dateCaptured: "2026-04-04", source: "Website" },
  { id: "r9", lenderId: "3", product: "jumbo", rate: 6.5, apr: 6.58, points: 0, dateCaptured: "2026-04-04", source: "Website" },
  // DCU
  { id: "r10", lenderId: "4", product: "30yr", rate: 5.99, apr: 6.05, points: 0, dateCaptured: "2026-04-05", source: "Website" },
  { id: "r11", lenderId: "4", product: "15yr", rate: 5.375, apr: 5.42, points: 0, dateCaptured: "2026-04-05", source: "Website" },
  { id: "r12", lenderId: "4", product: "HELOC", rate: 7.49, apr: 7.49, points: 0, dateCaptured: "2026-04-05", source: "Website" },
  // Citizens Bank
  { id: "r13", lenderId: "5", product: "30yr", rate: 6.5, apr: 6.62, points: 0, dateCaptured: "2026-04-01", source: "Website" },
  { id: "r14", lenderId: "5", product: "ARM", rate: 5.75, apr: 6.35, points: 0, dateCaptured: "2026-04-01", source: "Website" },
  { id: "r15", lenderId: "5", product: "jumbo", rate: 6.375, apr: 6.42, points: 0.5, dateCaptured: "2026-04-01", source: "Website" },
  // Webster Bank
  { id: "r16", lenderId: "6", product: "30yr", rate: 6.375, apr: 6.48, points: 0, dateCaptured: "2026-04-02", source: "Website" },
  { id: "r17", lenderId: "6", product: "15yr", rate: 5.75, apr: 5.85, points: 0, dateCaptured: "2026-04-02", source: "Website" },
  { id: "r18", lenderId: "6", product: "investor", rate: 7.125, apr: 7.25, points: 0, dateCaptured: "2026-04-02", source: "Phone" },
];
