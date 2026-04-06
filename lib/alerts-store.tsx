"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export type AlertType = "new_listing" | "price_drop" | "rate_change" | "watchlist_threshold";

export interface AlertRule {
  id: string;
  type: AlertType;
  active: boolean;
  conditions: Record<string, string | number | boolean>;
  createdAt: string;
  lastTriggered: string | null;
}

export interface AlertEvent {
  id: string;
  ruleId: string;
  type: AlertType;
  message: string;
  link: string;
  timestamp: string;
  read: boolean;
}

interface AlertsStore {
  rules: AlertRule[];
  events: AlertEvent[];
  addRule: (rule: Omit<AlertRule, "id" | "createdAt" | "lastTriggered">) => void;
  removeRule: (id: string) => void;
  toggleRule: (id: string) => void;
  markEventRead: (id: string) => void;
  markAllRead: () => void;
}

const AlertsContext = createContext<AlertsStore | null>(null);

const STORAGE_KEY = "zaxscape-alerts";

const MOCK_RULES: AlertRule[] = [
  {
    id: "ar1",
    type: "new_listing",
    active: true,
    conditions: { propertyType: "Multifamily", maxPrice: 2000000, city: "Boston" },
    createdAt: "2026-03-15T10:00:00Z",
    lastTriggered: "2026-04-05T14:22:00Z",
  },
  {
    id: "ar2",
    type: "price_drop",
    active: true,
    conditions: { propertyType: "Commercial", minDrop: 10 },
    createdAt: "2026-03-20T08:00:00Z",
    lastTriggered: "2026-04-04T09:15:00Z",
  },
  {
    id: "ar3",
    type: "rate_change",
    active: true,
    conditions: { lender: "DCU Federal Credit Union", product: "30yr", rateBelow: 6.0 },
    createdAt: "2026-04-01T12:00:00Z",
    lastTriggered: "2026-04-05T11:00:00Z",
  },
  {
    id: "ar4",
    type: "watchlist_threshold",
    active: false,
    conditions: { symbol: "AAPL", direction: "above", price: 200 },
    createdAt: "2026-04-02T15:00:00Z",
    lastTriggered: null,
  },
];

const MOCK_EVENTS: AlertEvent[] = [
  {
    id: "ae1",
    ruleId: "ar1",
    type: "new_listing",
    message: "New multifamily listing: 550 Main St Hartford, CT — Multifamily portfolio",
    link: "/real-estate",
    timestamp: "2026-04-05T14:22:00Z",
    read: false,
  },
  {
    id: "ae2",
    ruleId: "ar2",
    type: "price_drop",
    message: "Price drop: Auto shop on Fall River reduced 15% to $250K",
    link: "/businesses",
    timestamp: "2026-04-04T09:15:00Z",
    read: false,
  },
  {
    id: "ae3",
    ruleId: "ar3",
    type: "rate_change",
    message: "DCU 30yr Fixed dropped to 5.99% — below your 6.0% threshold",
    link: "/rates",
    timestamp: "2026-04-05T11:00:00Z",
    read: true,
  },
  {
    id: "ae4",
    ruleId: "ar1",
    type: "new_listing",
    message: "New listing: 8-unit MF in Quincy — $550K, 7.2% cap rate",
    link: "/real-estate",
    timestamp: "2026-04-03T16:45:00Z",
    read: true,
  },
  {
    id: "ae5",
    ruleId: "ar2",
    type: "price_drop",
    message: "Price cut: Coin laundromat in Quincy reduced to $185K",
    link: "/businesses",
    timestamp: "2026-04-02T10:30:00Z",
    read: true,
  },
];

export function AlertsProvider({ children }: { children: ReactNode }) {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [events, setEvents] = useState<AlertEvent[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setRules(parsed.rules?.length > 0 ? parsed.rules : MOCK_RULES);
        setEvents(parsed.events?.length > 0 ? parsed.events : MOCK_EVENTS);
      } else {
        setRules(MOCK_RULES);
        setEvents(MOCK_EVENTS);
      }
    } catch {
      setRules(MOCK_RULES);
      setEvents(MOCK_EVENTS);
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify({ rules, events }));
  }, [rules, events, loaded]);

  const addRule = useCallback((rule: Omit<AlertRule, "id" | "createdAt" | "lastTriggered">) => {
    setRules((prev) => [
      ...prev,
      { ...rule, id: crypto.randomUUID(), createdAt: new Date().toISOString(), lastTriggered: null },
    ]);
  }, []);

  const removeRule = useCallback((id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const toggleRule = useCallback((id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));
  }, []);

  const markEventRead = useCallback((id: string) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, read: true } : e)));
  }, []);

  const markAllRead = useCallback(() => {
    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
  }, []);

  return (
    <AlertsContext.Provider value={{ rules, events, addRule, removeRule, toggleRule, markEventRead, markAllRead }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used within AlertsProvider");
  return ctx;
}
