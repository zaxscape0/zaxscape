"use client";

import { cn } from "@/lib/utils";

type ConflictStatus = "Active" | "Escalating" | "De-escalating" | "Ceasefire" | "Monitoring";

interface Conflict {
  name: string;
  region: string;
  status: ConflictStatus;
  lastEvent: string;
  keywords: string[];
}

const CONFLICTS: Conflict[] = [
  {
    name: "Russia-Ukraine",
    region: "Eastern Europe",
    status: "Active",
    lastEvent: "Ongoing frontline engagements in Donbas",
    keywords: ["ukraine", "russia", "kyiv", "moscow", "donbas", "crimea", "zelensky", "putin"],
  },
  {
    name: "Israel-Gaza",
    region: "Middle East",
    status: "Escalating",
    lastEvent: "IDF operations continue in Gaza Strip",
    keywords: ["israel", "gaza", "hamas", "idf", "netanyahu", "palestinian", "west bank", "hezbollah"],
  },
  {
    name: "China-Taiwan",
    region: "Indo-Pacific",
    status: "Monitoring",
    lastEvent: "PLA military drills near Taiwan Strait",
    keywords: ["china", "taiwan", "beijing", "taipei", "pla", "strait", "xi jinping"],
  },
  {
    name: "Iran Nuclear",
    region: "Middle East",
    status: "Escalating",
    lastEvent: "IAEA reports enrichment above limits",
    keywords: ["iran", "nuclear", "tehran", "iaea", "enrichment", "jcpoa"],
  },
  {
    name: "North Korea",
    region: "Korean Peninsula",
    status: "Monitoring",
    lastEvent: "Ballistic missile test over Sea of Japan",
    keywords: ["north korea", "pyongyang", "kim jong", "dprk", "ballistic", "icbm"],
  },
  {
    name: "Red Sea / Houthi",
    region: "Arabian Peninsula",
    status: "Active",
    lastEvent: "Houthi attacks on commercial shipping continue",
    keywords: ["houthi", "red sea", "yemen", "aden", "shipping", "strait of hormuz"],
  },
];

const statusColors: Record<ConflictStatus, string> = {
  Active: "bg-red-500/20 text-red-400 border-red-500/30",
  Escalating: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  "De-escalating": "bg-green-500/20 text-green-400 border-green-500/30",
  Ceasefire: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Monitoring: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
};

function countRelated(keywords: string[], headlines: { text: string }[]): number {
  return headlines.filter((h) =>
    keywords.some((kw) => h.text.toLowerCase().includes(kw))
  ).length;
}

export function ConflictTracker({
  headlines,
}: {
  headlines: { text: string }[];
}) {
  return (
    <div className="space-y-2">
      <h3 className="text-[10px] font-mono uppercase tracking-widest text-zinc-500 px-1">
        Active Conflicts
      </h3>
      {CONFLICTS.map((c) => {
        const related = countRelated(c.keywords, headlines);
        return (
          <div
            key={c.name}
            className="bg-zinc-900/50 border border-zinc-800 rounded px-3 py-2 space-y-1"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-200">
                {c.name}
              </span>
              <span
                className={cn(
                  "text-[9px] font-mono px-1.5 py-0.5 rounded border",
                  statusColors[c.status]
                )}
              >
                {c.status.toUpperCase()}
              </span>
            </div>
            <p className="text-[10px] text-zinc-500">{c.region}</p>
            <p className="text-[10px] text-zinc-400 leading-snug">
              {c.lastEvent}
            </p>
            {related > 0 && (
              <p className="text-[10px] font-mono text-red-400">
                {related} related headline{related !== 1 ? "s" : ""} in feed
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
