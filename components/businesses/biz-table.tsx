"use client";

import { useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { BusinessListing } from "@/lib/biz-data";
import { formatCurrency, formatCompact } from "@/lib/format";
import { BizFilterState } from "./biz-filters";
import { Eye, Calculator, Bookmark } from "lucide-react";

function multipleColor(mult: number | null): string {
  if (mult == null) return "text-muted-foreground";
  if (mult < 3) return "text-up";
  if (mult <= 4) return "text-warning";
  return "text-down";
}

function scoreColor(score: number): string {
  if (score > 70) return "text-up";
  if (score >= 50) return "text-warning";
  return "text-down";
}

function scoreBg(score: number): string {
  if (score > 70) return "bg-up/15";
  if (score >= 50) return "bg-warning/15";
  return "bg-down/15";
}

const columns: ColumnDef<BusinessListing, unknown>[] = [
  {
    accessorKey: "title",
    header: "Business",
    size: 220,
    cell: ({ row }) => (
      <div>
        <span className="font-medium text-foreground">{row.original.title}</span>
        <div className="flex gap-1 mt-0.5">
          {row.original.flags.stale && (
            <span className="rounded bg-warning/15 px-1 py-px text-[9px] font-medium text-warning">🟡 Stale</span>
          )}
          {row.original.flags.overpriced && (
            <span className="rounded bg-down/15 px-1 py-px text-[9px] font-medium text-down">🔴 Overpriced</span>
          )}
          {row.original.flags.incomplete && (
            <span className="rounded bg-amber-500/15 px-1 py-px text-[9px] font-medium text-amber-400">⚠️ Incomplete</span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "industry",
    header: "Industry",
    size: 110,
    cell: ({ row }) => (
      <span className="inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-xxs font-medium text-primary">
        {row.original.industry}
      </span>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    size: 90,
  },
  {
    accessorKey: "askingPrice",
    header: "Price",
    size: 100,
    cell: ({ row }) => (
      <span className="font-mono">{formatCurrency(row.original.askingPrice, 0)}</span>
    ),
  },
  {
    accessorKey: "revenue",
    header: "Revenue",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.revenue != null ? formatCompact(row.original.revenue) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "sdeCashFlow",
    header: "SDE",
    size: 90,
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.sdeCashFlow != null ? formatCompact(row.original.sdeCashFlow) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "askingMultiple",
    header: "Multiple",
    size: 80,
    cell: ({ row }) => {
      const m = row.original.askingMultiple;
      return (
        <span className={`font-mono font-semibold ${multipleColor(m)}`}>
          {m != null ? `${m.toFixed(1)}x` : "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "ebitda",
    header: "EBITDA",
    size: 85,
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.ebitda != null ? formatCompact(row.original.ebitda) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "employees",
    header: "Emp",
    size: 45,
    cell: ({ row }) => (
      <span className="font-mono">{row.original.employees ?? "—"}</span>
    ),
  },
  {
    accessorKey: "yearEstablished",
    header: "Est.",
    size: 50,
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">{row.original.yearEstablished ?? "—"}</span>
    ),
  },
  {
    id: "flags",
    header: "Flags",
    size: 120,
    cell: ({ row }) => {
      const b = row.original;
      return (
        <div className="flex gap-1 flex-wrap">
          {b.hasRecurringRevenue && <span className="text-xxs" title="Recurring Revenue">🔁</span>}
          {b.isSemiAbsentee && <span className="text-xxs" title="Semi-Absentee">🏖️</span>}
          {b.isFranchise && <span className="text-xxs" title="Franchise">🏪</span>}
        </div>
      );
    },
  },
  {
    accessorKey: "daysListed",
    header: "Days",
    size: 50,
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">{row.original.daysListed}</span>
    ),
  },
  {
    accessorKey: "brokerName",
    header: "Broker",
    size: 100,
    cell: ({ row }) => (
      <span className="text-muted-foreground truncate">{row.original.brokerName ?? "—"}</span>
    ),
  },
  {
    accessorKey: "sourcePlatform",
    header: "Source",
    size: 80,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.sourcePlatform}</span>
    ),
  },
  {
    accessorKey: "score",
    header: "Score",
    size: 55,
    cell: ({ row }) => (
      <span className={`inline-flex rounded px-1.5 py-0.5 text-xxs font-mono font-semibold ${scoreBg(row.original.score)} ${scoreColor(row.original.score)}`}>
        {row.original.score}
      </span>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 80,
    cell: () => (
      <div className="flex items-center gap-1">
        <button className="rounded p-1 hover:bg-accent" title="View">
          <Eye className="h-3 w-3 text-muted-foreground" />
        </button>
        <button className="rounded p-1 hover:bg-accent" title="Analyze">
          <Calculator className="h-3 w-3 text-muted-foreground" />
        </button>
        <button className="rounded p-1 hover:bg-accent" title="Save">
          <Bookmark className="h-3 w-3 text-muted-foreground" />
        </button>
      </div>
    ),
  },
];

interface Props {
  data: BusinessListing[];
  filters: BizFilterState;
  onSelect: (listing: BusinessListing) => void;
}

export function BizTable({ data, filters, onSelect }: Props) {
  const filtered = useMemo(() => {
    let items = [...data];

    if (filters.industry !== "all") {
      items = items.filter((i) => i.industry === filters.industry);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.city.toLowerCase().includes(q)
      );
    }
    if (filters.priceMin) {
      const min = parseFloat(filters.priceMin.replace(/[^0-9.]/g, ""));
      if (!isNaN(min)) items = items.filter((i) => i.askingPrice >= min);
    }
    if (filters.priceMax) {
      const max = parseFloat(filters.priceMax.replace(/[^0-9.]/g, ""));
      if (!isNaN(max)) items = items.filter((i) => i.askingPrice <= max);
    }
    if (filters.revenueMin) {
      const min = parseFloat(filters.revenueMin.replace(/[^0-9.]/g, ""));
      if (!isNaN(min)) items = items.filter((i) => (i.revenue ?? 0) >= min);
    }
    if (filters.revenueMax) {
      const max = parseFloat(filters.revenueMax.replace(/[^0-9.]/g, ""));
      if (!isNaN(max)) items = items.filter((i) => (i.revenue ?? Infinity) <= max);
    }
    if (filters.sdeMin) {
      const min = parseFloat(filters.sdeMin.replace(/[^0-9.]/g, ""));
      if (!isNaN(min)) items = items.filter((i) => (i.sdeCashFlow ?? 0) >= min);
    }
    if (filters.sdeMax) {
      const max = parseFloat(filters.sdeMax.replace(/[^0-9.]/g, ""));
      if (!isNaN(max)) items = items.filter((i) => (i.sdeCashFlow ?? Infinity) <= max);
    }
    if (filters.multipleMin) {
      const min = parseFloat(filters.multipleMin);
      if (!isNaN(min)) items = items.filter((i) => (i.askingMultiple ?? 0) >= min);
    }
    if (filters.multipleMax) {
      const max = parseFloat(filters.multipleMax);
      if (!isNaN(max)) items = items.filter((i) => (i.askingMultiple ?? Infinity) <= max);
    }
    if (filters.hasRecurring) items = items.filter((i) => i.hasRecurringRevenue);
    if (filters.semiAbsentee) items = items.filter((i) => i.isSemiAbsentee);
    if (filters.franchise) items = items.filter((i) => i.isFranchise);
    if (filters.status !== "all") items = items.filter((i) => i.status === filters.status);

    return items;
  }, [data, filters]);

  const effectiveSorting = useMemo((): SortingState => {
    const map: Record<string, { id: string; desc: boolean }> = {
      multiple: { id: "askingMultiple", desc: false },
      sde: { id: "sdeCashFlow", desc: true },
      revenue: { id: "revenue", desc: true },
      price: { id: "askingPrice", desc: false },
      daysListed: { id: "daysListed", desc: true },
      score: { id: "score", desc: true },
    };
    const s = map[filters.sortBy] ?? map.multiple;
    return [s];
  }, [filters.sortBy]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting: effectiveSorting },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="overflow-auto rounded-md border">
      <table className="w-full text-xs">
        <thead>
          {table.getHeaderGroups().map((hg) => (
            <tr key={hg.id} className="border-b bg-muted/30">
              {hg.headers.map((h) => (
                <th
                  key={h.id}
                  className="px-2 py-1.5 text-left text-xxs font-medium uppercase tracking-wider text-muted-foreground cursor-pointer select-none"
                  style={{ width: h.getSize() }}
                  onClick={h.column.getToggleSortingHandler()}
                >
                  <div className="flex items-center gap-1">
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === "asc" && "↑"}
                    {h.column.getIsSorted() === "desc" && "↓"}
                  </div>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b border-border/50 hover:bg-accent/30 cursor-pointer transition-colors"
              onClick={() => onSelect(row.original)}
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-2 py-1.5" style={{ width: cell.column.getSize() }}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
          {table.getRowModel().rows.length === 0 && (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                No businesses match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
