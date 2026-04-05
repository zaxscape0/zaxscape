"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { rateSnapshots } from "@/lib/mock-data";
import { Percent } from "lucide-react";

export function RateSnapshot() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-1.5">
          <Percent className="h-3.5 w-3.5" />
          Best Local Rates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {rateSnapshots.map((rate) => (
            <div
              key={rate.product}
              className="flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-medium">{rate.product}</span>
                <span className="ml-2 text-xxs text-muted-foreground">
                  {rate.lender}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-semibold tabular-nums text-up">
                  {rate.rate.toFixed(3)}%
                </span>
                <span className="text-xxs text-muted-foreground">
                  {rate.updatedAt}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
