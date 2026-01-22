import React, { useState } from 'react';
import { User, Shield, ChevronRight, Globe, Bell, HelpCircle, LogOut, Wallet, Banknote, Scale, HeadphonesIcon, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const SettingsItem = ({ icon: Icon, label, value, color = "text-white", onClick }) => (
  <motion.button 
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 bg-surface backdrop-blur-md border border-white/5 rounded-2xl mb-2 hover:bg-white/5 transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-gray-400">
        <Icon size={18} />
      </div>
      <span className={`font-medium ${color}`}>{label}</span>
    </div>
    <div className="flex items-center gap-2">
      {value && <span className="text-sm text-gray-500">{value}</span>}
      <ChevronRight size={18} className="text-gray-600" />
    </div>
  </motion.button>
);

const SectionHeader = ({ title }) => (
  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-2 mt-6">{title}</h3>
);

const SettingsScreen = () => {
  const [currency, setCurrency] = useState('UAH (₴)');
  
  return (
    <div className="pt-6 px-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Profile Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 mb-2 p-4 bg-surface backdrop-blur-md rounded-2xl border border-white/5"
      >
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-shark-cyan to-blue-600 flex items-center justify-center text-2xl font-bold text-black shadow-lg shadow-shark-cyan/20">
          VG
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h2 className="text-xl font-bold">Vladislav</h2>
            <span className="px-2 py-1 bg-shark-cyan/20 text-shark-cyan text-xs font-bold rounded-lg border border-shark-cyan/20">PRO</span>
          </div>
          <p className="text-sm text-gray-400 mt-1">vladislav@shark.p2p</p>
        </div>
      </motion.div>
      
      <div className="mb-6 px-2 flex gap-4 text-sm text-gray-500">
        <span>ID: 849204</span>
        <span>•</span>
        <span className="text-green-400">Verified</span>
      </div>

      <div className="space-y-1">
        <SectionHeader title="General" />
        <SettingsItem icon={Globe} label="Fiat Currency" value={currency} onClick={() => {}} />
        <SettingsItem icon={Bell} label="Notifications" value="On" />
        <SettingsItem icon={Shield} label="Security" value="2FA Enabled" />

        <SectionHeader title="Trading" />
        <SettingsItem icon={Scale} label="Limits" value="Level 2" />
        <SettingsItem icon={Banknote} label="Payment Methods" value="3 Added" />
        <SettingsItem icon={Wallet} label="Connected Wallets" value="2 Active" />

        <SectionHeader title="Support" />
        <SettingsItem icon={HeadphonesIcon} label="Technical Support" />
        <SettingsItem icon={HelpCircle} label="Help Center" />
        <SettingsItem icon={AlertCircle} label="Report Issue" />

        <div className="mt-8">
           <SettingsItem icon={LogOut} label="Log Out" color="text-red-500" />
           <p className="text-center text-xs text-gray-600 mt-4">Version 1.0.2 (Build 240)</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
