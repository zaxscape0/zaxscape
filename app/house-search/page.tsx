"use client";

import { useState, useCallback } from "react";
import { Plus, Upload } from "lucide-react";
import { taxDelinquentProperties, type TaxDelinquentProperty } from "@/lib/mock-data";
import { Filters, type FilterState } from "@/components/house-search/filters";
import { PropertyTable } from "@/components/house-search/property-table";
import { InfoPanel } from "@/components/house-search/info-panel";
import { AddPropertyModal } from "@/components/house-search/add-property-modal";
import { CsvImportModal } from "@/components/house-search/csv-import-modal";

export default function HouseSearchPage() {
  const [properties, setProperties] = useState<TaxDelinquentProperty[]>(
    () => [...taxDelinquentProperties]
  );
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    town: "all",
    minYears: 5,
    propertyType: "all",
    status: "all",
    minValue: "",
    maxValue: "",
  });

  const nextId = Math.max(...properties.map((p) => p.id), 0) + 1;

  const handleAdd = useCallback((property: TaxDelinquentProperty) => {
    setProperties((prev) => [...prev, property]);
  }, []);

  const handleImport = useCallback((imported: TaxDelinquentProperty[]) => {
    setProperties((prev) => [...prev, ...imported]);
  }, []);

  const handleNotesChange = useCallback((id: number, notes: string) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, notes } : p))
    );
  }, []);

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-sm font-semibold uppercase tracking-wider">
            Tax Delinquent Property Search
          </h1>
          <p className="text-xxs text-muted-foreground mt-0.5">
            Properties with unpaid taxes — potential acquisition targets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowImport(true)}
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
            Add Property
          </button>
        </div>
      </div>

      {/* Info Panel */}
      <InfoPanel />

      {/* Filters */}
      <Filters filters={filters} onChange={setFilters} />

      {/* Table */}
      <PropertyTable
        data={properties}
        filters={filters}
        onNotesChange={handleNotesChange}
      />

      {/* Modals */}
      {showAdd && (
        <AddPropertyModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          nextId={nextId}
        />
      )}
      {showImport && (
        <CsvImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
          nextId={nextId}
        />
      )}
    </div>
  );
}
