"use client";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Calculator, Plus, Percent, StickyNote, Zap } from "lucide-react";

const actions = [
  { name: "Analyze Deal", icon: Calculator, variant: "default" as const },
  { name: "Add Listing", icon: Plus, variant: "outline" as const },
  { name: "Add Rate", icon: Percent, variant: "outline" as const },
  { name: "New Note", icon: StickyNote, variant: "outline" as const },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Zap className="h-3.5 w-3.5" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => (
            <Button
              key={action.name}
              variant={action.variant}
              size="sm"
              className="justify-start gap-2"
            >
              <action.icon className="h-3.5 w-3.5" />
              {action.name}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
