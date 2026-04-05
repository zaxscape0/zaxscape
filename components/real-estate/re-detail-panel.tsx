"use client";

import { useState } from "react";
import { REListing, getCapRate, getNoi, isEstimatedCapRate, isEstimatedNoi, propertyTypeLabels } from "@/lib/re-data";
import { formatCurrency } from "@/lib/format";
import { X, MapPin, Calculator, Bookmark, ExternalLink } from "lucide-react";

function EstBadge() {
  return (
    <span className="ml-1 rounded bg-amber-500/15 px-1 py-px text-[9px] font-medium text-amber-400">
      Est
    </span>
  );
}

function Field({ label, value, est }: { label: string; value: string | null; est?: boolean }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xxs text-muted-foreground">{label}</div>
      <div className="text-xs font-mono">
        {value}
        {est && <EstBadge />}
      </div>
    </div>
  );
}

interface Props {
  listing: REListing;
  onClose: () => void;
  onNotesChange: (id: number, notes: string) => void;
}

export function REDetailPanel({ listing, onClose, onNotesChange }: Props) {
  const [notes, setNotes] = useState(listing.notes);
  const capRate = getCapRate(listing);
  const noi = getNoi(listing);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${listing.address}, ${listing.city}, ${listing.state} ${listing.zip}`
  )}`;
  const zillowUrl = `https://www.zillow.com/homes/${encodeURIComponent(
    `${listing.address} ${listing.city} ${listing.state} ${listing.zip}`
  )}`;

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-[480px] flex-col border-l bg-card shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <h2 className="text-sm font-semibold">{listing.address}</h2>
          <p className="text-xs text-muted-foreground">
            {listing.city}, {listing.state} {listing.zip}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex rounded px-1.5 py-0.5 text-xxs font-medium ${
              listing.propertyType === 'multifamily' ? 'bg-blue-500/15 text-blue-400' :
              listing.propertyType === 'mixed_use' ? 'bg-purple-500/15 text-purple-400' :
              listing.propertyType === 'retail' ? 'bg-emerald-500/15 text-emerald-400' :
              listing.propertyType === 'office' ? 'bg-cyan-500/15 text-cyan-400' :
              listing.propertyType === 'industrial' ? 'bg-orange-500/15 text-orange-400' :
              'bg-yellow-500/15 text-yellow-400'
            }`}>
              {propertyTypeLabels[listing.propertyType]}
            </span>
            <span className="text-xxs text-muted-foreground">{listing.daysListed}d listed</span>
          </div>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded border p-2">
            <div className="text-xxs text-muted-foreground">Asking Price</div>
            <div className="text-sm font-mono font-semibold">{formatCurrency(listing.askingPrice, 0)}</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xxs text-muted-foreground">Cap Rate</div>
            <div className={`text-sm font-mono font-semibold ${
              capRate == null ? 'text-muted-foreground' :
              capRate > 8 ? 'text-up' : capRate >= 6 ? 'text-warning' : 'text-down'
            }`}>
              {capRate != null ? `${capRate.toFixed(1)}%` : "—"}
              {isEstimatedCapRate(listing) && <EstBadge />}
            </div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xxs text-muted-foreground">NOI</div>
            <div className="text-sm font-mono font-semibold">
              {noi != null ? formatCurrency(noi, 0) : "—"}
              {isEstimatedNoi(listing) && <EstBadge />}
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div>
          <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Property Details</h3>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Units" value={listing.units?.toString() ?? null} />
            <Field label="SqFt" value={listing.sqft?.toLocaleString() ?? null} />
            <Field label="Lot Size" value={listing.lotSize ? `${listing.lotSize} ac` : null} />
            <Field label="Year Built" value={listing.yearBuilt?.toString() ?? null} />
            <Field label="Occupancy" value={listing.occupancyPct != null ? `${listing.occupancyPct}%` : null} />
            <Field label="Price/Unit" value={listing.pricePerUnit ? formatCurrency(listing.pricePerUnit, 0) : null} />
            <Field label="Price/SqFt" value={listing.pricePerSqft ? `$${listing.pricePerSqft}` : null} />
            <Field label="Gross Rent" value={listing.grossRent ? formatCurrency(listing.grossRent, 0) : null} />
          </div>
        </div>

        {/* Financial Details */}
        <div>
          <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Financials</h3>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Reported NOI" value={listing.reportedNoi ? formatCurrency(listing.reportedNoi, 0) : null} />
            <Field label="Estimated NOI" value={listing.estimatedNoi ? formatCurrency(listing.estimatedNoi, 0) : null} est />
            <Field label="Reported Cap" value={listing.reportedCapRate ? `${listing.reportedCapRate}%` : null} />
            <Field label="Estimated Cap" value={listing.estimatedCapRate ? `${listing.estimatedCapRate}%` : null} est />
            <Field label="Taxes" value={listing.taxes ? formatCurrency(listing.taxes, 0) : null} />
            <Field label="Insurance" value={listing.insurance ? formatCurrency(listing.insurance, 0) : null} />
          </div>
        </div>

        {/* Photos placeholder */}
        <div>
          <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Photos</h3>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 w-28 rounded border border-dashed flex items-center justify-center text-xxs text-muted-foreground">
                No photo
              </div>
            ))}
          </div>
        </div>

        {/* Rent Roll */}
        {listing.rentRoll && listing.rentRoll.length > 0 && (
          <div>
            <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Rent Roll</h3>
            <div className="rounded border overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-2 py-1 text-left text-xxs font-medium uppercase text-muted-foreground">Unit</th>
                    <th className="px-2 py-1 text-left text-xxs font-medium uppercase text-muted-foreground">Rent</th>
                    <th className="px-2 py-1 text-left text-xxs font-medium uppercase text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {listing.rentRoll.map((r) => (
                    <tr key={r.unit} className="border-b border-border/30">
                      <td className="px-2 py-1 font-mono">{r.unit}</td>
                      <td className="px-2 py-1 font-mono">{formatCurrency(r.rent, 0)}</td>
                      <td className="px-2 py-1">
                        {r.occupied ? (
                          <span className="text-up text-xxs">Occupied</span>
                        ) : (
                          <span className="text-down text-xxs">Vacant</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Links */}
        <div className="flex gap-2">
          <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 rounded border px-2 py-1 text-xxs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            <MapPin className="h-3 w-3" /> Google Maps
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          <a href={zillowUrl} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1 rounded border px-2 py-1 text-xxs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
            Zillow
            <ExternalLink className="h-2.5 w-2.5" />
          </a>
          {listing.sourceUrl && (
            <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 rounded border px-2 py-1 text-xxs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              {listing.sourcePlatform}
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>

        {/* Broker */}
        {listing.brokerName && (
          <div>
            <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Broker</h3>
            <div className="rounded border p-2 space-y-0.5">
              <div className="text-xs font-medium">{listing.brokerName}</div>
              {listing.brokerCompany && <div className="text-xxs text-muted-foreground">{listing.brokerCompany}</div>}
              {listing.brokerPhone && <div className="text-xxs font-mono text-muted-foreground">{listing.brokerPhone}</div>}
            </div>
          </div>
        )}

        {/* Notes */}
        <div>
          <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Notes</h3>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            onBlur={() => onNotesChange(listing.id, notes)}
            className="w-full rounded border bg-background px-2 py-1.5 text-xs resize-none h-20"
            placeholder="Add notes…"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t p-3 flex gap-2">
        <button className="flex-1 flex items-center justify-center gap-1.5 rounded bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 transition-colors">
          <Calculator className="h-3.5 w-3.5" /> Analyze Deal
        </button>
        <button className="flex items-center justify-center gap-1.5 rounded border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
          <Bookmark className="h-3.5 w-3.5" /> Save
        </button>
      </div>
    </div>
  );
}
