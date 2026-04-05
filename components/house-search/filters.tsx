"use client";

import { Search } from "lucide-react";

const TOWNS = ["All", "Newton", "Dover", "Weston", "Wellesley", "Brookline"] as const;

const PROPERTY_TYPES = [
  { value: "all", label: "All Types" },
  { value: "single_family", label: "Single Family" },
  { value: "multi_family", label: "Multi-Family" },
  { value: "condo", label: "Condo" },
  { value: "commercial", label: "Commercial" },
  { value: "land", label: "Land" },
] as const;

const STATUSES = [
  { value: "all", label: "All Status" },
  { value: "tax_lien", label: "Tax Lien" },
  { value: "tax_title", label: "Tax Title" },
  { value: "in_redemption", label: "In Redemption" },
  { value: "foreclosure_pending", label: "Foreclosure Pending" },
] as const;

export interface FilterState {
  search: string;
  town: string;
  minYears: number;
  propertyType: string;
  status: string;
  minValue: string;
  maxValue: string;
}

interface FiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export function Filters({ filters, onChange }: FiltersProps) {
  const update = (patch: Partial<FilterState>) =>
    onChange({ ...filters, ...patch });

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search address, owner..."
          value={filters.search}
          onChange={(e) => update({ search: e.target.value })}
          className="h-8 w-56 rounded-md border bg-background pl-7 pr-3 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* Town */}
      <select
        value={filters.town}
        onChange={(e) => update({ town: e.target.value })}
        className="h-8 rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {TOWNS.map((t) => (
          <option key={t} value={t === "All" ? "all" : t}>
            {t}
          </option>
        ))}
      </select>

      {/* Min Years */}
      <div className="flex items-center gap-1">
        <span className="text-xxs text-muted-foreground">Min Yrs:</span>
        <input
          type="number"
          min={1}
          max={20}
          value={filters.minYears}
          onChange={(e) =>
            update({ minYears: Math.max(1, parseInt(e.target.value) || 1) })
          }
          className="h-8 w-14 rounded-md border bg-background px-2 text-xs text-foreground text-center focus:outline-none focus:ring-1 focus:ring-primary font-mono"
        />
      </div>

      {/* Property Type */}
      <select
        value={filters.propertyType}
        onChange={(e) => update({ propertyType: e.target.value })}
        className="h-8 rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {PROPERTY_TYPES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => update({ status: e.target.value })}
        className="h-8 rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      {/* Value Range */}
      <div className="flex items-center gap-1">
        <span className="text-xxs text-muted-foreground">Value:</span>
        <input
          type="text"
          placeholder="Min"
          value={filters.minValue}
          onChange={(e) => update({ minValue: e.target.value })}
          className="h-8 w-20 rounded-md border bg-background px-2 text-xs text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
        />
        <span className="text-xxs text-muted-foreground">–</span>
        <input
          type="text"
          placeholder="Max"
          value={filters.maxValue}
          onChange={(e) => update({ maxValue: e.target.value })}
          className="h-8 w-20 rounded-md border bg-background px-2 text-xs text-foreground text-center placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
        />
      </div>
    </div>
  );
}
