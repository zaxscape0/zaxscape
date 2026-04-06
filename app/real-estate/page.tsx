"use client";

import { useState, useCallback } from "react";
import { Plus, Upload, RefreshCw, Link, Building2, ExternalLink } from "lucide-react";
import { mockREListings, type REListing } from "@/lib/re-data";
import { REFilters, defaultREFilters, type REFilterState } from "@/components/real-estate/re-filters";
import { RETable } from "@/components/real-estate/re-table";
import { REDetailPanel } from "@/components/real-estate/re-detail-panel";
import { REAddModal } from "@/components/real-estate/re-add-modal";

export default function RealEstatePage() {
  const [listings, setListings] = useState<REListing[]>(() => [...mockREListings]);
  const [filters, setFilters] = useState<REFilterState>(defaultREFilters);
  const [selected, setSelected] = useState<REListing | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [scrapeMsg, setScrapeMsg] = useState<string | null>(null);
  const [pasteUrl, setPasteUrl] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseMsg, setParseMsg] = useState<string | null>(null);
  const [lastScraped, setLastScraped] = useState<string | null>(null);

  // Load scraped listings on mount
  useState(() => {
    fetch("/api/listings/real-estate")
      .then((res) => res.json())
      .then((data) => {
        if (data.listings && data.listings.length > 0) {
          setLastScraped(data.lastScraped);
          const existingUrls = new Set(mockREListings.map((l) => l.sourceUrl).filter(Boolean));
          let newId = Math.max(...mockREListings.map((l) => l.id), 0) + 1;
          const scraped: REListing[] = data.listings
            .filter((r: { listingUrl: string }) => !existingUrls.has(r.listingUrl))
            .map((r: {
              address: string;
              city: string;
              state: string;
              askingPrice: number | null;
              propertyType: string;
              capRate: number | null;
              units: number | null;
              sqft: number | null;
              brokerName: string | null;
              listingUrl: string;
              source: string;
            }) => ({
              id: newId++,
              address: r.address,
              city: r.city,
              state: r.state || "MA",
              zip: "",
              propertyType: normalizePropertyType(r.propertyType),
              askingPrice: r.askingPrice || 0,
              units: r.units,
              sqft: r.sqft,
              lotSize: null,
              yearBuilt: null,
              occupancyPct: null,
              reportedNoi: null,
              estimatedNoi: null,
              reportedCapRate: r.capRate,
              estimatedCapRate: null,
              grossRent: null,
              taxes: null,
              insurance: null,
              hoa: null,
              pricePerUnit: r.units ? Math.round((r.askingPrice || 0) / r.units) : null,
              pricePerSqft: r.sqft ? Math.round((r.askingPrice || 0) / r.sqft) : null,
              brokerName: r.brokerName,
              brokerCompany: null,
              brokerPhone: null,
              sourcePlatform: r.source,
              sourceUrl: r.listingUrl,
              daysListed: 0,
              status: "active" as const,
              notes: "",
              rentRoll: null,
            }));
          if (scraped.length > 0) {
            setListings((prev) => [...prev, ...scraped]);
          }
        }
      })
      .catch(() => {});
  });

  const nextId = Math.max(...listings.map((l) => l.id), 0) + 1;

  const handleAdd = useCallback((listing: REListing) => {
    setListings((prev) => [...prev, listing]);
  }, []);

  const handleNotesChange = useCallback((id: number, notes: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, notes } : l))
    );
    setSelected((prev) => (prev && prev.id === id ? { ...prev, notes } : prev));
  }, []);

  const handleScrape = useCallback(async () => {
    setScraping(true);
    setScrapeMsg(null);
    try {
      const res = await fetch("/api/scrape/real-estate");
      const data = await res.json();

      if (data.results && data.results.length > 0) {
        const existingUrls = new Set(listings.map((l) => l.sourceUrl).filter(Boolean));
        let newId = Math.max(...listings.map((l) => l.id), 0) + 1;

        const newListings: REListing[] = data.results
          .filter((r: { listingUrl: string }) => !existingUrls.has(r.listingUrl))
          .map((r: {
            address: string;
            city: string;
            state: string;
            price: number | null;
            capRate: number | null;
            propertyType: string;
            units: number | null;
            sqft: number | null;
            broker: string | null;
            listingUrl: string;
            source: string;
          }) => {
            const listing: REListing = {
              id: newId++,
              address: r.address,
              city: r.city,
              state: r.state || "MA",
              zip: "",
              propertyType: normalizePropertyType(r.propertyType),
              askingPrice: r.price || 0,
              units: r.units,
              sqft: r.sqft,
              lotSize: null,
              yearBuilt: null,
              occupancyPct: null,
              reportedNoi: null,
              estimatedNoi: null,
              reportedCapRate: r.capRate,
              estimatedCapRate: null,
              grossRent: null,
              taxes: null,
              insurance: null,
              hoa: null,
              pricePerUnit: r.units ? Math.round((r.price || 0) / r.units) : null,
              pricePerSqft: r.sqft ? Math.round((r.price || 0) / r.sqft) : null,
              brokerName: r.broker,
              brokerCompany: null,
              brokerPhone: null,
              sourcePlatform: r.source,
              sourceUrl: r.listingUrl,
              daysListed: 0,
              status: "active",
              notes: "",
              rentRoll: null,
            };
            return listing;
          });

        if (newListings.length > 0) {
          setListings((prev) => [...prev, ...newListings]);
          setScrapeMsg(`Found ${newListings.length} new listing${newListings.length > 1 ? "s" : ""} from ${data.sources?.crexi || 0} Crexi + ${data.sources?.loopnet || 0} LoopNet`);
        } else {
          setScrapeMsg(data.cached ? "Results cached — no new listings found" : "Scraped but no new listings found");
        }
      } else {
        setScrapeMsg(data.message || "No results — sites may be blocking. Try Paste URL below.");
      }
    } catch {
      setScrapeMsg("Scrape failed — network error");
    } finally {
      setScraping(false);
      setTimeout(() => setScrapeMsg(null), 8000);
    }
  }, [listings]);

  const handleParseUrl = useCallback(async () => {
    if (!pasteUrl.trim()) return;
    setParsing(true);
    setParseMsg(null);
    try {
      const res = await fetch("/api/scrape/parse-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: pasteUrl.trim() }),
      });
      const data = await res.json();

      if (data.error) {
        setParseMsg(data.error);
      } else if (data.parsed) {
        const d = data.parsed.data;
        const newId = Math.max(...listings.map((l) => l.id), 0) + 1;
        const listing: REListing = {
          id: newId,
          address: (d.address as string) || "Imported Listing",
          city: (d.city as string) || "",
          state: (d.state as string) || "MA",
          zip: "",
          propertyType: normalizePropertyType((d.propertyType as string) || ""),
          askingPrice: (d.askingPrice as number) || 0,
          units: (d.units as number) || null,
          sqft: (d.sqft as number) || null,
          lotSize: null,
          yearBuilt: null,
          occupancyPct: null,
          reportedNoi: (d.noi as number) || null,
          estimatedNoi: null,
          reportedCapRate: (d.capRate as number) || null,
          estimatedCapRate: null,
          grossRent: null,
          taxes: null,
          insurance: null,
          hoa: null,
          pricePerUnit: null,
          pricePerSqft: null,
          brokerName: null,
          brokerCompany: null,
          brokerPhone: null,
          sourcePlatform: data.parsed.source,
          sourceUrl: pasteUrl.trim(),
          daysListed: 0,
          status: "active",
          notes: "",
          rentRoll: null,
        };
        setListings((prev) => [...prev, listing]);
        setPasteUrl("");
        setParseMsg("Listing imported — click to review and edit details");
        setTimeout(() => setParseMsg(null), 5000);
      }
    } catch {
      setParseMsg("Failed to parse URL");
    } finally {
      setParsing(false);
    }
  }, [pasteUrl, listings]);

  const activeCount = listings.filter((l) => l.status === "active").length;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-semibold uppercase tracking-wider">
              Investment Real Estate
            </h1>
            <p className="text-xxs text-muted-foreground mt-0.5">
              Commercial & residential investment properties — Boston 100mi
            </p>
          </div>
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xxs font-mono font-medium text-primary">
            {activeCount} active
          </span>
          {lastScraped && (
            <span className="text-xxs text-muted-foreground/60">
              Last scraped: {new Date(lastScraped).toLocaleDateString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleScrape}
            disabled={scraping}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${scraping ? "animate-spin" : ""}`} />
            {scraping ? "Scraping…" : "Refresh Listings"}
          </button>
          <button
            onClick={() => {}}
            className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            Import CSV
          </button>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Listing
          </button>
        </div>
      </div>

      {/* Scrape status message */}
      {scrapeMsg && (
        <div className="rounded-md border border-primary/20 bg-primary/5 px-3 py-2 text-xs text-primary">
          {scrapeMsg}
        </div>
      )}

      {/* Paste URL bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 rounded-md border bg-card px-3 py-1.5">
          <Link className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
          <input
            type="url"
            placeholder="Paste a LoopNet or Crexi listing URL to import…"
            value={pasteUrl}
            onChange={(e) => setPasteUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleParseUrl()}
            className="flex-1 bg-transparent text-xs outline-none placeholder:text-muted-foreground/50"
          />
        </div>
        <button
          onClick={handleParseUrl}
          disabled={parsing || !pasteUrl.trim()}
          className="flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors disabled:opacity-50"
        >
          {parsing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ExternalLink className="h-3.5 w-3.5" />
          )}
          {parsing ? "Parsing…" : "Import"}
        </button>
      </div>
      {parseMsg && (
        <div className="rounded-md border border-amber-500/20 bg-amber-500/5 px-3 py-1.5 text-xs text-amber-400">
          {parseMsg}
        </div>
      )}

      {/* Filters */}
      <REFilters filters={filters} onChange={setFilters} />

      {/* Empty state or Table */}
      {listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <Building2 className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">No listings yet</p>
          <p className="text-xs text-muted-foreground/60 mt-1 max-w-sm">
            Add manually, import a CSV, paste a listing URL above, or hit &ldquo;Refresh Listings&rdquo; to scrape LoopNet &amp; Crexi
          </p>
        </div>
      ) : (
        <RETable data={listings} filters={filters} onSelect={setSelected} />
      )}

      {/* Detail Panel */}
      {selected && (
        <REDetailPanel
          listing={selected}
          onClose={() => setSelected(null)}
          onNotesChange={handleNotesChange}
        />
      )}

      {/* Add Modal */}
      {showAdd && (
        <REAddModal
          onClose={() => setShowAdd(false)}
          onAdd={handleAdd}
          nextId={nextId}
        />
      )}
    </div>
  );
}

function normalizePropertyType(raw: string): REListing["propertyType"] {
  const lower = (raw || "").toLowerCase();
  if (/multi/i.test(lower)) return "multifamily";
  if (/mix/i.test(lower)) return "mixed_use";
  if (/retail/i.test(lower)) return "retail";
  if (/office/i.test(lower)) return "office";
  if (/industr|warehouse/i.test(lower)) return "industrial";
  if (/land|lot/i.test(lower)) return "land";
  return "multifamily";
}
