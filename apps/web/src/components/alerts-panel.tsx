"use client";

import { useAlertsStore, Alert } from "@/store/alerts-store";
import { formatTimeAgo } from "@/lib/utils";
import { AlertCircle, RefreshCw, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function AlertsPanel() {
  const { alerts } = useAlertsStore();
  const [filter, setFilter] = useState<string | null>(null);

  const filteredAlerts = filter
    ? alerts.filter((alert) => alert.type === filter)
    : alerts;

  const handleAlertClick = (alert: Alert) => {
    console.log("Alert clicked:", alert);
  };

  const handleFilterChange = (type: string | null) => {
    setFilter(type === filter ? null : type);
  };

  // Get unique alert types for filter
  const alertTypes = Array.from(new Set(alerts.map((alert) => alert.type)));

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
      <div className="flex flex-col space-y-1.5 p-6 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold tracking-tight text-lg">Recent Alerts</h3>
            <p className="text-sm text-muted-foreground">
              {filteredAlerts.length} alerts{" "}
              {filter ? `of type "${filter}"` : "in the last 24 hours"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => console.log("Refresh clicked")}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => setFilter(null)}
              disabled={!filter}
            >
              <Filter className="w-4 h-4 mr-2" />
              {filter ? "Clear Filter" : "Filter"}
            </Button>
          </div>
        </div>
      </div>
      <div className="p-6 pt-0 space-y-3">
        {filteredAlerts.length > 0 ? (
          <>
            {alertTypes.length > 1 && !filter && (
              <div className="flex flex-wrap gap-2 mb-3">
                {alertTypes.map((type) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="cursor-pointer hover:bg-accent"
                    onClick={() => handleFilterChange(type)}
                  >
                    {type}
                  </Badge>
                ))}
              </div>
            )}
            <div className="space-y-3">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 border rounded-md hover:bg-accent/50 cursor-pointer transition-colors"
                  onClick={() => handleAlertClick(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <AlertCircle
                          className={`w-4 h-4 ${
                            ((alert.confidence ?? 0) > 0.8 ? "text-red-500" : "text-amber-500")
                          }`}
                        />
                        <span className="font-medium capitalize">{alert.type}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description ?? `Detected with ${Math.round((alert.confidence ?? 0) * 100)}% confidence`}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="mb-1">
                        {alert.cameraId}
                      </Badge>
                      <p className="text-xs text-muted-foreground">
                        {formatTimeAgo(new Date(alert.timestamp).toISOString())}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No alerts found</p>
            <p className="text-sm text-muted-foreground">
              {filter ? "Try removing your filter" : "Alerts will appear here when detected"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
} 