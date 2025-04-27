import React, { useEffect, useState } from 'react';
import { useUav } from '@/contexts/UavContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatDistanceToNow, subDays } from 'date-fns';
import { Alert, Telemetry, Uav } from '@shared/schema';

// Chart colors
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
const STATUS_COLORS = {
  'active': '#10B981',
  'warning': '#F59E0B',
  'critical': '#EF4444',
  'offline': '#9CA3AF'
};

export default function AnalyticsPage() {
  const { uavs, alerts, loading } = useUav();
  const [selectedUavId, setSelectedUavId] = useState<string>('all');
  const [telemetryData, setTelemetryData] = useState<Telemetry[]>([]);
  
  // Fetch telemetry data for selected drone
  useEffect(() => {
    const fetchTelemetryData = async () => {
      if (selectedUavId === 'all') {
        // Load a sample from each drone for overview
        const promises = uavs
          .filter(uav => uav.status !== 'offline')
          .map(uav => 
            fetch(`/api/uavs/${uav.id}/telemetry?limit=10`)
              .then(res => res.json())
          );
        
        const results = await Promise.all(promises);
        // Flatten and take most recent points
        const combined = results.flat().slice(0, 30);
        setTelemetryData(combined);
      } else {
        const uavId = parseInt(selectedUavId);
        const res = await fetch(`/api/uavs/${uavId}/telemetry?limit=50`);
        if (res.ok) {
          const data = await res.json();
          setTelemetryData(data);
        }
      }
    };
    
    if (!loading && uavs.length > 0) {
      fetchTelemetryData();
    }
  }, [uavs, selectedUavId, loading]);
  
  if (loading) {
    return <AnalyticsPageSkeleton />;
  }
  
  // Prepare data for status distribution chart
  const statusData = Object.entries(
    uavs.reduce((acc: Record<string, number>, uav) => {
      acc[uav.status] = (acc[uav.status] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  
  // Prepare data for alert types chart
  const alertTypeData = Object.entries(
    alerts.reduce((acc: Record<string, number>, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1;
      return acc;
    }, {})
  ).map(([name, value]) => ({ name, value }));
  
  // Prepare data for battery trend chart
  const batteryData = telemetryData
    .filter(t => t.batteryLevel !== undefined)
    .map(t => ({
      timestamp: new Date(t.timestamp).toLocaleTimeString(),
      batteryLevel: t.batteryLevel,
      uavId: t.uavId
    }));
  
  // Prepare data for altitude trend chart
  const altitudeData = telemetryData
    .filter(t => t.altitude !== undefined)
    .map(t => ({
      timestamp: new Date(t.timestamp).toLocaleTimeString(),
      altitude: t.altitude,
      uavId: t.uavId
    }));
  
  // Generate aggregate stats
  const avgBattery = uavs.length > 0 
    ? Math.round(uavs.reduce((sum, uav) => sum + uav.batteryLevel, 0) / uavs.length) 
    : 0;
  
  const alertsLast24h = alerts.filter(alert => 
    new Date(alert.timestamp) > subDays(new Date(), 1)
  ).length;
  
  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Page Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-800">Analytics</h1>
                  <p className="text-neutral-500 mt-1">Data analysis and statistics for your DroneView fleet</p>
                </div>
                <div className="mt-4 md:mt-0">
                  <Select value={selectedUavId} onValueChange={setSelectedUavId}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Drone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Drones</SelectItem>
                      {uavs.map(uav => (
                        <SelectItem key={uav.id} value={uav.id.toString()}>
                          {uav.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            {/* KPI Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Active Drones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{uavs.filter(u => u.status !== 'offline').length}</div>
                  <p className="text-xs text-neutral-500 mt-1">Out of {uavs.length} total</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Average Battery</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{avgBattery}%</div>
                  <p className="text-xs text-neutral-500 mt-1">Across all active drones</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Alerts (24h)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{alertsLast24h}</div>
                  <p className="text-xs text-neutral-500 mt-1">In the last 24 hours</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-neutral-500">Flight Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127h</div>
                  <p className="text-xs text-neutral-500 mt-1">Total for the month</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Analytics Content */}
            <Tabs defaultValue="overview" className="mb-6">
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="telemetry">Telemetry</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Status Distribution Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Status Distribution</CardTitle>
                      <CardDescription>Current state of the DroneView fleet</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={statusData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              {statusData.map((entry, index) => (
                                <Cell 
                                  key={`cell-${index}`} 
                                  fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]} 
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Alert Types Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Alert Types</CardTitle>
                      <CardDescription>Distribution of alerts by priority</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            width={500}
                            height={300}
                            data={alertTypeData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="value" name="Count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Telemetry Tab */}
              <TabsContent value="telemetry">
                <div className="grid grid-cols-1 gap-6">
                  {/* Battery Trend Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Battery Level Trend</CardTitle>
                      <CardDescription>Battery charge level change over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            width={500}
                            height={300}
                            data={batteryData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="batteryLevel" 
                              name="Battery Level (%)" 
                              stroke="#8884d8" 
                              activeDot={{ r: 8 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Altitude Trend Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Altitude Trend</CardTitle>
                      <CardDescription>Flight altitude change over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            width={500}
                            height={300}
                            data={altitudeData}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="altitude" 
                              name="Altitude (m)" 
                              stroke="#82ca9d" 
                              activeDot={{ r: 8 }} 
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Alerts Tab */}
              <TabsContent value="alerts">
                <Card>
                  <CardHeader>
                    <CardTitle>Alert History</CardTitle>
                    <CardDescription>Alert trends by day</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          width={500}
                          height={300}
                          data={[
                            { day: 'Mon', critical: 2, warning: 3, info: 5 },
                            { day: 'Tue', critical: 1, warning: 4, info: 3 },
                            { day: 'Wed', critical: 3, warning: 2, info: 4 },
                            { day: 'Thu', critical: 0, warning: 2, info: 6 },
                            { day: 'Fri', critical: 1, warning: 1, info: 5 },
                            { day: 'Sat', critical: 0, warning: 0, info: 2 },
                            { day: 'Sun', critical: 0, warning: 1, info: 1 }
                          ]}
                          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                        >
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="day" />
                          <YAxis />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="critical" name="Critical" stackId="a" fill="#EF4444" />
                          <Bar dataKey="warning" name="Warning" stackId="a" fill="#F59E0B" />
                          <Bar dataKey="info" name="Information" stackId="a" fill="#3B82F6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}

function AnalyticsPageSkeleton() {
  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 shadow-sm z-10 h-14">
        <Skeleton className="h-full w-full" />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-16 md:w-64 bg-white border-r border-neutral-200">
          <Skeleton className="h-full w-full" />
        </aside>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <div className="container mx-auto">
            <Skeleton className="h-20 w-full mb-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            
            <Skeleton className="h-10 w-96 mb-4" />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <Skeleton className="h-80 w-full" />
              <Skeleton className="h-80 w-full" />
            </div>
            
            <Skeleton className="h-80 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}