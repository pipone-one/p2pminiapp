import React from 'react';
import { User, Shield, ChevronRight, Globe, Bell, HelpCircle, LogOut } from 'lucide-react';

const SettingsItem = ({ icon: Icon, label, value, color = "text-white" }) => (
  <button className="w-full flex items-center justify-between p-4 bg-surface backdrop-blur-md border border-white/5 rounded-2xl mb-2 hover:bg-white/5 transition-colors">
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
  </button>
);

const SettingsScreen = () => {
  return (
    <div className="pt-6 px-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      {/* Profile Section */}
      <div className="flex items-center gap-4 mb-8 p-4 bg-surface backdrop-blur-md rounded-2xl border border-white/5">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-shark-cyan to-blue-600 flex items-center justify-center text-2xl font-bold text-black">
          VG
        </div>
        <div>
          <h2 className="text-xl font-bold">Vladislav</h2>
          <p className="text-sm text-gray-400">Pro Plan • Expires in 12 days</p>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-2">General</h3>
          <SettingsItem icon={Globe} label="Currency" value="UAH (₴)" />
          <SettingsItem icon={Bell} label="Notifications" value="On" />
          <SettingsItem icon={Shield} label="Security" />
        </div>

        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 ml-2">Support</h3>
          <SettingsItem icon={HelpCircle} label="Help Center" />
          <SettingsItem icon={User} label="Contact Support" />
        </div>

        <div>
           <SettingsItem icon={LogOut} label="Log Out" color="text-red-500" />
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
