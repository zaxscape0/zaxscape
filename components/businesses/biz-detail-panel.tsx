"use client";

import { useState } from "react";
import { BusinessListing } from "@/lib/biz-data";
import { formatCurrency } from "@/lib/format";
import { X, Calculator, Bookmark, ExternalLink } from "lucide-react";

function multipleColor(mult: number | null): string {
  if (mult == null) return "text-muted-foreground";
  if (mult < 3) return "text-up";
  if (mult <= 4) return "text-warning";
  return "text-down";
}

function scoreColor(score: number): string {
  if (score > 70) return "text-up";
  if (score >= 50) return "text-warning";
  return "text-down";
}

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-xxs text-muted-foreground">{label}</div>
      <div className="text-xs font-mono">{value}</div>
    </div>
  );
}

interface Props {
  listing: BusinessListing;
  onClose: () => void;
  onNotesChange: (id: number, notes: string) => void;
}

export function BizDetailPanel({ listing, onClose, onNotesChange }: Props) {
  const [notes, setNotes] = useState(listing.notes);

  return (
    <div className="fixed inset-y-0 right-0 z-50 flex w-[480px] flex-col border-l bg-card shadow-2xl animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between border-b p-4">
        <div>
          <h2 className="text-sm font-semibold">{listing.title}</h2>
          <p className="text-xs text-muted-foreground">
            {listing.city}, {listing.state} {listing.zip}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <span className="inline-flex rounded bg-primary/10 px-1.5 py-0.5 text-xxs font-medium text-primary">
              {listing.industry}
            </span>
            {listing.subIndustry && (
              <span className="text-xxs text-muted-foreground">{listing.subIndustry}</span>
            )}
            <span className="text-xxs text-muted-foreground">{listing.daysListed}d listed</span>
          </div>
          <div className="mt-1 flex gap-1">
            {listing.hasRecurringRevenue && (
              <span className="rounded bg-up/10 px-1.5 py-0.5 text-xxs text-up">🔁 Recurring</span>
            )}
            {listing.isSemiAbsentee && (
              <span className="rounded bg-blue-500/10 px-1.5 py-0.5 text-xxs text-blue-400">🏖️ Semi-Absentee</span>
            )}
            {listing.isFranchise && (
              <span className="rounded bg-purple-500/10 px-1.5 py-0.5 text-xxs text-purple-400">🏪 Franchise</span>
            )}
            {listing.flags.stale && (
              <span className="rounded bg-warning/15 px-1 py-0.5 text-[9px] font-medium text-warning">🟡 Stale</span>
            )}
            {listing.flags.overpriced && (
              <span className="rounded bg-down/15 px-1 py-0.5 text-[9px] font-medium text-down">🔴 Overpriced</span>
            )}
            {listing.flags.incomplete && (
              <span className="rounded bg-amber-500/15 px-1 py-0.5 text-[9px] font-medium text-amber-400">⚠️ Incomplete</span>
            )}
          </div>
        </div>
        <button onClick={onClose} className="rounded p-1 hover:bg-accent">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <div className="rounded border p-2">
            <div className="text-xxs text-muted-foreground">Asking Price</div>
            <div className="text-sm font-mono font-semibold">{formatCurrency(listing.askingPrice, 0)}</div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xxs text-muted-foreground">Multiple</div>
            <div className={`text-sm font-mono font-semibold ${multipleColor(listing.askingMultiple)}`}>
              {listing.askingMultiple != null ? `${listing.askingMultiple.toFixed(1)}x` : "—"}
            </div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xxs text-muted-foreground">Score</div>
            <div className={`text-sm font-mono font-semibold ${scoreColor(listing.score)}`}>
              {listing.score}
            </div>
          </div>
          <div className="rounded border p-2">
            <div className="text-xxs text-muted-foreground">Status</div>
            <div className="text-sm font-semibold capitalize">
              {listing.status.replace(/_/g, " ")}
            </div>
          </div>
        </div>

        {/* Financial Breakdown */}
        <div>
          <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Financial Breakdown</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Revenue" value={listing.revenue != null ? formatCurrency(listing.revenue, 0) : null} />
            <Field label="SDE / Cash Flow" value={listing.sdeCashFlow != null ? formatCurrency(listing.sdeCashFlow, 0) : null} />
            <Field label="EBITDA" value={listing.ebitda != null ? formatCurrency(listing.ebitda, 0) : null} />
            <Field label="Asking Multiple" value={listing.askingMultiple != null ? `${listing.askingMultiple.toFixed(1)}x` : null} />
          </div>
        </div>

        {/* Business Details */}
        <div>
          <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Details</h3>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Employees" value={listing.employees?.toString() ?? null} />
            <Field label="Year Established" value={listing.yearEstablished?.toString() ?? null} />
            <Field label="Industry" value={listing.industry} />
          </div>
        </div>

        {/* Description */}
        {listing.description && (
          <div>
            <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Description</h3>
            <p className="text-xs leading-relaxed text-muted-foreground">{listing.description}</p>
          </div>
        )}

        {/* Reason for Sale */}
        {listing.reasonForSale && (
          <div>
            <h3 className="text-xxs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Reason for Sale</h3>
            <p className="text-xs text-muted-foreground">{listing.reasonForSale}</p>
          </div>
        )}

        {/* Source */}
        <div className="flex gap-2">
          <span className="rounded border px-2 py-1 text-xxs text-muted-foreground">
            Source: {listing.sourcePlatform}
          </span>
          {listing.sourceUrl && (
            <a href={listing.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 rounded border px-2 py-1 text-xxs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors">
              View Listing <ExternalLink className="h-2.5 w-2.5" />
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
              {listing.brokerEmail && <div className="text-xxs text-muted-foreground">{listing.brokerEmail}</div>}
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
