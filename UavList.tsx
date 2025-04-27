import React, { useState } from 'react';
import { useUav } from '@/contexts/UavContext';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";

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

// Signal strength indicator
const getSignalText = (strength: number) => {
  if (strength === 0) return 'None';
  if (strength < 20) return 'Poor';
  if (strength < 50) return 'Fair';
  if (strength < 80) return 'Good';
  return 'Excellent';
};

// Battery icon based on level
const getBatteryIcon = (level: number, status: string) => {
  if (status === 'offline') return 'battery_unknown';
  if (level < 20) return 'battery_alert';
  if (level < 30) return 'battery_1_bar';
  if (level < 50) return 'battery_3_bar';
  if (level < 80) return 'battery_5_bar';
  return 'battery_6_bar';
};

// Signal icon based on strength
const getSignalIcon = (strength: number, status: string) => {
  if (status === 'offline') return 'signal_cellular_null';
  if (strength === 0) return 'signal_cellular_0_bar';
  if (strength < 20) return 'signal_cellular_1_bar';
  if (strength < 50) return 'signal_cellular_2_bar';
  if (strength < 80) return 'signal_cellular_3_bar';
  return 'signal_cellular_alt';
};

export default function UavList() {
  const { uavs, selectedUav, selectUav, deleteUav } = useUav();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [droneToDelete, setDroneToDelete] = useState<{ id: number, name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteClick = (e: React.MouseEvent, uav: { id: number, name: string }) => {
    // Stop the click event from bubbling up to the parent element
    e.stopPropagation();
    setDroneToDelete(uav);
    setDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (droneToDelete) {
      setIsDeleting(true);
      try {
        const result = await deleteUav(droneToDelete.id);
        if (result.success) {
          setDeleteDialogOpen(false);
          setDroneToDelete(null);
        }
      } finally {
        setIsDeleting(false);
      }
    }
  };
  
  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden mb-6">
        <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800">Drone Fleet Status</h2>
          <div className="flex space-x-1">
            <button className="p-1 text-neutral-400 hover:text-neutral-600" title="Filter">
              <span className="material-icons text-sm">filter_list</span>
            </button>
            <button className="p-1 text-neutral-400 hover:text-neutral-600" title="More options">
              <span className="material-icons text-sm">more_vert</span>
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto" style={{ maxHeight: '440px' }}>
          <ul className="divide-y divide-neutral-100">
            {uavs.map((uav) => {
              const status = statusColors[uav.status as keyof typeof statusColors];
              const isSelected = selectedUav?.id === uav.id;
              const isOffline = uav.status === 'offline';
              
              return (
                <li 
                  key={uav.id} 
                  className={`hover:bg-neutral-50 cursor-pointer ${
                    isSelected ? 'bg-blue-50' : ''
                  } ${
                    uav.status === 'warning' ? 'bg-warning-light bg-opacity-5' : 
                    uav.status === 'critical' ? 'bg-critical-light bg-opacity-5' : 
                    uav.status === 'offline' ? 'bg-neutral-50' : ''
                  }`}
                  onClick={() => selectUav(uav)}
                >
                  <div className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${status.dot} mr-2`}></div>
                        <h3 className="font-medium text-neutral-800">{uav.name}</h3>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`text-xs font-medium ${status.badge} px-2 py-0.5 rounded-full`}>
                          {status.text}
                        </span>
                        <button 
                          className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          title="Delete Drone"
                          onClick={(e) => handleDeleteClick(e, { id: uav.id, name: uav.name })}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                      <div className={`flex items-center ${
                        uav.batteryLevel < 35 && !isOffline ? 'text-warning' : isOffline ? 'text-neutral-400' : 'text-neutral-500'
                      }`}>
                        <span className="material-icons text-xs mr-1">{getBatteryIcon(uav.batteryLevel, uav.status)}</span>
                        <span>Battery: <b className={isOffline ? '' : "text-neutral-700"}>{
                          isOffline ? 'Unknown' : `${uav.batteryLevel}%`
                        }</b></span>
                      </div>
                      <div className={`flex items-center ${
                        uav.signalStrength < 20 && !isOffline ? 'text-critical' : isOffline ? 'text-neutral-400' : 'text-neutral-500'
                      }`}>
                        <span className="material-icons text-xs mr-1">{getSignalIcon(uav.signalStrength, uav.status)}</span>
                        <span>Signal: <b className={isOffline ? '' : "text-neutral-700"}>{
                          isOffline ? 'None' : getSignalText(uav.signalStrength)
                        }</b></span>
                      </div>
                      <div className={`flex items-center ${isOffline ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <span className="material-icons text-xs mr-1">speed</span>
                        <span>Speed: <b className={isOffline ? '' : "text-neutral-700"}>{
                          isOffline ? '0 m/s' : `${uav.speed} m/s`
                        }</b></span>
                      </div>
                      <div className={`flex items-center ${isOffline ? 'text-neutral-400' : 'text-neutral-500'}`}>
                        <span className="material-icons text-xs mr-1">height</span>
                        <span>Alt: <b className={isOffline ? '' : "text-neutral-700"}>{
                          isOffline ? '0 m' : `${uav.altitude} m`
                        }</b></span>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Confirm Drone Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              {droneToDelete && (
                <div className="space-y-4">
                  <p>
                    Are you sure you want to delete <span className="font-semibold">{droneToDelete.name}</span>? 
                    This action will permanently remove all drone data including telemetry history, 
                    component status, and alerts.
                  </p>
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded text-amber-800 text-sm space-y-2 mt-2">
                    <p className="font-semibold flex items-center">
                      <span className="material-icons text-xs mr-1">warning</span>
                      Warning:
                    </p>
                    <ul className="list-disc pl-5">
                      <li>This action cannot be undone</li>
                      <li>All telemetry history will be lost</li>
                      <li>Component health data will be deleted</li>
                      <li>All alerts related to this drone will be deleted</li>
                    </ul>
                  </div>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white focus:ring-red-500"
            >
              {isDeleting ? "Deleting..." : "Delete Drone"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
