"use client";

import { useState } from "react";
import { 
  Bell, 
  Filter, 
  RefreshCw, 
  MoreHorizontal, 
  CheckCircle, 
  XCircle, 
  Download,
  Eye,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppStore, Event } from "@/lib/store";
import { cn } from "@/lib/utils";

export function InteractiveAlerts() {
  const events = useAppStore((state) => state.events);
  const cameras = useAppStore((state) => state.cameras);
  
  const [selectedAlert, setSelectedAlert] = useState<Event | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCamera, setFilterCamera] = useState<string>('all');

  const handleFilterChange = (type: string, value: string) => {
    if (type === 'event') {
      setFilterType(value);
    } else if (type === 'camera') {
      setFilterCamera(value);
    }
  };

  const handleAlertAction = async (action: string, event: Event) => {
    switch (action) {
      case 'acknowledge':
        // Mark alert as acknowledged
        console.log('Acknowledging alert:', event.id);
        break;
      case 'dismiss':
        // Dismiss alert
        console.log('Dismissing alert:', event.id);
        break;
      case 'export':
        // Export alert data
        console.log('Exporting alert:', event.id);
        break;
      case 'view':
        setSelectedAlert(event);
        break;
    }
  };

  const getSeverityColor = (confidence: number) => {
    if (confidence > 0.8) return 'bg-red-500';
    if (confidence > 0.5) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

  const getSeverityText = (confidence: number) => {
    if (confidence > 0.8) return 'High';
    if (confidence > 0.5) return 'Medium';
    return 'Low';
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const eventTime = new Date(timestamp);
    const diffMs = now.getTime() - eventTime.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Filter events based on selected filters
  const filteredEvents = events.filter(event => {
    if (filterType !== 'all' && event.type !== filterType) return false;
    if (filterCamera !== 'all' && event.camera_id !== filterCamera) return false;
    return true;
  });

  // Get unique event types and camera IDs for filters
  const eventTypes = Array.from(new Set(events.map(e => e.type)));
  const cameraIds = Array.from(new Set(events.map(e => e.camera_id)));

  return (
    <div className="space-y-4">
      {/* Alert Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Recent Alerts</CardTitle>
              <CardDescription>
                {filteredEvents.length} alerts in the last 24 hours
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="p-2">
                    <div className="mb-2">
                      <label className="text-xs font-medium text-muted-foreground">Event Type</label>
                      <select
                        value={filterType}
                        onChange={(e) => handleFilterChange('event', e.target.value)}
                        className="mt-1 w-full text-xs border rounded px-2 py-1"
                      >
                        <option value="all">All Types</option>
                        {eventTypes.map(type => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Camera</label>
                      <select
                        value={filterCamera}
                        onChange={(e) => handleFilterChange('camera', e.target.value)}
                        className="mt-1 w-full text-xs border rounded px-2 py-1"
                      >
                        <option value="all">All Cameras</option>
                        {cameraIds.map(cameraId => {
                          const camera = cameras.find(c => c.id === cameraId);
                          return (
                            <option key={cameraId} value={cameraId}>
                              {camera?.name || cameraId}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No alerts found</p>
              <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
            </div>
          ) : (
            filteredEvents.slice(0, 10).map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {/* Severity indicator */}
                <div className={cn(
                  "w-3 h-3 rounded-full mt-1 flex-shrink-0",
                  getSeverityColor(event.confidence)
                )} />
                
                {/* Alert content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-medium text-sm truncate">
                          {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Detected
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {getSeverityText(event.confidence)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {event.description || `Anomaly detected on ${cameras.find(c => c.id === event.camera_id)?.name || event.camera_id}`}
                      </p>
                      
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(event.timestamp)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>Confidence: {Math.round(event.confidence * 100)}%</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Action menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleAlertAction('view', event)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlertAction('acknowledge', event)}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Acknowledge
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlertAction('dismiss', event)}>
                          <XCircle className="w-4 h-4 mr-2" />
                          Dismiss
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleAlertAction('export', event)}>
                          <Download className="w-4 h-4 mr-2" />
                          Export
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            ))
          )}
          
          {filteredEvents.length > 10 && (
            <div className="text-center pt-2">
              <Button variant="outline" size="sm">
                View All Alerts ({filteredEvents.length})
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Alert Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                <XCircle className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Type</label>
                <p className="text-sm">{selectedAlert.type}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Camera</label>
                <p className="text-sm">
                  {cameras.find(c => c.id === selectedAlert.camera_id)?.name || selectedAlert.camera_id}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Confidence</label>
                <p className="text-sm">{Math.round(selectedAlert.confidence * 100)}%</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Time</label>
                <p className="text-sm">{new Date(selectedAlert.timestamp).toLocaleString()}</p>
              </div>
              
              {selectedAlert.description && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="text-sm">{selectedAlert.description}</p>
                </div>
              )}
            </div>
            
            <div className="flex space-x-2 mt-6">
              <Button
                variant="outline"
                onClick={() => handleAlertAction('acknowledge', selectedAlert)}
                className="flex-1"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Acknowledge
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAlertAction('export', selectedAlert)}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 