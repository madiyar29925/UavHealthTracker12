import React from 'react';
import { useUav } from '@/contexts/UavContext';
import TelemetryChart from './TelemetryChart';

// Status indicator colors based on drone status
const statusColors = {
  active: {
    dot: 'bg-success',
    badge: 'bg-success bg-opacity-10 text-success',
    text: 'Active'
  },
  warning: {
    dot: 'bg-warning',
    badge: 'bg-warning bg-opacity-10 text-warning',
    text: 'Warning'
  },
  critical: {
    dot: 'bg-critical',
    badge: 'bg-critical bg-opacity-10 text-critical',
    text: 'Critical'
  },
  offline: {
    dot: 'bg-neutral-400',
    badge: 'bg-neutral-200 text-neutral-600',
    text: 'Offline'
  }
};

// Calculate remaining time based on battery level
const getRemainingTime = (batteryLevel: number): string => {
  // Assumes a full battery (100%) lasts for 60 minutes
  const minutes = Math.round(batteryLevel * 0.6);
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `~${hours}h ${remainingMinutes}min remaining`;
  }
  return `~${minutes} min remaining`;
};

// Signal strength text
const getSignalQuality = (strength: number): string => {
  if (strength > 95) return 'Excellent';
  if (strength > 80) return 'Good';
  if (strength > 60) return 'Fair';
  if (strength > 30) return 'Poor';
  return 'Critical';
};

export default function UavDetails() {
  const { selectedUav, telemetryData } = useUav();
  
  if (!selectedUav) return null;
  
  const status = statusColors[selectedUav.status as keyof typeof statusColors];
  
  return (
    <div className="bg-white rounded-lg shadow-md border border-neutral-100 overflow-hidden mb-6">
      <div className="px-5 py-4 border-b border-neutral-100 flex flex-col md:flex-row md:items-center md:justify-between">
        <div className="flex items-center mb-3 md:mb-0">
          <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
            <span className="material-icons text-primary">flight</span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800">{selectedUav.name}</h2>
            <div className="flex items-center mt-1">
              <div className={`w-2.5 h-2.5 rounded-full ${status.dot} mr-2 ${selectedUav.status === 'active' ? 'animate-pulse' : ''}`}></div>
              <span className={`text-xs font-medium ${status.badge} px-2.5 py-0.5 rounded-full`}>
                {status.text}
              </span>
              <span className="mx-2 text-slate-300">•</span>
              <span className="text-xs text-slate-500">ID: {selectedUav.id}</span>
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md flex items-center transition-colors shadow-sm">
            <span className="material-icons text-sm mr-1.5">history</span>
            History
          </button>
          <button className="px-3 py-1.5 text-sm bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-md flex items-center transition-colors shadow-sm">
            <span className="material-icons text-sm mr-1.5">settings</span>
            Configure
          </button>
          <button className="px-3 py-1.5 text-sm bg-primary text-white rounded-md flex items-center hover:opacity-90 transition-colors shadow-sm">
            <span className="material-icons text-sm mr-1.5">open_in_new</span>
            Full View
          </button>
        </div>
      </div>
      
      {/* Drone Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 p-5">
        {/* Battery Status */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-slate-600">Battery</div>
            <div className={`flex items-center justify-center h-7 w-7 rounded-full ${
              selectedUav.batteryLevel > 60 ? 'bg-green-50 text-green-500' : 
              selectedUav.batteryLevel > 30 ? 'bg-amber-50 text-amber-500' : 
              'bg-red-50 text-red-500'
            }`}>
              <span className="material-icons text-sm">battery_6_bar</span>
            </div>
          </div>
          <div className="flex items-end">
            <div className="text-2xl font-bold text-slate-800">{selectedUav.batteryLevel}%</div>
            <div className={`text-xs font-medium ml-2 mb-0.5 ${
              selectedUav.batteryLevel > 60 ? 'text-green-500' : 
              selectedUav.batteryLevel > 30 ? 'text-amber-500' : 
              'text-red-500'
            }`}>{getRemainingTime(selectedUav.batteryLevel)}</div>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className={`${
                selectedUav.batteryLevel > 60 ? 'bg-green-500' : 
                selectedUav.batteryLevel > 30 ? 'bg-amber-500' : 
                'bg-red-500'
              } h-1.5 rounded-full transition-all duration-300`} 
              style={{ width: `${selectedUav.batteryLevel}%` }}
            ></div>
          </div>
        </div>
        
        {/* Signal Strength */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-slate-600">Signal</div>
            <div className={`flex items-center justify-center h-7 w-7 rounded-full ${
              selectedUav.signalStrength > 80 ? 'bg-green-50 text-green-500' : 
              selectedUav.signalStrength > 30 ? 'bg-amber-50 text-amber-500' : 
              'bg-red-50 text-red-500'
            }`}>
              <span className="material-icons text-sm">signal_cellular_alt</span>
            </div>
          </div>
          <div className="flex items-end">
            <div className="text-2xl font-bold text-slate-800">{selectedUav.signalStrength}%</div>
            <div className={`text-xs font-medium ml-2 mb-0.5 ${
              selectedUav.signalStrength > 80 ? 'text-green-500' : 
              selectedUav.signalStrength > 30 ? 'text-amber-500' : 
              'text-red-500'
            }`}>{getSignalQuality(selectedUav.signalStrength)}</div>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className={`${
                selectedUav.signalStrength > 80 ? 'bg-green-500' : 
                selectedUav.signalStrength > 30 ? 'bg-amber-500' : 
                'bg-red-500'
              } h-1.5 rounded-full transition-all duration-300`} 
              style={{ width: `${selectedUav.signalStrength}%` }}
            ></div>
          </div>
        </div>
        
        {/* Speed */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-slate-600">Speed</div>
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-primary">
              <span className="material-icons text-sm">speed</span>
            </div>
          </div>
          <div className="flex items-end">
            <div className="text-2xl font-bold text-slate-800">{selectedUav.speed} m/s</div>
            <div className="text-xs font-medium text-slate-500 ml-2 mb-0.5">{Math.round(selectedUav.speed * 3.6)} km/h</div>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, selectedUav.speed * 5)}%` }}
            ></div>
          </div>
        </div>
        
        {/* Altitude */}
        <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100">
          <div className="flex justify-between items-start mb-3">
            <div className="text-sm font-medium text-slate-600">Altitude</div>
            <div className="flex items-center justify-center h-7 w-7 rounded-full bg-blue-50 text-primary">
              <span className="material-icons text-sm">height</span>
            </div>
          </div>
          <div className="flex items-end">
            <div className="text-2xl font-bold text-slate-800">{selectedUav.altitude} m</div>
            <div className="text-xs font-medium text-slate-500 ml-2 mb-0.5">{Math.round(selectedUav.altitude * 3.28)} ft</div>
          </div>
          <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5">
            <div 
              className="bg-primary h-1.5 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min(100, selectedUav.altitude / 3)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      {/* Drone Telemetry Charts */}
      <div className="border-t border-slate-100 p-5">
        <div className="flex justify-between items-center mb-5">
          <h3 className="font-semibold text-slate-800 text-lg">Telemetry Data</h3>
          <div className="flex space-x-1 bg-slate-100 p-0.5 rounded-lg">
            <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-primary text-white shadow-sm">Live</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:bg-slate-200 transition-colors">1h</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:bg-slate-200 transition-colors">6h</button>
            <button className="px-3 py-1.5 text-xs font-medium rounded-md text-slate-600 hover:bg-slate-200 transition-colors">24h</button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Flight Altitude Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center mr-2">
                  <span className="material-icons text-sm text-primary">height</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Flight Altitude</span>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Last 30 minutes</span>
            </div>
            <div className="chart-container">
              <TelemetryChart
                data={telemetryData}
                dataKey="altitude"
                stroke="#1E88E5"
                fill="url(#altitude-gradient)"
                gradientId="altitude-gradient"
                gradientColor="#1E88E5"
                unit="m"
              />
            </div>
          </div>
          
          {/* Flight Speed Chart */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-2">
                  <span className="material-icons text-sm text-teal-500">speed</span>
                </div>
                <span className="text-sm font-medium text-slate-700">Flight Speed</span>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Last 30 minutes</span>
            </div>
            <div className="chart-container">
              <TelemetryChart
                data={telemetryData}
                dataKey="speed"
                stroke="#26A69A"
                fill="url(#speed-gradient)"
                gradientId="speed-gradient"
                gradientColor="#26A69A"
                unit="m/s"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
