"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
} from "@tanstack/react-table";
import { Lender } from "@/lib/rates-data";
import { ArrowUpDown, ChevronDown, ChevronUp, Plus, X } from "lucide-react";

interface LenderDirectoryProps {
  lenders: Lender[];
  onAddLender: (lender: Omit<Lender, "id">) => void;
}

const TYPE_LABELS: Record<string, string> = {
  bank: "Bank",
  credit_union: "Credit Union",
  mortgage_co: "Mortgage Co",
};

const columnHelper = createColumnHelper<Lender>();

const columns = [
  columnHelper.accessor("name", {
    header: "Name",
    cell: (info) => <span className="font-medium">{info.getValue()}</span>,
  }),
  columnHelper.accessor("type", {
    header: "Type",
    cell: (info) => (
      <span className="rounded bg-muted px-1.5 py-0.5 text-xxs">
        {TYPE_LABELS[info.getValue()] ?? info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("city", {
    header: "City",
    cell: (info) => <span className="text-muted-foreground">{info.getValue()}</span>,
  }),
  columnHelper.accessor("website", {
    header: "Website",
    cell: (info) => (
      <a
        href={`https://${info.getValue()}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[hsl(var(--link))] hover:underline"
      >
        {info.getValue()}
      </a>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "Phone",
    cell: (info) => <span className="font-mono text-muted-foreground">{info.getValue()}</span>,
  }),
];

export function LenderDirectory({ lenders, onAddLender }: LenderDirectoryProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "bank" as Lender["type"],
    city: "",
    website: "",
    phone: "",
  });

  const table = useReactTable({
    data: lenders,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const handleSubmit = () => {
    if (!formData.name) return;
    onAddLender(formData);
    setFormData({ name: "", type: "bank", city: "", website: "", phone: "" });
    setShowForm(false);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Lender Directory
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50"
        >
          {showForm ? <X className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
          {showForm ? "Cancel" : "Add Lender"}
        </button>
      </div>

      {/* Add Lender Form */}
      {showForm && (
        <div className="rounded-md border bg-card p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Name</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                placeholder="Bank Name"
              />
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value as Lender["type"] }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
              >
                <option value="bank">Bank</option>
                <option value="credit_union">Credit Union</option>
                <option value="mortgage_co">Mortgage Co</option>
              </select>
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">City</label>
              <input
                value={formData.city}
                onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                placeholder="Boston, MA"
              />
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Website</label>
              <input
                value={formData.website}
                onChange={(e) => setFormData((p) => ({ ...p, website: e.target.value }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                placeholder="example.com"
              />
            </div>
            <div>
              <label className="block text-xxs text-muted-foreground uppercase mb-1">Phone</label>
              <input
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                className="w-full rounded-md border bg-background px-2.5 py-1.5 text-xs focus:border-primary focus:outline-none"
                placeholder="(555) 123-4567"
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
