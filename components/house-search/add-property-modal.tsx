"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { TaxDelinquentProperty } from "@/lib/mock-data";

interface AddPropertyModalProps {
  onClose: () => void;
  onAdd: (property: TaxDelinquentProperty) => void;
  nextId: number;
}

const TOWNS = ["Newton", "Dover", "Weston", "Wellesley", "Brookline"];

export function AddPropertyModal({ onClose, onAdd, nextId }: AddPropertyModalProps) {
  const [form, setForm] = useState({
    address: "",
    city: "Newton",
    zip: "",
    ownerName: "",
    propertyType: "single_family" as TaxDelinquentProperty["propertyType"],
    assessedValue: "",
    estimatedMarketValue: "",
    totalTaxOwed: "",
    yearsDelinquent: "5",
    taxTitleDate: "",
    status: "tax_lien" as TaxDelinquentProperty["status"],
    lastPaymentDate: "",
    lotSizeSqft: "",
    yearBuilt: "",
    bedrooms: "",
    bathrooms: "",
    units: "",
    source: "",
    sourceUrl: "",
    notes: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const property: TaxDelinquentProperty = {
      id: nextId,
      address: form.address,
      city: form.city,
      state: "MA",
      zip: form.zip,
      ownerName: form.ownerName,
      propertyType: form.propertyType,
      assessedValue: parseInt(form.assessedValue) || 0,
      estimatedMarketValue: parseInt(form.estimatedMarketValue) || 0,
      totalTaxOwed: parseInt(form.totalTaxOwed) || 0,
      yearsDelinquent: parseInt(form.yearsDelinquent) || 0,
      taxTitleDate: form.taxTitleDate || null,
      status: form.status,
      lastPaymentDate: form.lastPaymentDate || null,
      lotSizeSqft: form.lotSizeSqft ? parseInt(form.lotSizeSqft) : null,
      yearBuilt: form.yearBuilt ? parseInt(form.yearBuilt) : null,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      bathrooms: form.bathrooms ? parseFloat(form.bathrooms) : null,
      units: form.units ? parseInt(form.units) : null,
      source: form.source || `${form.city} Tax Collector`,
      sourceUrl: form.sourceUrl || null,
      notes: form.notes,
      addedAt: new Date().toISOString().split("T")[0],
    };
    onAdd(property);
    onClose();
  };

  const inputCls =
    "h-8 w-full rounded-md border bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary";
  const labelCls = "text-xxs font-medium text-muted-foreground uppercase tracking-wider";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-full max-w-2xl rounded-lg border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-sm font-semibold">Add Property</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Row 1: Address */}
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-2">
              <label className={labelCls}>Address</label>
              <input
                required
                value={form.address}
                onChange={(e) => update("address", e.target.value)}
                className={inputCls}
                placeholder="123 Main St"
              />
            </div>
            <div>
              <label className={labelCls}>City/Town</label>
              <select
                value={form.city}
                onChange={(e) => update("city", e.target.value)}
                className={inputCls}
              >
                {TOWNS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>ZIP</label>
              <input
                value={form.zip}
                onChange={(e) => update("zip", e.target.value)}
                className={inputCls}
                placeholder="02458"
              />
            </div>
          </div>

          {/* Row 2: Owner & Type */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Owner Name</label>
              <input
                required
                value={form.ownerName}
                onChange={(e) => update("ownerName", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Property Type</label>
              <select
                value={form.propertyType}
                onChange={(e) => update("propertyType", e.target.value)}
                className={inputCls}
              >
                <option value="single_family">Single Family</option>
                <option value="multi_family">Multi-Family</option>
                <option value="condo">Condo</option>
                <option value="commercial">Commercial</option>
                <option value="land">Land</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Status</label>
              <select
                value={form.status}
                onChange={(e) => update("status", e.target.value)}
                className={inputCls}
              >
                <option value="tax_lien">Tax Lien</option>
                <option value="tax_title">Tax Title</option>
                <option value="in_redemption">In Redemption</option>
                <option value="foreclosure_pending">Foreclosure Pending</option>
              </select>
            </div>
          </div>

          {/* Row 3: Values */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Assessed Value</label>
              <input
                type="number"
                required
                value={form.assessedValue}
                onChange={(e) => update("assessedValue", e.target.value)}
                className={inputCls}
                placeholder="1500000"
              />
            </div>
            <div>
              <label className={labelCls}>Est. Market Value</label>
              <input
                type="number"
                value={form.estimatedMarketValue}
                onChange={(e) => update("estimatedMarketValue", e.target.value)}
                className={inputCls}
                placeholder="1800000"
              />
            </div>
            <div>
              <label className={labelCls}>Total Tax Owed</label>
              <input
                type="number"
                required
                value={form.totalTaxOwed}
                onChange={(e) => update("totalTaxOwed", e.target.value)}
                className={inputCls}
                placeholder="95000"
              />
            </div>
            <div>
              <label className={labelCls}>Years Delinquent</label>
              <input
                type="number"
                required
                min={1}
                value={form.yearsDelinquent}
                onChange={(e) => update("yearsDelinquent", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Tax Title Date</label>
              <input
                type="date"
                value={form.taxTitleDate}
                onChange={(e) => update("taxTitleDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Last Payment</label>
              <input
                type="date"
                value={form.lastPaymentDate}
                onChange={(e) => update("lastPaymentDate", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Year Built</label>
              <input
                type="number"
                value={form.yearBuilt}
                onChange={(e) => update("yearBuilt", e.target.value)}
                className={inputCls}
                placeholder="1955"
              />
            </div>
            <div>
              <label className={labelCls}>Lot Size (sqft)</label>
              <input
                type="number"
                value={form.lotSizeSqft}
                onChange={(e) => update("lotSizeSqft", e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          {/* Row 5: Beds/Bath/Units */}
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className={labelCls}>Bedrooms</label>
              <input
                type="number"
                value={form.bedrooms}
                onChange={(e) => update("bedrooms", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Bathrooms</label>
              <input
                type="number"
                step="0.5"
                value={form.bathrooms}
                onChange={(e) => update("bathrooms", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Units</label>
              <input
                type="number"
                value={form.units}
                onChange={(e) => update("units", e.target.value)}
                className={inputCls}
              />
            </div>
            <div>
              <label className={labelCls}>Source</label>
              <input
                value={form.source}
                onChange={(e) => update("source", e.target.value)}
                className={inputCls}
                placeholder="Town Tax Collector"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className={labelCls}>Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => update("notes", e.target.value)}
              rows={2}
              className="w-full rounded-md border bg-background px-2 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90"
            >
              Add Property
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
