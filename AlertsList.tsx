import React from 'react';
import { useUav } from '@/contexts/UavContext';
import { formatDistanceToNow } from 'date-fns';
import { Alert } from '@shared/schema';

// Alert severity configurations
const alertConfig = {
  critical: {
    bgClass: 'bg-critical-light bg-opacity-5',
    iconBgClass: 'bg-critical bg-opacity-20',
    iconClass: 'text-critical',
    icon: 'error'
  },
  warning: {
    bgClass: 'bg-warning-light bg-opacity-5',
    iconBgClass: 'bg-warning bg-opacity-20',
    iconClass: 'text-warning',
    icon: 'warning'
  },
  info: {
    bgClass: '',
    iconBgClass: 'bg-primary bg-opacity-20',
    iconClass: 'text-primary',
    icon: 'info'
  }
};

interface AlertItemProps {
  alert: Alert;
  onAcknowledge: (id: number) => void;
  onDismiss: (id: number) => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ alert, onAcknowledge, onDismiss }) => {
  const config = alertConfig[alert.severity as keyof typeof alertConfig];
  const timeAgo = formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true });
  
  // If alert is acknowledged or dismissed, don't show it
  if (alert.acknowledged || alert.dismissed) {
    return null;
  }
  
  return (
    <li className={`px-4 py-3 ${config.bgClass} hover:bg-neutral-50`}>
      <div className="flex items-start">
        <div className={`rounded-full p-1 ${config.iconBgClass} mr-3`}>
          <span className={`material-icons ${config.iconClass}`} style={{ fontSize: '18px' }}>{config.icon}</span>
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-neutral-800">{alert.message.split(':')[0]}</h3>
            <span className="text-xs text-neutral-500">{timeAgo}</span>
          </div>
          <p className="text-sm text-neutral-600 mt-1">{alert.message.split(':')[1] || alert.message}</p>
          <div className="flex mt-2">
            <button 
              className="text-xs font-medium text-primary mr-3"
              onClick={() => onAcknowledge(alert.id)}
            >
              Acknowledge
            </button>
            <button 
              className="text-xs font-medium text-neutral-500"
              onClick={() => onDismiss(alert.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </li>
  );
};

export default function AlertsList() {
  const { alerts, acknowledgeAlert, dismissAlert } = useUav();
  
  // Filter active alerts (not acknowledged or dismissed)
  const activeAlerts = alerts.filter(alert => !alert.acknowledged && !alert.dismissed);
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
        <h2 className="font-semibold text-neutral-800">Recent Alerts</h2>
        <button className="text-primary text-sm font-medium">View All</button>
      </div>
      
      <div className="overflow-y-auto" style={{ maxHeight: '320px' }}>
        {activeAlerts.length > 0 ? (
          <ul className="divide-y divide-neutral-100">
            {activeAlerts.map((alert, index) => (
              <AlertItem 
                key={`alert-item-${alert.id}-${index}`} 
                alert={alert} 
                onAcknowledge={acknowledgeAlert}
                onDismiss={dismissAlert}
              />
            ))}
          </ul>
        ) : (
          <div className="py-6 text-center">
            <span className="material-icons text-neutral-400 text-3xl">notifications_none</span>
            <p className="text-neutral-500 mt-2">No active alerts</p>
          </div>
        )}
      </div>
    </div>
  );
}
