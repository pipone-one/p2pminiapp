import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, RefreshCw } from 'lucide-react';
import { api } from '../services/api';

const AnalyticsScreen = () => {
  const [spreads, setSpreads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getSpreads();
      setSpreads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-6 px-4 pb-20">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">Analytics</h1>
         <button onClick={fetchData} className="p-2 rounded-full bg-white/5 hover:bg-white/10">
           <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
         </button>
      </div>

      {/* Spread Card */}
      <div className="bg-surface backdrop-blur-md border border-white/5 rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-shark-cyan" />
            Best Spreads
          </h2>
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Live
          </span>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Scanning markets...</div>
          ) : (
            spreads.map(spread => (
              <div key={spread.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                <div>
                  <div className="flex items-center gap-2 text-sm font-bold mb-1">
                    <span className="text-white">{spread.buyExchange}</span>
                    <ArrowUpRight size={14} className="text-gray-500" />
                    <span className="text-white">{spread.sellExchange}</span>
                  </div>
                  <div className="text-xs text-gray-400">
                     Buy: {spread.buyPrice} • Sell: {spread.sellPrice}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-soft-gold font-bold text-lg">{spread.profit}</div>
                  <div className="text-[10px] text-gray-500 uppercase">{spread.pair}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-surface backdrop-blur-md border border-white/5 rounded-2xl p-4 h-64 flex flex-col items-center justify-center text-gray-500">
        <BarChart3 size={48} className="mb-2 opacity-50" />
        <span className="text-sm">Volume Analysis</span>
        <span className="text-xs text-gray-600 mt-1">Coming in Pro version</span>
      </div>
    </div>
  );
};

export default AnalyticsScreen;
