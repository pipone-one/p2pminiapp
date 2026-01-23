import React from 'react';
import { User, ChevronRight, Globe, Bell, Moon, Sun, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsItem = ({ icon: Icon, label, value, color = "text-text", onClick, toggle }) => (
  <motion.button 
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 glass-card rounded-2xl mb-3 group relative overflow-hidden"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-shark-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
    <div className="flex items-center gap-3 relative z-10">
      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 dark:from-white/10 dark:to-white/5 flex items-center justify-center text-text-secondary group-hover:text-shark-cyan transition-colors shadow-inner">
        <Icon size={20} strokeWidth={2} />
      </div>
      <span className={`font-bold text-base tracking-tight ${color}`}>{label}</span>
    </div>
    <div className="flex items-center gap-2 relative z-10">
      {value && <span className="text-sm font-medium text-text-secondary bg-black/5 dark:bg-white/10 px-2 py-1 rounded-lg">{value}</span>}
      {toggle ? toggle : <ChevronRight size={18} className="text-text-secondary group-hover:text-shark-cyan transition-colors" />}
    </div>
  </motion.button>
);

const SectionHeader = ({ title }) => (
  <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3 ml-2 mt-8 opacity-70">{title}</h3>
);

const SettingsScreen = ({ theme, toggleTheme, language, setLanguage, notifications, setNotifications, t }) => {
  const toggleLanguage = () => {
    const langs = ['en', 'ru', 'ua'];
    const nextIndex = (langs.indexOf(language) + 1) % langs.length;
    setLanguage(langs[nextIndex]);
  };

  const getLangLabel = (lang) => {
    switch(lang) {
      case 'en': return 'English';
      case 'ru': return 'Русский';
      case 'ua': return 'Українська';
      default: return 'English';
    }
  };
  
  return (
    <div className="pt-8 px-4 pb-24 relative min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-tight">{t('settings.title')}</h1>
      </div>

      {/* Minimal Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-5 mb-8 p-5 glass-card rounded-[24px] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-shark-cyan/10 via-transparent to-primary/5 opacity-50" />
        <div className="relative z-10 w-16 h-16 rounded-2xl bg-gradient-to-br from-shark-cyan to-primary flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-shark-cyan/20 ring-4 ring-white/10">
          VG
        </div>
        <div className="flex-1 relative z-10">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-black text-text tracking-tight">Vladislav</h2>
            <span className="px-2.5 py-1 bg-gradient-to-r from-shark-cyan to-primary text-white text-[10px] font-black uppercase tracking-wider rounded-lg shadow-lg shadow-shark-cyan/20">PRO</span>
          </div>
          <p className="text-sm text-text-secondary font-medium mt-1">vladislav@shark.p2p</p>
        </div>
      </motion.div>
      
      <div className="space-y-1">
        <SectionHeader title={t('settings.app_settings')} />
        
        <SettingsItem 
          icon={theme === 'dark' ? Moon : Sun} 
          label={t('settings.theme')}
          value={theme === 'dark' ? t('settings.dark') : t('settings.light')}
          onClick={toggleTheme}
        />
        
        <SettingsItem icon={Globe} label={t('settings.currency')} value="UAH (₴)" onClick={() => {}} />
        
        <SettingsItem 
          icon={Bell} 
          label={t('settings.notifications')} 
          value={notifications ? t('settings.on') : t('settings.off')}
          onClick={() => setNotifications(!notifications)}
          toggle={
            <div className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${notifications ? 'bg-shark-cyan' : 'bg-gray-200 dark:bg-white/10'}`}>
              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${notifications ? 'translate-x-5' : 'translate-x-0'}`} />
            </div>
          }
        />
        
        <SectionHeader title={t('settings.account')} />
        <SettingsItem 
          icon={User} 
          label={t('settings.language')} 
          value={getLangLabel(language)} 
          onClick={toggleLanguage}
        />

        <div className="mt-12 flex flex-col items-center">
           <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center mb-3">
             <div className="w-6 h-6 rounded-full bg-shark-cyan/20 flex items-center justify-center">
               <div className="w-3 h-3 rounded-full bg-shark-cyan animate-pulse" />
             </div>
           </div>
           <p className="text-center text-xs font-bold text-text-secondary uppercase tracking-widest opacity-50">Shark P2P • v1.0.2 (Build 240)</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
