"use client";

import { propertyTypes, reStatuses, reSortOptions } from "@/lib/re-data";

export interface REFilterState {
  propertyType: string;
  search: string;
  priceMin: string;
  priceMax: string;
  capRateMin: string;
  capRateMax: string;
  unitsMin: string;
  unitsMax: string;
  status: string;
  sortBy: string;
}

export const defaultREFilters: REFilterState = {
  propertyType: "all",
  search: "",
  priceMin: "",
  priceMax: "",
  capRateMin: "",
  capRateMax: "",
  unitsMin: "",
  unitsMax: "",
  status: "all",
  sortBy: "capRate",
};

interface Props {
  filters: REFilterState;
  onChange: (f: REFilterState) => void;
}

export function REFilters({ filters, onChange }: Props) {
  const set = (key: keyof REFilterState, val: string) =>
    onChange({ ...filters, [key]: val });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2">
      {/* Property Type */}
      <select
        value={filters.propertyType}
        onChange={(e) => set("propertyType", e.target.value)}
        className="rounded border bg-background px-2 py-1 text-xs"
      >
        {propertyTypes.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* City Search */}
      <input
        type="text"
        placeholder="City / address…"
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="w-36 rounded border bg-background px-2 py-1 text-xs placeholder:text-muted-foreground"
      />

      {/* Price Range */}
      <div className="flex items-center gap-1 text-xxs text-muted-foreground">
        <span>Price</span>
        <input
          type="text"
          placeholder="Min"
          value={filters.priceMin}
          onChange={(e) => set("priceMin", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono"
        />
        <span>–</span>
        <input
          type="text"
          placeholder="Max"
          value={filters.priceMax}
          onChange={(e) => set("priceMax", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono"
        />
      </div>

      {/* Cap Rate Range */}
      <div className="flex items-center gap-1 text-xxs text-muted-foreground">
        <span>Cap%</span>
        <input
          type="text"
          placeholder="Min"
          value={filters.capRateMin}
          onChange={(e) => set("capRateMin", e.target.value)}
          className="w-14 rounded border bg-background px-1.5 py-1 text-xs font-mono"
        />
        <span>–</span>
        <input
          type="text"
          placeholder="Max"
          value={filters.capRateMax}
          onChange={(e) => set("capRateMax", e.target.value)}
          className="w-14 rounded border bg-background px-1.5 py-1 text-xs font-mono"
        />
      </div>

      {/* Units Range */}
      <div className="flex items-center gap-1 text-xxs text-muted-foreground">
        <span>Units</span>
        <input
          type="text"
          placeholder="Min"
          value={filters.unitsMin}
          onChange={(e) => set("unitsMin", e.target.value)}
          className="w-14 rounded border bg-background px-1.5 py-1 text-xs font-mono"
        />
        <span>–</span>
        <input
          type="text"
          placeholder="Max"
          value={filters.unitsMax}
          onChange={(e) => set("unitsMax", e.target.value)}
          className="w-14 rounded border bg-background px-1.5 py-1 text-xs font-mono"
        />
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        className="rounded border bg-background px-2 py-1 text-xs"
      >
        {reStatuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>

      {/* Sort */}
      <div className="ml-auto flex items-center gap-1 text-xxs text-muted-foreground">
        <span>Sort:</span>
        <select
          value={filters.sortBy}
          onChange={(e) => set("sortBy", e.target.value)}
          className="rounded border bg-background px-2 py-1 text-xs"
        >
          {reSortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
