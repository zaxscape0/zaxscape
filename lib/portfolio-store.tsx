"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  account: string;
}

interface PortfolioStore {
  holdings: Holding[];
  addHolding: (h: Omit<Holding, "id">) => void;
  removeHolding: (id: string) => void;
  updateHolding: (id: string, updates: Partial<Omit<Holding, "id">>) => void;
}

const PortfolioContext = createContext<PortfolioStore | null>(null);

const STORAGE_KEY = "zaxscape-portfolio";

const SEED_HOLDINGS: Holding[] = [
  { id: "h1", symbol: "AAPL", name: "Apple Inc.", shares: 50, avgCost: 145, account: "Brokerage" },
  { id: "h2", symbol: "MSFT", name: "Microsoft Corp.", shares: 30, avgCost: 310, account: "Brokerage" },
  { id: "h3", symbol: "GOOGL", name: "Alphabet Inc.", shares: 15, avgCost: 140, account: "IRA" },
  { id: "h4", symbol: "O", name: "Realty Income Corp.", shares: 100, avgCost: 55, account: "IRA" },
  { id: "h5", symbol: "SCHD", name: "Schwab US Dividend", shares: 80, avgCost: 75, account: "401k" },
  { id: "h6", symbol: "VNQ", name: "Vanguard Real Estate", shares: 60, avgCost: 80, account: "401k" },
  { id: "h7", symbol: "SPY", name: "SPDR S&P 500 ETF", shares: 25, avgCost: 450, account: "Brokerage" },
  { id: "h8", symbol: "JPM", name: "JPMorgan Chase & Co.", shares: 40, avgCost: 175, account: "Brokerage" },
];

export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setHoldings(parsed.length > 0 ? parsed : SEED_HOLDINGS);
      } else {
        setHoldings(SEED_HOLDINGS);
      }
    } catch {
      setHoldings(SEED_HOLDINGS);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(holdings));
  }, [holdings, loaded]);

  const addHolding = useCallback((h: Omit<Holding, "id">) => {
    setHoldings((prev) => [...prev, { ...h, id: crypto.randomUUID() }]);
  }, []);

  const removeHolding = useCallback((id: string) => {
    setHoldings((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const updateHolding = useCallback((id: string, updates: Partial<Omit<Holding, "id">>) => {
    setHoldings((prev) => prev.map((h) => (h.id === id ? { ...h, ...updates } : h)));
  }, []);

  return (
    <PortfolioContext.Provider value={{ holdings, addHolding, removeHolding, updateHolding }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export function usePortfolio() {
  const ctx = useContext(PortfolioContext);
  if (!ctx) throw new Error("usePortfolio must be used within PortfolioProvider");
  return ctx;
}
