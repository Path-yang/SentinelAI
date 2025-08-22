"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Bell, 
  BellOff, 
  Filter, 
  Search, 
  Clock, 
  MapPin, 
  AlertTriangle,
  CheckCircle,
  X,
  RefreshCw,
  Download,
  Eye,
  EyeOff
} from "lucide-react";
import { useAppStore, Event } from "@/lib/store";
import { cn } from "@/lib/utils";

interface AlertFilters {
  type: string[];
  severity: string[];
  camera: string[];
  timeRange: 'all' | '1h' | '24h' | '7d';
}

export function InteractiveAlerts() {
  const events = useAppStore((state) => state.events);
  const cameras = useAppStore((state) => state.cameras);
  const clearEvents = useAppStore((state) => state.clearEvents);
  
  const [filters, setFilters] = useState<AlertFilters>({
    type: [],
    severity: [],
    camera: [],
    timeRange: 'all'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<Event | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get unique alert types and cameras for filters
  const alertTypes = [...new Set(events.map(e => e.type))];
  const cameraIds = [...new Set(events.map(e => e.camera_id))];

  // Filter events based on current filters
  const filteredEvents = events.filter(event => {
    // Type filter
    if (filters.type.length > 0 && !filters.type.includes(event.type)) {
      return false;
    }
    
    // Camera filter
    if (filters.camera.length > 0 && !filters.camera.includes(event.camera_id)) {
      return false;
    }
    
    // Severity filter (based on confidence)
    if (filters.severity.length > 0) {
      const severity = event.confidence > 0.8 ? 'high' : event.confidence > 0.5 ? 'medium' : 'low';
      if (!filters.severity.includes(severity)) {
        return false;
      }
    }
    
    // Time range filter
    if (filters.timeRange !== 'all') {
      const eventTime = new Date(event.timestamp);
      const now = new Date();
      const diffHours = (now.getTime() - eventTime.getTime()) / (1000 * 60 * 60);
      
      switch (filters.timeRange) {
        case '1h':
          if (diffHours > 1) return false;
          break;
        case '24h':
          if (diffHours > 24) return false;
          break;
        case '7d':
          if (diffHours > 24 * 7) return false;
          break;
      }
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const camera = cameras.find(c => c.id === event.camera_id);
      const searchText = `${event.type} ${event.description} ${camera?.name || ''}`.toLowerCase();
      if (!searchText.includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  const handleFilterChange = (filterType: keyof AlertFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
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

  return (
    <div className="space-y-4">
      {/* Alert Controls */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CardTitle className="text-lg">Recent Alerts</CardTitle>
              <Badge variant="secondary">{filteredEvents.length}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNotifications(!showNotifications)}
              >
                {showNotifications ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn("w-4 h-4", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filters */}
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search alerts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-2">
            {filters.type.map(type => (
              <Badge
                key={type}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleFilterChange('type', filters.type.filter(t => t !== type))}
              >
                {type} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
            {filters.camera.map(cameraId => (
              <Badge
                key={cameraId}
                variant="secondary"
                className="cursor-pointer"
                onClick={() => handleFilterChange('camera', filters.camera.filter(c => c !== cameraId))}
              >
                {cameras.find(c => c.id === cameraId)?.name || cameraId} <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Alerts List */}
      <Card>
        <CardContent className="p-0">
          <div className="max-h-[400px] overflow-y-auto">
            {filteredEvents.length > 0 ? (
              <div className="divide-y">
                {filteredEvents.slice(0, 10).map((event, index) => {
                  const camera = cameras.find(c => c.id === event.camera_id);
                  
                  return (
                    <div
                      key={event.id}
                      className={cn(
                        "p-4 hover:bg-muted/50 transition-colors cursor-pointer",
                        selectedAlert?.id === event.id && "bg-muted"
                      )}
                      onClick={() => setSelectedAlert(event)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3 flex-1">
                          <div className="relative">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            <div className={cn(
                              "absolute -top-1 -right-1 w-2 h-2 rounded-full",
                              getSeverityColor(event.confidence)
                            )} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="font-medium capitalize">{event.type}</span>
                              <Badge variant="outline" className="text-xs">
                                {getSeverityText(event.confidence)}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {event.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <div className="flex items-center space-x-1">
                                <MapPin className="w-3 h-3" />
                                <span>{camera?.name || event.camera_id}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Clock className="w-3 h-3" />
                                <span>{formatTimeAgo(event.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction('acknowledge', event);
                            }}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAlertAction('export', event);
                            }}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-1">No alerts found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchQuery || filters.type.length > 0 || filters.camera.length > 0
                    ? 'Try adjusting your filters'
                    : 'Alerts will appear here when anomalies are detected'
                  }
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alert Details Modal */}
      {selectedAlert && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Alert Details</CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedAlert(null)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Event Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Type:</span>
                    <span className="ml-2 capitalize">{selectedAlert.type}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidence:</span>
                    <span className="ml-2">{(selectedAlert.confidence * 100).toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Camera:</span>
                    <span className="ml-2">{cameras.find(c => c.id === selectedAlert.camera_id)?.name || selectedAlert.camera_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time:</span>
                    <span className="ml-2">{new Date(selectedAlert.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              {selectedAlert.description && (
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{selectedAlert.description}</p>
                </div>
              )}
              
              {selectedAlert.metadata && (
                <div>
                  <h4 className="font-medium mb-2">Metadata</h4>
                  <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                    {JSON.stringify(selectedAlert.metadata, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => handleAlertAction('acknowledge', selectedAlert)}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Acknowledge
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAlertAction('export', selectedAlert)}
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 