import { useUav } from '@/contexts/UavContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import StatusCards from '@/components/StatusCards';
import UavList from '@/components/UavList';
import AlertsList from '@/components/AlertsList';
import UavDetails from '@/components/UavDetails';
import ComponentStatus from '@/components/ComponentStatus';

import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { loading, selectedUav } = useUav();

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          <div className="container mx-auto px-4 py-6">
            {/* Dashboard Header */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-neutral-800">Real-time DroneView Monitoring</h1>
                  <p className="text-neutral-500 mt-1">Overview of your drone fleet status and telemetry</p>
                </div>
                <div className="mt-4 md:mt-0 flex space-x-3">
                  <button className="px-4 py-2 bg-white border border-neutral-200 rounded-md flex items-center text-neutral-700 hover:bg-neutral-50">
                    <span className="material-icons text-sm mr-1.5">file_download</span>
                    Export Data
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md flex items-center hover:bg-primary-dark focus:ring-2 focus:ring-primary-light focus:ring-opacity-50">
                    <span className="material-icons text-sm mr-1.5">refresh</span>
                    Refresh
                  </button>
                </div>
              </div>
              
              {/* Status Cards */}
              <StatusCards />
            </div>
            
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Drone List and Status */}
              <div className="lg:col-span-1">
                <UavList />
                <div className="mt-6">
                  <AlertsList />
                </div>
              </div>
              
              {/* Middle Column - Selected Drone Details */}
              <div className="lg:col-span-2">
                {selectedUav ? (
                  <>
                    <UavDetails />
                    <ComponentStatus />
                  </>
                ) : (
                  <div className="bg-white rounded-lg shadow-sm border border-neutral-100 p-8 text-center">
                    <span className="material-icons text-4xl text-neutral-400 mb-2">airplanemode_inactive</span>
                    <h2 className="text-xl font-semibold text-neutral-700">No Drone Selected</h2>
                    <p className="text-neutral-500 mt-2">Select a drone from the list to view detailed information</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
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
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Skeleton className="h-72 w-full mb-6" />
                <Skeleton className="h-64 w-full" />
              </div>
              
              <div className="lg:col-span-2">
                <Skeleton className="h-96 w-full mb-6" />
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
