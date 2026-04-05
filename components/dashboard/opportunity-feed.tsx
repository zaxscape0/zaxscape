"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { opportunities } from "@/lib/mock-data";
import { formatCompact } from "@/lib/utils";
import { Store, Home, Zap } from "lucide-react";

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
        <div className="space-y-1.5">
          {opportunities.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/50 cursor-pointer transition-colors"
            >
              {item.type === "business" ? (
                <Store className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <Home className="h-3.5 w-3.5 text-warning shrink-0" />
              )}
              <span className="font-medium flex-1 truncate">{item.title}</span>
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
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
