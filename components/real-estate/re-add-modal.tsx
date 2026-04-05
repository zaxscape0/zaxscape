"use client";

import { useState } from "react";
import { REListing, propertyTypes } from "@/lib/re-data";
import { X } from "lucide-react";

interface Props {
  onClose: () => void;
  onAdd: (listing: REListing) => void;
  nextId: number;
}

const emptyForm = {
  address: "",
  city: "",
  state: "MA",
  zip: "",
  propertyType: "multifamily" as const,
  askingPrice: "",
  units: "",
  sqft: "",
  lotSize: "",
  yearBuilt: "",
  occupancyPct: "",
  reportedNoi: "",
  reportedCapRate: "",
  grossRent: "",
  taxes: "",
  insurance: "",
  brokerName: "",
  brokerCompany: "",
  brokerPhone: "",
  sourcePlatform: "Manual",
  sourceUrl: "",
  notes: "",
};

export function REAddModal({ onClose, onAdd, nextId }: Props) {
  const [form, setForm] = useState(emptyForm);

  const set = (key: string, val: string) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(form.askingPrice) || 0;
    const units = form.units ? parseInt(form.units) : null;
    const sqft = form.sqft ? parseInt(form.sqft) : null;
    const reportedNoi = form.reportedNoi ? parseFloat(form.reportedNoi) : null;
    const reportedCapRate = form.reportedCapRate ? parseFloat(form.reportedCapRate) : null;

    // Calculate estimated values if reported not provided
    let estimatedNoi: number | null = null;
    let estimatedCapRate: number | null = null;
    if (!reportedNoi && form.grossRent) {
      const gross = parseFloat(form.grossRent);
      const taxes = parseFloat(form.taxes) || 0;
      const ins = parseFloat(form.insurance) || 0;
      estimatedNoi = gross - taxes - ins;
    }
    if (!reportedCapRate && price > 0) {
      const noi = reportedNoi ?? estimatedNoi;
      if (noi) estimatedCapRate = +((noi / price) * 100).toFixed(1);
    }

    const listing: REListing = {
      id: nextId,
      address: form.address,
      city: form.city,
      state: form.state,
      zip: form.zip,
      propertyType: form.propertyType as REListing["propertyType"],
      askingPrice: price,
      units,
      sqft,
      lotSize: form.lotSize ? parseFloat(form.lotSize) : null,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : null,
      occupancyPct: form.occupancyPct ? parseFloat(form.occupancyPct) : null,
      reportedNoi,
      estimatedNoi,
      reportedCapRate,
      estimatedCapRate,
      grossRent: form.grossRent ? parseFloat(form.grossRent) : null,
      taxes: form.taxes ? parseFloat(form.taxes) : null,
      insurance: form.insurance ? parseFloat(form.insurance) : null,
      hoa: null,
      pricePerUnit: units ? Math.round(price / units) : null,
      pricePerSqft: sqft ? Math.round(price / sqft) : null,
      brokerName: form.brokerName || null,
      brokerCompany: form.brokerCompany || null,
      brokerPhone: form.brokerPhone || null,
      sourcePlatform: form.sourcePlatform || "Manual",
      sourceUrl: form.sourceUrl || null,
      daysListed: 0,
      status: "active",
      notes: form.notes,
      rentRoll: null,
    };

    onAdd(listing);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[560px] max-h-[85vh] overflow-y-auto rounded-lg border bg-card shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-sm font-semibold">Add Property Listing</h2>
          <button onClick={onClose} className="rounded p-1 hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-3">
          {/* Address */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xxs text-muted-foreground">Address</label>
              <input required value={form.address} onChange={(e) => set("address", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">City</label>
              <input required value={form.city} onChange={(e) => set("city", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          {/* Type & Price */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Type</label>
              <select value={form.propertyType} onChange={(e) => set("propertyType", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs">
                {propertyTypes.filter((t) => t.value !== "all").map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Asking Price</label>
              <input required type="number" value={form.askingPrice} onChange={(e) => set("askingPrice", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Units</label>
              <input type="number" value={form.units} onChange={(e) => set("units", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
          </div>

          {/* Property Specs */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">SqFt</label>
              <input type="number" value={form.sqft} onChange={(e) => set("sqft", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Lot (acres)</label>
              <input type="number" step="0.01" value={form.lotSize} onChange={(e) => set("lotSize", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Year Built</label>
              <input type="number" value={form.yearBuilt} onChange={(e) => set("yearBuilt", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Occupancy %</label>
              <input type="number" value={form.occupancyPct} onChange={(e) => set("occupancyPct", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
          </div>

          {/* Financials */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Gross Rent (annual)</label>
              <input type="number" value={form.grossRent} onChange={(e) => set("grossRent", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Reported NOI</label>
              <input type="number" value={form.reportedNoi} onChange={(e) => set("reportedNoi", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Reported Cap Rate %</label>
              <input type="number" step="0.1" value={form.reportedCapRate} onChange={(e) => set("reportedCapRate", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Taxes (annual)</label>
              <input type="number" value={form.taxes} onChange={(e) => set("taxes", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Insurance (annual)</label>
              <input type="number" value={form.insurance} onChange={(e) => set("insurance", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs font-mono" />
            </div>
          </div>

          {/* Broker / Source */}
          <div className="grid grid-cols-3 gap-3">
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
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xxs text-muted-foreground">Source Platform</label>
              <select value={form.sourcePlatform} onChange={(e) => set("sourcePlatform", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs">
                <option>Manual</option>
                <option>LoopNet</option>
                <option>Crexi</option>
                <option>Broker Direct</option>
                <option>MLS</option>
              </select>
            </div>
            <div>
              <label className="text-xxs text-muted-foreground">Source URL</label>
              <input value={form.sourceUrl} onChange={(e) => set("sourceUrl", e.target.value)}
                className="w-full rounded border bg-background px-2 py-1 text-xs" />
            </div>
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
