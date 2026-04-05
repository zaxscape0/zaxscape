"use client";

import { bizIndustries, bizStatuses, bizSortOptions } from "@/lib/biz-data";

export interface BizFilterState {
  industry: string;
  search: string;
  priceMin: string;
  priceMax: string;
  revenueMin: string;
  revenueMax: string;
  sdeMin: string;
  sdeMax: string;
  multipleMin: string;
  multipleMax: string;
  hasRecurring: boolean;
  semiAbsentee: boolean;
  franchise: boolean;
  status: string;
  sortBy: string;
}

export const defaultBizFilters: BizFilterState = {
  industry: "all",
  search: "",
  priceMin: "",
  priceMax: "",
  revenueMin: "",
  revenueMax: "",
  sdeMin: "",
  sdeMax: "",
  multipleMin: "",
  multipleMax: "",
  hasRecurring: false,
  semiAbsentee: false,
  franchise: false,
  status: "all",
  sortBy: "multiple",
};

interface Props {
  filters: BizFilterState;
  onChange: (f: BizFilterState) => void;
}

export function BizFilters({ filters, onChange }: Props) {
  const set = (key: keyof BizFilterState, val: string | boolean) =>
    onChange({ ...filters, [key]: val });

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border bg-card p-2">
      {/* Industry */}
      <select
        value={filters.industry}
        onChange={(e) => set("industry", e.target.value)}
        className="rounded border bg-background px-2 py-1 text-xs"
      >
        {bizIndustries.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      {/* City Search */}
      <input
        type="text"
        placeholder="City / name…"
        value={filters.search}
        onChange={(e) => set("search", e.target.value)}
        className="w-32 rounded border bg-background px-2 py-1 text-xs placeholder:text-muted-foreground"
      />

      {/* Price */}
      <div className="flex items-center gap-1 text-xxs text-muted-foreground">
        <span>Price</span>
        <input type="text" placeholder="Min" value={filters.priceMin}
          onChange={(e) => set("priceMin", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
        <span>–</span>
        <input type="text" placeholder="Max" value={filters.priceMax}
          onChange={(e) => set("priceMax", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
      </div>

      {/* Revenue */}
      <div className="flex items-center gap-1 text-xxs text-muted-foreground">
        <span>Rev</span>
        <input type="text" placeholder="Min" value={filters.revenueMin}
          onChange={(e) => set("revenueMin", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
        <span>–</span>
        <input type="text" placeholder="Max" value={filters.revenueMax}
          onChange={(e) => set("revenueMax", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
      </div>

      {/* SDE */}
      <div className="flex items-center gap-1 text-xxs text-muted-foreground">
        <span>SDE</span>
        <input type="text" placeholder="Min" value={filters.sdeMin}
          onChange={(e) => set("sdeMin", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
        <span>–</span>
        <input type="text" placeholder="Max" value={filters.sdeMax}
          onChange={(e) => set("sdeMax", e.target.value)}
          className="w-20 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
      </div>

      {/* Multiple */}
      <div className="flex items-center gap-1 text-xxs text-muted-foreground">
        <span>Mult</span>
        <input type="text" placeholder="Min" value={filters.multipleMin}
          onChange={(e) => set("multipleMin", e.target.value)}
          className="w-12 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
        <span>–</span>
        <input type="text" placeholder="Max" value={filters.multipleMax}
          onChange={(e) => set("multipleMax", e.target.value)}
          className="w-12 rounded border bg-background px-1.5 py-1 text-xs font-mono" />
      </div>

      {/* Flag toggles */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-1 text-xxs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={filters.hasRecurring}
            onChange={(e) => set("hasRecurring", e.target.checked)}
            className="h-3 w-3 rounded" />
          🔁 Recurring
        </label>
        <label className="flex items-center gap-1 text-xxs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={filters.semiAbsentee}
            onChange={(e) => set("semiAbsentee", e.target.checked)}
            className="h-3 w-3 rounded" />
          🏖️ Absentee
        </label>
        <label className="flex items-center gap-1 text-xxs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={filters.franchise}
            onChange={(e) => set("franchise", e.target.checked)}
            className="h-3 w-3 rounded" />
          🏪 Franchise
        </label>
      </div>

      {/* Status */}
      <select
        value={filters.status}
        onChange={(e) => set("status", e.target.value)}
        className="rounded border bg-background px-2 py-1 text-xs"
      >
        {bizStatuses.map((s) => (
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
          {bizSortOptions.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
