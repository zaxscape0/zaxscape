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
import { QuoteData } from "@/lib/use-market-data";
import { formatNumber, formatPercent, formatCompact } from "@/lib/format";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

interface WatchlistTableProps {
  data: Record<string, QuoteData>;
  loading: boolean;
  onSelectSymbol: (symbol: string) => void;
  selectedSymbol: string | null;
}

const columnHelper = createColumnHelper<QuoteData>();

export function WatchlistTable({ data, loading, onSelectSymbol, selectedSymbol }: WatchlistTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const tableData = useMemo(() => {
    return Object.values(data).filter((d) => !d.error);
  }, [data]);

  const columns = useMemo(
    () => [
      columnHelper.accessor("symbol", {
        header: "Symbol",
        cell: (info) => (
          <span className="font-mono font-bold text-foreground">
            {info.getValue().replace("^", "")}
          </span>
        ),
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => (
          <span className="text-muted-foreground truncate max-w-[160px] block">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => (
          <span className="font-mono tabular-nums">
            {formatNumber(info.getValue(), 2)}
          </span>
        ),
      }),
      columnHelper.accessor("changePct", {
        header: "Change %",
        cell: (info) => {
          const val = info.getValue();
          const isUp = val >= 0;
          return (
            <span
              className={`font-mono tabular-nums ${isUp ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}
            >
              {formatPercent(val)}
            </span>
          );
        },
      }),
      columnHelper.accessor("change", {
        header: "Change $",
        cell: (info) => {
          const val = info.getValue();
          const isUp = val >= 0;
          return (
            <span
              className={`font-mono tabular-nums ${isUp ? "text-[hsl(var(--up))]" : "text-[hsl(var(--down))]"}`}
            >
              {isUp ? "+" : ""}
              {formatNumber(val, 2)}
            </span>
          );
        },
      }),
      columnHelper.accessor("volume", {
        header: "Volume",
        cell: (info) => (
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatCompact(info.getValue() ?? 0)}
          </span>
        ),
      }),
      columnHelper.accessor("marketCap", {
        header: "Mkt Cap",
        cell: (info) => (
          <span className="font-mono tabular-nums text-muted-foreground">
            {info.getValue() ? formatCompact(info.getValue()!) : "—"}
          </span>
        ),
      }),
      columnHelper.accessor("high", {
        header: "High",
        cell: (info) => (
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatNumber(info.getValue(), 2)}
          </span>
        ),
      }),
      columnHelper.accessor("low", {
        header: "Low",
        cell: (info) => (
          <span className="font-mono tabular-nums text-muted-foreground">
            {formatNumber(info.getValue(), 2)}
          </span>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: tableData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (loading) {
    return (
      <div className="rounded-md border bg-card p-4">
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-muted/30">
                {headerGroup.headers.map((header) => (
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
              <tr
                key={row.id}
                className={`border-b border-border/50 cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedSymbol === row.original.symbol ? "bg-accent" : ""
                }`}
                onClick={() => onSelectSymbol(row.original.symbol)}
              >
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
  );
}
