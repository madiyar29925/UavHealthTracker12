import React, { useState } from 'react';

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('');
  
  return (
    <header className="bg-white border-b border-neutral-100 shadow-sm z-10">
      <div className="container mx-auto px-4 py-2.5 flex justify-between items-center">
        <div className="flex items-center md:hidden">
          <span className="material-icons text-primary">menu</span>
        </div>
        
        <div className="hidden md:flex items-center space-x-2">
          <h1 className="text-lg font-semibold tracking-tight text-slate-700">DroneView Control Center</h1>
        </div>
        
        <div className="flex items-center space-x-3 md:space-x-6">
          <div className="hidden md:block">
            <div className="relative">
              <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">search</span>
              <input 
                type="text" 
                placeholder="Search DroneView..." 
                className="pl-10 pr-4 py-2 rounded-full bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 w-60 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors" title="Notifications">
            <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
            <span className="material-icons text-slate-600">notifications</span>
          </button>
          
          <button className="p-2 rounded-full hover:bg-slate-100 transition-colors" title="Settings">
            <span className="material-icons text-slate-600">settings</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white shadow-sm ring-2 ring-white">
              <span className="text-sm font-medium">AD</span>
            </div>
            <span className="hidden md:inline text-sm font-medium text-slate-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
