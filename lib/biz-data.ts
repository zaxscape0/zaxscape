export interface BusinessListing {
  id: number;
  title: string;
  askingPrice: number;
  revenue: number | null;
  sdeCashFlow: number | null;
  ebitda: number | null;
  industry: string;
  subIndustry: string | null;
  city: string;
  state: string;
  zip: string;
  brokerName: string | null;
  brokerCompany: string | null;
  brokerPhone: string | null;
  brokerEmail: string | null;
  reasonForSale: string | null;
  description: string | null;
  employees: number | null;
  yearEstablished: number | null;
  isFranchise: boolean;
  isSemiAbsentee: boolean;
  hasRecurringRevenue: boolean;
  sourcePlatform: string;
  sourceUrl: string | null;
  daysListed: number;
  status: 'active' | 'under_loi' | 'sold';
  askingMultiple: number | null;
  score: number;
  flags: { stale?: boolean; overpriced?: boolean; incomplete?: boolean };
  notes: string;
}

export const bizIndustries = [
  { value: 'all', label: 'All Industries' },
  { value: 'Laundromat', label: 'Laundromat' },
  { value: 'Auto', label: 'Auto' },
  { value: 'Restaurant/Food', label: 'Restaurant/Food' },
  { value: 'HVAC/Trades', label: 'HVAC/Trades' },
  { value: 'Franchise', label: 'Franchise' },
  { value: 'Retail', label: 'Retail' },
  { value: 'Tech/SaaS', label: 'Tech/SaaS' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Manufacturing', label: 'Manufacturing' },
  { value: 'Services', label: 'Services' },
] as const;

export const bizStatuses = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'under_loi', label: 'Under LOI' },
  { value: 'sold', label: 'Sold' },
] as const;

export const bizSortOptions = [
  { value: 'multiple', label: 'Multiple' },
  { value: 'sde', label: 'SDE' },
  { value: 'revenue', label: 'Revenue' },
  { value: 'price', label: 'Price' },
  { value: 'daysListed', label: 'Days Listed' },
  { value: 'score', label: 'Score' },
] as const;

export function calculateBuyBoxScore(biz: BusinessListing): number {
  let score = 0;
  if (biz.askingMultiple != null) {
    if (biz.askingMultiple < 3) score += 25;
    else if (biz.askingMultiple <= 4) score += 15;
  }
  if (biz.hasRecurringRevenue) score += 20;
  if (biz.isSemiAbsentee) score += 15;
  if (biz.sdeCashFlow != null && biz.sdeCashFlow > 150000) score += 15;
  if (biz.yearEstablished != null && (new Date().getFullYear() - biz.yearEstablished) > 5) score += 10;
  if (biz.employees != null && biz.employees < 10) score += 5;
  // +5 for franchise or non-franchise (always +5)
  score += 5;
  if (biz.askingPrice < 2000000) score += 5;
  return score;
}

export function computeFlags(biz: BusinessListing): BusinessListing['flags'] {
  return {
    stale: biz.daysListed > 90,
    overpriced: biz.askingMultiple != null && biz.askingMultiple > 5,
    incomplete: biz.sdeCashFlow == null || biz.revenue == null,
  };
}

export function make(partial: Omit<BusinessListing, 'askingMultiple' | 'score' | 'flags'>): BusinessListing {
  const askingMultiple = partial.sdeCashFlow ? +(partial.askingPrice / partial.sdeCashFlow).toFixed(1) : null;
  const base = { ...partial, askingMultiple, score: 0, flags: {} };
  base.score = calculateBuyBoxScore(base);
  base.flags = computeFlags(base);
  return base;
}

export const mockBizListings: BusinessListing[] = []; // cleared — listings come from scrapers or manual entry
