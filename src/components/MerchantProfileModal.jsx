import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck, Star, Clock, ThumbsUp, ExternalLink } from 'lucide-react';
import { openLink } from '../utils/telegram';
import { api } from '../services/api';

const MerchantProfileModal = ({ isOpen, onClose, merchant, t }) => {
  const [details, setDetails] = useState(merchant);

  useEffect(() => {
    if (merchant) {
      setDetails(merchant);
      const fetchDetails = async () => {
        const data = await api.getMerchantDetails(merchant.exchange, merchant.id);
        if (data) {
          setDetails(prev => ({ ...prev, ...data }));
        }
      };
      fetchDetails();
    }
  }, [merchant]);

  if (!details) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-2xl border-t border-white/10 rounded-t-[32px] z-[101] p-6 pb-12 max-h-[90vh] overflow-y-auto text-text shadow-2xl"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-5">
                 <div className="w-20 h-20 rounded-[24px] bg-gradient-to-br from-gray-800 to-black p-0.5 shadow-lg shadow-shark-cyan/20">
                   <div className="w-full h-full rounded-[22px] bg-[#1A1D24] flex items-center justify-center text-3xl font-black text-white relative overflow-hidden">
                     <div className="absolute inset-0 bg-gradient-to-br from-shark-cyan/20 to-transparent opacity-50" />
                     <span className="relative z-10">{details.name[0]}</span>
                   </div>
                 </div>
                 <div>
                   <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight text-text">
                     {details.name}
                     {details.verified && <ShieldCheck size={20} className="text-[#FCD535]" fill="#FCD535" fillOpacity={0.2} />}
                     {details.isPro && <ShieldCheck size={20} className="text-purple-500" fill="#a855f7" fillOpacity={0.2} />}
                   </h2>
                   <div className="flex items-center gap-2.5 mt-1">
                     <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-green-500/10 border border-green-500/20">
                       <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                       <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">{t('market.online')}</span>
                     </div>
                     <span className="text-xs font-bold text-text-secondary">{t('market.recently')}</span>
                   </div>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text transition-colors"
              >
                <X size={18} strokeWidth={2.5} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="glass-card p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-shark-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 text-text-secondary mb-1.5 relative z-10">
                  <Star size={14} className="text-shark-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('market.completion')}</span>
                </div>
                <div className="text-2xl font-black text-text relative z-10">{details.completion}%</div>
              </div>
              
              <div className="glass-card p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-shark-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 text-text-secondary mb-1.5 relative z-10">
                  <Clock size={14} className="text-shark-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('market.avg_time')}</span>
                </div>
                <div className="text-2xl font-black text-text relative z-10">{details.avgTime || '5 min'}</div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-shark-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 text-text-secondary mb-1.5 relative z-10">
                  <ThumbsUp size={14} className="text-shark-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('market.rating')}</span>
                </div>
                <div className="text-2xl font-black text-text relative z-10">{details.positive || '98%'}</div>
              </div>

              <div className="glass-card p-4 rounded-2xl border border-white/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-shark-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex items-center gap-2 text-text-secondary mb-1.5 relative z-10">
                  <ShieldCheck size={14} className="text-shark-cyan" />
                  <span className="text-[10px] font-black uppercase tracking-wider">{t('market.total_orders')}</span>
                </div>
                <div className="text-2xl font-black text-text relative z-10">{details.totalOrders || details.orders}</div>
              </div>
            </div>

            {/* Trading Terms */}
            <div className="mb-8">
              <h3 className="text-xs font-black text-text-secondary uppercase tracking-widest mb-3 ml-1">{t('market.terms')}</h3>
              <div className="text-sm font-medium text-text-secondary/80 leading-relaxed bg-black/5 dark:bg-white/5 p-5 rounded-2xl max-h-40 overflow-y-auto whitespace-pre-wrap border border-white/5">
                {details.terms || t('market.no_terms')}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-3 pb-8">
              <button 
                onClick={() => {
                  let url = '';
                  if (details.exchange === 'Binance') url = `https://p2p.binance.com/en/advertiserDetail?advertiserNo=${details.id}`;
                  else if (details.exchange === 'Bybit') url = `https://www.bybit.com/fiat/trade/otc/profile/${details.id}`;
                  else if (details.exchange === 'OKX') url = `https://www.okx.com/p2p/advertiser/${details.id}`;
                  else if (details.exchange === 'MEXC') url = `https://www.mexc.com`; 
                  
                  if (url) openLink(url);
                }}
                className="w-full py-4 bg-shark-cyan text-black font-black rounded-xl text-lg hover:bg-[#00D060] transition-all flex items-center justify-center gap-2 shadow-lg shadow-shark-cyan/20 active:scale-[0.98]"
              >
                {t('market.open_exchange')} <ExternalLink size={20} strokeWidth={2.5} />
              </button>
              
              <button className="w-full py-4 bg-red-500/10 text-red-500 font-black rounded-xl text-lg hover:bg-red-500/20 transition-all active:scale-[0.98]">
                {t('market.block_merchant')}
              </button>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MerchantProfileModal;
