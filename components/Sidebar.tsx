import React from 'react';
import { LayoutDashboard, Briefcase, UserCircle, Terminal, Activity, Send } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView }) => {
  const navItems: { id: ViewState; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'jobs', label: 'Jobs & Tracking', icon: <Briefcase size={20} /> },
    { id: 'outbox', label: 'Sent Outbox', icon: <Send size={20} /> },
    { id: 'profile', label: 'User Profile', icon: <UserCircle size={20} /> },
    { id: 'logs', label: 'Agent Logs', icon: <Terminal size={20} /> },
  ];

  return (
    <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-10">
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <Activity className="text-blue-500" />
        <h1 className="text-xl font-bold text-slate-100 tracking-tight">AutoApply AI</h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setView(item.id)}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${
              currentView === item.id
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-2 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span>System Operational</span>
        </div>
        <div className="mt-1 text-xs text-slate-600 font-mono">
          Orchestrator: Active
        </div>
      </div>
    </div>
  );
};

export default Sidebar;