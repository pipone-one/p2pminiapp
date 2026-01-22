import React from 'react';
import { Home, Bell, BarChart3, User, Settings } from 'lucide-react';
import clsx from 'clsx';

const NavItem = ({ icon: Icon, label, id, activeTab, onTabChange }) => (
  <button 
    onClick={() => onTabChange(id)}
    className={clsx(
      "flex flex-col items-center gap-1 p-2 transition-colors",
      activeTab === id ? "text-shark-cyan" : "text-gray-400 hover:text-white"
    )}
  >
    <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const Navigation = ({ activeTab, onTabChange }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface backdrop-blur-md border-t border-white/5 pb-6 pt-4 px-6 flex justify-between items-center z-50 rounded-t-2xl">
      <NavItem icon={Home} label="Market" id="Market" activeTab={activeTab} onTabChange={onTabChange} />
      <NavItem icon={Bell} label="Watchlist" id="Alerts" activeTab={activeTab} onTabChange={onTabChange} />
      <NavItem icon={BarChart3} label="History" id="Analytics" activeTab={activeTab} onTabChange={onTabChange} />
      <NavItem icon={User} label="Profile" id="Merchant" activeTab={activeTab} onTabChange={onTabChange} />
      <NavItem icon={Settings} label="Settings" id="Settings" activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default Navigation;
