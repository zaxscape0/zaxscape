"use client";

import { useState, useCallback, useMemo } from "react";
import { Plus, Upload, Phone, Loader2 } from "lucide-react";
import { taxDelinquentProperties, type TaxDelinquentProperty } from "@/lib/mock-data";
import { Filters, type FilterState } from "@/components/house-search/filters";
import { PropertyTable } from "@/components/house-search/property-table";
import { InfoPanel } from "@/components/house-search/info-panel";
import { AddPropertyModal } from "@/components/house-search/add-property-modal";
import { CsvImportModal } from "@/components/house-search/csv-import-modal";

const SKIP_TRACE_STORAGE_KEY = "zs_skip_trace_pwd";

function getStoredPassword(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(SKIP_TRACE_STORAGE_KEY);
}

function promptForPassword(): string | null {
  const stored = getStoredPassword();
  if (stored) return stored;
  const pwd = window.prompt("Enter skip trace password:");
  if (pwd) sessionStorage.setItem(SKIP_TRACE_STORAGE_KEY, pwd);
  return pwd;
}

async function fetchSkipTrace(property: TaxDelinquentProperty) {
  const password = promptForPassword();
  if (!password) throw new Error("Password required");

  const res = await fetch("/api/skip-trace", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ownerName: property.ownerName,
      address: property.address,
      city: property.city,
      state: property.state,
      zip: property.zip,
      password,
    }),
  });
  const data = await res.json();
  if (data.error) {
    if (res.status === 403) {
      sessionStorage.removeItem(SKIP_TRACE_STORAGE_KEY);
      throw new Error("Invalid password");
    }
    throw new Error(data.error);
  }
  return data as {
    phones: { number: string; type: string }[];
    emails: string[];
    mailingAddress: string | null;
  };
}

export default function HouseSearchPage() {
  const [properties, setProperties] = useState<TaxDelinquentProperty[]>(
    () => [...taxDelinquentProperties]
  );
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [batchProgress, setBatchProgress] = useState<{ done: number; total: number } | null>(null);
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

  // Filtered properties (needed for batch skip trace)
  const filtered = useMemo(() => {
    return properties.filter((p) => {
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
  }, [properties, filters]);

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

  const handleSkipTrace = useCallback(async (id: number) => {
    // Set loading
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, skipTraceLoading: true } : p))
    );

    try {
      const property = properties.find((p) => p.id === id);
      if (!property) return;

      // Check cache
      if (property.skipTrace) {
        setProperties((prev) =>
          prev.map((p) => (p.id === id ? { ...p, skipTraceLoading: false } : p))
        );
        return;
      }

      const result = await fetchSkipTrace(property);
      setProperties((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, skipTrace: result, skipTraceLoading: false } : p
        )
      );
    } catch {
      setProperties((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, skipTrace: { phones: [], emails: [], mailingAddress: null }, skipTraceLoading: false }
            : p
        )
      );
    }
  }, [properties]);

  const handleBatchSkipTrace = useCallback(async () => {
    const toTrace = filtered.filter((p) => !p.skipTrace && !p.skipTraceLoading);
    if (toTrace.length === 0) return;

    setBatchProgress({ done: 0, total: toTrace.length });

    for (let i = 0; i < toTrace.length; i++) {
      const property = toTrace[i];

      // Set loading
      setProperties((prev) =>
        prev.map((p) => (p.id === property.id ? { ...p, skipTraceLoading: true } : p))
      );

      try {
        const result = await fetchSkipTrace(property);
        setProperties((prev) =>
          prev.map((p) =>
            p.id === property.id
              ? { ...p, skipTrace: result, skipTraceLoading: false }
              : p
          )
        );
      } catch {
        setProperties((prev) =>
          prev.map((p) =>
            p.id === property.id
              ? { ...p, skipTrace: { phones: [], emails: [], mailingAddress: null }, skipTraceLoading: false }
              : p
          )
        );
      }

      setBatchProgress({ done: i + 1, total: toTrace.length });

      // Rate limit: 1 per second
      if (i < toTrace.length - 1) {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    setBatchProgress(null);
  }, [filtered]);

  const untracedCount = filtered.filter((p) => !p.skipTrace && !p.skipTraceLoading).length;

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
          {/* Batch Skip Trace */}
          {batchProgress ? (
            <div className="flex items-center gap-2 rounded-md border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span className="font-mono">
                {batchProgress.done}/{batchProgress.total} traced
              </span>
            </div>
          ) : (
            untracedCount > 0 && (
              <button
                onClick={handleBatchSkipTrace}
                className="flex items-center gap-1.5 rounded-md border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              >
                <Phone className="h-3.5 w-3.5" />
                Skip Trace All ({untracedCount})
              </button>
            )
          )}
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
        onSkipTrace={handleSkipTrace}
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
