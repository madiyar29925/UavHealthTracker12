import React, { useState, useEffect } from 'react';
import { useUav } from '@/contexts/UavContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
  AreaChart,
  Area,
} from 'recharts';

// System monitoring interface
interface SystemStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  uptime: number;
  load: number;
  responseTime: number;
}

interface NetworkMetrics {
  timestamp: string;
  latency: number;
  packetLoss: number;
  bandwidth: number;
}

interface ResourceUsage {
  timestamp: string;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export default function SystemMonitoring() {
  const { loading } = useUav();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<NetworkMetrics[]>([]);
  const [resourceUsage, setResourceUsage] = useState<ResourceUsage[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    // Simulate loading system monitoring data
    const loadData = () => {
      setIsLoadingData(true);
      
      // Mock system status data
      const systems = [
        { 
          name: "Main Control System", 
          status: "online" as const, 
          uptime: 99.98, 
          load: 42, 
          responseTime: 120 
        },
        { 
          name: "Telemetry Server", 
          status: "online" as const, 
          uptime: 99.95, 
          load: 65, 
          responseTime: 145 
        },
        { 
          name: "Data Storage", 
          status: "online" as const, 
          uptime: 99.99, 
          load: 30, 
          responseTime: 50 
        },
        { 
          name: "Communication System", 
          status: "degraded" as const, 
          uptime: 98.75, 
          load: 85, 
          responseTime: 350 
        },
        { 
          name: "Backup Server", 
          status: "online" as const, 
          uptime: 99.90, 
          load: 10, 
          responseTime: 80 
        },
      ];
      
      // Mock network metrics data - for the last 24 hours
      const networkData = Array.from({ length: 24 }).map((_, i) => {
        const hour = i.toString().padStart(2, '0');
        return {
          timestamp: `${hour}:00`,
          latency: Math.round(50 + Math.random() * 150),
          packetLoss: Math.round(Math.random() * 5 * 10) / 10,
          bandwidth: Math.round(10 + Math.random() * 90)
        };
      });
      
      // Mock resource usage data - for the last 24 hours
      const resourceData = Array.from({ length: 24 }).map((_, i) => {
        const hour = i.toString().padStart(2, '0');
        return {
          timestamp: `${hour}:00`,
          cpu: Math.round(20 + Math.random() * 60),
          memory: Math.round(30 + Math.random() * 50),
          disk: Math.round(40 + Math.random() * 30),
          network: Math.round(10 + Math.random() * 70)
        };
      });
      
      setSystemStatus(systems);
      setNetworkMetrics(networkData);
      setResourceUsage(resourceData);
      setIsLoadingData(false);
    };
    
    if (!loading) {
      loadData();
    }
  }, [loading]);
  
  if (loading || isLoadingData) {
    return <SystemMonitoringSkeleton />;
  }
  
  // Helper function to get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-success">Online</Badge>;
      case 'degraded':
        return <Badge className="bg-warning text-black">Degraded</Badge>;
      case 'offline':
        return <Badge className="bg-critical">Offline</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  // Helper function to get color based on value
  const getColorClass = (value: number, threshold1: number, threshold2: number) => {
    if (value < threshold1) return 'text-success';
    if (value < threshold2) return 'text-warning';
    return 'text-critical';
  };
  
  // Define chart colors
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6'];
  
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
                  <h1 className="text-2xl font-bold text-neutral-800">System Monitoring</h1>
                  <p className="text-neutral-500 mt-1">Performance and status monitoring of all system components</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <Button variant="outline" className="flex items-center">
                    <span className="material-icons text-sm mr-1.5">file_download</span>
                    Export
                  </Button>
                  <Button className="flex items-center">
                    <span className="material-icons text-sm mr-1.5">refresh</span>
                    Refresh
                  </Button>
                </div>
              </div>
            </div>
            
            {/* System Status Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {systemStatus.map((system, index) => (
                <Card key={index}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-neutral-500">{system.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex flex-col">
                        <div className="flex items-center space-x-2 mb-1">
                          <div className={`w-2 h-2 rounded-full ${
                            system.status === 'online' ? 'bg-success' : 
                            system.status === 'degraded' ? 'bg-warning' : 'bg-critical'
                          }`}></div>
                          <span className="text-sm">{system.status}</span>
                        </div>
                        <div className="text-xs text-neutral-500">
                          Uptime: {system.uptime}%
                        </div>
                      </div>
                      <div className={`text-xl font-semibold ${
                        getColorClass(system.responseTime, 100, 250)
                      }`}>
                        {system.responseTime}ms
                      </div>
                    </div>
                    <Progress 
                      className="mt-2" 
                      value={system.load} 
                      style={{
                        backgroundColor: '#F3F4F6',
                        '--progress-background': system.load > 80 ? '#EF4444' : 
                                                system.load > 60 ? '#F59E0B' : '#10B981'
                      } as React.CSSProperties}
                    />
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-neutral-500">Load</span>
                      <span className="text-xs font-medium">{system.load}%</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {/* Main Monitoring Content */}
            <Tabs defaultValue="overview" className="mb-6" onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="network">Network</TabsTrigger>
                <TabsTrigger value="resources">Resources</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>
              
              {/* Overview Tab */}
              <TabsContent value="overview">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  {/* System Health Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>System State</CardTitle>
                      <CardDescription>General overview of all component health</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                { name: 'Online', value: systemStatus.filter(s => s.status === 'online').length },
                                { name: 'Degraded', value: systemStatus.filter(s => s.status === 'degraded').length },
                                { name: 'Offline', value: systemStatus.filter(s => s.status === 'offline').length },
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              outerRadius={100}
                              fill="#8884d8"
                              dataKey="value"
                              nameKey="name"
                              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            >
                              <Cell fill="#10B981" />
                              <Cell fill="#F59E0B" />
                              <Cell fill="#EF4444" />
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Response Time Overview */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Response Time</CardTitle>
                      <CardDescription>Component response time in milliseconds</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            width={500}
                            height={300}
                            data={systemStatus.map(s => ({
                              name: s.name,
                              responseTime: s.responseTime
                            }))}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar 
                              dataKey="responseTime" 
                              name="Response Time (ms)" 
                              fill="#3B82F6"
                              radius={[4, 4, 0, 0]} 
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                

                
                <Card>
                  <CardHeader>
                    <CardTitle>Unavailability Statistics</CardTitle>
                    <CardDescription>System component downtime for the last 30 days</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {systemStatus.map((system, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <div className="font-medium">{system.name}</div>
                            <div className="text-sm text-neutral-500">
                              Availability: {system.uptime}%
                            </div>
                          </div>
                          <Progress 
                            value={system.uptime} 
                            className="h-2"
                            style={{
                              backgroundColor: '#F3F4F6',
                              '--progress-background': system.uptime > 99.9 ? '#10B981' : 
                                                      system.uptime > 99 ? '#3B82F6' : 
                                                      system.uptime > 98 ? '#F59E0B' : '#EF4444'
                            } as React.CSSProperties}
                          />
                          <div className="text-xs text-neutral-500">
                            Downtime: {(100 - system.uptime).toFixed(2)}% ({Math.round((100 - system.uptime) * 0.3 * 24 * 60)} minutes over 30 days)
                          </div>
                          <Separator className="mt-4" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              {/* Network Tab */}
              <TabsContent value="network">
                <div className="grid grid-cols-1 gap-6 mb-6">
                  {/* Network Latency Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Network Latency</CardTitle>
                      <CardDescription>Average network response time in milliseconds (24 hours)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            width={500}
                            height={300}
                            data={networkMetrics}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="latency" 
                              name="Latency (ms)" 
                              stroke="#3B82F6" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Packet Loss Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Packet Loss</CardTitle>
                      <CardDescription>Percentage of network packet loss (24 hours)</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            width={500}
                            height={300}
                            data={networkMetrics}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="packetLoss" 
                              name="Packet Loss (%)" 
                              stroke="#F59E0B" 
                              fill="#FEF3C7" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Bandwidth Usage Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Bandwidth Usage</CardTitle>
                      <CardDescription>Bandwidth consumption (Mbps) over 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart
                            width={500}
                            height={300}
                            data={networkMetrics}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="bandwidth" 
                              name="Bandwidth (Mbps)" 
                              stroke="#8B5CF6" 
                              fill="#EDE9FE" 
                              strokeWidth={2}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              {/* Resources Tab */}
              <TabsContent value="resources">
                <div className="grid grid-cols-1 gap-6 mb-6">
                  {/* CPU Usage Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>CPU Usage</CardTitle>
                      <CardDescription>CPU usage percentage over 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            width={500}
                            height={300}
                            data={resourceUsage}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="cpu" 
                              name="CPU (%)" 
                              stroke="#EF4444" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Memory Usage Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Memory Usage</CardTitle>
                      <CardDescription>Memory usage percentage over 24 hours</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            width={500}
                            height={300}
                            data={resourceUsage}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="memory" 
                              name="Memory (%)" 
                              stroke="#3B82F6" 
                              activeDot={{ r: 8 }} 
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* All Resources Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Resources Summary Chart</CardTitle>
                      <CardDescription>Usage of all system resources</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart
                            width={500}
                            height={300}
                            data={resourceUsage}
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="timestamp" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line 
                              type="monotone" 
                              dataKey="cpu" 
                              name="CPU (%)" 
                              stroke="#EF4444" 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="memory" 
                              name="Memory (%)" 
                              stroke="#3B82F6" 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="disk" 
                              name="Disk (%)" 
                              stroke="#10B981" 
                              strokeWidth={2}
                            />
                            <Line 
                              type="monotone" 
                              dataKey="network" 
                              name="Network (%)" 
                              stroke="#8B5CF6" 
                              strokeWidth={2}
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
                    <CardTitle>System Alerts</CardTitle>
                    <CardDescription>Log of system alerts and warnings</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Alert className="border-warning">
                        <span className="material-icons mr-2 text-warning">warning</span>
                        <div>
                          <AlertTitle>High latency in communication system</AlertTitle>
                          <AlertDescription className="mt-1">
                            <p className="mb-1">
                              Increased latency detected in the communication system. It is recommended to check the connection between the main server and auxiliary servers.
                            </p>
                            <div className="flex justify-between text-xs text-neutral-500 mt-2">
                              <span>07.04.2025 13:42:22</span>
                              <Badge variant="outline">Warning</Badge>
                            </div>
                          </AlertDescription>
                        </div>
                      </Alert>
                      
                      <Alert className="border-critical">
                        <span className="material-icons mr-2 text-critical">error</span>
                        <div>
                          <AlertTitle>Temporary loss of connection with backup server</AlertTitle>
                          <AlertDescription className="mt-1">
                            <p className="mb-1">
                              Temporary loss of connection with the backup server detected. The system automatically restored the connection.
                            </p>
                            <div className="flex justify-between text-xs text-neutral-500 mt-2">
                              <span>07.04.2025 10:15:33</span>
                              <Badge variant="outline">Error</Badge>
                            </div>
                          </AlertDescription>
                        </div>
                      </Alert>
                      
                      <Alert className="border-warning">
                        <span className="material-icons mr-2 text-warning">warning</span>
                        <div>
                          <AlertTitle>High CPU usage on telemetry server</AlertTitle>
                          <AlertDescription className="mt-1">
                            <p className="mb-1">
                              CPU load on the telemetry server exceeded 80% for 15 minutes. It is recommended to check server processes.
                            </p>
                            <div className="flex justify-between text-xs text-neutral-500 mt-2">
                              <span>06.04.2025 22:04:51</span>
                              <Badge variant="outline">Warning</Badge>
                            </div>
                          </AlertDescription>
                        </div>
                      </Alert>
                      

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

function SystemMonitoringSkeleton() {
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
            
            <Skeleton className="h-10 w-96 mb-4" />
            
            <Skeleton className="h-96 w-full mb-6" />
            
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
      </div>
    </div>
  );
}