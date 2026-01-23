import React from 'react';
import { Home, Bell, BarChart3, User, Settings } from 'lucide-react';
import clsx from 'clsx';
import { hapticFeedback } from '../utils/telegram';

const NavItem = ({ icon: Icon, label, id, activeTab, onTabChange }) => {
  const isActive = activeTab === id;
  return (
    <button 
      onClick={() => {
        onTabChange(id);
        hapticFeedback('light');
      }}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-1.5 p-2 transition-all duration-300 w-16",
        isActive ? "text-shark-cyan" : "text-text-secondary hover:text-text"
      )}
    >
      {/* Glow effect for active tab */}
      {isActive && (
        <div className="absolute inset-0 bg-shark-cyan/10 blur-xl rounded-full" />
      )}
      
      <div className={clsx(
        "relative transition-transform duration-300",
        isActive && "scale-110 drop-shadow-[0_0_8px_rgba(0,229,106,0.5)]"
      )}>
        <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
      </div>
      
      <span className={clsx(
        "text-[10px] font-semibold tracking-wide transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-70"
      )}>
        {label}
      </span>
    </button>
  );
};

const Navigation = ({ activeTab, onTabChange, t, onLogoClick }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
      <div className="bg-surface/90 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40 rounded-3xl px-2 py-3 flex justify-around items-center pointer-events-auto max-w-md mx-auto">
        <NavItem icon={Home} label={t('nav.market')} id="Market" activeTab={activeTab} onTabChange={onTabChange} />
        <NavItem icon={Bell} label={t('nav.alerts')} id="Alerts" activeTab={activeTab} onTabChange={onTabChange} />
        
        {/* Hidden trigger on Analytics icon for Admin Panel */}
        <div onClick={onLogoClick} className="select-none">
          <NavItem icon={BarChart3} label={t('nav.analytics')} id="Analytics" activeTab={activeTab} onTabChange={onTabChange} />
        </div>

        <NavItem icon={Settings} label={t('nav.settings')} id="Settings" activeTab={activeTab} onTabChange={onTabChange} />
      </div>
    </div>
  );
};

export default Navigation;
