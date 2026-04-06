"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface SavedItem {
  id: string;
  type: "real-estate" | "business" | "stock" | "lender" | "tax-delinquent";
  title: string;
  keyMetric: string;
  price: number | null;
  dateSaved: string;
  notes: string;
  href: string;
}

interface SavedStore {
  items: SavedItem[];
  addItem: (item: Omit<SavedItem, "id" | "dateSaved">) => void;
  removeItem: (id: string) => void;
  updateNotes: (id: string, notes: string) => void;
  isSaved: (type: SavedItem["type"], title: string) => boolean;
  toggleSave: (item: Omit<SavedItem, "id" | "dateSaved">) => void;
}

const SavedContext = createContext<SavedStore | null>(null);

const STORAGE_KEY = "zaxscape-saved-items";

export function SavedProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, loaded]);

  const addItem = useCallback((item: Omit<SavedItem, "id" | "dateSaved">) => {
    setItems((prev) => [
      ...prev,
      {
        ...item,
        id: crypto.randomUUID(),
        dateSaved: new Date().toISOString(),
      },
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateNotes = useCallback((id: string, notes: string) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, notes } : i)));
  }, []);

  const isSaved = useCallback(
    (type: SavedItem["type"], title: string) => items.some((i) => i.type === type && i.title === title),
    [items]
  );

  const toggleSave = useCallback(
    (item: Omit<SavedItem, "id" | "dateSaved">) => {
      const existing = items.find((i) => i.type === item.type && i.title === item.title);
      if (existing) {
        removeItem(existing.id);
      } else {
        addItem(item);
      }
    },
    [items, addItem, removeItem]
  );

  return (
    <SavedContext.Provider value={{ items, addItem, removeItem, updateNotes, isSaved, toggleSave }}>
      {children}
    </SavedContext.Provider>
  );
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error("useSaved must be used within SavedProvider");
  return ctx;
}
