export interface RentRollEntry {
  unit: string;
  rent: number;
  occupied: boolean;
}

export interface REListing {
  id: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  propertyType: 'multifamily' | 'mixed_use' | 'retail' | 'office' | 'industrial' | 'land';
  askingPrice: number;
  units: number | null;
  sqft: number | null;
  lotSize: number | null;
  yearBuilt: number | null;
  occupancyPct: number | null;
  reportedNoi: number | null;
  estimatedNoi: number | null;
  reportedCapRate: number | null;
  estimatedCapRate: number | null;
  grossRent: number | null;
  taxes: number | null;
  insurance: number | null;
  hoa: number | null;
  pricePerUnit: number | null;
  pricePerSqft: number | null;
  brokerName: string | null;
  brokerCompany: string | null;
  brokerPhone: string | null;
  sourcePlatform: string;
  sourceUrl: string | null;
  daysListed: number;
  status: 'active' | 'under_contract' | 'sold' | 'off_market';
  notes: string;
  rentRoll: RentRollEntry[] | null;
}

export const propertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'multifamily', label: 'Multifamily' },
  { value: 'mixed_use', label: 'Mixed-Use' },
  { value: 'retail', label: 'Retail' },
  { value: 'office', label: 'Office' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'land', label: 'Land' },
] as const;

export const reStatuses = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'under_contract', label: 'Under Contract' },
  { value: 'sold', label: 'Sold' },
  { value: 'off_market', label: 'Off Market' },
] as const;

export const reSortOptions = [
  { value: 'capRate', label: 'Cap Rate' },
  { value: 'price', label: 'Price' },
  { value: 'pricePerUnit', label: 'Price/Unit' },
  { value: 'pricePerSqft', label: 'Price/SqFt' },
  { value: 'units', label: 'Units' },
  { value: 'daysListed', label: 'Days Listed' },
] as const;

export function getCapRate(listing: REListing): number | null {
  return listing.reportedCapRate ?? listing.estimatedCapRate ?? null;
}

export function getNoi(listing: REListing): number | null {
  return listing.reportedNoi ?? listing.estimatedNoi ?? null;
}

export function isEstimatedCapRate(listing: REListing): boolean {
  return listing.reportedCapRate == null && listing.estimatedCapRate != null;
}

export function isEstimatedNoi(listing: REListing): boolean {
  return listing.reportedNoi == null && listing.estimatedNoi != null;
}

export const propertyTypeLabels: Record<string, string> = {
  multifamily: 'Multifamily',
  mixed_use: 'Mixed-Use',
  retail: 'Retail',
  office: 'Office',
  industrial: 'Industrial',
  land: 'Land',
};

export const mockREListings: REListing[] = [];
