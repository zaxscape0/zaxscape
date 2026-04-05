"use client";

import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { REListing, getCapRate, getNoi, isEstimatedCapRate, isEstimatedNoi, propertyTypeLabels } from "@/lib/re-data";
import { formatCurrency, formatCompact } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import { REFilterState } from "./re-filters";
import { Eye, Calculator, Bookmark } from "lucide-react";

function capRateColor(rate: number | null): string {
  if (rate == null) return "text-muted-foreground";
  if (rate > 8) return "text-up";
  if (rate >= 6) return "text-warning";
  return "text-down";
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    active: { label: "Active", cls: "bg-up/10 text-up" },
    under_contract: { label: "Under Contract", cls: "bg-warning/10 text-warning" },
    sold: { label: "Sold", cls: "bg-down/10 text-down" },
    off_market: { label: "Off Market", cls: "bg-muted text-muted-foreground" },
  };
  const s = map[status] ?? map.active;
  return <span className={`inline-flex rounded px-1.5 py-0.5 text-xxs font-medium ${s.cls}`}>{s.label}</span>;
}

function EstBadge() {
  return (
    <span className="ml-1 rounded bg-amber-500/15 px-1 py-px text-[9px] font-medium text-amber-400">
      Est
    </span>
  );
}

function typeBadge(type: string) {
  const colors: Record<string, string> = {
    multifamily: "bg-blue-500/15 text-blue-400",
    mixed_use: "bg-purple-500/15 text-purple-400",
    retail: "bg-emerald-500/15 text-emerald-400",
    office: "bg-cyan-500/15 text-cyan-400",
    industrial: "bg-orange-500/15 text-orange-400",
    land: "bg-yellow-500/15 text-yellow-400",
  };
  return (
    <span className={`inline-flex rounded px-1.5 py-0.5 text-xxs font-medium ${colors[type] ?? "bg-muted text-muted-foreground"}`}>
      {propertyTypeLabels[type] ?? type}
    </span>
  );
}

const columns: ColumnDef<REListing, unknown>[] = [
  {
    accessorKey: "address",
    header: "Address",
    size: 180,
    cell: ({ row }) => (
      <span className="font-medium text-foreground">{row.original.address}</span>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
    size: 100,
  },
  {
    accessorKey: "propertyType",
    header: "Type",
    size: 100,
    cell: ({ row }) => typeBadge(row.original.propertyType),
  },
  {
    accessorKey: "askingPrice",
    header: "Asking Price",
    size: 110,
    cell: ({ row }) => (
      <span className="font-mono">{formatCurrency(row.original.askingPrice, 0)}</span>
    ),
  },
  {
    accessorKey: "units",
    header: "Units",
    size: 60,
    cell: ({ row }) => (
      <span className="font-mono">{row.original.units ?? "—"}</span>
    ),
  },
  {
    accessorKey: "sqft",
    header: "SqFt",
    size: 70,
    cell: ({ row }) => (
      <span className="font-mono">{row.original.sqft ? row.original.sqft.toLocaleString() : "—"}</span>
    ),
  },
  {
    id: "capRate",
    header: "Cap Rate",
    size: 90,
    accessorFn: (row) => getCapRate(row),
    cell: ({ row }) => {
      const rate = getCapRate(row.original);
      const est = isEstimatedCapRate(row.original);
      return (
        <span className={`font-mono font-semibold ${capRateColor(rate)}`}>
          {rate != null ? `${rate.toFixed(1)}%` : "—"}
          {est && <EstBadge />}
        </span>
      );
    },
    sortingFn: (a, b) => {
      const av = getCapRate(a.original) ?? -1;
      const bv = getCapRate(b.original) ?? -1;
      return av - bv;
    },
  },
  {
    id: "noi",
    header: "NOI",
    size: 90,
    accessorFn: (row) => getNoi(row),
    cell: ({ row }) => {
      const noi = getNoi(row.original);
      const est = isEstimatedNoi(row.original);
      return (
        <span className="font-mono">
          {noi != null ? formatCompact(noi) : "—"}
          {est && <EstBadge />}
        </span>
      );
    },
  },
  {
    accessorKey: "pricePerUnit",
    header: "$/Unit",
    size: 80,
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.pricePerUnit ? formatCompact(row.original.pricePerUnit) : "—"}
      </span>
    ),
  },
  {
    accessorKey: "pricePerSqft",
    header: "$/SqFt",
    size: 70,
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.pricePerSqft ? `$${row.original.pricePerSqft}` : "—"}
      </span>
    ),
  },
  {
    accessorKey: "yearBuilt",
    header: "Year",
    size: 55,
    cell: ({ row }) => (
      <span className="font-mono text-muted-foreground">{row.original.yearBuilt ?? "—"}</span>
    ),
  },
  {
    accessorKey: "occupancyPct",
    header: "Occ%",
    size: 55,
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.occupancyPct != null ? `${row.original.occupancyPct}%` : "—"}
      </span>
    ),
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
    accessorKey: "sourcePlatform",
    header: "Source",
    size: 80,
    cell: ({ row }) => (
      <span className="text-muted-foreground">{row.original.sourcePlatform}</span>
    ),
  },
  {
    id: "actions",
    header: "",
    size: 80,
    cell: ({ row }) => (
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
  data: REListing[];
  filters: REFilterState;
  onSelect: (listing: REListing) => void;
}

export function RETable({ data, filters, onSelect }: Props) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "capRate", desc: true },
  ]);

  const filtered = useMemo(() => {
    let items = [...data];

    if (filters.propertyType !== "all") {
      items = items.filter((i) => i.propertyType === filters.propertyType);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (i) =>
          i.address.toLowerCase().includes(q) ||
          i.city.toLowerCase().includes(q)
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
    if (filters.capRateMin) {
      const min = parseFloat(filters.capRateMin);
      if (!isNaN(min)) items = items.filter((i) => (getCapRate(i) ?? 0) >= min);
    }
    if (filters.capRateMax) {
      const max = parseFloat(filters.capRateMax);
      if (!isNaN(max)) items = items.filter((i) => (getCapRate(i) ?? 100) <= max);
    }
    if (filters.unitsMin) {
      const min = parseInt(filters.unitsMin);
      if (!isNaN(min)) items = items.filter((i) => (i.units ?? 0) >= min);
    }
    if (filters.unitsMax) {
      const max = parseInt(filters.unitsMax);
      if (!isNaN(max)) items = items.filter((i) => (i.units ?? 999) <= max);
    }
    if (filters.status !== "all") {
      items = items.filter((i) => i.status === filters.status);
    }

    return items;
  }, [data, filters]);

  // Apply custom sort from filters
  const effectiveSorting = useMemo(() => {
    const sortMap: Record<string, string> = {
      capRate: "capRate",
      price: "askingPrice",
      pricePerUnit: "pricePerUnit",
      pricePerSqft: "pricePerSqft",
      units: "units",
      daysListed: "daysListed",
    };
    const col = sortMap[filters.sortBy] ?? "capRate";
    const desc = filters.sortBy === "capRate"; // cap rate desc, others asc
    return [{ id: col, desc }];
  }, [filters.sortBy]);

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting: effectiveSorting },
    onSortingChange: setSorting,
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
                No properties match your filters.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
