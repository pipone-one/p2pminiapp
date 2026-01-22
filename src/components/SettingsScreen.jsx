import React from 'react';
import { User, ChevronRight, Globe, Bell, Moon, Sun, ToggleLeft, ToggleRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsItem = ({ icon: Icon, label, value, color = "text-text", onClick, toggle }) => (
  <motion.button 
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-surface backdrop-blur-md border border-border rounded-2xl mb-2 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center text-gray-400">
        <Icon size={18} />
      </div>
      <span className={`font-medium ${color}`}>{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-sm text-gray-500">{value}</span>}
      {toggle ? toggle : <ChevronRight size={18} className="text-gray-600" />}
    </div>
  </motion.button>
);

const SectionHeader = ({ title }) => (
  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-2 mt-6">{title}</h3>
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
    <div className="pt-6 px-4 pb-20">
      <h1 className="text-3xl font-bold mb-6 text-text">{t('settings.title')}</h1>

      {/* Minimal Profile */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-6 p-4 bg-surface backdrop-blur-md rounded-2xl border border-border"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-shark-cyan to-blue-600 flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-shark-cyan/20">
          VG
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold text-text">Vladislav</h2>
            <span className="px-2 py-1 bg-shark-cyan/20 text-shark-cyan text-xs font-bold rounded-lg border border-shark-cyan/20">PRO</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">vladislav@shark.p2p</p>
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
            notifications ? 
            <ToggleRight size={24} className="text-green-500" /> : 
            <ToggleLeft size={24} className="text-gray-400" />
          }
        />
        
        <SectionHeader title={t('settings.account')} />
        <SettingsItem 
          icon={User} 
          label={t('settings.language')} 
          value={getLangLabel(language)} 
          onClick={toggleLanguage}
        />

        <div className="mt-8">
           <p className="text-center text-xs text-gray-500 mt-4">{t('settings.version')} 1.0.2 (Build 240)</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
