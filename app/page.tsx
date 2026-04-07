import { LiveMarkets } from "@/components/dashboard/live-markets";
import { RateSnapshot } from "@/components/dashboard/rate-snapshot";
import { OpportunityFeed } from "@/components/dashboard/opportunity-feed";
import { WatchlistMovers } from "@/components/dashboard/watchlist-movers";
import { AlertsFeed } from "@/components/dashboard/alerts-feed";
import { QuickActions } from "@/components/dashboard/quick-actions";

export default function Dashboard() {
  return (
    <div className="space-y-3">
      {/* Live Market Futures Row */}
      <section>
        <h2 className="mb-2 text-xxs font-medium uppercase tracking-wider text-muted-foreground">
          Markets — Live
        </h2>
        <LiveMarkets />
      </section>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        {/* Main column */}
        <div className="space-y-3 lg:col-span-2">
          <OpportunityFeed />
          <AlertsFeed />
        </div>

        {/* Side column */}
        <div className="space-y-3">
          <RateSnapshot />
          <WatchlistMovers />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
