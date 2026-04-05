"use client";

import { cn } from "@/lib/utils";
import { ExternalLink } from "lucide-react";

interface Headline {
  id: string;
  text: string;
  timestamp: string;
  url: string;
  source: string;
}

const MILITARY_KEYWORDS =
  /\b(war|strike|attack|missile|bomb|military|troops|invasion|drone|weapon|artillery|airstrike|casualties|killed|shot down|intercept|deploy|defense|combat|offensive)\b/i;
const SANCTIONS_KEYWORDS =
  /\b(sanctions?|tariff|embargo|ban|restrict|seize|freeze|blacklist|export control|trade war)\b/i;
const DIPLOMATIC_KEYWORDS =
  /\b(summit|talks|agreement|treaty|ceasefire|negotiat|diplomat|peace|de-escalat|resolution|bilateral)\b/i;

function getCategory(text: string): "military" | "sanctions" | "diplomatic" | "default" {
  if (MILITARY_KEYWORDS.test(text)) return "military";
  if (SANCTIONS_KEYWORDS.test(text)) return "sanctions";
  if (DIPLOMATIC_KEYWORDS.test(text)) return "diplomatic";
  return "default";
}

const categoryStyles = {
  military: "border-l-red-500 bg-red-500/5",
  sanctions: "border-l-amber-500 bg-amber-500/5",
  diplomatic: "border-l-blue-500 bg-blue-500/5",
  default: "border-l-zinc-600 bg-zinc-800/30",
};

const categoryBadge = {
  military: "bg-red-500/20 text-red-400",
  sanctions: "bg-amber-500/20 text-amber-400",
  diplomatic: "bg-blue-500/20 text-blue-400",
  default: "",
};

function relativeTime(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function isRecent(timestamp: string): boolean {
  return Date.now() - new Date(timestamp).getTime() < 5 * 60_000;
}

export function NewsFeed({
  headlines,
  newIds,
}: {
  headlines: Headline[];
  newIds: Set<string>;
}) {
  if (headlines.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500 font-mono text-sm">
        NO SIGNAL — AWAITING DATA FEED...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {headlines.map((h) => {
        const cat = getCategory(h.text);
        const recent = isRecent(h.timestamp);
        const isNew = newIds.has(h.id);
        return (
          <a
            key={h.id}
            href={h.url !== "#" ? h.url : undefined}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "block border-l-2 px-3 py-2 transition-all hover:bg-white/5 cursor-pointer group",
              categoryStyles[cat],
              recent && "ring-1 ring-red-500/30",
              isNew && "animate-flash"
            )}
          >
            <div className="flex items-start gap-3">
              <span className="font-mono text-[10px] text-zinc-500 shrink-0 w-14 pt-0.5">
                {relativeTime(h.timestamp)}
              </span>
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    recent ? "text-zinc-100 font-medium" : "text-zinc-300"
                  )}
                >
                  {h.text}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-mono text-zinc-600">
                    {h.source}
                  </span>
                  {cat !== "default" && (
                    <span
                      className={cn(
                        "text-[9px] font-mono uppercase px-1.5 py-0.5 rounded",
                        categoryBadge[cat]
                      )}
                    >
                      {cat}
                    </span>
                  )}
                  {h.url !== "#" && (
                    <ExternalLink className="h-2.5 w-2.5 text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>
              </div>
              {recent && (
                <span className="relative flex h-2 w-2 shrink-0 mt-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                </span>
              )}
            </div>
          </a>
        );
      })}
    </div>
  );
}
