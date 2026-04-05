"use client";

import { cn } from "@/lib/utils";
import { formatPct, formatNumber } from "@/lib/utils";
import type { MarketIndex } from "@/lib/mock-data";

function MiniSparkline({
  data,
  isUp,
}: {
  data: number[];
  isUp: boolean;
}) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const height = 20;
  const width = 48;
  const step = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * step},${height - ((v - min) / range) * height}`)
    .join(" ");

  return (
    <svg
      width={width}
      height={height}
      className="shrink-0"
      viewBox={`0 0 ${width} ${height}`}
    >
      <polyline
        fill="none"
        stroke={isUp ? "hsl(var(--up))" : "hsl(var(--down))"}
        strokeWidth="1.5"
        points={points}
      />
    </svg>
  );
}

export function MarketCard({ data }: { data: MarketIndex }) {
  const isUp = data.changePct >= 0;
  const priceDecimals = data.price < 100 ? 3 : data.price < 1000 ? 2 : 2;

  return (
    <div className="flex items-center gap-3 rounded-md border bg-card px-3 py-2 min-w-[180px]">
      <div className="flex-1 min-w-0">
        <div className="text-xxs font-medium text-muted-foreground truncate">
          {data.name}
        </div>
        <div className="font-mono text-sm font-semibold tabular-nums">
          {formatNumber(data.price, priceDecimals)}
        </div>
        <div
          className={cn(
            "font-mono text-xxs tabular-nums",
            isUp ? "text-up" : "text-down"
          )}
        >
          {formatPct(data.changePct)}
        </div>
      </div>
      <MiniSparkline data={data.sparkline} isUp={isUp} />
    </div>
  );
}
