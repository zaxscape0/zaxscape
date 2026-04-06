"use client";

import { useState, useMemo } from "react";
import { seedLenders, seedRates, PRODUCT_LABELS, Lender } from "@/lib/rates-data";
import { Building2, ExternalLink, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";

const TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  credit_union: "Credit Union",
  mortgage_co: "Mortgage Co.",
};

const columnHelper = createColumnHelper<Lender>();

export default function LendersPage() {
  const [selectedLender, setSelectedLender] = useState<Lender | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [lenderNotes, setLenderNotes] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      return JSON.parse(localStorage.getItem("zaxscape-lender-notes") || "{}");
    } catch { return {}; }
  });

  const saveNote = (lenderId: string, note: string) => {
    const updated = { ...lenderNotes, [lenderId]: note };
    setLenderNotes(updated);
    localStorage.setItem("zaxscape-lender-notes", JSON.stringify(updated));
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Lender",
        cell: (info) => (
          <button
            onClick={() => setSelectedLender(info.row.original)}
            className="text-[hsl(var(--link))] hover:underline font-medium text-left"
          >
            {info.getValue()}
          </button>
        ),
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <Badge variant="secondary">{TYPE_LABELS[info.getValue()] || info.getValue()}</Badge>
        ),
      }),
      columnHelper.accessor("city", {
        header: "Location",
      }),
      columnHelper.display({
        id: "products",
        header: "Products",
        cell: (info) => {
          const rates = seedRates.filter((r) => r.lenderId === info.row.original.id);
          return (
            <div className="flex gap-1 flex-wrap">
              {rates.map((r) => (
                <Badge key={r.id} variant="default" className="text-xxs">
                  {PRODUCT_LABELS[r.product] || r.product}: {r.rate}%
                </Badge>
              ))}
            </div>
          );
        },
      }),
      columnHelper.display({
        id: "bestRate",
        header: "Best Rate",
        cell: (info) => {
          const rates = seedRates.filter((r) => r.lenderId === info.row.original.id);
          const best = rates.reduce((min, r) => (r.rate < min ? r.rate : min), Infinity);
          return best < Infinity ? (
            <span className="font-mono tabular-nums text-[hsl(var(--up))]">{best.toFixed(3)}%</span>
          ) : (
            <span className="text-muted-foreground">—</span>
          );
        },
      }),
      columnHelper.accessor("phone", {
        header: "Phone",
        cell: (info) => <span className="font-mono text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.display({
        id: "website",
        header: "",
        cell: (info) => (
          <a
            href={`https://${info.row.original.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground"
          >
            <ExternalLink className="h-3 w-3" />
          </a>
        ),
      }),
    ],
    []
  );

  const table = useReactTable({
    data: seedLenders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const selectedRates = selectedLender
    ? seedRates.filter((r) => r.lenderId === selectedLender.id)
    : [];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold uppercase tracking-wider">Lender Directory</h1>
        <span className="text-xxs text-muted-foreground">{seedLenders.length} lenders</span>
      </div>

      {/* Lenders table */}
      <div className="border rounded-md overflow-hidden">
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
          </tbody>
        </table>
      </div>

      {/* Lender Detail Panel */}
      {selectedLender && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                {selectedLender.name}
                <Badge variant="secondary">{TYPE_LABELS[selectedLender.type]}</Badge>
              </span>
              <button
                onClick={() => setSelectedLender(null)}
                className="text-xxs text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{selectedLender.city}</span>
              <span className="font-mono">{selectedLender.phone}</span>
              <a
                href={`https://${selectedLender.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[hsl(var(--link))] hover:underline flex items-center gap-1"
              >
                {selectedLender.website} <ExternalLink className="h-3 w-3" />
              </a>
            </div>

            <div>
              <h3 className="text-xxs font-medium uppercase tracking-wider text-muted-foreground mb-1">Rates</h3>
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="px-2 py-1 text-left font-medium text-muted-foreground">Product</th>
                      <th className="px-2 py-1 text-left font-medium text-muted-foreground">Rate</th>
                      <th className="px-2 py-1 text-left font-medium text-muted-foreground">APR</th>
                      <th className="px-2 py-1 text-left font-medium text-muted-foreground">Points</th>
                      <th className="px-2 py-1 text-left font-medium text-muted-foreground">Date</th>
                      <th className="px-2 py-1 text-left font-medium text-muted-foreground">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRates.map((rate) => (
                      <tr key={rate.id} className="border-b border-border/30">
                        <td className="px-2 py-1">{PRODUCT_LABELS[rate.product] || rate.product}</td>
                        <td className="px-2 py-1 font-mono tabular-nums text-[hsl(var(--up))]">{rate.rate}%</td>
                        <td className="px-2 py-1 font-mono tabular-nums">{rate.apr}%</td>
                        <td className="px-2 py-1 font-mono tabular-nums">{rate.points}</td>
                        <td className="px-2 py-1 text-muted-foreground">{rate.dateCaptured}</td>
                        <td className="px-2 py-1 text-muted-foreground">{rate.source}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xxs font-medium uppercase tracking-wider text-muted-foreground mb-1">Notes</h3>
              <textarea
                value={lenderNotes[selectedLender.id] || ""}
                onChange={(e) => saveNote(selectedLender.id, e.target.value)}
                className="w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono resize-none h-20 focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Add notes about this lender..."
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
