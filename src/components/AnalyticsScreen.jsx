import React from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const AnalyticsScreen = () => {
  return (
    <div className="pt-6 px-4 pb-20">
      <h1 className="text-3xl font-bold mb-6">Market Analysis</h1>

      {/* Spread Card */}
      <div className="bg-surface backdrop-blur-md border border-white/5 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-shark-cyan" />
            Best Spreads
          </h2>
          <span className="text-xs text-gray-400">Live</span>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-bold">Binance</span>
              <ArrowUpRight size={14} className="text-gray-500" />
              <span className="font-bold">Bybit</span>
            </div>
            <div className="text-right">
              <div className="text-soft-gold font-bold">+1.2%</div>
              <div className="text-xs text-gray-500">USDT/UAH</div>
            </div>
          </div>

          <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-bold">OKX</span>
              <ArrowUpRight size={14} className="text-gray-500" />
              <span className="font-bold">Binance</span>
            </div>
            <div className="text-right">
              <div className="text-soft-gold font-bold">+0.8%</div>
              <div className="text-xs text-gray-500">USDT/UAH</div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-surface backdrop-blur-md border border-white/5 rounded-2xl p-4 h-64 flex flex-col items-center justify-center text-gray-500">
        <BarChart3 size={48} className="mb-2 opacity-50" />
        <span className="text-sm">Price History Chart</span>
        <span className="text-xs text-gray-600 mt-1">Coming soon</span>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
