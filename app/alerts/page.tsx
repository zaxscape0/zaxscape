"use client";

import { useState } from "react";
import { useAlerts, AlertType } from "@/lib/alerts-store";
import { Plus, Trash2, X, Eye, EyeOff, CheckCheck, Circle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  new_listing: "New Listing",
  price_drop: "Price Drop",
  rate_change: "Rate Change",
  watchlist_threshold: "Watchlist Threshold",
};

const ALERT_TYPE_COLORS: Record<AlertType, "default" | "up" | "down" | "warning"> = {
  new_listing: "default",
  price_drop: "down",
  rate_change: "warning",
  watchlist_threshold: "up",
};

export default function AlertsPage() {
  const { rules, events, addRule, removeRule, toggleRule, markEventRead, markAllRead } = useAlerts();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [activeTab, setActiveTab] = useState<"rules" | "events">("events");

  const unreadCount = events.filter((e) => !e.read).length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-semibold uppercase tracking-wider">Alerts</h1>
          {unreadCount > 0 && (
            <Badge variant="down">{unreadCount} unread</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={markAllRead}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <CheckCheck className="h-3 w-3" />
            Mark All Read
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-colors"
          >
            <Plus className="h-3 w-3" />
            New Alert
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        <button
          onClick={() => setActiveTab("events")}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "events" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Events ({events.length})
        </button>
        <button
          onClick={() => setActiveTab("rules")}
          className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors ${
            activeTab === "rules" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Rules ({rules.length})
        </button>
      </div>

      {activeTab === "events" ? (
        <div className="space-y-1">
          {events.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No alert events yet</div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className={`flex items-start gap-3 rounded-md border px-3 py-2 transition-colors ${
                  event.read ? "bg-card/50 opacity-70" : "bg-card"
                }`}
              >
                <div className="mt-0.5">
                  {event.read ? (
                    <Circle className="h-2.5 w-2.5 text-muted-foreground" />
                  ) : (
                    <Circle className="h-2.5 w-2.5 text-primary fill-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={ALERT_TYPE_COLORS[event.type]} className="shrink-0">
                      {ALERT_TYPE_LABELS[event.type]}
                    </Badge>
                    <span className="text-xxs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleDateString()} {new Date(event.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs mt-0.5">{event.message}</p>
                  <a href={event.link} className="text-xxs text-[hsl(var(--link))] hover:underline">
                    View →
                  </a>
                </div>
                {!event.read && (
                  <button
                    onClick={() => markEventRead(event.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <Eye className="h-3 w-3" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-1">
          {rules.length === 0 ? (
            <div className="text-center py-8 text-xs text-muted-foreground">No alert rules configured</div>
          ) : (
            rules.map((rule) => (
              <div key={rule.id} className="flex items-center gap-3 rounded-md border px-3 py-2 bg-card">
                <button onClick={() => toggleRule(rule.id)} className="shrink-0">
                  {rule.active ? (
                    <Eye className="h-3.5 w-3.5 text-[hsl(var(--up))]" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <Badge variant={ALERT_TYPE_COLORS[rule.type]}>
                      {ALERT_TYPE_LABELS[rule.type]}
                    </Badge>
                    <span className={`text-xxs ${rule.active ? "text-[hsl(var(--up))]" : "text-muted-foreground"}`}>
                      {rule.active ? "Active" : "Paused"}
                    </span>
                  </div>
                  <div className="text-xxs text-muted-foreground mt-0.5 font-mono">
                    {Object.entries(rule.conditions)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(" · ")}
                  </div>
                  {rule.lastTriggered && (
                    <div className="text-xxs text-muted-foreground mt-0.5">
                      Last triggered: {new Date(rule.lastTriggered).toLocaleDateString()}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeRule(rule.id)}
                  className="text-muted-foreground hover:text-[hsl(var(--down))] transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateForm && (
        <CreateAlertModal
          onClose={() => setShowCreateForm(false)}
          onSave={(rule) => {
            addRule(rule);
            setShowCreateForm(false);
          }}
        />
      )}
    </div>
  );
}

function CreateAlertModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (rule: { type: AlertType; active: boolean; conditions: Record<string, string | number | boolean> }) => void;
}) {
  const [type, setType] = useState<AlertType>("new_listing");
  const [conditions, setConditions] = useState<Record<string, string>>({});

  const updateCond = (key: string, value: string) => {
    setConditions((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed: Record<string, string | number | boolean> = {};
    for (const [k, v] of Object.entries(conditions)) {
      if (v === "") continue;
      const num = Number(v);
      parsed[k] = isNaN(num) ? v : num;
    }
    onSave({ type, active: true, conditions: parsed });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose}>
      <div className="w-full max-w-sm rounded-md border bg-card p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Create Alert</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="text-xxs text-muted-foreground uppercase tracking-wider">Alert Type</label>
            <select
              value={type}
              onChange={(e) => { setType(e.target.value as AlertType); setConditions({}); }}
              className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="new_listing">New Listing</option>
              <option value="price_drop">Price Drop</option>
              <option value="rate_change">Rate Change</option>
              <option value="watchlist_threshold">Watchlist Threshold</option>
            </select>
          </div>

          {(type === "new_listing" || type === "price_drop") && (
            <>
              <div>
                <label className="text-xxs text-muted-foreground uppercase tracking-wider">Property Type</label>
                <input
                  value={conditions.propertyType || ""}
                  onChange={(e) => updateCond("propertyType", e.target.value)}
                  className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. Multifamily, Commercial"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xxs text-muted-foreground uppercase tracking-wider">Max Price</label>
                  <input
                    value={conditions.maxPrice || ""}
                    onChange={(e) => updateCond("maxPrice", e.target.value)}
                    className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="2000000"
                  />
                </div>
                <div>
                  <label className="text-xxs text-muted-foreground uppercase tracking-wider">City</label>
                  <input
                    value={conditions.city || ""}
                    onChange={(e) => updateCond("city", e.target.value)}
                    className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="Boston"
                  />
                </div>
              </div>
            </>
          )}

          {type === "rate_change" && (
            <>
              <div>
                <label className="text-xxs text-muted-foreground uppercase tracking-wider">Lender</label>
                <input
                  value={conditions.lender || ""}
                  onChange={(e) => updateCond("lender", e.target.value)}
                  className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="DCU Federal Credit Union"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xxs text-muted-foreground uppercase tracking-wider">Product</label>
                  <input
                    value={conditions.product || ""}
                    onChange={(e) => updateCond("product", e.target.value)}
                    className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="30yr"
                  />
                </div>
                <div>
                  <label className="text-xxs text-muted-foreground uppercase tracking-wider">Rate Below</label>
                  <input
                    value={conditions.rateBelow || ""}
                    onChange={(e) => updateCond("rateBelow", e.target.value)}
                    className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="6.0"
                  />
                </div>
              </div>
            </>
          )}

          {type === "watchlist_threshold" && (
            <>
              <div>
                <label className="text-xxs text-muted-foreground uppercase tracking-wider">Symbol</label>
                <input
                  value={conditions.symbol || ""}
                  onChange={(e) => updateCond("symbol", e.target.value)}
                  className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="AAPL"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xxs text-muted-foreground uppercase tracking-wider">Direction</label>
                  <select
                    value={conditions.direction || "above"}
                    onChange={(e) => updateCond("direction", e.target.value)}
                    className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="above">Above</option>
                    <option value="below">Below</option>
                  </select>
                </div>
                <div>
                  <label className="text-xxs text-muted-foreground uppercase tracking-wider">Price</label>
                  <input
                    value={conditions.price || ""}
                    onChange={(e) => updateCond("price", e.target.value)}
                    className="mt-0.5 w-full rounded-md border bg-background px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="200"
                  />
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Create Alert
          </button>
        </form>
      </div>
    </div>
  );
}
