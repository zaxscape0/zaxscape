export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  sparkline: number[];
}

export const marketIndexes: MarketIndex[] = [
  {
    symbol: "SPX",
    name: "S&P 500",
    price: 5248.49,
    change: 22.78,
    changePct: 0.44,
    sparkline: [5180, 5195, 5210, 5190, 5225, 5235, 5248],
  },
  {
    symbol: "NDX",
    name: "Nasdaq",
    price: 16384.47,
    change: -45.12,
    changePct: -0.27,
    sparkline: [16450, 16420, 16380, 16410, 16395, 16370, 16384],
  },
  {
    symbol: "DJI",
    name: "Dow",
    price: 39807.37,
    change: 134.21,
    changePct: 0.34,
    sparkline: [39600, 39650, 39700, 39680, 39750, 39790, 39807],
  },
  {
    symbol: "RUT",
    name: "Russell 2K",
    price: 2075.61,
    change: -8.43,
    changePct: -0.4,
    sparkline: [2090, 2085, 2080, 2078, 2072, 2070, 2075],
  },
  {
    symbol: "TNX",
    name: "10Y Yield",
    price: 4.218,
    change: -0.032,
    changePct: -0.75,
    sparkline: [4.28, 4.26, 4.25, 4.24, 4.23, 4.22, 4.218],
  },
  {
    symbol: "VIX",
    name: "VIX",
    price: 14.32,
    change: 0.87,
    changePct: 6.47,
    sparkline: [13.2, 13.5, 13.8, 14.0, 13.9, 14.1, 14.32],
  },
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 69421.0,
    change: 1247.0,
    changePct: 1.83,
    sparkline: [67800, 68100, 68500, 68200, 69000, 69200, 69421],
  },
  {
    symbol: "GC",
    name: "Gold",
    price: 2338.4,
    change: 12.6,
    changePct: 0.54,
    sparkline: [2310, 2315, 2322, 2328, 2330, 2335, 2338],
  },
  {
    symbol: "CL",
    name: "Oil (WTI)",
    price: 78.61,
    change: -0.84,
    changePct: -1.06,
    sparkline: [80.2, 79.8, 79.5, 79.2, 79.0, 78.8, 78.61],
  },
];

export interface RateSnapshot {
  product: string;
  rate: number;
  lender: string;
  updatedAt: string;
}

export const rateSnapshots: RateSnapshot[] = [
  { product: "30yr Fixed", rate: 6.25, lender: "First Credit Union", updatedAt: "2h ago" },
  { product: "15yr Fixed", rate: 5.625, lender: "PNC Bank", updatedAt: "4h ago" },
  { product: "5/1 ARM", rate: 5.875, lender: "Rockland Trust", updatedAt: "1d ago" },
  { product: "HELOC", rate: 7.99, lender: "Eastern Bank", updatedAt: "3h ago" },
];

export interface OpportunityItem {
  id: number;
  type: "business" | "property";
  title: string;
  price: number;
  metric: string;
  metricLabel: string;
  city: string;
  daysListed: number;
}

export const opportunities: OpportunityItem[] = [
  {
    id: 1,
    type: "property",
    title: "4-Unit Multifamily",
    price: 320000,
    metric: "8.2%",
    metricLabel: "Cap Rate",
    city: "Brockton, MA",
    daysListed: 3,
  },
  {
    id: 2,
    type: "business",
    title: "Coin Laundromat",
    price: 185000,
    metric: "2.8x",
    metricLabel: "Multiple",
    city: "Quincy, MA",
    daysListed: 5,
  },
  {
    id: 3,
    type: "property",
    title: "6-Unit Mixed Use",
    price: 480000,
    metric: "7.5%",
    metricLabel: "Cap Rate",
    city: "Worcester, MA",
    daysListed: 1,
  },
  {
    id: 4,
    type: "business",
    title: "Auto Repair Shop",
    price: 250000,
    metric: "3.1x",
    metricLabel: "Multiple",
    city: "Fall River, MA",
    daysListed: 8,
  },
  {
    id: 5,
    type: "property",
    title: "8-Unit Apartment",
    price: 550000,
    metric: "6.9%",
    metricLabel: "Cap Rate",
    city: "Lynn, MA",
    daysListed: 12,
  },
  {
    id: 6,
    type: "business",
    title: "Pizza Restaurant",
    price: 125000,
    metric: "2.2x",
    metricLabel: "Multiple",
    city: "Lowell, MA",
    daysListed: 2,
  },
];

export interface WatchlistMover {
  symbol: string;
  name: string;
  price: number;
  changePct: number;
}

export const watchlistMovers: WatchlistMover[] = [
  { symbol: "AAPL", name: "Apple", price: 178.72, changePct: 2.31 },
  { symbol: "O", name: "Realty Income", price: 54.38, changePct: 1.14 },
  { symbol: "MSFT", name: "Microsoft", price: 422.86, changePct: -0.52 },
  { symbol: "SCHD", name: "Schwab Dividend", price: 78.94, changePct: 0.87 },
  { symbol: "VNQ", name: "Vanguard REIT", price: 82.13, changePct: -1.23 },
];

export interface AlertItem {
  id: number;
  type: "new_listing" | "rate_drop" | "price_cut";
  message: string;
  time: string;
}

export const recentAlerts: AlertItem[] = [
  {
    id: 1,
    type: "new_listing",
    message: "New listing: Auto shop $250K in Fall River",
    time: "12m ago",
  },
  {
    id: 2,
    type: "rate_drop",
    message: "Rate drop: First Credit Union 30yr now 6.25%",
    time: "2h ago",
  },
  {
    id: 3,
    type: "price_cut",
    message: "Price cut: 8-unit MF reduced to $550K",
    time: "5h ago",
  },
  {
    id: 4,
    type: "new_listing",
    message: "New listing: Coin laundromat $185K in Quincy",
    time: "8h ago",
  },
];
