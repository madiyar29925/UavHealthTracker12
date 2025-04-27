import React from 'react';
import { useUav } from '@/contexts/UavContext';

interface StatusCardProps {
  icon: string;
  iconBgClass: string;
  iconTextClass: string;
  title: string;
  value: string | number;
  trend?: {
    isUp?: boolean;
    isDown?: boolean;
    text: string;
    colorClass: string;
  };
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  icon, 
  iconBgClass, 
  iconTextClass, 
  title, 
  value, 
  trend 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-4">
      <div className="flex items-center">
        <div className={`rounded-full ${iconBgClass} p-2 mr-4`}>
          <span className={`material-icons ${iconTextClass}`}>{icon}</span>
        </div>
        <div>
          <div className="text-sm text-neutral-500 font-medium">{title}</div>
          <div className="text-2xl font-semibold text-neutral-800">{value}</div>
        </div>
      </div>
      {trend && (
        <div className={`mt-2 flex items-center text-xs ${trend.colorClass}`}>
          <span className="material-icons text-xs mr-1">
            {trend.isUp ? 'arrow_upward' : trend.isDown ? 'arrow_downward' : 'remove'}
          </span>
          <span>{trend.text}</span>
        </div>
      )}
    </div>
  );
};

export default function StatusCards() {
  const { stats } = useUav();
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      <StatusCard 
        icon="airplanemode_active"
        iconBgClass="bg-primary-light bg-opacity-20"
        iconTextClass="text-primary-dark"
        title="Active Drones"
        value={stats.activeUavs}
        trend={{
          isUp: true,
          text: "1 more than yesterday",
          colorClass: "text-success"
        }}
      />
      
      <StatusCard 
        icon="airplanemode_inactive"
        iconBgClass="bg-neutral-200"
        iconTextClass="text-neutral-600"
        title="Offline Drones"
        value={stats.offlineUavs}
        trend={{
          text: "No change",
          colorClass: "text-neutral-500"
        }}
      />
      
      <StatusCard 
        icon="warning"
        iconBgClass="bg-warning-light bg-opacity-20"
        iconTextClass="text-warning-dark"
        title="Active Alerts"
        value={stats.activeAlerts}
        trend={{
          isUp: true,
          text: "2 new alerts",
          colorClass: "text-warning"
        }}
      />
      
      <StatusCard 
        icon="battery_charging_full"
        iconBgClass="bg-success-light bg-opacity-20"
        iconTextClass="text-success-dark"
        title="Avg. Battery"
        value={`${stats.avgBattery}%`}
        trend={{
          isUp: true,
          text: "12% higher than average",
          colorClass: "text-success"
        }}
      />
    </div>
  );
}
