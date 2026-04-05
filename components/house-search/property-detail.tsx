"use client";

import { TaxDelinquentProperty } from "@/lib/mock-data";
import { X, MapPin, ExternalLink, Calculator, Bookmark, Phone, Mail, Home, Loader2 } from "lucide-react";

const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

const fmtSqft = (n: number) => n.toLocaleString("en-US");

const fmtPhone = (n: string) => {
  const d = n.replace(/\D/g, "");
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return n;
};

const TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family",
  multi_family: "Multi-Family",
  condo: "Condo",
  commercial: "Commercial",
  land: "Land",
};

const STATUS_LABELS: Record<string, string> = {
  tax_lien: "Tax Lien",
  tax_title: "Tax Title",
  in_redemption: "In Redemption",
  foreclosure_pending: "Foreclosure Pending",
};

const STATUS_COLORS: Record<string, string> = {
  tax_lien: "text-yellow-400",
  tax_title: "text-orange-400",
  in_redemption: "text-blue-400",
  foreclosure_pending: "text-red-400",
};

const PHONE_TYPE_COLORS: Record<string, string> = {
  mobile: "bg-emerald-500/15 text-emerald-400",
  cell: "bg-emerald-500/15 text-emerald-400",
  wireless: "bg-emerald-500/15 text-emerald-400",
  landline: "bg-blue-500/15 text-blue-400",
  voip: "bg-purple-500/15 text-purple-400",
  unknown: "bg-zinc-500/15 text-zinc-400",
};

interface PropertyDetailProps {
  property: TaxDelinquentProperty;
  onClose: () => void;
  onNotesChange: (id: number, notes: string) => void;
  onSkipTrace: (id: number) => void;
}

export function PropertyDetail({ property: p, onClose, onNotesChange, onSkipTrace }: PropertyDetailProps) {
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    `${p.address}, ${p.city}, ${p.state} ${p.zip}`
  )}`;
  const zillowUrl = `https://www.zillow.com/homes/${encodeURIComponent(
    `${p.address} ${p.city} ${p.state} ${p.zip}`
  )}`;
  const redfinUrl = `https://www.redfin.com/search#query=${encodeURIComponent(
    `${p.address}, ${p.city}, ${p.state}`
  )}`;

  const delinquencyColor =
    p.yearsDelinquent >= 8
      ? "text-red-400"
      : p.yearsDelinquent >= 5
      ? "text-amber-400"
      : "text-emerald-400";

  const equity = p.estimatedMarketValue - p.totalTaxOwed;
  const equityPct = ((equity / p.estimatedMarketValue) * 100).toFixed(1);

  const hasSkipTrace = p.skipTrace !== undefined && p.skipTrace !== null;
  const hasResults = hasSkipTrace && (p.skipTrace!.phones.length > 0 || p.skipTrace!.emails.length > 0);
  const propertyFullAddr = `${p.address}, ${p.city}, ${p.state} ${p.zip}`.toLowerCase();

  return (
    <div className="border-t bg-card/50 px-4 py-3">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            {p.address}, {p.city}, {p.state} {p.zip}
          </h3>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xxs text-muted-foreground">
              {TYPE_LABELS[p.propertyType]}
            </span>
            <span className={`text-xxs font-medium ${STATUS_COLORS[p.status]}`}>
              {STATUS_LABELS[p.status]}
            </span>
            <span className="text-xxs text-muted-foreground">
              Owner: {p.ownerName}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 text-xs">
        {/* Financial */}
        <div className="space-y-2">
          <h4 className="text-xxs font-medium text-muted-foreground uppercase tracking-wider">
            Financials
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Assessed</span>
              <span className="font-mono">{fmt(p.assessedValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Market</span>
              <span className="font-mono">{fmt(p.estimatedMarketValue)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax Owed</span>
              <span className="font-mono text-red-400">{fmt(p.totalTaxOwed)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-1">
              <span className="text-muted-foreground">Est. Equity</span>
              <span className="font-mono text-emerald-400">
                {fmt(equity)} ({equityPct}%)
              </span>
            </div>
          </div>
        </div>

        {/* Property Details */}
        <div className="space-y-2">
          <h4 className="text-xxs font-medium text-muted-foreground uppercase tracking-wider">
            Property
          </h4>
          <div className="space-y-1">
            {p.yearBuilt && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year Built</span>
                <span className="font-mono">{p.yearBuilt}</span>
              </div>
            )}
            {p.lotSizeSqft && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Lot Size</span>
                <span className="font-mono">{fmtSqft(p.lotSizeSqft)} sqft</span>
              </div>
            )}
            {p.bedrooms != null && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Bed / Bath</span>
                <span className="font-mono">
                  {p.bedrooms}bd / {p.bathrooms}ba
                </span>
              </div>
            )}
            {p.units && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Units</span>
                <span className="font-mono">{p.units}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tax History */}
        <div className="space-y-2">
          <h4 className="text-xxs font-medium text-muted-foreground uppercase tracking-wider">
            Tax Status
          </h4>
          <div className="space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Years Overdue</span>
              <span className={`font-mono font-semibold ${delinquencyColor}`}>
                {p.yearsDelinquent}
              </span>
            </div>
            {p.taxTitleDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax Title Date</span>
                <span className="font-mono">{p.taxTitleDate}</span>
              </div>
            )}
            {p.lastPaymentDate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Last Payment</span>
                <span className="font-mono">{p.lastPaymentDate}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Source</span>
              {p.sourceUrl ? (
                <a
                  href={p.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-1"
                >
                  {p.source} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span>{p.source}</span>
              )}
            </div>
          </div>
        </div>

        {/* Links & Actions */}
        <div className="space-y-2">
          <h4 className="text-xxs font-medium text-muted-foreground uppercase tracking-wider">
            Links & Actions
          </h4>
          <div className="space-y-1.5">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <MapPin className="h-3 w-3" /> Google Maps
            </a>
            <a
              href={zillowUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Zillow
            </a>
            <a
              href={redfinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-primary hover:underline"
            >
              <ExternalLink className="h-3 w-3" /> Redfin
            </a>
            <div className="flex gap-1.5 pt-1 flex-wrap">
              <button className="flex items-center gap-1 rounded border px-2 py-1 text-xxs hover:bg-accent">
                <Calculator className="h-3 w-3" /> Analyze Deal
              </button>
              <button className="flex items-center gap-1 rounded border px-2 py-1 text-xxs hover:bg-accent">
                <Bookmark className="h-3 w-3" /> Save
              </button>
              {!hasSkipTrace && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSkipTrace(p.id);
                  }}
                  disabled={p.skipTraceLoading}
                  className="flex items-center gap-1 rounded border border-emerald-500/30 px-2 py-1 text-xxs text-emerald-400 hover:bg-emerald-500/10 disabled:opacity-50 transition-colors"
                >
                  {p.skipTraceLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Phone className="h-3 w-3" />
                  )}
                  {p.skipTraceLoading ? "Tracing..." : "Get Contact"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Skip Trace Results */}
      {hasSkipTrace && (
        <div className={`mt-3 rounded-md border p-3 ${hasResults ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-muted/20"}`}>
          <h4 className="text-xxs font-medium uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span className={hasResults ? "text-emerald-400" : "text-muted-foreground"}>
              Contact Info
            </span>
          </h4>

          {!hasResults ? (
            <p className="text-xxs text-muted-foreground">No contact info found</p>
          ) : (
            <div className="grid grid-cols-3 gap-4 text-xs">
              {/* Phones */}
              {p.skipTrace!.phones.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xxs text-muted-foreground">Phone Numbers</span>
                  {p.skipTrace!.phones.map((ph, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <a
                        href={`tel:${ph.number}`}
                        className="font-mono text-foreground hover:text-primary transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {fmtPhone(ph.number)}
                      </a>
                      <span className={`inline-block rounded px-1 py-0.5 text-[9px] font-medium ${PHONE_TYPE_COLORS[ph.type] || PHONE_TYPE_COLORS.unknown}`}>
                        {ph.type}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Emails */}
              {p.skipTrace!.emails.length > 0 && (
                <div className="space-y-1">
                  <span className="text-xxs text-muted-foreground">Email Addresses</span>
                  {p.skipTrace!.emails.map((email, i) => (
                    <div key={i}>
                      <a
                        href={`mailto:${email}`}
                        className="font-mono text-foreground hover:text-primary transition-colors flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {email}
                      </a>
                    </div>
                  ))}
                </div>
              )}

              {/* Mailing Address */}
              {p.skipTrace!.mailingAddress &&
                p.skipTrace!.mailingAddress.toLowerCase() !== propertyFullAddr && (
                  <div className="space-y-1">
                    <span className="text-xxs text-muted-foreground">Mailing Address</span>
                    <div className="flex items-start gap-1 text-foreground">
                      <Home className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                      <span className="font-mono">{p.skipTrace!.mailingAddress}</span>
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      )}

      {/* Notes */}
      <div className="mt-3">
        <label className="text-xxs font-medium text-muted-foreground uppercase tracking-wider">
          Notes
        </label>
        <textarea
          value={p.notes}
          onChange={(e) => onNotesChange(p.id, e.target.value)}
          placeholder="Add notes about this property..."
          rows={2}
          className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary resize-none"
        />
      </div>
    </div>
  );
}
