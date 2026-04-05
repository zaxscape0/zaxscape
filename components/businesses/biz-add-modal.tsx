"use client";

import { useState } from "react";
import { BusinessListing, bizIndustries, calculateBuyBoxScore, computeFlags } from "@/lib/biz-data";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdd: (listing: BusinessListing) => void;
  nextId: number;
}

const emptyForm = {
  title: "",
  askingPrice: "",
  revenue: "",
  sdeCashFlow: "",
  ebitda: "",
  industry: "Services",
  subIndustry: "",
  city: "",
  state: "MA",
  zip: "",
  brokerName: "",
  brokerCompany: "",
  brokerPhone: "",
  brokerEmail: "",
  reasonForSale: "",
  description: "",
  employees: "",
  yearEstablished: "",
  isFranchise: false,
  isSemiAbsentee: false,
  hasRecurringRevenue: false,
  sourcePlatform: "Manual",
  sourceUrl: "",
  notes: "",
};

export function BizAddModal({ onClose, onAdd, nextId }: Props) {
  const [form, setForm] = useState(emptyForm);

  const set = (key: string, val: string | boolean) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.askingPrice) || 0;
    const sde = form.sdeCashFlow ? parseFloat(form.sdeCashFlow) : null;
    const askingMultiple = sde && sde > 0 ? +(price / sde).toFixed(1) : null;

    const base: BusinessListing = {
      id: nextId,
      title: form.title,
      askingPrice: price,
      revenue: form.revenue ? parseFloat(form.revenue) : null,
      sdeCashFlow: sde,
      ebitda: form.ebitda ? parseFloat(form.ebitda) : null,
      industry: form.industry,
      subIndustry: form.subIndustry || null,
      city: form.city,
      state: form.state,
      zip: form.zip,
      brokerName: form.brokerName || null,
      brokerCompany: form.brokerCompany || null,
      brokerPhone: form.brokerPhone || null,
      brokerEmail: form.brokerEmail || null,
      reasonForSale: form.reasonForSale || null,
      description: form.description || null,
      employees: form.employees ? parseInt(form.employees) : null,
      yearEstablished: form.yearEstablished ? parseInt(form.yearEstablished) : null,
      isFranchise: form.isFranchise,
      isSemiAbsentee: form.isSemiAbsentee,
      hasRecurringRevenue: form.hasRecurringRevenue,
      sourcePlatform: form.sourcePlatform || "Manual",
      sourceUrl: form.sourceUrl || null,
      daysListed: 0,
      status: "active",
      askingMultiple,
      score: 0,
      flags: {},
      notes: form.notes,
    };
    base.score = calculateBuyBoxScore(base);
    base.flags = computeFlags(base);

    onAdd(base);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-lg border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-sm font-semibold">Add Business Listing</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Title */}
          <div>
            <label className="text-xxs text-muted-foreground">Business Title</label>
            <input required value={form.title} onChange={(e) => set("title", e.target.value)}
              className="w-full rounded border bg-background px-2 py-1 text-xs" />
          </div>

          {/* Location */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">City</label>
              <input required value={form.city} onChange={(e) => set("city", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">State</label>
              <input required value={form.state} onChange={(e) => set("state", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">ZIP</label>
              <input value={form.zip} onChange={(e) => set("zip", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
          </div>

          {/* Industry & Financials */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Industry</label>
              <select value={form.industry} onChange={(e) => set("industry", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs">
                {bizIndustries.filter((t) => t.value !== "all").map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Sub-Industry</label>
              <input value={form.subIndustry} onChange={(e) => set("subIndustry", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Asking Price</label>
              <input required type="number" value={form.askingPrice} onChange={(e) => set("askingPrice", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Revenue</label>
              <input type="number" value={form.revenue} onChange={(e) => set("revenue", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">SDE / Cash Flow</label>
              <input type="number" value={form.sdeCashFlow} onChange={(e) => set("sdeCashFlow", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">EBITDA</label>
              <input type="number" value={form.ebitda} onChange={(e) => set("ebitda", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Employees</label>
              <input type="number" value={form.employees} onChange={(e) => set("employees", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Year Established</label>
              <input type="number" value={form.yearEstablished} onChange={(e) => set("yearEstablished", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
          </div>

          {/* Flags */}
          <div className="flex gap-4">
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={form.isFranchise}
                onChange={(e) => set("isFranchise", e.target.checked)} className="h-3 w-3 rounded" />
              🏪 Franchise
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={form.isSemiAbsentee}
                onChange={(e) => set("isSemiAbsentee", e.target.checked)} className="h-3 w-3 rounded" />
              🏖️ Semi-Absentee
            </label>
            <label className="flex items-center gap-1.5 text-xs cursor-pointer">
              <input type="checkbox" checked={form.hasRecurringRevenue}
                onChange={(e) => set("hasRecurringRevenue", e.target.checked)} className="h-3 w-3 rounded" />
              🔁 Recurring Revenue
            </label>
          </div>

          {/* Broker */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Broker Name</label>
              <input value={form.brokerName} onChange={(e) => set("brokerName", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Broker Company</label>
              <input value={form.brokerCompany} onChange={(e) => set("brokerCompany", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Broker Phone</label>
              <input value={form.brokerPhone} onChange={(e) => set("brokerPhone", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Broker Email</label>
              <input value={form.brokerEmail} onChange={(e) => set("brokerEmail", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
          </div>

          {/* Source & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Source Platform</label>
              <select value={form.sourcePlatform} onChange={(e) => set("sourcePlatform", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs">
                <option>Manual</option>
                <option>BizBuySell</option>
                <option>Broker Direct</option>
                <option>Quiet Light</option>
                <option>Digital Exits</option>
                <option>Franchise Resales</option>
              </select>
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Reason for Sale</label>
              <input value={form.reasonForSale} onChange={(e) => set("reasonForSale", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xxs text-muted-foreground">Description</label>
            <textarea value={form.description} onChange={(e) => set("description", e.target.value)}
              className="w-full rounded border bg-background px-2 py-1.5 text-xs resize-none h-16" />
          </div>

          {/* Notes */}
          <div>
            <label className="text-xxs text-muted-foreground">Notes</label>
            <textarea value={form.notes} onChange={(e) => set("notes", e.target.value)}
              className="w-full rounded border bg-background px-2 py-1.5 text-xs resize-none h-16" />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose}
              className="rounded border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="rounded bg-primary px-4 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 transition-colors">
              Add Listing
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
