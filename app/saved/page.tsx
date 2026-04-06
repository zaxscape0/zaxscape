"use client";

import { useState, useMemo } from "react";
import { useSaved, SavedItem } from "@/lib/saved-store";
import { formatCurrency } from "@/lib/format";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,

  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Bookmark, Trash2, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const TYPE_LABELS: Record<string, string> = {
  "real-estate": "Real Estate",
  business: "Business",
  stock: "Stock",
  lender: "Lender",
  "tax-delinquent": "Tax Delinquent",
};

const TYPE_VARIANTS: Record<string, "default" | "up" | "down" | "warning" | "secondary"> = {
  "real-estate": "default",
  business: "up",
  stock: "warning",
  lender: "secondary",
  "tax-delinquent": "down",
};

const columnHelper = createColumnHelper<SavedItem>();

export default function SavedPage() {
  const { items, removeItem, updateNotes } = useSaved();
  const [sorting, setSorting] = useState<SortingState>([{ id: "dateSaved", desc: true }]);
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [editingNotes, setEditingNotes] = useState<string | null>(null);

  const filtered = useMemo(
    () => (typeFilter === "all" ? items : items.filter((i) => i.type === typeFilter)),
    [items, typeFilter]
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <Badge variant={TYPE_VARIANTS[info.getValue()] || "default"}>
            {TYPE_LABELS[info.getValue()] || info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("title", {
        header: "Name / Title",
        cell: (info) => (
          <Link href={info.row.original.href} className="text-[hsl(var(--link))] hover:underline font-medium">
            {info.getValue()}
          </Link>
        ),
      }),
      columnHelper.accessor("keyMetric", {
        header: "Key Metric",
        cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
      }),
      columnHelper.accessor("price", {
        header: "Price",
        cell: (info) => {
          const v = info.getValue();
          return v ? <span className="font-mono tabular-nums">{formatCurrency(v, 0)}</span> : <span className="text-muted-foreground">—</span>;
        },
      }),
      columnHelper.accessor("dateSaved", {
        header: "Date Saved",
        cell: (info) => (
          <span className="text-muted-foreground">{new Date(info.getValue()).toLocaleDateString()}</span>
        ),
      }),
      columnHelper.accessor("notes", {
        header: "Notes",
        cell: (info) => {
          const item = info.row.original;
          const isEditing = editingNotes === item.id;
          if (isEditing) {
            return (
              <input
                autoFocus
                defaultValue={info.getValue()}
                onBlur={(e) => {
                  updateNotes(item.id, e.target.value);
                  setEditingNotes(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    updateNotes(item.id, (e.target as HTMLInputElement).value);
                    setEditingNotes(null);
                  }
                }}
                className="w-full bg-background border rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
            );
          }
          return (
            <span
              onClick={() => setEditingNotes(item.id)}
              className="text-muted-foreground cursor-pointer hover:text-foreground truncate max-w-[150px] block"
            >
              {info.getValue() || "Click to add notes..."}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => (
          <button
            onClick={() => removeItem(info.row.original.id)}
            className="text-muted-foreground hover:text-[hsl(var(--down))] transition-colors"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        ),
      }),
    ],
    [removeItem, updateNotes, editingNotes]
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((i) => { counts[i.type] = (counts[i.type] || 0) + 1; });
    return counts;
  }, [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bookmark className="h-4 w-4 text-muted-foreground" />
          <h1 className="text-sm font-semibold uppercase tracking-wider">Saved Opportunities</h1>
          <span className="text-xxs text-muted-foreground">{items.length} items</span>
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setTypeFilter("all")}
          className={`rounded-md border px-2 py-0.5 text-xxs transition-colors ${
            typeFilter === "all" ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          All ({items.length})
        </button>
        {Object.entries(TYPE_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTypeFilter(key)}
            className={`rounded-md border px-2 py-0.5 text-xxs transition-colors ${
              typeFilter === key ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label} ({typeCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
          <Bookmark className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-xs">No saved items yet</p>
          <p className="text-xxs mt-1">Bookmark items from Markets, Real Estate, Businesses, and more</p>
        </div>
      ) : (
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
      )}
    </div>
  );
}
