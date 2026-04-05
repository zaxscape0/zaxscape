"use client";

import { useState, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,

  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { RateEntry, Lender, PRODUCT_LABELS } from "@/lib/rates-data";
import { formatNumber } from "@/lib/format";
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, X, Trophy } from "lucide-react";

interface RateTableProps {
  rates: RateEntry[];
  lenders: Lender[];
  onAddRate: (rate: Omit<RateEntry, "id">) => void;
}

const columnHelper = createColumnHelper<RateEntry & { lenderName: string }>();

export function RateTable({ rates, lenders, onAddRate }: RateTableProps) {
  const [sorting, setSorting] = useState<SortingState>([{ id: "rate", desc: false }]);
  const [productFilter, setProductFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    lenderId: lenders[0]?.id ?? "",
    product: "30yr" as RateEntry["product"],
    rate: 0,
    apr: 0,
    points: 0,
    source: "Website",
  });

  // Find best rate per product
  const bestRates = useMemo(() => {
    const best: Record<string, number> = {};
    for (const r of rates) {
      if (!best[r.product] || r.rate < best[r.product]) {
        best[r.product] = r.rate;
      }
    }
    return best;
  }, [rates]);

  const enrichedRates = useMemo(() => {
    return rates
      .map((r) => ({
        ...r,
        lenderName: lenders.find((l) => l.id === r.lenderId)?.name ?? "Unknown",
      }))
      .filter((r) => productFilter === "all" || r.product === productFilter);
  }, [rates, lenders, productFilter]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("lenderName", {
        header: "Lender",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("product", {
        header: "Product",
        cell: (info) => (
          <span className="rounded bg-muted px-1.5 py-0.5 text-xxs">
            {PRODUCT_LABELS[info.getValue()] ?? info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("rate", {
        header: "Rate",
        cell: (info) => {
          const val = info.getValue();
          const product = info.row.original.product;
          const isBest = bestRates[product] === val;
          return (
            <span className={`font-mono tabular-nums font-bold ${isBest ? "text-[hsl(var(--up))]" : ""}`}>
              {formatNumber(val, 3)}%
              {isBest && <Trophy className="inline h-3 w-3 ml-1 text-[hsl(var(--warning))]" />}
            </span>
          );
        },
      }),
      columnHelper.accessor("apr", {
        header: "APR",
        cell: (info) => (
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatNumber(info.getValue(), 3)}%
          </span>
        ),
      }),
      columnHelper.accessor("points", {
        header: "Points",
        cell: (info) => (
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatNumber(info.getValue(), 2)}
          </span>
        ),
      }),
      columnHelper.accessor("dateCaptured", {
        header: "Date",
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor("source", {
        header: "Source",
        cell: (info) => (
          <span className="text-muted-foreground">{info.getValue()}</span>
        ),
      }),
    ],
    [bestRates]
  );

  const table = useReactTable({
    data: enrichedRates,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSubmit = () => {
    if (!formData.rate) return;
    onAddRate({
      ...formData,
      dateCaptured: new Date().toISOString().split("T")[0],
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Rate Entries
          </h3>
          {/* Product filter */}
          <div className="flex rounded-md border bg-card overflow-hidden">
            {["all", "30yr", "15yr", "ARM", "HELOC", "jumbo", "investor"].map((p) => (
              <button
                key={p}
                onClick={() => setProductFilter(p)}
                className={`px-2 py-1 text-xxs transition-colors ${
                  productFilter === p
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {p === "all" ? "All" : PRODUCT_LABELS[p] ?? p}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {showForm ? "Cancel" : "Add Rate"}
        </button>
      </div>

      {/* Add Rate Form */}
      {showForm && (
        <div className="rounded-md border bg-card p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Lender</label>
              <select
                value={formData.lenderId}
                onChange={(e) => setFormData((p) => ({ ...p, lenderId: e.target.value }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
              >
                {lenders.map((l) => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Product</label>
              <select
                value={formData.product}
                onChange={(e) => setFormData((p) => ({ ...p, product: e.target.value as RateEntry["product"] }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
              >
                {Object.entries(PRODUCT_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Rate %</label>
              <input
                type="number"
                step="0.125"
                value={formData.rate || ""}
                onChange={(e) => setFormData((p) => ({ ...p, rate: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">APR %</label>
              <input
                type="number"
                step="0.01"
                value={formData.apr || ""}
                onChange={(e) => setFormData((p) => ({ ...p, apr: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Points</label>
              <input
                type="number"
                step="0.25"
                value={formData.points || ""}
                onChange={(e) => setFormData((p) => ({ ...p, points: parseFloat(e.target.value) || 0 }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs font-mono focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Source</label>
              <input
                value={formData.source}
                onChange={(e) => setFormData((p) => ({ ...p, source: e.target.value }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id} className="border-b bg-muted/30">
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-3 py-2 text-left font-medium text-muted-foreground uppercase tracking-wider text-xxs cursor-pointer select-none hover:text-foreground"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {{
                          asc: <ChevronUp className="h-3 w-3" />,
                          desc: <ChevronDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ?? (
                          <ArrowUpDown className="h-3 w-3 opacity-30" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/50 hover:bg-accent/30">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-3 py-2 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
