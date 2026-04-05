"use client";

import { useMemo } from "react";
import { QuoteData } from "@/lib/use-market-data";
import { formatNumber, formatPercent, formatCompact } from "@/lib/format";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { X } from "lucide-react";

interface StockDetailProps {
  quote: QuoteData;
  onClose: () => void;
}

export function StockDetail({ quote, onClose }: StockDetailProps) {
  const chartData = useMemo(() => {
    if (!quote.timestamps || !quote.closes) return [];
    return quote.timestamps.map((ts, i) => ({
      time: new Date(ts * 1000).toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
      }),
      price: quote.closes[i],
    })).filter((d) => d.price != null);
  }, [quote]);

  const isUp = quote.change >= 0;
  const chartColor = isUp ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)";

  return (
    <div className="rounded-md border bg-card p-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold font-mono">
              {quote.symbol.replace("^", "")}
            </h3>
            <span className="text-sm text-muted-foreground">{quote.name}</span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl font-bold font-mono tabular-nums">
              {formatNumber(quote.price, 2)}
            </span>
            <span
              className={`text-sm font-mono tabular-nums ${
                isUp ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"
              }`}
            >
              {isUp ? "+" : ""}
              {formatNumber(quote.change, 2)} ({formatPercent(quote.changePct)})
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 hover:bg-accent text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Price Chart */}
      <div className="h-64 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(240, 10%, 14%)" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: "hsl(240, 5%, 50%)" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={["auto", "auto"]}
              tick={{ fontSize: 10, fill: "hsl(240, 5%, 50%)" }}
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v) => formatNumber(v, 2)}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(240, 14%, 7%)",
                border: "1px solid hsl(240, 10%, 14%)",
                borderRadius: "6px",
                fontSize: "12px",
                fontFamily: "monospace",
              }}
              labelStyle={{ color: "hsl(240, 5%, 50%)" }}
              formatter={(value) => [formatNumber(Number(value), 2), "Price"]}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={chartColor}
              fill="url(#priceGradient)"
              strokeWidth={1.5}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Key Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatItem label="Open" value={formatNumber(quote.open, 2)} />
        <StatItem label="High" value={formatNumber(quote.high, 2)} />
        <StatItem label="Low" value={formatNumber(quote.low, 2)} />
        <StatItem label="Volume" value={formatCompact(quote.volume)} />
        <StatItem label="Prev Close" value={formatNumber(quote.previousClose, 2)} />
        <StatItem
          label="Day Range"
          value={`${formatNumber(quote.low, 2)} - ${formatNumber(quote.high, 2)}`}
        />
        <StatItem label="Exchange" value={quote.exchange} />
        {quote.marketCap ? (
          <StatItem label="Mkt Cap" value={formatCompact(quote.marketCap)} />
        ) : (
          <StatItem label="Currency" value={quote.currency} />
        )}
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-muted/30 p-2">
      <p className="text-xxs text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className="text-sm font-mono tabular-nums mt-0.5">{value}</p>
    </div>
  );
}
