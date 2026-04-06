"use client";

import { useState, useMemo, useRef } from "react";
import { useNotes } from "@/lib/notes-store";
import { StickyNote, Plus, Trash2, Search, Tag, Link as LinkIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function NotesPage() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const autoSaveTimer = useRef<NodeJS.Timeout | null>(null);

  const selected = useMemo(() => notes.find((n) => n.id === selectedId) ?? null, [notes, selectedId]);

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    notes.forEach((n) => n.tags.forEach((t) => tags.add(t)));
    return Array.from(tags).sort();
  }, [notes]);

  const filtered = useMemo(() => {
    let result = notes;
    if (tagFilter) result = result.filter((n) => n.tags.includes(tagFilter));
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [notes, tagFilter, searchQuery]);

  const handleCreate = () => {
    const note = addNote();
    setSelectedId(note.id);
  };

  const handleAutoSave = (field: "title" | "body" | "tags", value: string) => {
    if (!selectedId) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (field === "tags") {
        updateNote(selectedId, { tags: value.split(",").map((t) => t.trim()).filter(Boolean) });
      } else {
        updateNote(selectedId, { [field]: value });
      }
    }, 500);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-3">
      {/* Left sidebar: note list */}
      <div className="w-64 shrink-0 flex flex-col border rounded-md overflow-hidden">
        <div className="p-2 border-b space-y-1.5">
          <div className="flex items-center justify-between">
            <h1 className="text-xs font-semibold uppercase tracking-wider">Notes</h1>
            <button
              onClick={handleCreate}
              className="flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-xxs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
            >
              <Plus className="h-3 w-3" />
              New
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full rounded-md border bg-background pl-7 pr-2 py-1 text-xxs focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tagFilter && (
                <button
                  onClick={() => setTagFilter(null)}
                  className="text-xxs text-[hsl(var(--link))] hover:underline"
                >
                  Clear
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setTagFilter(tagFilter === tag ? null : tag)}
                  className={`rounded px-1 py-0.5 text-xxs border transition-colors ${
                    tagFilter === tag ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="p-4 text-center text-xxs text-muted-foreground">
              {notes.length === 0 ? "Create your first note" : "No notes match"}
            </div>
          ) : (
            filtered.map((note) => (
              <button
                key={note.id}
                onClick={() => setSelectedId(note.id)}
                className={`w-full text-left px-2.5 py-2 border-b border-border/50 transition-colors ${
                  selectedId === note.id ? "bg-accent/50" : "hover:bg-accent/30"
                }`}
              >
                <div className="text-xs font-medium truncate">{note.title}</div>
                <div className="text-xxs text-muted-foreground truncate mt-0.5">
                  {note.body.slice(0, 60) || "Empty note"}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xxs text-muted-foreground">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  {note.tags.length > 0 && (
                    <div className="flex gap-0.5">
                      {note.tags.slice(0, 2).map((t) => (
                        <Badge key={t} variant="secondary" className="text-xxs px-1 py-0">{t}</Badge>
                      ))}
                      {note.tags.length > 2 && (
                        <span className="text-xxs text-muted-foreground">+{note.tags.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right panel: editor */}
      <div className="flex-1 border rounded-md flex flex-col overflow-hidden">
        {selected ? (
          <>
            <div className="p-3 border-b space-y-2">
              <div className="flex items-center justify-between">
                <input
                  key={selected.id + "-title"}
                  defaultValue={selected.title}
                  onChange={(e) => handleAutoSave("title", e.target.value)}
                  className="text-sm font-semibold bg-transparent border-none focus:outline-none w-full"
                  placeholder="Note title..."
                />
                <button
                  onClick={() => {
                    deleteNote(selected.id);
                    setSelectedId(null);
                  }}
                  className="text-muted-foreground hover:text-[hsl(var(--down))] transition-colors shrink-0"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 flex-1">
                  <Tag className="h-3 w-3 text-muted-foreground shrink-0" />
                  <input
                    key={selected.id + "-tags"}
                    defaultValue={selected.tags.join(", ")}
                    onChange={(e) => handleAutoSave("tags", e.target.value)}
                    className="text-xxs bg-transparent border-none focus:outline-none w-full text-muted-foreground"
                    placeholder="Tags (comma-separated)..."
                  />
                </div>
                <span className="text-xxs text-muted-foreground shrink-0">
                  Updated {new Date(selected.updatedAt).toLocaleString()}
                </span>
              </div>
              {selected.linkedItem && (
                <div className="flex items-center gap-1 text-xxs text-[hsl(var(--link))]">
                  <LinkIcon className="h-3 w-3" />
                  <a href={selected.linkedItem.href} className="hover:underline">
                    {selected.linkedItem.type}: {selected.linkedItem.title}
                  </a>
                </div>
              )}
            </div>
            <textarea
              key={selected.id + "-body"}
              defaultValue={selected.body}
              onChange={(e) => handleAutoSave("body", e.target.value)}
              className="flex-1 p-3 bg-transparent resize-none text-xs font-mono leading-relaxed focus:outline-none"
              placeholder="Start writing..."
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <StickyNote className="h-8 w-8 mx-auto mb-2 opacity-30" />
              <p className="text-xs">Select a note or create a new one</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
