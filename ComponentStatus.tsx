import React from 'react';
import { useUav } from '@/contexts/UavContext';
import { Component } from '@shared/schema';

// Component type configuration
const componentConfig: Record<string, { icon: string, label: string }> = {
  motor: { icon: 'settings', label: 'Motors' },
  camera: { icon: 'videocam', label: 'Camera' },
  gps: { icon: 'gps_fixed', label: 'GPS' },
  battery: { icon: 'battery_full', label: 'Battery' },
  gyroscope: { icon: '3d_rotation', label: 'Gyroscope' },
  radio: { icon: 'router', label: 'Radio Control' }
};

// Status indicators
const statusColors = {
  normal: 'text-success bg-success bg-opacity-10',
  warning: 'text-warning bg-warning bg-opacity-10',
  critical: 'text-critical bg-critical bg-opacity-10'
};

interface ComponentCardProps {
  component: Component;
}

const ComponentCard: React.FC<ComponentCardProps> = ({ component }) => {
  const config = componentConfig[component.type];
  const statusClass = statusColors[component.status as keyof typeof statusColors];
  
  // Default fallback if component type is not recognized
  const icon = config?.icon || 'devices';
  const label = config?.label || component.type;
  
  return (
    <div className="flex items-start border border-neutral-100 rounded-lg p-3">
      <div className={`rounded-full p-2 ${statusClass} mr-3`}>
        <span className={`material-icons text-${component.status === 'normal' ? 'success' : component.status === 'warning' ? 'warning' : 'critical'}`}>
          {icon}
        </span>
      </div>
      <div>
        <h3 className="font-medium text-neutral-700">{label}</h3>
        <p className={`text-sm mt-1 ${
          component.status === 'normal' ? 'text-neutral-500' : 
          component.status === 'warning' ? 'text-warning-dark' : 
          'text-critical-dark'
        }`}>
          {component.details}
        </p>
        <div className="mt-2">
          <div className="text-xs text-neutral-500 mb-1">
            {component.type === 'motor' ? 'Temperature' : 
             component.type === 'camera' ? 'Storage' :
             component.type === 'gps' ? 'Signal Strength' :
             component.type === 'battery' ? 'Charge Level' :
             component.type === 'gyroscope' ? 'Accuracy' :
             component.type === 'radio' ? 'Signal Quality' : 'Status'}
          </div>
          <div className="w-full bg-neutral-200 rounded-full h-1.5">
            <div 
              className={`h-1.5 rounded-full ${
                component.status === 'normal' ? 'bg-success' : 
                component.status === 'warning' ? 'bg-warning' : 
                'bg-critical'
              }`} 
              style={{ width: `${component.value}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function ComponentStatus() {
  const { componentStatus } = useUav();
  
  if (!componentStatus.length) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-8 text-center">
        <span className="material-icons text-4xl text-neutral-400 mb-2">devices_other</span>
        <h2 className="text-xl font-semibold text-neutral-700">No Component Data</h2>
        <p className="text-neutral-500 mt-2">Component information is unavailable</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="font-semibold text-neutral-800">Drone Component Status</h2>
        <div className="flex items-center text-sm">
          <div className="flex items-center mr-4">
            <div className="w-2 h-2 rounded-full bg-success mr-1.5"></div>
            <span className="text-neutral-600">Normal</span>
          </div>
          <div className="flex items-center mr-4">
            <div className="w-2 h-2 rounded-full bg-warning mr-1.5"></div>
            <span className="text-neutral-600">Warning</span>
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 rounded-full bg-critical mr-1.5"></div>
            <span className="text-neutral-600">Critical</span>
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {componentStatus.map((component) => (
            <ComponentCard key={component.id} component={component} />
          ))}
        </div>
      </div>
    </div>
  );
}
