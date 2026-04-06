"use client";

import { useState, useMemo, useEffect } from "react";
import { QuoteData } from "@/lib/use-market-data";
import {
  useChartData,
  TimeRange,
  ChartDataPoint,
} from "@/lib/use-chart-data";
import { formatNumber, formatPercent, formatCompact } from "@/lib/format";
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Cell,
} from "recharts";
import { X, Loader2, Bookmark, BookmarkCheck } from "lucide-react";
import { useSaved } from "@/lib/saved-store";

// ─── Types ───────────────────────────────────────────────────────────────────

type ChartType = "line" | "area" | "candle";

const TIME_RANGES: TimeRange[] = ["1D", "5D", "1M", "3M", "6M", "YTD", "1Y", "5Y"];

interface StockDetailProps {
  quote: QuoteData;
  onClose: () => void;
}

// ─── Custom Candlestick Shape ────────────────────────────────────────────────

interface CandlestickProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ChartDataPoint;
  yAxis?: { scale: (v: number) => number };
}

function CandlestickShape(props: CandlestickProps) {
  const { x = 0, width = 0, payload, yAxis } = props;
  if (!payload || !yAxis?.scale) return null;

  const { open, high, low, close } = payload;
  if (open == null || high == null || low == null || close == null) return null;

  const isUp = close >= open;
  const color = isUp ? "#22c55e" : "#ef4444";

  const yHigh = yAxis.scale(high);
  const yLow = yAxis.scale(low);
  const yOpen = yAxis.scale(open);
  const yClose = yAxis.scale(close);

  const bodyTop = Math.min(yOpen, yClose);
  const bodyHeight = Math.max(Math.abs(yOpen - yClose), 1);
  const center = x + width / 2;

  return (
    <g>
      {/* Wick */}
      <line x1={center} y1={yHigh} x2={center} y2={yLow} stroke={color} strokeWidth={1} />
      {/* Body */}
      <rect
        x={x + width * 0.15}
        y={bodyTop}
        width={width * 0.7}
        height={bodyHeight}
        fill={isUp ? color : color}
        stroke={color}
        strokeWidth={0.5}
        opacity={isUp ? 0.9 : 0.9}
      />
    </g>
  );
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint }>;
  chartType: ChartType;
  previousClose: number;
}

function ChartTooltip({ active, payload, chartType, previousClose }: CustomTooltipProps) {
  if (!active || !payload?.[0]) return null;
  const d = payload[0].payload;

  return (
    <div
      style={{
        background: "#13131a",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 4,
        padding: "8px 12px",
        fontFamily: "monospace",
        fontSize: 11,
      }}
    >
      <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{d.time}</div>
      {chartType === "candle" ? (
        <>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>O</span>
            <span style={{ color: "#e2e2e2" }}>{d.open != null ? formatNumber(d.open, 2) : "—"}</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>H</span>
            <span style={{ color: "#e2e2e2" }}>{d.high != null ? formatNumber(d.high, 2) : "—"}</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>L</span>
            <span style={{ color: "#e2e2e2" }}>{d.low != null ? formatNumber(d.low, 2) : "—"}</span>
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            <span style={{ color: "rgba(255,255,255,0.5)" }}>C</span>
            <span style={{ color: "#e2e2e2" }}>{d.close != null ? formatNumber(d.close, 2) : "—"}</span>
          </div>
        </>
      ) : (
        <div style={{ color: "#e2e2e2" }}>
          {d.close != null ? formatNumber(d.close, 2) : "—"}
          {d.close != null && previousClose > 0 && (
            <span
              style={{
                marginLeft: 8,
                color: d.close >= previousClose ? "#22c55e" : "#ef4444",
                fontSize: 10,
              }}
            >
              {d.close >= previousClose ? "+" : ""}
              {formatPercent(((d.close - previousClose) / previousClose) * 100)}
            </span>
          )}
        </div>
      )}
      {d.volume != null && (
        <div style={{ color: "rgba(255,255,255,0.35)", marginTop: 4, fontSize: 10 }}>
          Vol: {formatCompact(d.volume)}
        </div>
      )}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function StockDetail({ quote, onClose }: StockDetailProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>("1D");
  const [chartType, setChartType] = useState<ChartType>("area");
  const { isSaved, toggleSave } = useSaved();
  const saved = isSaved("stock", quote.symbol);
  const { data: chartData, loading } = useChartData(quote.symbol, timeRange);

  const isUp = (chartData?.change ?? quote.change) >= 0;
  const upColor = "#22c55e";
  const downColor = "#ef4444";
  const lineColor = isUp ? upColor : downColor;

  const previousClose = chartData?.previousClose ?? quote.previousClose;

  // Compute Y domain with some padding
  const { yDomain, volumeMax } = useMemo(() => {
    const points = chartData?.data ?? [];
    if (points.length === 0) return { yDomain: [0, 100] as [number, number], volumeMax: 0 };

    let min = Infinity;
    let max = -Infinity;
    let vMax = 0;

    for (const p of points) {
      if (chartType === "candle") {
        if (p.low != null && p.low < min) min = p.low;
        if (p.high != null && p.high > max) max = p.high;
      } else {
        if (p.close != null && p.close < min) min = p.close;
        if (p.close != null && p.close > max) max = p.close;
      }
      if (p.volume != null && p.volume > vMax) vMax = p.volume;
    }

    // Include previousClose in range
    if (previousClose > 0) {
      if (previousClose < min) min = previousClose;
      if (previousClose > max) max = previousClose;
    }

    const padding = (max - min) * 0.05 || max * 0.01;
    return {
      yDomain: [min - padding, max + padding] as [number, number],
      volumeMax: vMax,
    };
  }, [chartData, chartType, previousClose]);

  // Prepare candlestick bar data range (high - low) for bar positioning
  const candleData = useMemo(() => {
    if (chartType !== "candle" || !chartData?.data) return chartData?.data ?? [];
    return chartData.data.map((p) => ({
      ...p,
      // Bar needs a numeric value — we use close for positioning but render custom shape
      candleRange: p.high != null && p.low != null ? p.high - p.low : 0,
      candleBase: p.low ?? 0,
    }));
  }, [chartData, chartType]);

  const points = chartType === "candle" ? candleData : (chartData?.data ?? []);

  // Tick formatter for X axis — show fewer ticks
  const xTickCount = useMemo(() => {
    const len = points.length;
    if (len <= 20) return len;
    if (len <= 50) return 8;
    if (len <= 100) return 10;
    return 12;
  }, [points.length]);

  const currentPrice = chartData?.price ?? quote.price;
  const currentChange = chartData?.change ?? quote.change;
  const currentChangePct = chartData?.changePct ?? quote.changePct;
  const name = chartData?.name ?? quote.name;

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      {/* ─── Header ─── */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="text-xl font-bold font-mono tracking-tight">
              {quote.symbol.replace("^", "")}
            </h3>
            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
              {name}
            </span>
            <span className="text-xxs text-muted-foreground/50 font-mono">
              {chartData?.exchange ?? quote.exchange}
            </span>
          </div>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-3xl font-bold font-mono tabular-nums">
              {formatNumber(currentPrice, 2)}
            </span>
            <span
              className="text-sm font-mono tabular-nums font-medium"
              style={{ color: isUp ? upColor : downColor }}
            >
              {isUp ? "+" : ""}
              {formatNumber(currentChange, 2)}
            </span>
            <span
              className="text-sm font-mono tabular-nums"
              style={{ color: isUp ? upColor : downColor }}
            >
              ({formatPercent(currentChangePct)})
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => toggleSave({
              type: "stock",
              title: quote.symbol,
              keyMetric: `${formatPercent(quote.changePct)}`,
              price: quote.price,
              notes: "",
              href: "/markets",
            })}
            className={`rounded-md p-1.5 transition-colors ${
              saved ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ─── Controls ─── */}
      <div className="flex items-center justify-between px-4 pb-3">
        {/* Time Range Buttons */}
        <div className="flex items-center gap-0.5 rounded-md bg-muted/30 p-0.5">
          {TIME_RANGES.map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-2 py-1 text-[10px] font-mono font-medium rounded transition-all ${
                timeRange === r
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Chart Type Toggle */}
        <div className="flex items-center gap-0.5 rounded-md bg-muted/30 p-0.5">
          {(["line", "area", "candle"] as ChartType[]).map((t) => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={`px-2 py-1 text-[10px] font-mono font-medium rounded capitalize transition-all ${
                chartType === t
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              {t === "candle" ? "OHLC" : t}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Chart Area ─── */}
      <div className="relative" style={{ background: "#0d0d12" }}>
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[#0d0d12]/80">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Price Chart */}
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={points}
              margin={{ top: 16, right: 60, bottom: 0, left: 0 }}
            >
              <defs>
                <linearGradient id="areaGradUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={upColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={upColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="areaGradDown" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={downColor} stopOpacity={0.15} />
                  <stop offset="100%" stopColor={downColor} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="none"
                vertical={false}
              />

              <XAxis
                dataKey="time"
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                interval={Math.max(0, Math.floor(points.length / xTickCount))}
                height={28}
              />

              <YAxis
                yAxisId="price"
                orientation="right"
                domain={yDomain}
                tick={{ fontSize: 10, fill: "rgba(255,255,255,0.3)", fontFamily: "monospace" }}
                tickLine={false}
                axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
                width={56}
                tickFormatter={(v: number) => formatNumber(v, 2)}
                tickCount={8}
              />

              <YAxis
                yAxisId="volume"
                orientation="left"
                domain={[0, volumeMax * 5]}
                hide
              />

              {/* Previous Close Reference Line */}
              {previousClose > 0 && (
                <ReferenceLine
                  yAxisId="price"
                  y={previousClose}
                  stroke="rgba(255,255,255,0.15)"
                  strokeDasharray="4 4"
                  label={{
                    value: `Prev ${formatNumber(previousClose, 2)}`,
                    position: "left",
                    fill: "rgba(255,255,255,0.25)",
                    fontSize: 9,
                    fontFamily: "monospace",
                  }}
                />
              )}

              {/* Volume Bars */}
              <Bar
                yAxisId="volume"
                dataKey="volume"
                isAnimationActive={false}
                barSize={points.length > 200 ? 2 : points.length > 60 ? 3 : 6}
              >
                {points.map((entry, idx) => {
                  const d = entry as ChartDataPoint;
                  const volColor =
                    d.close != null && d.open != null && d.close >= d.open
                      ? upColor
                      : downColor;
                  return (
                    <Cell
                      key={idx}
                      fill={volColor}
                      fillOpacity={0.15}
                    />
                  );
                })}
              </Bar>

              {/* Chart rendering based on type */}
              {chartType === "area" && (
                <Area
                  yAxisId="price"
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  fill={isUp ? "url(#areaGradUp)" : "url(#areaGradDown)"}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {chartType === "line" && (
                <Line
                  yAxisId="price"
                  type="monotone"
                  dataKey="close"
                  stroke={lineColor}
                  strokeWidth={1.5}
                  dot={false}
                  isAnimationActive={false}
                />
              )}

              {chartType === "candle" && (
                <Bar
                  yAxisId="price"
                  dataKey="close"
                  isAnimationActive={false}
                  barSize={points.length > 200 ? 3 : points.length > 60 ? 5 : 10}
                  shape={(props: CandlestickProps) => {
                    // Access yAxis from the chart's internal coordinate system
                    const yAxis = {
                      scale: (v: number) => {
                        // Map value to pixel using domain and range
                        const [domMin, domMax] = yDomain;
                        const chartHeight = 400 - 16 - 28; // minus top margin and xAxis height
                        const top = 16; // top margin
                        const ratio = (v - domMin) / (domMax - domMin);
                        return top + chartHeight * (1 - ratio);
                      },
                    };
                    return <CandlestickShape {...props} yAxis={yAxis} />;
                  }}
                >
                  {points.map((_, idx) => (
                    <Cell
                      key={idx}
                      fill="transparent"
                    />
                  ))}
                </Bar>
              )}

              <Tooltip
                content={
                  <ChartTooltip
                    chartType={chartType}
                    previousClose={previousClose}
                  />
                }
                cursor={{
                  stroke: "rgba(255,255,255,0.2)",
                  strokeDasharray: "3 3",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Current Price Label on Right Edge */}
        <div
          className="absolute right-0 font-mono text-[10px] px-1.5 py-0.5 rounded-l"
          style={{
            top: (() => {
              if (!points.length || yDomain[0] === yDomain[1]) return "50%";
              const ratio = (currentPrice - yDomain[0]) / (yDomain[1] - yDomain[0]);
              const chartTop = 16;
              const chartHeight = 400 - 16 - 28;
              const y = chartTop + chartHeight * (1 - ratio);
              return `${Math.max(16, Math.min(360, y))}px`;
            })(),
            transform: "translateY(-50%)",
            background: isUp ? upColor : downColor,
            color: "#fff",
            zIndex: 5,
            fontSize: 10,
          }}
        >
          {formatNumber(currentPrice, 2)}
        </div>
      </div>

      {/* ─── Stats Panel ─── */}
      <div className="p-4 pt-3">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          <StatCell label="Open" value={formatNumber(chartData?.open ?? quote.open, 2)} />
          <StatCell label="High" value={formatNumber(chartData?.high ?? quote.high, 2)} />
          <StatCell label="Low" value={formatNumber(chartData?.low ?? quote.low, 2)} />
          <StatCell label="Close" value={formatNumber(currentPrice, 2)} />
          <StatCell label="Volume" value={formatCompact(chartData?.volume ?? quote.volume)} />
          <StatCell
            label="Avg Vol"
            value={chartData?.avgVolume ? formatCompact(chartData.avgVolume) : "—"}
          />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-7 gap-2 mt-2">
          <StatCell
            label="Mkt Cap"
            value={chartData?.marketCap ? formatCompact(chartData.marketCap) : quote.marketCap ? formatCompact(quote.marketCap) : "—"}
          />
          <StatCell label="Prev Close" value={formatNumber(previousClose, 2)} />
          <StatCell
            label="Day Range"
            value={`${formatNumber(chartData?.low ?? quote.low, 2)}–${formatNumber(chartData?.high ?? quote.high, 2)}`}
          />
          <StatCell
            label="Exchange"
            value={chartData?.exchange ?? quote.exchange}
          />
          <StatCell
            label="Currency"
            value={chartData?.currency ?? quote.currency}
          />
          <StatCell label="" value="" />
          <StatCell label="" value="" />
        </div>

        {/* News */}
        <StockNews symbol={quote.symbol.replace("^", "")} />
      </div>
    </div>
  );
}

// ─── Stock News ──────────────────────────────────────────────────────────────

interface NewsItem {
  title: string;
  url: string;
  source: string;
  publishedAt: string;
}

function StockNews({ symbol }: { symbol: string }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/markets/news?symbol=${encodeURIComponent(symbol)}`)
      .then((r) => r.json())
      .then((d) => {
        setNews(d.news || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [symbol]);

  const sourceBadgeColor: Record<string, string> = {
    "Reuters": "text-orange-400 border-orange-400/30",
    "Bloomberg": "text-purple-400 border-purple-400/30",
    "Financial Times": "text-pink-400 border-pink-400/30",
    "Yahoo Finance": "text-indigo-400 border-indigo-400/30",
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className="mt-3 border-t border-border/50 pt-3">
      <h4 className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-mono mb-2">
        Top News
      </h4>
      {loading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground/50">
          <div className="h-3 w-3 animate-spin rounded-full border border-muted-foreground/30 border-t-transparent" />
          Loading...
        </div>
      ) : news.length === 0 ? (
        <p className="text-xs text-muted-foreground/40 font-mono">No recent news</p>
      ) : (
        <div className="space-y-1.5">
          {news.map((item, i) => (
            <a
              key={i}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded px-1.5 py-1 text-xs hover:bg-accent/30 transition-colors group"
            >
              <span className="text-[9px] font-mono text-muted-foreground/50 tabular-nums whitespace-nowrap mt-0.5">
                {timeAgo(item.publishedAt)}
              </span>
              <span className="flex-1 text-foreground/80 group-hover:text-foreground leading-tight">
                {item.title}
              </span>
              <span className={`text-[8px] font-mono border rounded px-1 py-0.5 whitespace-nowrap ${sourceBadgeColor[item.source] || "text-muted-foreground border-border"}`}>
                {item.source}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Stat Cell ───────────────────────────────────────────────────────────────

function StatCell({ label, value }: { label: string; value: string }) {
  if (!label) return <div />;
  return (
    <div className="py-1.5">
      <p className="text-[9px] text-muted-foreground/60 uppercase tracking-widest font-mono">
        {label}
      </p>
      <p className="text-xs font-mono tabular-nums text-foreground/80 mt-0.5">
        {value}
      </p>
    </div>
  );
}
