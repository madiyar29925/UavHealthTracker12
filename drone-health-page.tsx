import React from 'react';
import { useUav } from '@/contexts/UavContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import DroneHealthAnimation from '@/components/DroneHealthAnimation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import ComponentStatus from '@/components/ComponentStatus';

export default function DroneHealthPage() {
  const { loading, selectedUav, componentStatus } = useUav();

  if (loading) {
    return <DroneHealthPageSkeleton />;
  }

  if (!selectedUav) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <main className="flex-1 p-6">
            <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-8 text-center">
              <span className="material-icons text-4xl text-neutral-400 mb-2">drone</span>
              <h2 className="text-xl font-semibold text-neutral-700">No Drone Selected</h2>
              <p className="text-neutral-500 mt-2">Please select a drone from the list to view its status</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">
              Interactive Drone Diagnostics
            </h1>
            <p className="text-neutral-500">
              Visual representation of {selectedUav.name} status with interactive elements
            </p>
          </div>

          <Tabs defaultValue="3d-model" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="3d-model">3D Model</TabsTrigger>
              <TabsTrigger value="components">Components</TabsTrigger>
              <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
            </TabsList>

            <TabsContent value="3d-model" className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                      Interactive Drone Model
                    </h2>
                    <p className="text-neutral-600 mb-4">
                      Hover over different parts of the drone to see their status and additional information.
                      Component status is displayed using color indicators.
                    </p>
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 mb-4">
                      <h3 className="font-medium text-neutral-700 mb-2">Color Key:</h3>
                      <div className="space-y-2">
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-success mr-2"></div>
                          <span className="text-neutral-600">Normal operation</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-warning mr-2"></div>
                          <span className="text-neutral-600">Warning</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-critical mr-2"></div>
                          <span className="text-neutral-600">Critical condition</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-4 h-4 rounded-full bg-neutral-400 mr-2"></div>
                          <span className="text-neutral-600">Inactive</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                      <h3 className="font-medium text-neutral-700 mb-2">Tips:</h3>
                      <ul className="list-disc pl-5 text-neutral-600 space-y-1">
                        <li>Click the "Pause" button to stop the animation</li>
                        <li>Hover over motors to see detailed information</li>
                        <li>Hover over the center for gyroscope information</li>
                        <li>Indicators at the bottom show battery and signal levels</li>
                      </ul>
                    </div>
                  </div>
                  <div className="flex justify-center items-center">
                    <DroneHealthAnimation 
                      components={componentStatus}
                      batteryLevel={selectedUav.batteryLevel}
                      signalStrength={selectedUav.signalStrength}
                      status={selectedUav.status as 'active' | 'warning' | 'critical' | 'offline'}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                  Overall Drone Status
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status */}
                  <div className="p-4 rounded-lg border border-neutral-100">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-lg text-neutral-500 mr-2">
                        info
                      </span>
                      <span className="text-neutral-700 font-medium">Status</span>
                    </div>
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded-full mr-2 ${
                        selectedUav.status === 'active' ? 'bg-success' : 
                        selectedUav.status === 'warning' ? 'bg-warning' : 
                        selectedUav.status === 'critical' ? 'bg-critical' : 
                        'bg-neutral-400'
                      }`}></div>
                      <span className={`font-medium ${
                        selectedUav.status === 'active' ? 'text-success' : 
                        selectedUav.status === 'warning' ? 'text-warning' : 
                        selectedUav.status === 'critical' ? 'text-critical' : 
                        'text-neutral-500'
                      }`}>
                        {selectedUav.status === 'active' ? 'Active' : 
                         selectedUav.status === 'warning' ? 'Warning' : 
                         selectedUav.status === 'critical' ? 'Critical' : 
                         'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  {/* Speed */}
                  <div className="p-4 rounded-lg border border-neutral-100">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-lg text-neutral-500 mr-2">
                        speed
                      </span>
                      <span className="text-neutral-700 font-medium">Speed</span>
                    </div>
                    <div className="text-xl font-semibold text-neutral-800">
                      {selectedUav.speed} m/s
                    </div>
                  </div>
                  
                  {/* Battery */}
                  <div className="p-4 rounded-lg border border-neutral-100">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-lg text-neutral-500 mr-2">
                        battery_6_bar
                      </span>
                      <span className="text-neutral-700 font-medium">Battery</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xl font-semibold text-neutral-800 mr-2">
                        {selectedUav.batteryLevel}%
                      </div>
                      <div className={`text-sm ${
                        selectedUav.batteryLevel > 60 ? 'text-success' : 
                        selectedUav.batteryLevel > 30 ? 'text-warning' : 
                        'text-critical'
                      }`}>
                        {selectedUav.batteryLevel > 60 ? 'Good' : 
                         selectedUav.batteryLevel > 30 ? 'Medium' : 
                         'Low'}
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          selectedUav.batteryLevel > 60 ? 'bg-success' : 
                          selectedUav.batteryLevel > 30 ? 'bg-warning' : 
                          'bg-critical'
                        }`} 
                        style={{ width: `${selectedUav.batteryLevel}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Signal Strength */}
                  <div className="p-4 rounded-lg border border-neutral-100">
                    <div className="flex items-center mb-2">
                      <span className="material-icons text-lg text-neutral-500 mr-2">
                        signal_cellular_alt
                      </span>
                      <span className="text-neutral-700 font-medium">Signal Strength</span>
                    </div>
                    <div className="flex items-center">
                      <div className="text-xl font-semibold text-neutral-800 mr-2">
                        {selectedUav.signalStrength}%
                      </div>
                      <div className={`text-sm ${
                        selectedUav.signalStrength > 80 ? 'text-success' : 
                        selectedUav.signalStrength > 30 ? 'text-warning' : 
                        'text-critical'
                      }`}>
                        {selectedUav.signalStrength > 80 ? 'Excellent' : 
                         selectedUav.signalStrength > 30 ? 'Medium' : 
                         'Weak'}
                      </div>
                    </div>
                    <div className="mt-2 w-full bg-neutral-200 rounded-full h-1.5">
                      <div 
                        className={`h-1.5 rounded-full ${
                          selectedUav.signalStrength > 80 ? 'bg-success' : 
                          selectedUav.signalStrength > 30 ? 'bg-warning' : 
                          'bg-critical'
                        }`} 
                        style={{ width: `${selectedUav.signalStrength}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="components">
              <ComponentStatus />
            </TabsContent>

            <TabsContent value="diagnostics">
              <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
                <h2 className="text-lg font-semibold text-neutral-800 mb-4">
                  System Diagnostics
                </h2>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg border border-neutral-100">
                    <h3 className="font-medium text-neutral-700 mb-3">Automatic Check</h3>
                    <button className="px-4 py-2 bg-primary text-white rounded-md flex items-center">
                      <span className="material-icons text-sm mr-2">play_arrow</span>
                      Run Diagnostics
                    </button>
                  </div>
                  
                  <div className="p-4 rounded-lg border border-neutral-100">
                    <h3 className="font-medium text-neutral-700 mb-3">Diagnostic Logs</h3>
                    <div className="bg-neutral-50 p-3 rounded-md border border-neutral-200 font-mono text-sm text-neutral-600 h-60 overflow-y-auto">
                      <div className="mb-1">
                        <span className="text-success">[✓]</span> GPS Check: Stable signal (12 satellites)
                      </div>
                      <div className="mb-1">
                        <span className="text-success">[✓]</span> Gyroscope Check: Normal operation
                      </div>
                      <div className="mb-1">
                        <span className="text-warning">[!]</span> Motor #2 Check: Temperature elevated (48°C)
                      </div>
                      <div className="mb-1">
                        <span className="text-success">[✓]</span> Camera Check: Calibration normal
                      </div>
                      <div className="mb-1">
                        <span className="text-success">[✓]</span> Battery Check: Charge level {selectedUav.batteryLevel}%
                      </div>
                      <div className="mb-1">
                        <span className="text-success">[✓]</span> Software Check: Latest version
                      </div>
                      <div className="mb-1">
                        <span className="text-success">[✓]</span> Radio Control Check: Signal stable
                      </div>
                      <div className="mb-1">
                        <span className="text-success">[✓]</span> Accelerometer Check: Calibration normal
                      </div>
                      <div className="mb-1">
                        <span className="text-warning">[!]</span> Compass Check: Calibration required
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}

function DroneHealthPageSkeleton() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <Header />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
          
          <div className="mb-6">
            <Skeleton className="h-10 w-72 mb-4" />
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6 mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Skeleton className="h-6 w-48 mb-4" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  
                  <Skeleton className="h-24 w-full mb-4" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <div className="flex justify-center items-center">
                  <Skeleton className="h-80 w-80 rounded-lg" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
                <Skeleton className="h-24 w-full rounded-lg" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}