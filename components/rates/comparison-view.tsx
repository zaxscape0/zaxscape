"use client";

import { useMemo, useState } from "react";
import { RateEntry, Lender, PRODUCT_LABELS } from "@/lib/rates-data";
import { formatNumber } from "@/lib/format";

interface ComparisonViewProps {
  rates: RateEntry[];
  lenders: Lender[];
}

export function ComparisonView({ rates, lenders }: ComparisonViewProps) {
  const [selectedProduct, setSelectedProduct] = useState("30yr");

  const products = useMemo(() => {
    return Array.from(new Set(rates.map((r) => r.product))).sort();
  }, [rates]);

  const comparisonData = useMemo(() => {
    return rates
      .filter((r) => r.product === selectedProduct)
      .map((r) => ({
        ...r,
        lenderName: lenders.find((l) => l.id === r.lenderId)?.name ?? "Unknown",
      }))
      .sort((a, b) => a.rate - b.rate);
  }, [rates, lenders, selectedProduct]);

  const bestRate = comparisonData[0]?.rate;

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Side-by-Side Comparison
        </h3>
        <select
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
          className="rounded-md border bg-background px-2 py-1 text-xs focus:border-primary focus:outline-none"
        >
          {products.map((p) => (
            <option key={p} value={p}>
              {PRODUCT_LABELS[p] ?? p}
            </option>
          ))}
        </select>
      </div>

      {comparisonData.length === 0 ? (
        <p className="text-xs text-muted-foreground">No rates for this product.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {comparisonData.map((entry) => {
            const isBest = entry.rate === bestRate;
            return (
              <div
                key={entry.id}
                className={`rounded-md p-3 ${
                  isBest
                    ? "bg-[hsl(var(--up))]/10 border border-[hsl(var(--up))]/20"
                    : "bg-muted/30"
                }`}
              >
                <p className="text-xs font-medium mb-1">{entry.lenderName}</p>
                <p
                  className={`text-lg font-bold font-mono tabular-nums ${
                    isBest ? "text-[hsl(var(--up))]" : ""
                  }`}
                >
                  {formatNumber(entry.rate, 3)}%
                </p>
                <div className="mt-1 space-y-0.5 text-xxs text-muted-foreground font-mono tabular-nums">
                  <p>APR: {formatNumber(entry.apr, 3)}%</p>
                  <p>Points: {formatNumber(entry.points, 2)}</p>
                  <p>{entry.dateCaptured}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
