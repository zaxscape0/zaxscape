"use client";

import { useState } from "react";
import { RealEstateAnalyzer } from "@/components/deals/real-estate-analyzer";
import { BusinessAnalyzer } from "@/components/deals/business-analyzer";
import { Home, Store } from "lucide-react";

type Mode = "real-estate" | "business";

export default function DealsPage() {
  const [mode, setMode] = useState<Mode>("real-estate");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-semibold uppercase tracking-wider">Deal Analyzer</h1>
        <div className="flex rounded-md border bg-card">
          <button
            onClick={() => setMode("real-estate")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
              mode === "real-estate"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            } rounded-l-md`}
          >
            <Home className="h-3.5 w-3.5" />
            Real Estate
          </button>
          <button
            onClick={() => setMode("business")}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs transition-colors ${
              mode === "business"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            } rounded-r-md`}
          >
            <Store className="h-3.5 w-3.5" />
            Business
          </button>
        </div>
      </div>

      {mode === "real-estate" ? <RealEstateAnalyzer /> : <BusinessAnalyzer />}
    </div>
  );
}
