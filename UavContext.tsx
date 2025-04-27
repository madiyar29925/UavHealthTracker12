import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Alert, Component, DashboardStats, Telemetry, Uav } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';

interface UavContextType {
  uavs: Uav[];
  selectedUav: Uav | null;
  selectUav: (uav: Uav) => void;
  telemetryData: Telemetry[];
  componentStatus: Component[];
  alerts: Alert[];
  stats: DashboardStats;
  loading: boolean;
  acknowledgeAlert: (alertId: number) => Promise<void>;
  dismissAlert: (alertId: number) => Promise<void>;
  deleteUav: (uavId: number) => Promise<{ success: boolean; message: string }>;
  connected: boolean;
}

const UavContext = createContext<UavContextType | undefined>(undefined);

// Interval duration for polling (in milliseconds)
const POLLING_INTERVAL = 5000; 

export const UavProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [uavs, setUavs] = useState<Uav[]>([]);
  const [selectedUav, setSelectedUav] = useState<Uav | null>(null);
  const [telemetryData, setTelemetryData] = useState<Telemetry[]>([]);
  const [componentStatus, setComponentStatus] = useState<Component[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    activeUavs: 0, // This variable name kept for backend compatibility
    offlineUavs: 0, // This variable name kept for backend compatibility
    activeAlerts: 0,
    avgBattery: 0
  });
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const lastAlertId = useRef<number | null>(null);
  const pollingIntervalId = useRef<number | null>(null);
  const { toast } = useToast();

  // Initial data loading
  // Define fetchDashboardStats early
  const fetchDashboardStats = useCallback(async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  }, []);

  const fetchInitialData = useCallback(async () => {
    try {
      // Fetch UAVs
      const uavsResponse = await fetch('/api/uavs');
      if (!uavsResponse.ok) throw new Error('Failed to fetch UAVs');
      const uavsData = await uavsResponse.json();
      setUavs(uavsData);
      
      // Fetch dashboard stats
      const statsResponse = await fetch('/api/dashboard/stats');
      if (!statsResponse.ok) throw new Error('Failed to fetch dashboard stats');
      const statsData = await statsResponse.json();
      setStats(statsData);
      
      // Fetch alerts
      const alertsResponse = await fetch('/api/alerts?limit=10');
      if (!alertsResponse.ok) throw new Error('Failed to fetch alerts');
      const alertsData = await alertsResponse.json();
      setAlerts(alertsData);
      
      // Set the last alert ID for future polling
      if (alertsData.length > 0) {
        lastAlertId.current = Math.max(...alertsData.map((alert: Alert) => alert.id));
      }
      
      // Select the first active UAV by default
      const activeUav = uavsData.find((uav: Uav) => uav.status !== 'offline');
      if (activeUav) {
        setSelectedUav(activeUav);
        fetchUavDetails(activeUav.id);
      }
      
      setLoading(false);
      setConnected(true);
      
      // Show notification
      toast({
        title: 'Connected to server',
        description: 'Data loaded successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setConnected(false);
      setLoading(false);
      
      toast({
        title: 'Connection error',
        description: 'Failed to load data from server.',
        variant: 'destructive',
      });
    }
  }, [toast]);

  // Polling for updates
  const pollForUpdates = useCallback(async () => {
    try {
      // Fetch any new alerts first
      if (lastAlertId.current !== null) {
        const alertsResponse = await fetch(`/api/alerts?after=${lastAlertId.current}`);
        if (alertsResponse.ok) {
          const newAlerts = await alertsResponse.json();
          
          if (newAlerts.length > 0) {
            // Update the last alert ID
            lastAlertId.current = Math.max(...newAlerts.map((alert: Alert) => alert.id));
            
            // Add new alerts to the state
            setAlerts(prevAlerts => [...newAlerts, ...prevAlerts]);
            
            // Show notification for each new alert
            newAlerts.forEach((alert: Alert) => {
              toast({
                title: `${alert.severity.toUpperCase()}: ${alert.message}`,
                variant: alert.severity === 'critical' ? 'destructive' : 'default'
              });
            });
            
            // Refresh dashboard stats
            fetchDashboardStats();
          }
        }
      }
      
      // Refresh UAVs list
      const uavsResponse = await fetch('/api/uavs');
      if (uavsResponse.ok) {
        const uavsData = await uavsResponse.json();
        setUavs(uavsData);
        
        // Update selected UAV if it exists in the new data
        if (selectedUav) {
          const updatedSelectedUav = uavsData.find((uav: Uav) => uav.id === selectedUav.id);
          if (updatedSelectedUav && JSON.stringify(updatedSelectedUav) !== JSON.stringify(selectedUav)) {
            setSelectedUav(updatedSelectedUav);
            fetchUavDetails(updatedSelectedUav.id);
          }
        }
      }
      
      // If connection was previously down, mark as connected
      if (!connected) {
        setConnected(true);
        toast({
          title: 'Connection restored',
          description: 'Real-time monitoring is now active.',
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error polling for updates:', error);
      setConnected(false);
      
      toast({
        title: 'Connection lost',
        description: 'Unable to fetch updates from server.',
        variant: 'destructive',
      });
    }
  }, [selectedUav, toast, connected, fetchDashboardStats]);


const fetchUavDetails = useCallback(async (uavId: number) => {
    try {
      // Fetch telemetry data
      const telemetryResponse = await fetch(`/api/uavs/${uavId}/telemetry?limit=30`);
      if (telemetryResponse.ok) {
        const data = await telemetryResponse.json();
        setTelemetryData(data);
      }
      
      // Fetch component status
      const componentsResponse = await fetch(`/api/uavs/${uavId}/components`);
      if (componentsResponse.ok) {
        const data = await componentsResponse.json();
        setComponentStatus(data);
      }
    } catch (error) {
      console.error('Error fetching UAV details:', error);
    }
  }, []);

  const selectUav = useCallback((uav: Uav) => {
    setSelectedUav(uav);
    fetchUavDetails(uav.id);
  }, [fetchUavDetails]);

  const acknowledgeAlert = useCallback(async (alertId: number) => {
    try {
      await apiRequest('PATCH', `/api/alerts/${alertId}`, { acknowledged: true });
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, acknowledged: true } : alert
        )
      );
      fetchDashboardStats();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast({
        title: 'Failed to acknowledge alert',
        variant: 'destructive'
      });
    }
  }, [fetchDashboardStats, toast]);

  const dismissAlert = useCallback(async (alertId: number) => {
    try {
      await apiRequest('PATCH', `/api/alerts/${alertId}`, { dismissed: true });
      setAlerts(prevAlerts => 
        prevAlerts.map(alert => 
          alert.id === alertId ? { ...alert, dismissed: true } : alert
        )
      );
      fetchDashboardStats();
    } catch (error) {
      console.error('Error dismissing alert:', error);
      toast({
        title: 'Failed to dismiss alert',
        variant: 'destructive'
      });
    }
  }, [fetchDashboardStats, toast]);

  const deleteUav = useCallback(async (uavId: number) => {
    try {
      const response = await apiRequest('DELETE', `/api/uavs/${uavId}`);
      const result = await response.json();
      
      // If successful, update the local state
      if (result.success) {
        // Remove UAV from list
        setUavs(prevUavs => prevUavs.filter(uav => uav.id !== uavId));
        
        // If the deleted UAV was selected, clear the selection
        if (selectedUav && selectedUav.id === uavId) {
          setSelectedUav(null);
          setTelemetryData([]);
          setComponentStatus([]);
        }
        
        // Refresh dashboard stats
        fetchDashboardStats();
        
        // Show success notification
        toast({
          title: 'UAV Deleted',
          description: result.message,
          variant: 'default'
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error deleting UAV:', error);
      toast({
        title: 'Failed to delete UAV',
        description: 'The operation could not be completed.',
        variant: 'destructive'
      });
      return { success: false, message: 'Failed to delete UAV' };
    }
  }, [selectedUav, fetchDashboardStats, toast]);

  // Initial data loading effect
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Setup polling interval
  useEffect(() => {
    // Immediately poll once
    pollForUpdates();
    
    // Setup interval for polling
    pollingIntervalId.current = window.setInterval(() => {
      pollForUpdates();
    }, POLLING_INTERVAL);
    
    // Cleanup on unmount
    return () => {
      if (pollingIntervalId.current) {
        window.clearInterval(pollingIntervalId.current);
      }
    };
  }, [pollForUpdates]);

  const value = {
    uavs,
    selectedUav,
    selectUav,
    telemetryData,
    componentStatus,
    alerts,
    stats,
    loading,
    acknowledgeAlert,
    dismissAlert,
    deleteUav,
    connected
  };

  return <UavContext.Provider value={value}>{children}</UavContext.Provider>;
};

export const useUav = (): UavContextType => {
  const context = useContext(UavContext);
  if (context === undefined) {
    throw new Error('useUav must be used within a UavProvider');
  }
  return context;
};
