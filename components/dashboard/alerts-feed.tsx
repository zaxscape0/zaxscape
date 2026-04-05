"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { recentAlerts } from "@/lib/mock-data";
import { Bell, Tag, Percent, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

const alertIcons = {
  new_listing: Plus,
  rate_drop: Percent,
  price_cut: Tag,
};

const alertColors = {
  new_listing: "text-primary",
  rate_drop: "text-up",
  price_cut: "text-warning",
};

export function AlertsFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5" />
          Recent Alerts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1.5">
          {recentAlerts.map((alert) => {
            const Icon = alertIcons[alert.type];
            return (
              <div
                key={alert.id}
                className="flex items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-accent/50 cursor-pointer transition-colors"
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5 shrink-0",
                    alertColors[alert.type]
                  )}
                />
                <span className="flex-1">{alert.message}</span>
                <span className="text-xxs text-muted-foreground whitespace-nowrap">
                  {alert.time}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
