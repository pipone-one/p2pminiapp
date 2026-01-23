import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, ShieldCheck, ExternalLink } from 'lucide-react';
import { openLink } from '../utils/telegram';
import clsx from 'clsx';

const OrderCard = ({ order, onClick, t, theme }) => {
  const { merchant, price, limit, crypto, available, paymentMethods, exchange, type } = order;

  const getBankColor = (method) => {
    const m = method.toLowerCase();
    if (m.includes('privat')) return 'bg-green-500/20 text-green-400 border-green-500/20';
    if (m.includes('mono')) return 'bg-pink-500/20 text-pink-400 border-pink-500/20';
    if (m.includes('pumb')) return 'bg-red-500/20 text-red-400 border-red-500/20';
    if (m.includes('oschad')) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
    if (m.includes('otp')) return 'bg-teal-500/20 text-teal-400 border-teal-500/20';
    if (m.includes('raiffeisen') || m.includes('aval')) return 'bg-yellow-400/20 text-yellow-400 border-yellow-400/20';
    if (m.includes('ukrsib')) return 'bg-lime-600/20 text-lime-400 border-lime-600/20';
    if (m.includes('universal')) return 'bg-blue-600/20 text-blue-400 border-blue-600/20';
    if (m.includes('wise')) return 'bg-lime-400/20 text-lime-400 border-lime-400/20';
    if (m.includes('revolut')) return 'bg-sky-500/20 text-sky-400 border-sky-500/20';
    if (m.includes('paypal')) return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/20';
    if (m.includes('sepa')) return 'bg-blue-400/20 text-blue-400 border-blue-400/20';
    if (m.includes('geopay')) return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/20';
    if (m.includes('a-bank') || m.includes('abank')) return 'bg-orange-500/20 text-orange-400 border-orange-500/20';
    if (m.includes('sense') || m.includes('alfa')) return 'bg-red-600/20 text-red-400 border-red-600/20';
    if (m.includes('izi')) return 'bg-yellow-300/20 text-yellow-300 border-yellow-300/20';
    if (m.includes('sport')) return 'bg-orange-600/20 text-orange-400 border-orange-600/20';
    if (m.includes('neo')) return 'bg-purple-500/20 text-purple-400 border-purple-500/20';
    
    return 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-white/5';
  };

  const handleBuyClick = (e) => {
    e.stopPropagation();
    let url = '';
    if (exchange === 'Binance') url = `https://p2p.binance.com/en/advertiserDetail?advertiserNo=${merchant.id}`;
    else if (exchange === 'Bybit') url = `https://www.bybit.com/fiat/trade/otc/profile/${merchant.id}`;
    else if (exchange === 'OKX') url = `https://www.okx.com/p2p/advertiser/${merchant.id}`;
    else if (exchange === 'MEXC') url = `https://otc.mexc.com/merchant/${merchant.id}`; // Best effort for MEXC


    if (url) openLink(url);
  };

  return (
    <motion.div
      whileTap={{ scale: 0.98 }}
      onClick={() => onClick(order)}
      className="bg-surface rounded-[16px] p-3 mb-1.5 border border-border relative overflow-hidden shadow-sm"
    >
      {/* Top Row: Price & Button */}
      <div className="flex justify-between items-start mb-1.5">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-yellow-600 dark:text-[#FCD535] tracking-tight">{price}</span>
            <span className="text-[10px] font-bold text-gray-500">UAH</span>
          </div>
          <div className="text-[10px] text-gray-400 mt-0.5 font-medium">
             {t('market.avail')}: <span className="text-text">{available ? Number(available).toLocaleString() : '---'} {crypto}</span>
          </div>
        </div>
        
        <button 
          onClick={handleBuyClick}
          className={`px-2.5 py-1 rounded-md text-xs font-bold flex items-center gap-1 transition-transform active:scale-95 shadow-md ${type === 'buy' ? 'bg-green-500 text-white hover:bg-green-600 shadow-green-500/20' : 'bg-red-500 text-white hover:bg-red-600 shadow-red-500/20'}`}
        >
          {type === 'buy' ? t('market.buy') : t('market.sell')} <ExternalLink size={12} strokeWidth={3} />
        </button>
      </div>

      {/* Limits */}
      <div className="mb-1.5">
        <div className="text-[8px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{t('market.limits')}</div>
        <div className="text-xs font-bold text-text tracking-wide">{limit} UAH</div>
      </div>

      {/* Divider */}
      <div className="h-px bg-border w-full my-2" />

      {/* Footer: Merchant & Payments */}
      <div className="flex justify-between items-center">
         {/* Merchant Info */}
         <div className="flex items-center gap-1.5">
            <div className="relative">
               <div className="w-7 h-7 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center text-[10px] font-bold text-gray-700 dark:text-white border border-border">
                  {merchant.name[0]}
               </div>
               {merchant.verified && (
                 <div className="absolute -bottom-1 -right-1 bg-surface rounded-full p-0.5">
                   <BadgeCheck className="text-yellow-400 fill-yellow-400/20" size={10} />
                 </div>
               )}
            </div>
            <div>
               <div className="text-[11px] font-bold text-text flex items-center gap-0.5">
                 {merchant.name}
                 {merchant.isPro && <ShieldCheck size={10} className="text-purple-400" />}
               </div>
               <div className="text-[9px] text-gray-500 font-medium leading-none">
                 {merchant.orders} {t('market.orders_abbrev')} <span className="mx-0.5">|</span> {merchant.completion}%
               </div>
            </div>
         </div>

         {/* Payment Badges */}
         <div className="flex gap-1">
            {paymentMethods.slice(0, 2).map((method, i) => (
              <div key={i} className={`px-1.5 py-[1px] rounded text-[8px] font-bold uppercase tracking-wide border flex items-center ${getBankColor(method)}`}>
                 {method}
              </div>
            ))}
            {paymentMethods.length > 2 && (
               <div className="px-1.5 py-[1px] rounded text-[8px] font-bold bg-gray-100 dark:bg-white/5 text-gray-500 border border-gray-200 dark:border-white/5 flex items-center">
                 +{paymentMethods.length - 2}
              </div>
            )}
         </div>
      </div>
    </motion.div>
  );
};

export default OrderCard;
