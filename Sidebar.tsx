import React from 'react';
import { Link, useLocation } from 'wouter';

type NavItem = {
  icon: string;
  label: string;
  path: string;
};

const mainNavItems: NavItem[] = [
  { icon: 'dashboard', label: 'Dashboard', path: '/' },
  { icon: 'airplanemode_active', label: 'Drone Fleet', path: '/fleet' },
  { icon: 'healing', label: 'Drone Health', path: '/health' },
  { icon: 'analytics', label: 'Analytics', path: '/analytics' },
  { icon: 'monitor_heart', label: 'System Monitoring', path: '/system' },
];

const systemNavItems: NavItem[] = [
  { icon: 'tune', label: 'Configuration', path: '/config' },
  { icon: 'help_outline', label: 'Help', path: '/help' },
];

export default function Sidebar() {
  const [location] = useLocation();
  
  return (
    <aside className="w-16 md:w-64 bg-white border-r border-neutral-200 flex flex-col shadow-sm">
      <div className="p-4 mb-2 border-b border-gray-100 hidden md:flex items-center">
        <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center mr-3">
          <span className="material-icons text-white">flight_takeoff</span>
        </div>
        <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">DroneView</h1>
      </div>
      <nav className="flex-1 py-4 overflow-y-auto">
        <div className="px-4 mb-4 hidden md:block">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Main</h2>
        </div>
        <ul className="space-y-1 px-2">
          {mainNavItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                location === item.path 
                  ? 'text-primary bg-blue-50 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}>
                <span className="material-icons text-[22px] md:mr-3">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        
        <div className="px-4 mt-8 mb-4 hidden md:block">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">System</h2>
        </div>
        <ul className="space-y-1 px-2">
          {systemNavItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path} className={`flex items-center px-3 py-2.5 rounded-md transition-colors ${
                location === item.path 
                  ? 'text-primary bg-blue-50 font-medium' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-primary'
              }`}>
                <span className="material-icons text-[22px] md:mr-3">{item.icon}</span>
                <span className="hidden md:inline">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 mt-4 mx-3 border-t border-gray-100 hidden md:block">
        <div className="p-3 bg-gradient-to-r from-slate-50 to-blue-50 rounded-lg shadow-sm">
          <div className="flex items-center">
            <div className="relative mr-3 bg-white p-2 rounded-full shadow-sm">
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full absolute -top-0.5 -right-0.5 border-2 border-white animate-pulse"></div>
              <span className="material-icons text-primary">dns</span>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-800">System Status</div>
              <div className="text-xs font-medium text-green-600">Operational</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
