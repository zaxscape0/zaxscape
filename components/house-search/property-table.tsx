"use client";

import { useState, useMemo, Fragment } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import type { TaxDelinquentProperty } from "@/lib/mock-data";
import { PropertyDetail } from "./property-detail";
import type { FilterState } from "./filters";

const fmt = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const TYPE_LABELS: Record<string, string> = {
  single_family: "SFH",
  multi_family: "MF",
  condo: "Condo",
  commercial: "Comm",
  land: "Land",
};

const TYPE_COLORS: Record<string, string> = {
  single_family: "bg-blue-500/15 text-blue-400",
  multi_family: "bg-purple-500/15 text-purple-400",
  condo: "bg-cyan-500/15 text-cyan-400",
  commercial: "bg-amber-500/15 text-amber-400",
  land: "bg-emerald-500/15 text-emerald-400",
};

const STATUS_LABELS: Record<string, string> = {
  tax_lien: "Tax Lien",
  tax_title: "Tax Title",
  in_redemption: "Redemption",
  foreclosure_pending: "Foreclosure",
};

const STATUS_COLORS: Record<string, string> = {
  tax_lien: "bg-yellow-500/15 text-yellow-400",
  tax_title: "bg-orange-500/15 text-orange-400",
  in_redemption: "bg-blue-500/15 text-blue-400",
  foreclosure_pending: "bg-red-500/15 text-red-400",
};

const col = createColumnHelper<TaxDelinquentProperty>();

interface PropertyTableProps {
  data: TaxDelinquentProperty[];
  filters: FilterState;
  onNotesChange: (id: number, notes: string) => void;
}

export function PropertyTable({ data, filters, onNotesChange }: PropertyTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "yearsDelinquent", desc: true },
  ]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filter data
  const filtered = useMemo(() => {
    return data.filter((p) => {
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match =
          p.address.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q);
        if (!match) return false;
      }
      if (filters.town !== "all" && p.city !== filters.town) return false;
      if (p.yearsDelinquent < filters.minYears) return false;
      if (filters.propertyType !== "all" && p.propertyType !== filters.propertyType)
        return false;
      if (filters.status !== "all" && p.status !== filters.status) return false;
      if (filters.minValue) {
        const min = parseInt(filters.minValue);
        if (!isNaN(min) && p.estimatedMarketValue < min) return false;
      }
      if (filters.maxValue) {
        const max = parseInt(filters.maxValue);
        if (!isNaN(max) && p.estimatedMarketValue > max) return false;
      }
      return true;
    });
  }, [data, filters]);

  const columns = useMemo(
    () => [
      col.accessor("address", {
        header: "Address",
        cell: (info) => (
          <span className="font-medium text-foreground">{info.getValue()}</span>
        ),
        size: 160,
      }),
      col.accessor("city", {
        header: "Town",
        size: 90,
      }),
      col.accessor("ownerName", {
        header: "Owner",
        size: 160,
      }),
      col.accessor("propertyType", {
        header: "Type",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-xxs font-medium ${TYPE_COLORS[v]}`}
            >
              {TYPE_LABELS[v]}
            </span>
          );
        },
        size: 70,
      }),
      col.accessor("assessedValue", {
        header: "Assessed",
        cell: (info) => (
          <span className="font-mono">{fmt(info.getValue())}</span>
        ),
        size: 110,
      }),
      col.accessor("estimatedMarketValue", {
        header: "Est. Market",
        cell: (info) => (
          <span className="font-mono">{fmt(info.getValue())}</span>
        ),
        size: 110,
      }),
      col.accessor("totalTaxOwed", {
        header: "Tax Owed",
        cell: (info) => (
          <span className="font-mono text-red-400">{fmt(info.getValue())}</span>
        ),
        size: 100,
      }),
      col.accessor("yearsDelinquent", {
        header: "Yrs",
        cell: (info) => {
          const v = info.getValue();
          const color =
            v >= 8
              ? "text-red-400 font-semibold"
              : v >= 5
              ? "text-amber-400"
              : "text-emerald-400";
          return <span className={`font-mono ${color}`}>{v}</span>;
        },
        size: 50,
      }),
      col.accessor("status", {
        header: "Status",
        cell: (info) => {
          const v = info.getValue();
          return (
            <span
              className={`inline-block rounded px-1.5 py-0.5 text-xxs font-medium ${STATUS_COLORS[v]}`}
            >
              {STATUS_LABELS[v]}
            </span>
          );
        },
        size: 100,
      }),
      col.accessor("lastPaymentDate", {
        header: "Last Pmt",
        cell: (info) => (
          <span className="font-mono text-muted-foreground">
            {info.getValue() || "—"}
          </span>
        ),
        size: 100,
      }),
      col.accessor("source", {
        header: "Source",
        size: 130,
      }),
    ],
    []
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b bg-muted/30">
                {hg.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-3 py-2 text-left text-xxs font-medium text-muted-foreground uppercase tracking-wider cursor-pointer select-none hover:text-foreground transition-colors"
                    style={{ width: header.getSize() }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <div className="flex items-center gap-1">
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                      {header.column.getIsSorted() === "asc" ? (
                        <ArrowUp className="h-3 w-3" />
                      ) : header.column.getIsSorted() === "desc" ? (
                        <ArrowDown className="h-3 w-3" />
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-30" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-8 text-center text-sm text-muted-foreground"
                >
                  No properties match your filters
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <tr
                    className={`border-b border-border/50 cursor-pointer transition-colors ${
                      expandedId === row.original.id
                        ? "bg-accent/50"
                        : "hover:bg-accent/30"
                    }`}
                    onClick={() =>
                      setExpandedId(
                        expandedId === row.original.id
                          ? null
                          : row.original.id
                      )
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-2">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                  {expandedId === row.original.id && (
                    <tr>
                      <td colSpan={columns.length} className="p-0">
                        <PropertyDetail
                          property={row.original}
                          onClose={() => setExpandedId(null)}
                          onNotesChange={onNotesChange}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between border-t bg-muted/20 px-3 py-1.5">
        <span className="text-xxs text-muted-foreground">
          {filtered.length} properties
        </span>
        <span className="text-xxs text-muted-foreground font-mono">
          Total tax owed:{" "}
          <span className="text-red-400">
            {fmt(filtered.reduce((sum, p) => sum + p.totalTaxOwed, 0))}
          </span>
          {" · "}
          Est. market value:{" "}
          <span className="text-foreground">
            {fmt(filtered.reduce((sum, p) => sum + p.estimatedMarketValue, 0))}
          </span>
        </span>
      </div>
    </div>
  );
}
