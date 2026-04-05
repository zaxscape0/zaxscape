"use client";

import { useState, useCallback } from "react";
import { Plus, Upload } from "lucide-react";
import { mockREListings, type REListing } from "@/lib/re-data";
import { REFilters, defaultREFilters, type REFilterState } from "@/components/real-estate/re-filters";
import { RETable } from "@/components/real-estate/re-table";
import { REDetailPanel } from "@/components/real-estate/re-detail-panel";
import { REAddModal } from "@/components/real-estate/re-add-modal";

export default function RealEstatePage() {
  const [listings, setListings] = useState<REListing[]>(() => [...mockREListings]);
  const [filters, setFilters] = useState<REFilterState>(defaultREFilters);
  const [selected, setSelected] = useState<REListing | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const nextId = Math.max(...listings.map((l) => l.id), 0) + 1;

  const handleAdd = useCallback((listing: REListing) => {
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
              Investment Real Estate
            </h1>
            <p className="text-xxs text-muted-foreground mt-0.5">
              Commercial & residential investment properties — Boston 100mi
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
      <REFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <RETable data={listings} filters={filters} onSelect={setSelected} />

      {/* Detail Panel */}
      {selected && (
        <REDetailPanel
          listing={selected}
          onClose={() => setSelected(null)}
          onNotesChange={handleNotesChange}
        />
      )}

      {/* Add Modal */}
      {showAdd && (
        <REAddModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          nextId={nextId}
        />
      )}
    </div>
  );
}
