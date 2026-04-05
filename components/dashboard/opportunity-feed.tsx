"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { opportunities } from "@/lib/mock-data";
import { formatCompact } from "@/lib/utils";
import { Store, Home, Zap, ExternalLink } from "lucide-react";

export function OpportunityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          Opportunity Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        {opportunities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Zap className="h-5 w-5 text-muted-foreground/40 mb-2" />
            <p className="text-xs text-muted-foreground">No opportunities yet</p>
            <p className="text-xxs text-muted-foreground/60 mt-0.5">
              Opportunities will appear here from your RE &amp; business scrapers
            </p>
          </div>
        ) : (
        <div className="space-y-1.5">
          {opportunities.map((item) => (
            <a
              key={item.id}
              href={item.sourceUrl || (item.type === "business" ? "/businesses" : "/real-estate")}
              target={item.sourceUrl ? "_blank" : "_self"}
              rel={item.sourceUrl ? "noopener noreferrer" : undefined}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/50 cursor-pointer transition-colors group"
            >
              {item.type === "business" ? (
                <Store className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <Home className="h-3.5 w-3.5 text-warning shrink-0" />
              )}
              <span className="font-medium flex-1 truncate group-hover:text-primary transition-colors">{item.title}</span>
              <span className="font-mono tabular-nums text-muted-foreground">
                {formatCompact(item.price)}
              </span>
              <Badge variant={item.type === "property" ? "warning" : "default"}>
                {item.metric} {item.metricLabel}
              </Badge>
              <span className="text-xxs text-muted-foreground whitespace-nowrap">
                {item.city}
              </span>
              {item.daysListed <= 3 && (
                <Badge variant="up">New</Badge>
              )}
              {item.sourceUrl && (
                <ExternalLink className="h-3 w-3 text-muted-foreground/50 group-hover:text-primary shrink-0 transition-colors" />
              )}
            </a>
          ))}
        </div>
        )}
      </CardContent>
    </Card>
  );
}
