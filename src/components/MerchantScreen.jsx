import React from 'react';
import { User, ShieldCheck, List, Clock, CheckCircle2 } from 'lucide-react';

const MerchantScreen = () => {
  return (
    <div className="pt-6 px-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">Merchant Profile</h1>

      {/* User Info */}
      <div className="bg-surface backdrop-blur-md border border-white/5 rounded-2xl p-6 mb-6 text-center">
        <div className="w-24 h-24 mx-auto bg-gradient-to-br from-shark-cyan to-blue-600 rounded-full flex items-center justify-center text-4xl font-bold text-black mb-4 border-4 border-white/10">
          VG
        </div>
        <h2 className="text-2xl font-bold flex items-center justify-center gap-2">
          Vladislav
          <ShieldCheck className="text-shark-cyan" size={24} />
        </h2>
        <p className="text-gray-400 mt-1">Verified Merchant</p>
        
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center">
             <div className="text-xl font-bold text-white">125</div>
             <div className="text-xs text-gray-500">Orders</div>
          </div>
          <div className="text-center">
             <div className="text-xl font-bold text-white">98%</div>
             <div className="text-xs text-gray-500">Completion</div>
          </div>
          <div className="text-center">
             <div className="text-xl font-bold text-white">15m</div>
             <div className="text-xs text-gray-500">Avg. Time</div>
          </div>
        </div>
      </div>

      {/* My Ads Section */}
      <h3 className="text-lg font-bold mb-4">My Ads</h3>
      <div className="space-y-3">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-shark-cyan">BUY</span>
              <span className="text-gray-400">USDT</span>
            </div>
            <div className="text-2xl font-bold">40.05 <span className="text-sm text-gray-500 font-normal">UAH</span></div>
            <div className="text-xs text-gray-500 mt-1">Limit: 1,000 - 50,000 UAH</div>
          </div>
          <div className="flex flex-col gap-2">
             <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-lg text-center">Active</span>
             <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
               <List size={16} />
             </button>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 border border-white/5 flex justify-between items-center opacity-75">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-red-400">SELL</span>
              <span className="text-gray-400">BTC</span>
            </div>
            <div className="text-2xl font-bold">1,650,000 <span className="text-sm text-gray-500 font-normal">UAH</span></div>
            <div className="text-xs text-gray-500 mt-1">Limit: 10,000 - 100,000 UAH</div>
          </div>
          <div className="flex flex-col gap-2">
             <span className="px-3 py-1 bg-gray-500/20 text-gray-400 text-xs font-bold rounded-lg text-center">Offline</span>
             <button className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
               <List size={16} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MerchantScreen;
