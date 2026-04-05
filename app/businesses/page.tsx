"use client";

import { useState, useCallback } from "react";
import { Plus, Upload } from "lucide-react";
import { mockBizListings, type BusinessListing } from "@/lib/biz-data";
import { BizFilters, defaultBizFilters, type BizFilterState } from "@/components/businesses/biz-filters";
import { BizTable } from "@/components/businesses/biz-table";
import { BizDetailPanel } from "@/components/businesses/biz-detail-panel";
import { BizAddModal } from "@/components/businesses/biz-add-modal";

export default function BusinessesPage() {
  const [listings, setListings] = useState<BusinessListing[]>(() => [...mockBizListings]);
  const [filters, setFilters] = useState<BizFilterState>(defaultBizFilters);
  const [selected, setSelected] = useState<BusinessListing | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const nextId = Math.max(...listings.map((l) => l.id), 0) + 1;

  const handleAdd = useCallback((listing: BusinessListing) => {
    setListings((prev) => [...prev, listing]);
  }, []);

  const handleNotesChange = useCallback((id: number, notes: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes } : l))
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, notes } : prev));
  }, []);

  const activeCount = listings.filter((l) => l.status === "active").length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold uppercase tracking-wider">
              Businesses for Sale
            </h1>
            <p className="text-xxs text-muted-foreground mt-0.5">
              Acquisition targets — Boston 100mi • Max $10M
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xxs font-mono font-medium text-primary">
            {activeCount} active
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Listing
          </button>
        </div>
      </div>

      {/* Filters */}
      <BizFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <BizTable data={listings} filters={filters} onSelect={setSelected} />

      {/* Detail Panel */}
      {selected && (
        <BizDetailPanel
          listing={selected}
          onClose={() => setSelected(null)}
          onNotesChange={handleNotesChange}
        />
      )}

      {/* Add Modal */}
      {showAdd && (
        <BizAddModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          nextId={nextId}
        />
      )}
    </div>
  );
}
