import React from 'react';
import { Home, Bell, BarChart3, User, Settings } from 'lucide-react';
import clsx from 'clsx';
import { hapticFeedback } from '../utils/telegram';

const NavItem = ({ icon: Icon, label, id, activeTab, onTabChange }) => (
  <button 
    onClick={() => {
      onTabChange(id);
      hapticFeedback('light');
    }}
    className={clsx(
      "flex flex-col items-center gap-1 p-2 transition-colors",
      activeTab === id ? "text-shark-cyan" : "text-gray-400 hover:text-text"
    )}
  >
    <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
    <span className="text-[10px] font-medium">{label}</span>
  </button>
);

const Navigation = ({ activeTab, onTabChange, t, onLogoClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface backdrop-blur-md border-t border-border pb-6 pt-4 px-6 flex justify-between items-center z-50 rounded-t-2xl">
      <NavItem icon={Home} label={t('nav.market')} id="Market" activeTab={activeTab} onTabChange={onTabChange} />
      <NavItem icon={Bell} label={t('nav.alerts')} id="Alerts" activeTab={activeTab} onTabChange={onTabChange} />
      
      {/* Hidden trigger on Analytics icon for Admin Panel */}
      <div onDoubleClick={onLogoClick} className="select-none">
        <NavItem icon={BarChart3} label={t('nav.analytics')} id="Analytics" activeTab={activeTab} onTabChange={onTabChange} />
      </div>

      <NavItem icon={Settings} label={t('nav.settings')} id="Settings" activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default Navigation;
