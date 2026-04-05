"use client";

import { useMemo } from "react";
import { RateEntry, Lender, PRODUCT_LABELS } from "@/lib/rates-data";
import { formatNumber } from "@/lib/format";
import { Trophy } from "lucide-react";

interface BestRatesProps {
  rates: RateEntry[];
  lenders: Lender[];
}

export function BestRates({ rates, lenders }: BestRatesProps) {
  const bestByProduct = useMemo(() => {
    const map: Record<string, RateEntry & { lenderName: string }> = {};
    for (const r of rates) {
      if (!map[r.product] || r.rate < map[r.product].rate) {
        map[r.product] = {
          ...r,
          lenderName: lenders.find((l) => l.id === r.lenderId)?.name ?? "Unknown",
        };
      }
    }
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  }, [rates, lenders]);

  return (
    <div className="rounded-md border bg-card p-4">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
        <Trophy className="h-3.5 w-3.5 text-[hsl(var(--warning))]" />
        Best Rates
      </h3>
      <div className="space-y-2">
        {bestByProduct.map(([product, entry]) => (
          <div
            key={product}
            className="flex items-center justify-between rounded-md bg-muted/30 p-2.5"
          >
            <div>
              <p className="text-xs font-medium">{PRODUCT_LABELS[product] ?? product}</p>
              <p className="text-xxs text-muted-foreground">{entry.lenderName}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold font-mono tabular-nums text-[hsl(var(--up))]">
                {formatNumber(entry.rate, 3)}%
              </p>
              <p className="text-xxs text-muted-foreground font-mono tabular-nums">
                APR {formatNumber(entry.apr, 3)}%
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
