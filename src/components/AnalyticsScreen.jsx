import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, ArrowUpRight, RefreshCw, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';

const AnalyticsScreen = ({ theme, t }) => {
  const [spreads, setSpreads] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [minProfit, setMinProfit] = useState('0');
  const [minAmount, setMinAmount] = useState('1000');

  const EXCHANGE_STYLES = {
    Binance: { color: theme === 'light' ? '#D97706' : '#FCD535' },
    Bybit: { color: theme === 'light' ? '#D97706' : '#FFB119' },
    OKX: { color: theme === 'light' ? '#000000' : '#FFFFFF' },
    MEXC: { color: '#2B70FF' }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await api.getSpreads(Number(minAmount) || 1000);
      setSpreads(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySettings = () => {
    setShowSettings(false);
    fetchData();
  };

  const filteredSpreads = spreads.filter(s => parseFloat(s.profit) >= (parseFloat(minProfit) || 0));

  return (
    <div className="pt-6 px-4 pb-20 relative">
      <div className="flex justify-between items-center mb-6">
         <h1 className="text-3xl font-bold">{t('analytics.title')}</h1>
         <div className="flex gap-2">
           <button 
             onClick={() => setShowSettings(true)}
             className="p-2 rounded-full bg-surface border border-border hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
           >
             <SlidersHorizontal size={20} />
           </button>
           <button 
             onClick={fetchData} 
             className="p-2 rounded-full bg-surface border border-border hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
           >
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
         </div>
      </div>

      {/* Spread Card */}
      <div className="glass-card rounded-2xl p-4 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp size={20} className="text-shark-cyan" />
            {t('analytics.best_spreads')}
          </h2>
          <span className="text-xs text-green-400 flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            {t('analytics.live')}
          </span>
        </div>
        
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-8 text-text-secondary animate-pulse">{t('analytics.scanning')}</div>
          ) : filteredSpreads.length > 0 ? (
            filteredSpreads.map(spread => (
              <div key={spread.id} className="flex justify-between items-center p-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <div className="flex items-center gap-2 text-sm font-black mb-1">
                    <span style={{ color: EXCHANGE_STYLES[spread.buyExchange]?.color || 'var(--text)' }}>{spread.buyExchange}</span>
                    <ArrowUpRight size={14} className="text-text-secondary" />
                    <span style={{ color: EXCHANGE_STYLES[spread.sellExchange]?.color || 'var(--text)' }}>{spread.sellExchange}</span>
                  </div>
                  <div className="text-xs text-text-secondary font-medium">
                     <span className="text-green-500">{t('market.buy')}:</span> {spread.buyPrice} • <span className="text-red-500">{t('market.sell')}:</span> {spread.sellPrice}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-shark-cyan font-black text-xl drop-shadow-[0_0_8px_rgba(0,229,106,0.3)]">{spread.profit}</div>
                  <div className="text-[10px] text-text-secondary uppercase font-bold tracking-wider">{spread.pair}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-gray-500 text-sm">
              {t('analytics.no_spreads')}
            </div>
          )}
        </div>
      </div>

      {/* Chart Placeholder */}
      <div className="bg-surface backdrop-blur-md border border-border rounded-2xl p-4 h-64 flex flex-col items-center justify-center text-gray-500 shadow-sm">
        <BarChart3 size={48} className="mb-2 opacity-50" />
        <span className="text-sm">{t('analytics.volume_analysis')}</span>
        <span className="text-xs text-gray-600 mt-1">{t('analytics.coming_soon')}</span>
      </div>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              onClick={() => setShowSettings(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-[32px] z-[101] px-5 pt-5 pb-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-text">{t('analytics.settings_title')}</h2>
                <button 
                  onClick={() => setShowSettings(false)}
                  className="w-8 h-8 rounded-full bg-surface border border-border flex items-center justify-center text-gray-500"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">{t('analytics.min_profit')}</label>
                  <input 
                    type="number" 
                    value={minProfit}
                    onChange={(e) => setMinProfit(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text focus:border-[#FCD535] focus:outline-none"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-gray-500 mb-1 block">{t('analytics.min_amount')}</label>
                  <input 
                    type="number" 
                    value={minAmount}
                    onChange={(e) => setMinAmount(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-text focus:border-[#FCD535] focus:outline-none"
                    placeholder="1000"
                  />
                </div>

                <button 
                  onClick={handleApplySettings}
                  className="w-full py-3 bg-[#FCD535] text-black font-bold rounded-xl text-base hover:bg-[#e0bc2e] transition-colors mt-2"
                >
                  {t('analytics.apply')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AnalyticsScreen;
