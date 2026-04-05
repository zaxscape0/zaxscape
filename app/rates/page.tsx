"use client";

import { useState, useCallback } from "react";
import { seedLenders, seedRates, Lender, RateEntry } from "@/lib/rates-data";
import { LenderDirectory } from "@/components/rates/lender-directory";
import { RateTable } from "@/components/rates/rate-table";
import { BestRates } from "@/components/rates/best-rates";
import { ComparisonView } from "@/components/rates/comparison-view";

export default function RatesPage() {
  const [lenders, setLenders] = useState<Lender[]>(seedLenders);
  const [rates, setRates] = useState<RateEntry[]>(seedRates);

  const handleAddLender = useCallback((lender: Omit<Lender, "id">) => {
    setLenders((prev) => [
      ...prev,
      { ...lender, id: `custom-${Date.now()}` },
    ]);
  }, []);

  const handleAddRate = useCallback((rate: Omit<RateEntry, "id">) => {
    setRates((prev) => [
      ...prev,
      { ...rate, id: `custom-${Date.now()}` },
    ]);
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-sm font-semibold uppercase tracking-wider">Rates & Lenders</h1>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-4 lg:col-span-2">
          <LenderDirectory lenders={lenders} onAddLender={handleAddLender} />
          <RateTable rates={rates} lenders={lenders} onAddRate={handleAddRate} />
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <BestRates rates={rates} lenders={lenders} />
          <ComparisonView rates={rates} lenders={lenders} />
        </div>
      </div>
    </div>
  );
}
