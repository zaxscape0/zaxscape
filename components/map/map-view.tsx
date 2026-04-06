"use client";

import { useMemo, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
// leaflet CSS imported in globals.css
import { formatCurrency } from "@/lib/format";
import { taxDelinquentProperties, TaxDelinquentProperty } from "@/lib/mock-data";

// Fix default marker icons in webpack/next.js
if (typeof window !== "undefined") {
  delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
}

const BOSTON_CENTER: [number, number] = [42.36, -71.06];
const RADIUS_MILES = 100;
const RADIUS_METERS = RADIUS_MILES * 1609.34;

interface REListing {
  address: string;
  city: string;
  state: string;
  askingPrice: number | null;
  propertyType: string;
  capRate: number | null;
  units: number | null;
  sqft: number | null;
  listingUrl: string;
  source: string;
}

interface BizListing {
  title: string;
  askingPrice: number | null;
  cashFlow: number | null;
  revenue: number | null;
  industry: string;
  city: string;
  state: string;
  listingUrl: string;
  source: string;
}

function createIcon(color: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="
      width: 12px; height: 12px; border-radius: 50%;
      background: ${color}; border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

const blueIcon = createIcon("#3b82f6");
const greenIcon = createIcon("#22c55e");
const redIcon = createIcon("#ef4444");

// City -> approximate coords (MA area)
const CITY_COORDS: Record<string, [number, number]> = {
  "Boston": [42.36, -71.06],
  "Waltham": [42.38, -71.24],
  "Hartford": [41.76, -72.68],
  "Biddeford": [43.49, -70.45],
  "New Haven": [41.31, -72.93],
  "Newton": [42.34, -71.21],
  "Dover": [42.24, -71.28],
  "Wellesley": [42.30, -71.29],
  "Weston": [42.37, -71.30],
  "Brookline": [42.33, -71.12],
  "Cambridge": [42.37, -71.11],
  "Somerville": [42.39, -71.10],
  "Quincy": [42.25, -71.00],
  "Framingham": [42.28, -71.42],
  "Worcester": [42.26, -71.80],
  "Springfield": [42.10, -72.59],
  "Providence": [41.82, -71.41],
  "Manchester": [42.99, -71.45],
  "Portland": [43.66, -70.26],
  "Stamford": [41.05, -73.54],
  "Brockton": [42.08, -71.02],
  "Fall River": [41.70, -71.16],
  "New Bedford": [41.64, -70.93],
  "Lowell": [42.63, -71.32],
  "Lawrence": [42.71, -71.16],
  "Massachusetts": [42.36, -71.06],
};

function getCityCoords(city: string): [number, number] | null {
  if (!city) return null;
  const key = Object.keys(CITY_COORDS).find(
    (k) => city.toLowerCase().includes(k.toLowerCase())
  );
  if (key) {
    // Add small jitter to avoid overlapping markers
    const base = CITY_COORDS[key];
    return [base[0] + (Math.random() - 0.5) * 0.01, base[1] + (Math.random() - 0.5) * 0.01];
  }
  return null;
}

interface MapViewProps {
  reListings: REListing[];
  bizListings: BizListing[];
}

export default function MapView({ reListings, bizListings }: MapViewProps) {
  const [showRE, setShowRE] = useState(true);
  const [showBiz, setShowBiz] = useState(true);
  const [showTax, setShowTax] = useState(true);

  const reMarkers = useMemo(
    () =>
      reListings
        .map((l) => ({ ...l, coords: getCityCoords(l.city) }))
        .filter((l) => l.coords !== null) as (REListing & { coords: [number, number] })[],
    [reListings]
  );

  const bizMarkers = useMemo(
    () =>
      bizListings
        .map((l) => ({ ...l, coords: getCityCoords(l.city) }))
        .filter((l) => l.coords !== null) as (BizListing & { coords: [number, number] })[],
    [bizListings]
  );

  const taxMarkers = useMemo(
    () =>
      taxDelinquentProperties
        .map((p) => ({ ...p, coords: getCityCoords(p.city) }))
        .filter((p) => p.coords !== null) as (TaxDelinquentProperty & { coords: [number, number] })[],
    []
  );

  return (
    <div className="h-full flex flex-col">
      {/* Filter toggles */}
      <div className="flex items-center gap-3 mb-2">
        <FilterToggle color="#3b82f6" label={`RE (${reMarkers.length})`} active={showRE} onToggle={() => setShowRE(!showRE)} />
        <FilterToggle color="#22c55e" label={`Business (${bizMarkers.length})`} active={showBiz} onToggle={() => setShowBiz(!showBiz)} />
        <FilterToggle color="#ef4444" label={`Tax Delinquent (${taxMarkers.length})`} active={showTax} onToggle={() => setShowTax(!showTax)} />
      </div>

      <div className="flex-1 rounded-md border overflow-hidden" style={{ minHeight: "500px" }}>
        <MapContainer
          center={BOSTON_CENTER}
          zoom={9}
          className="h-full w-full"
          style={{ height: "100%", background: "hsl(240 17% 4%)" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {/* 100 mile radius */}
          <Circle
            center={BOSTON_CENTER}
            radius={RADIUS_METERS}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.04, weight: 1, dashArray: "8 4" }}
          />

          {/* RE markers */}
          {showRE &&
            reMarkers.map((l, i) => (
              <Marker key={`re-${i}`} position={l.coords} icon={blueIcon}>
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <div className="font-semibold">{l.address}</div>
                    <div>{l.propertyType} — {l.city}, {l.state}</div>
                    {l.askingPrice && <div className="font-mono">{formatCurrency(l.askingPrice, 0)}</div>}
                    {l.capRate && <div>Cap Rate: {l.capRate}%</div>}
                    <a href="/real-estate" className="text-blue-400 underline block">View in Real Estate →</a>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Biz markers */}
          {showBiz &&
            bizMarkers.map((l, i) => (
              <Marker key={`biz-${i}`} position={l.coords} icon={greenIcon}>
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <div className="font-semibold">{l.title}</div>
                    <div>{l.industry} — {l.city}</div>
                    {l.askingPrice && <div className="font-mono">{formatCurrency(l.askingPrice, 0)}</div>}
                    {l.cashFlow && <div>Cash Flow: {formatCurrency(l.cashFlow, 0)}</div>}
                    <a href="/businesses" className="text-green-400 underline block">View in Businesses →</a>
                  </div>
                </Popup>
              </Marker>
            ))}

          {/* Tax delinquent markers */}
          {showTax &&
            taxMarkers.map((p) => (
              <Marker key={`tax-${p.id}`} position={p.coords} icon={redIcon}>
                <Popup>
                  <div className="text-xs space-y-1 min-w-[180px]">
                    <div className="font-semibold">{p.address}</div>
                    <div>{p.city}, {p.state} {p.zip}</div>
                    <div className="font-mono">Tax Owed: {formatCurrency(p.totalTaxOwed, 0)}</div>
                    <div>Est. Value: {formatCurrency(p.estimatedMarketValue, 0)}</div>
                    <div>{p.yearsDelinquent}yr delinquent — {p.status.replace(/_/g, " ")}</div>
                    <a href="/house-search" className="text-red-400 underline block">View in House Search →</a>
                  </div>
                </Popup>
              </Marker>
            ))}
        </MapContainer>
      </div>
    </div>
  );
}

function FilterToggle({ color, label, active, onToggle }: { color: string; label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-xxs transition-colors ${
        active ? "bg-accent/50 text-foreground" : "text-muted-foreground opacity-50"
      }`}
    >
      <div className="h-2.5 w-2.5 rounded-full" style={{ background: active ? color : "#666" }} />
      {label}
    </button>
  );
}
