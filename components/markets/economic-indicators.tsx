"use client";

import { formatNumber } from "@/lib/format";

// Mock yield curve data (FRED-style)
const yieldCurveData = [
  { maturity: "1M", rate: 5.33, prev: 5.35 },
  { maturity: "3M", rate: 5.22, prev: 5.25 },
  { maturity: "6M", rate: 5.05, prev: 5.10 },
  { maturity: "1Y", rate: 4.72, prev: 4.80 },
  { maturity: "2Y", rate: 4.52, prev: 4.60 },
  { maturity: "3Y", rate: 4.35, prev: 4.42 },
  { maturity: "5Y", rate: 4.22, prev: 4.28 },
  { maturity: "7Y", rate: 4.28, prev: 4.32 },
  { maturity: "10Y", rate: 4.22, prev: 4.25 },
  { maturity: "20Y", rate: 4.48, prev: 4.50 },
  { maturity: "30Y", rate: 4.38, prev: 4.40 },
];

const economicData = [
  { indicator: "Fed Funds Rate", value: "5.25 - 5.50%", change: "Unchanged", date: "Mar 2026" },
  { indicator: "CPI (YoY)", value: "3.1%", change: "-0.2%", date: "Feb 2026" },
  { indicator: "Core CPI (YoY)", value: "3.8%", change: "-0.1%", date: "Feb 2026" },
  { indicator: "GDP Growth (Q4)", value: "3.2%", change: "+0.1%", date: "Q4 2025" },
  { indicator: "Unemployment", value: "3.7%", change: "Unchanged", date: "Mar 2026" },
  { indicator: "10Y-2Y Spread", value: "-0.30%", change: "+0.08%", date: "Today" },
];

export function EconomicIndicators() {
  return (
    <div className="space-y-4">
      {/* Yield Curve */}
      <div className="rounded-md border bg-card p-4">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-3">
          Treasury Yield Curve
        </h3>
        <div className="overflow-x-auto">
          <div className="flex gap-0 min-w-[500px]">
            {yieldCurveData.map((point) => {
              const change = point.rate - point.prev;
              const barHeight = Math.max(10, ((point.rate - 3.5) / 2.5) * 100);
              const isUp = change >= 0;

              return (
                <div key={point.maturity} className="flex-1 flex flex-col items-center">
                  <span
                    className={`text-xxs font-mono tabular-nums mb-1 ${
                      isUp ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {formatNumber(change, 2)}
                  </span>
                  <span className="text-xs font-mono tabular-nums font-bold mb-1">
                    {formatNumber(point.rate, 2)}%
                  </span>
                  <div className="w-full px-0.5">
                    <div
                      className="w-full rounded-t bg-primary/60"
                      style={{ height: `${barHeight}px` }}
                    />
                  </div>
                  <span className="text-xxs text-muted-foreground mt-1 font-mono">
                    {point.maturity}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Economic Data Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-2">
          Key Economic Indicators
        </h3>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b bg-muted/30">
              <th className="px-4 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider text-xxs">
                Indicator
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground uppercase tracking-wider text-xxs">
                Value
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground uppercase tracking-wider text-xxs">
                Change
              </th>
              <th className="px-4 py-2 text-right font-medium text-muted-foreground uppercase tracking-wider text-xxs">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {economicData.map((row) => (
              <tr key={row.indicator} className="border-b border-border/50">
                <td className="px-4 py-2 font-medium">{row.indicator}</td>
                <td className="px-4 py-2 text-right font-mono tabular-nums font-bold">
                  {row.value}
                </td>
                <td className="px-4 py-2 text-right font-mono tabular-nums text-muted-foreground">
                  {row.change}
                </td>
                <td className="px-4 py-2 text-right text-muted-foreground">
                  {row.date}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
