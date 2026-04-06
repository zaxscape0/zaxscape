"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

export interface Note {
  id: string;
  title: string;
  body: string;
  tags: string[];
  linkedItem: { type: string; title: string; href: string } | null;
  createdAt: string;
  updatedAt: string;
}

interface NotesStore {
  notes: Note[];
  addNote: () => Note;
  updateNote: (id: string, updates: Partial<Pick<Note, "title" | "body" | "tags" | "linkedItem">>) => void;
  deleteNote: (id: string) => void;
}

const NotesContext = createContext<NotesStore | null>(null);

const STORAGE_KEY = "zaxscape-notes";

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setNotes(JSON.parse(raw));
    } catch {}
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes, loaded]);

  const addNote = useCallback(() => {
    const note: Note = {
      id: crypto.randomUUID(),
      title: "Untitled Note",
      body: "",
      tags: [],
      linkedItem: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setNotes((prev) => [note, ...prev]);
    return note;
  }, []);

  const updateNote = useCallback(
    (id: string, updates: Partial<Pick<Note, "title" | "body" | "tags" | "linkedItem">>) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
        )
      );
    },
    []
  );

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return (
    <NotesContext.Provider value={{ notes, addNote, updateNote, deleteNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const ctx = useContext(NotesContext);
  if (!ctx) throw new Error("useNotes must be used within NotesProvider");
  return ctx;
}
