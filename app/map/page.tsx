"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { Map } from "lucide-react";

const MapView = dynamic(() => import("@/components/map/map-view"), { ssr: false });

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

export default function MapPage() {
  const [reListings, setReListings] = useState<REListing[]>([]);
  const [bizListings, setBizListings] = useState<BizListing[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/listings/real-estate").then((r) => r.json()).catch(() => ({ listings: [] })),
      fetch("/api/listings/businesses").then((r) => r.json()).catch(() => ({ listings: [] })),
    ]).then(([re, biz]) => {
      setReListings(re.listings || []);
      setBizListings(biz.listings || []);
      setLoaded(true);
    });
  }, []);

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col">
      <div className="flex items-center gap-2 mb-2">
        <Map className="h-4 w-4 text-muted-foreground" />
        <h1 className="text-sm font-semibold uppercase tracking-wider">Map View</h1>
        <span className="text-xxs text-muted-foreground">Boston · 100mi radius</span>
      </div>
      {!loaded ? (
        <div className="flex-1 flex items-center justify-center text-xs text-muted-foreground">
          Loading map data...
        </div>
      ) : (
        <MapView reListings={reListings} bizListings={bizListings} />
      )}
    </div>
  );
}
