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
            className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-[32px] z-[101] p-6 pb-12 max-h-[90vh] overflow-y-auto text-text"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                 <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-2xl font-bold text-white border-2 border-shark-cyan">
                    {details.name[0]}
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold flex items-center gap-2">
                     {details.name}
                     {details.verified && <ShieldCheck size={20} className="text-yellow-400" />}
                     {details.isPro && <ShieldCheck size={20} className="text-purple-400" />}
                   </h2>
                   <div className="flex items-center gap-2 text-sm text-gray-500">
                     <span className="text-green-400">{t('market.online')}</span>
                     <span>•</span>
                     <span>{t('market.recently')} {details.registeredDays ? `${details.registeredDays} ${t('market.days')}` : ''}</span>
                   </div>
                 </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-surface p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Star size={14} />
                  <span className="text-xs">{t('market.completion')}</span>
                </div>
                <div className="text-xl font-bold">{details.completion}%</div>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Clock size={14} />
                  <span className="text-xs">{t('market.avg_time')}</span>
                </div>
                <div className="text-xl font-bold">{details.avgTime || '5 min'}</div>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ThumbsUp size={14} />
                  <span className="text-xs">{t('market.rating')}</span>
                </div>
                <div className="text-xl font-bold">{details.positive || '98%'}</div>
              </div>
              <div className="bg-surface p-4 rounded-2xl border border-border">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <ShieldCheck size={14} />
                  <span className="text-xs">{t('market.total_orders')}</span>
                </div>
                <div className="text-xl font-bold">{details.totalOrders || details.orders}</div>
              </div>
            </div>

            {/* Trading Terms */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-3">{t('market.terms')}</h3>
              <div className="text-sm text-gray-500 leading-relaxed bg-black/5 dark:bg-white/5 p-4 rounded-xl max-h-40 overflow-y-auto whitespace-pre-wrap">
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
                  else if (details.exchange === 'MEXC') url = `https://www.mexc.com`; // MEXC profile links are tricky
                  
                  if (url) openLink(url);
                }}
                className="w-full py-4 bg-shark-cyan text-black font-bold rounded-xl text-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2"
              >
                {t('market.open_exchange')} <ExternalLink size={20} />
              </button>
              
              <button className="w-full py-4 bg-red-500/10 text-red-500 font-bold rounded-xl text-lg hover:bg-red-500/20 transition-colors">
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
