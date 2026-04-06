"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { usePortfolio, Holding } from "@/lib/portfolio-store";
import { formatCurrency, formatPercent } from "@/lib/format";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RefreshCw, Plus, X, ArrowUpDown, TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react";
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Tooltip as ReTooltip } from "recharts";

interface QuoteData {
  price: number;
  change: number;
  changePct: number;
  name: string;
  error?: string;
}

interface HoldingRow {
  id: string;
  symbol: string;
  name: string;
  shares: number;
  avgCost: number;
  currentPrice: number;
  marketValue: number;
  gainLoss: number;
  gainLossPct: number;
  dayChange: number;
  weight: number;
  account: string;
}

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6",
  "#06b6d4", "#ec4899", "#f97316", "#14b8a6", "#6366f1",
];

const DIVIDEND_ESTIMATES: Record<string, number> = {
  AAPL: 0.96, MSFT: 3.0, GOOGL: 0, O: 3.06, SCHD: 2.7,
  VNQ: 3.2, SPY: 6.5, JPM: 4.6,
};

const columnHelper = createColumnHelper<HoldingRow>();

export default function PortfolioPage() {
  const { holdings, addHolding, removeHolding } = usePortfolio();
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({});
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  const fetchQuotes = useCallback(async () => {
    if (holdings.length === 0) { setLoading(false); return; }
    setLoading(true);
    try {
      const symbols = Array.from(new Set(holdings.map((h) => h.symbol))).join(",");
      const res = await fetch(`/api/markets/quote?symbols=${symbols}`);
      const data = await res.json();
      setQuotes(data);
    } catch (e) {
      console.error("Failed to fetch quotes", e);
    }
    setLoading(false);
  }, [holdings]);

  useEffect(() => { fetchQuotes(); }, [fetchQuotes]);

  const rows: HoldingRow[] = useMemo(() => {
    const totalValue = holdings.reduce((sum, h) => {
      const q = quotes[h.symbol];
      const price = q?.price ?? h.avgCost;
      return sum + h.shares * price;
    }, 0);

    return holdings.map((h) => {
      const q = quotes[h.symbol];
      const price = q?.price ?? h.avgCost;
      const marketValue = h.shares * price;
      const costBasis = h.shares * h.avgCost;
      const gainLoss = marketValue - costBasis;
      const gainLossPct = costBasis > 0 ? (gainLoss / costBasis) * 100 : 0;
      const dayChange = q ? h.shares * q.change : 0;
      return {
        id: h.id,
        symbol: h.symbol,
        name: q?.name || h.name,
        shares: h.shares,
        avgCost: h.avgCost,
        currentPrice: price,
        marketValue,
        gainLoss,
        gainLossPct,
        dayChange,
        weight: totalValue > 0 ? (marketValue / totalValue) * 100 : 0,
        account: h.account,
      };
    });
  }, [holdings, quotes]);

  const totals = useMemo(() => {
    const totalValue = rows.reduce((s, r) => s + r.marketValue, 0);
    const totalCost = holdings.reduce((s, h) => s + h.shares * h.avgCost, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPct = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
    const totalDayChange = rows.reduce((s, r) => s + r.dayChange, 0);
    const annualDividend = holdings.reduce((s, h) => {
      const div = DIVIDEND_ESTIMATES[h.symbol] ?? 0;
      return s + h.shares * div;
    }, 0);
    return { totalValue, totalCost, totalGainLoss, totalGainLossPct, totalDayChange, annualDividend };
  }, [rows, holdings]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("symbol", {
        header: "Symbol",
        cell: (info) => <span className="font-mono font-semibold text-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="text-muted-foreground truncate max-w-[140px] block">{info.getValue()}</span>,
      }),
      columnHelper.accessor("shares", {
        header: "Shares",
        cell: (info) => <span className="font-mono tabular-nums">{info.getValue()}</span>,
      }),
      columnHelper.accessor("avgCost", {
        header: "Avg Cost",
        cell: (info) => <span className="font-mono tabular-nums">{formatCurrency(info.getValue())}</span>,
      }),
      columnHelper.accessor("currentPrice", {
        header: "Price",
        cell: (info) => <span className="font-mono tabular-nums">{formatCurrency(info.getValue())}</span>,
      }),
      columnHelper.accessor("marketValue", {
        header: "Mkt Value",
        cell: (info) => <span className="font-mono tabular-nums">{formatCurrency(info.getValue())}</span>,
      }),
      columnHelper.accessor("gainLoss", {
        header: "Gain/Loss $",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={`font-mono tabular-nums ${v >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
              {v >= 0 ? "+" : ""}{formatCurrency(v)}
            </span>
          );
        },
      }),
      columnHelper.accessor("gainLossPct", {
        header: "Gain/Loss %",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={`font-mono tabular-nums ${v >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
              {formatPercent(v)}
            </span>
          );
        },
      }),
      columnHelper.accessor("dayChange", {
        header: "Day Chg",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span className={`font-mono tabular-nums ${v >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
              {v >= 0 ? "+" : ""}{formatCurrency(v)}
            </span>
          );
        },
      }),
      columnHelper.accessor("weight", {
        header: "Weight",
        cell: (info) => <span className="font-mono tabular-nums">{info.getValue().toFixed(1)}%</span>,
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <button
            onClick={() => removeHolding(info.row.original.id)}
            className="text-muted-foreground hover:text-[hsl(var(--down))] transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        ),
      }),
    ],
    [removeHolding]
  );

  const table = useReactTable({
    data: rows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const pieData = rows.map((r) => ({ name: r.symbol, value: r.marketValue }));

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-semibold uppercase tracking-wider">Portfolio</h1>
          <div className="flex items-center gap-3 text-xs">
            <span className="font-mono tabular-nums text-foreground">{formatCurrency(totals.totalValue)}</span>
            <span className={`font-mono tabular-nums ${totals.totalGainLoss >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
              {totals.totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totals.totalGainLoss)} ({formatPercent(totals.totalGainLossPct)})
            </span>
            <span className={`font-mono tabular-nums ${totals.totalDayChange >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
              Day: {totals.totalDayChange >= 0 ? "+" : ""}{formatCurrency(totals.totalDayChange)}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Holding
          </button>
          <button
            onClick={fetchQuotes}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono tabular-nums font-semibold">{formatCurrency(totals.totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Cost Basis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono tabular-nums font-semibold">{formatCurrency(totals.totalCost)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle className="flex items-center gap-1">
              {totals.totalGainLoss >= 0 ? <TrendingUp className="h-3 w-3 text-[hsl(var(--up))]" /> : <TrendingDown className="h-3 w-3 text-[hsl(var(--down))]" />}
              Total Gain/Loss
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-mono tabular-nums font-semibold ${totals.totalGainLoss >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
              {totals.totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totals.totalGainLoss)}
              <span className="text-xs ml-1">({formatPercent(totals.totalGainLossPct)})</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Day Change</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-lg font-mono tabular-nums font-semibold ${totals.totalDayChange >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
              {totals.totalDayChange >= 0 ? "+" : ""}{formatCurrency(totals.totalDayChange)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-0">
            <CardTitle>Annual Dividends (est.)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-mono tabular-nums font-semibold text-[hsl(var(--up))]">
              {formatCurrency(totals.annualDividend)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main content: Table + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Holdings Table */}
        <div className="lg:col-span-3 border rounded-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b bg-muted/30">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-2 py-1.5 text-left font-medium text-muted-foreground cursor-pointer select-none hover:text-foreground"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && <ArrowUpDown className="h-3 w-3 opacity-40" />}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-2 py-1.5">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-muted/20 font-semibold">
                  <td className="px-2 py-1.5 font-mono">TOTAL</td>
                  <td className="px-2 py-1.5"></td>
                  <td className="px-2 py-1.5"></td>
                  <td className="px-2 py-1.5"></td>
                  <td className="px-2 py-1.5"></td>
                  <td className="px-2 py-1.5 font-mono tabular-nums">{formatCurrency(totals.totalValue)}</td>
                  <td className={`px-2 py-1.5 font-mono tabular-nums ${totals.totalGainLoss >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
                    {totals.totalGainLoss >= 0 ? "+" : ""}{formatCurrency(totals.totalGainLoss)}
                  </td>
                  <td className={`px-2 py-1.5 font-mono tabular-nums ${totals.totalGainLossPct >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
                    {formatPercent(totals.totalGainLossPct)}
                  </td>
                  <td className={`px-2 py-1.5 font-mono tabular-nums ${totals.totalDayChange >= 0 ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}>
                    {totals.totalDayChange >= 0 ? "+" : ""}{formatCurrency(totals.totalDayChange)}
                  </td>
                  <td className="px-2 py-1.5 font-mono tabular-nums">100.0%</td>
                  <td className="px-2 py-1.5"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Allocation Chart */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-1"><PieChart className="h-3 w-3" /> Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <ReTooltip
                    contentStyle={{ background: "hsl(240 14% 7%)", border: "1px solid hsl(240 10% 14%)", borderRadius: 4, fontSize: 11 }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </RePieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {pieData.map((d, i) => (
                <div key={d.name} className="flex items-center justify-between text-xxs">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="font-mono">{d.name}</span>
                  </div>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {rows[i]?.weight.toFixed(1)}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <AddHoldingModal
          onClose={() => setShowAddModal(false)}
          onAdd={(h) => {
            addHolding(h);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

function AddHoldingModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (h: Omit<Holding, "id">) => void;
}) {
  const [symbol, setSymbol] = useState("");
  const [name, setName] = useState("");
  const [shares, setShares] = useState("");
  const [avgCost, setAvgCost] = useState("");
  const [account, setAccount] = useState("Brokerage");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !shares || !avgCost) return;
    onAdd({
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      shares: parseFloat(shares),
      avgCost: parseFloat(avgCost),
      account,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm rounded-md border bg-card p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Add Holding</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="text-xxs text-muted-foreground uppercase tracking-wider">Symbol *</label>
            <input
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="AAPL"
              required
            />
          </div>
          <div>
            <label className="text-xxs text-muted-foreground uppercase tracking-wider">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Apple Inc."
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xxs text-muted-foreground uppercase tracking-wider">Shares *</label>
              <input
                type="number"
                step="any"
                value={shares}
                onChange={(e) => setShares(e.target.value)}
                className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="100"
                required
              />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground uppercase tracking-wider">Avg Cost *</label>
              <input
                type="number"
                step="any"
                value={avgCost}
                onChange={(e) => setAvgCost(e.target.value)}
                className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="150.00"
                required
              />
            </div>
          </div>
          <div>
            <label className="text-xxs text-muted-foreground uppercase tracking-wider">Account</label>
            <select
              value={account}
              onChange={(e) => setAccount(e.target.value)}
              className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option>Brokerage</option>
              <option>IRA</option>
              <option>401k</option>
              <option>Roth IRA</option>
              <option>Other</option>
            </select>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Add Holding
          </button>
        </form>
      </div>
    </div>
  );
}
