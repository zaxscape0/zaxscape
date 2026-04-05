"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Info, ExternalLink } from "lucide-react";

export function InfoPanel() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-md border bg-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <Info className="h-3.5 w-3.5 text-primary" />
        <span className="font-medium">
          About Tax Title Properties in Massachusetts
        </span>
        {open ? (
          <ChevronUp className="ml-auto h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="ml-auto h-3.5 w-3.5" />
        )}
      </button>

      {open && (
        <div className="border-t px-4 py-3 text-xs text-muted-foreground space-y-3">
          <div>
            <h4 className="font-medium text-foreground mb-1">
              What are tax title properties?
            </h4>
            <p>
              When a property owner fails to pay real estate taxes, the municipality
              can place a lien on the property. After continued non-payment (typically
              1-2 years), the town takes &quot;tax title&quot; — a legal claim that can
              eventually lead to foreclosure. These properties represent acquisition
              opportunities where the purchase price is often just the back taxes owed.
            </p>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-1">
              Massachusetts tax title process
            </h4>
            <ol className="list-decimal list-inside space-y-0.5">
              <li>
                <strong>Tax Lien:</strong> Town places lien after non-payment
                (interest accrues at 14%/year)
              </li>
              <li>
                <strong>Tax Taking:</strong> After ~1 year, town takes tax title
                (M.G.L. c. 60, §53)
              </li>
              <li>
                <strong>Redemption Period:</strong> Owner has ~6 months to 2 years to
                pay back taxes + interest
              </li>
              <li>
                <strong>Land Court Foreclosure:</strong> Town files petition to
                foreclose tax title (M.G.L. c. 60, §65)
              </li>
              <li>
                <strong>Assignment/Auction:</strong> Town can assign tax title to
                investor or auction the property
              </li>
            </ol>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-1">Key risks</h4>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Owner can redeem at any time before foreclosure decree</li>
              <li>Environmental liens (21E) survive tax title foreclosure</li>
              <li>IRS liens have 120-day right of redemption</li>
              <li>Title may have other encumbrances requiring quiet title action</li>
              <li>Property condition is often unknown — inspection difficult</li>
              <li>Land Court process can take 1-3+ years</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-1">
              Due diligence checklist
            </h4>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Title search at Registry of Deeds</li>
              <li>Check for federal tax liens (IRS)</li>
              <li>Environmental records check (MassDEP)</li>
              <li>Building department — permits, violations, condemnation</li>
              <li>Zoning verification</li>
              <li>Drive-by inspection of property condition</li>
              <li>Assess rehab costs and ARV (after repair value)</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-foreground mb-1">
              Town tax collector links
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {[
                { name: "Newton", url: "https://www.newtonma.gov/government/finance/tax-collector" },
                { name: "Dover", url: "https://www.doverma.org/tax-collector" },
                { name: "Weston", url: "https://www.weston.org/tax-collector" },
                { name: "Wellesley", url: "https://www.wellesleyma.gov/tax-collector" },
                { name: "Brookline", url: "https://www.brooklinema.gov/tax-collector" },
              ].map((town) => (
                <a
                  key={town.name}
                  href={town.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {town.name} <ExternalLink className="h-3 w-3" />
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
