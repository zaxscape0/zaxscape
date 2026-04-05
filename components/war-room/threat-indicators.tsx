"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Indicator {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  category: "defense" | "commodity" | "volatility" | "currency";
}

// Simulated data — in production, wire to a market data API
function generateIndicators(): Indicator[] {
  const base: Omit<Indicator, "price" | "change" | "changePercent">[] = [
    { symbol: "LMT", name: "Lockheed Martin", category: "defense" },
    { symbol: "RTX", name: "Raytheon", category: "defense" },
    { symbol: "NOC", name: "Northrop Grumman", category: "defense" },
    { symbol: "GD", name: "General Dynamics", category: "defense" },
    { symbol: "BA", name: "Boeing", category: "defense" },
    { symbol: "CL=F", name: "Crude Oil", category: "commodity" },
    { symbol: "GC=F", name: "Gold", category: "commodity" },
    { symbol: "VIX", name: "Fear Index", category: "volatility" },
    { symbol: "USD/CNY", name: "Dollar/Yuan", category: "currency" },
    { symbol: "USD/RUB", name: "Dollar/Ruble", category: "currency" },
  ];

  const prices: Record<string, number> = {
    LMT: 468.32,
    RTX: 102.15,
    NOC: 478.90,
    GD: 289.44,
    BA: 178.52,
    "CL=F": 82.47,
    "GC=F": 2418.30,
    VIX: 18.42,
    "USD/CNY": 7.24,
    "USD/RUB": 92.15,
  };

  return base.map((b) => {
    const basePrice = prices[b.symbol] || 100;
    // Small random variation
    const pctChange = (Math.random() - 0.4) * 4; // slight upward bias for defense
    const change = basePrice * (pctChange / 100);
    return {
      ...b,
      price: basePrice + change,
      change,
      changePercent: pctChange,
    };
  });
}

const categoryLabels: Record<string, string> = {
  defense: "DEFENSE",
  commodity: "COMMODITIES",
  volatility: "VOLATILITY",
  currency: "FX RATES",
};

export function ThreatIndicators() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);

  useEffect(() => {
    setIndicators(generateIndicators());
    const interval = setInterval(() => {
      setIndicators(generateIndicators());
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (indicators.length === 0) return null;

  const grouped = indicators.reduce<Record<string, Indicator[]>>((acc, ind) => {
    (acc[ind.category] ??= []).push(ind);
    return acc;
  }, {});

  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-1">
        Key Indicators
      </h3>
      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat}>
          <p className="text-[9px] font-mono text-zinc-600 uppercase tracking-wider mb-1 px-1">
            {categoryLabels[cat] || cat}
          </p>
          <div className="space-y-0.5">
            {items.map((ind) => (
              <div
                key={ind.symbol}
                className="flex items-center justify-between bg-zinc-900/40 rounded px-2 py-1.5 group hover:bg-zinc-800/60 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-medium text-zinc-300 w-16">
                    {ind.symbol}
                  </span>
                  <span className="text-[9px] text-zinc-600 hidden xl:inline">
                    {ind.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-zinc-300">
                    {ind.category === "currency"
                      ? ind.price.toFixed(2)
                      : ind.price >= 1000
                        ? ind.price.toFixed(1)
                        : ind.price.toFixed(2)}
                  </span>
                  <span
                    className={cn(
                      "text-[10px] font-mono flex items-center gap-0.5",
                      ind.changePercent > 0
                        ? "text-green-400"
                        : ind.changePercent < 0
                          ? "text-red-400"
                          : "text-zinc-500"
                    )}
                  >
                    {ind.changePercent > 0 ? (
                      <TrendingUp className="h-2.5 w-2.5" />
                    ) : ind.changePercent < 0 ? (
                      <TrendingDown className="h-2.5 w-2.5" />
                    ) : (
                      <Minus className="h-2.5 w-2.5" />
                    )}
                    {ind.changePercent >= 0 ? "+" : ""}
                    {ind.changePercent.toFixed(2)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
