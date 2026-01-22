import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, RefreshCw, Filter, Search } from 'lucide-react';
import OrderCard from './OrderCard';
import MerchantProfileModal from './MerchantProfileModal';
import { api } from '../services/api';
import { hapticFeedback } from '../utils/telegram';

const EXCHANGES = ['Binance', 'Bybit', 'OKX', 'MEXC'];
const CRYPTOS = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];

// Skeleton Loader Component
const SkeletonCard = () => (
  <div className="bg-surface backdrop-blur-md rounded-2xl p-4 border border-white/5 mb-3 animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="space-y-1">
          <div className="w-20 h-3 bg-white/10 rounded" />
          <div className="w-16 h-2 bg-white/10 rounded" />
        </div>
      </div>
      <div className="w-24 h-6 bg-white/10 rounded" />
    </div>
    <div className="flex justify-between items-end">
      <div className="space-y-2">
        <div className="w-32 h-3 bg-white/10 rounded" />
        <div className="flex gap-2">
          <div className="w-16 h-4 bg-white/10 rounded" />
          <div className="w-16 h-4 bg-white/10 rounded" />
        </div>
      </div>
      <div className="w-24 h-8 bg-white/10 rounded-xl" />
    </div>
  </div>
);

const MarketScreen = ({ theme, t }) => {
  const [activeTab, setActiveTab] = useState('buy'); // buy | sell
  const [activeCrypto, setActiveCrypto] = useState('USDT');
  const [activeExchange, setActiveExchange] = useState('Binance');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  
  // Filter States
  const [showExchangeSelector, setShowExchangeSelector] = useState(false);
  const [showAmountModal, setShowAmountModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCryptoModal, setShowCryptoModal] = useState(false);
  
  const [filterAmountFrom, setFilterAmountFrom] = useState('');
  const [filterAmountTo, setFilterAmountTo] = useState('');
  const [filterPayment, setFilterPayment] = useState(null);

  const PRESET_AMOUNTS = [100, 500, 1000, 2000, 5000, 10000, 20000, 50000];
  const BANK_LIST = [
    'PrivatBank', 'Monobank', 'PUMB', 'Oschadbank', 'OTP Bank',
    'Raiffeisen Bank', 'UKRSIBBANK', 'Universal Bank', 'A-Bank',
    'Sense Bank', 'izibank', 'Sportbank', 'NEOBANK', 'Wise', 
    'Revolut', 'PayPal', 'Sepa', 'GeoPay'
  ];

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let data = await api.getOrders({ 
        type: activeTab, 
        crypto: activeCrypto,
        exchange: activeExchange,
        amount: filterAmountFrom,
        paymentMethod: filterPayment
      });

      if (filterAmountTo) {
        const maxAmount = parseFloat(filterAmountTo);
        data = data.filter(order => order.maxLimit >= maxAmount);
      }

      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, activeCrypto, activeExchange, filterAmountFrom, filterAmountTo, filterPayment]);

  const handleRefresh = () => {
    hapticFeedback('medium');
    fetchOrders();
  };

  const EXCHANGE_STYLES = {
    Binance: { color: '#FCD535' },
    Bybit: { color: '#FFB119' },
    OKX: { color: theme === 'light' ? '#000000' : '#FFFFFF' },
    MEXC: { color: '#2B70FF' }
  };

  return (
    <div className="pt-2 px-4 pb-20 relative">
      {/* Top Header with Exchange Selector */}
      <div className="flex justify-between items-center mb-4 pt-2">
        <div className="relative">
          <button 
            onClick={() => { setShowExchangeSelector(!showExchangeSelector); hapticFeedback('light'); }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all active:scale-95"
            style={{ 
              borderColor: EXCHANGE_STYLES[activeExchange].color,
              color: EXCHANGE_STYLES[activeExchange].color,
              backgroundColor: `${EXCHANGE_STYLES[activeExchange].color}10`
            }}
          >
            <span className="font-bold text-sm tracking-wide">{activeExchange}</span>
            <ChevronDown size={16} className={`transition-transform duration-300 ${showExchangeSelector ? 'rotate-180' : ''}`} />
          </button>

          {/* Exchange Selector Dropdown */}
          {showExchangeSelector && (
            <>
               <div className="fixed inset-0 z-40" onClick={() => setShowExchangeSelector(false)} />
               <motion.div 
                 initial={{ opacity: 0, y: -10, scale: 0.95 }}
                 animate={{ opacity: 1, y: 0, scale: 1 }}
                 className="absolute top-full mt-2 left-0 z-50 bg-surface border border-white/10 rounded-2xl p-2 shadow-2xl min-w-[160px] overflow-hidden backdrop-blur-xl"
               >
                 {EXCHANGES.map(ex => (
                   <button
                     key={ex}
                     onClick={() => {
                       setActiveExchange(ex);
                       setShowExchangeSelector(false);
                       hapticFeedback('medium');
                     }}
                     className={`w-full text-left px-4 py-3 rounded-xl font-bold transition-all flex items-center justify-between mb-1 last:mb-0 ${
                       activeExchange === ex ? 'bg-white/10' : 'hover:bg-white/5'
                     }`}
                     style={{ color: EXCHANGE_STYLES[ex].color }}
                   >
                     {ex}
                     {activeExchange === ex && (
                       <div 
                         className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]"
                         style={{ backgroundColor: EXCHANGE_STYLES[ex].color }} 
                       />
                     )}
                   </button>
                 ))}
               </motion.div>
            </>
          )}
        </div>

        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/5 dark:bg-white/5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10 transition-colors border border-black/5 dark:border-white/5">
          UAH <ChevronDown size={14} />
        </button>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-6 mb-4 text-lg font-bold">
        <button 
          onClick={() => { setActiveTab('buy'); hapticFeedback('light'); }}
          className={`transition-colors relative pb-1 ${activeTab === 'buy' ? 'text-green-500' : 'text-gray-500'}`}
        >
          {t('market.buy')}
          {activeTab === 'buy' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 shadow-[0_0_10px_#22c55e]" />}
        </button>
        <button 
          onClick={() => { setActiveTab('sell'); hapticFeedback('light'); }}
          className={`transition-colors relative pb-1 ${activeTab === 'sell' ? 'text-red-500' : 'text-gray-500'}`}
        >
          {t('market.sell')}
          {activeTab === 'sell' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500 shadow-[0_0_10px_#ef4444]" />}
        </button>
      </div>



      {/* Filters Row (Amount & Payment) */}
      <div className="flex justify-between items-center mb-4 gap-2 relative z-30">
        <div className="flex gap-2 flex-wrap flex-1">
           {/* Amount Filter Button */}
           <div className="relative">
             <button 
               onClick={() => { setShowAmountModal(!showAmountModal); setShowPaymentModal(false); hapticFeedback('light'); }}
               className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border flex items-center gap-1 whitespace-nowrap ${filterAmountFrom || filterAmountTo ? 'text-shark-cyan bg-shark-cyan/10 border-shark-cyan/50' : 'text-gray-500 dark:text-gray-300 border-border bg-surface'}`}
             >
               {filterAmountFrom ? `${filterAmountFrom}${filterAmountTo ? '-' + filterAmountTo : ''} ₴` : t('market.amount')}
               <ChevronDown size={12} />
             </button>
             
             {/* Amount Dropdown */}
             {showAmountModal && (
               <>
                 <div className="fixed inset-0 z-30" onClick={() => setShowAmountModal(false)} />
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="absolute top-full mt-2 left-0 z-40 bg-surface border border-border rounded-xl p-4 shadow-xl min-w-[280px]"
                 >
                   <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-bold uppercase">{t('market.currency_uah')}</div>
                   <div className="flex gap-2 mb-3">
                     <input 
                       type="number" 
                       placeholder={t('market.amount_from')}
                       value={filterAmountFrom}
                       onChange={(e) => setFilterAmountFrom(e.target.value)}
                       className="w-full bg-black/5 dark:bg-black/20 border border-border rounded-lg px-3 py-2 text-text focus:border-shark-cyan outline-none text-sm placeholder:text-gray-400"
                     />
                     <input 
                       type="number" 
                       placeholder={t('market.amount_to')}
                       value={filterAmountTo}
                       onChange={(e) => setFilterAmountTo(e.target.value)}
                       className="w-full bg-black/5 dark:bg-black/20 border border-border rounded-lg px-3 py-2 text-text focus:border-shark-cyan outline-none text-sm placeholder:text-gray-400"
                     />
                   </div>
                   
                   <div className="grid grid-cols-4 gap-2 mb-3">
                      {PRESET_AMOUNTS.map(amount => (
                        <button
                          key={amount}
                          onClick={() => setFilterAmountFrom(amount.toString())}
                          className={`px-1 py-1.5 rounded text-[10px] font-bold transition-colors ${filterAmountFrom === amount.toString() ? 'bg-shark-cyan text-black' : 'bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-black/10 dark:hover:bg-white/10'}`}
                        >
                          {amount >= 1000 ? `${amount/1000}k` : amount}
                        </button>
                      ))}
                   </div>

                   <div className="flex gap-2">
                     <button 
                        onClick={() => { setFilterAmountFrom(''); setFilterAmountTo(''); setShowAmountModal(false); }}
                        className="flex-1 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-text"
                     >
                       {t('market.reset_filter')}
                     </button>
                     <button 
                        onClick={() => { setShowAmountModal(false); fetchOrders(); }}
                        className="flex-1 py-2 bg-shark-cyan text-black rounded-lg text-xs font-bold"
                     >
                       {t('market.ok')}
                     </button>
                   </div>
                 </motion.div>
               </>
             )}
           </div>

           {/* Payment Method Button */}
           <div className="relative">
             <button 
               onClick={() => { setShowPaymentModal(!showPaymentModal); setShowAmountModal(false); hapticFeedback('light'); }}
               className={`text-xs font-medium px-3 py-1.5 rounded-full transition-colors border flex items-center gap-1 whitespace-nowrap ${filterPayment ? 'text-shark-cyan bg-shark-cyan/10 border-shark-cyan/50' : 'text-gray-500 dark:text-gray-300 border-border bg-surface'}`}
             >
               {filterPayment || t('market.payment_method')}
               <ChevronDown size={12} />
             </button>

             {/* Payment Dropdown */}
             {showPaymentModal && (
               <>
                 <div className="fixed inset-0 z-30" onClick={() => setShowPaymentModal(false)} />
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   className="absolute top-full mt-2 left-0 z-40 bg-surface border border-border rounded-xl p-2 shadow-xl min-w-[200px]"
                 >
                   <div className="text-xs text-gray-500 dark:text-gray-400 m-2 font-bold uppercase">{t('market.choose_bank_title')}</div>
                   <div className="max-h-[200px] overflow-y-auto space-y-1">
                     {BANK_LIST.map(bank => (
                       <button
                         key={bank}
                         onClick={() => {
                           setFilterPayment(filterPayment === bank ? null : bank);
                           setShowPaymentModal(false);
                           hapticFeedback('medium');
                         }}
                         className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${filterPayment === bank ? 'bg-shark-cyan/20 text-shark-cyan' : 'text-gray-500 dark:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5'}`}
                       >
                         {bank}
                       </button>
                     ))}
                   </div>
                   {filterPayment && (
                     <button 
                        onClick={() => { setFilterPayment(null); setShowPaymentModal(false); }}
                        className="w-full mt-2 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-text border-t border-border"
                     >
                       {t('market.reset_filter')}
                     </button>
                   )}
                 </motion.div>
               </>
             )}
           </div>
        </div>

        {/* Crypto Dropdown */}
        <div className="relative">
          <button 
             onClick={() => { setShowCryptoModal(!showCryptoModal); setShowAmountModal(false); setShowPaymentModal(false); hapticFeedback('light'); }}
             className="text-xs font-bold px-3 py-1.5 rounded-full transition-colors border flex items-center gap-1 whitespace-nowrap bg-surface border-border text-text hover:bg-gray-100 dark:hover:bg-white/5"
          >
            <span className={activeCrypto === 'USDT' ? 'text-green-500' : 'text-blue-500'}>{activeCrypto}</span>
            <ChevronDown size={12} className="text-gray-500" />
          </button>

          {showCryptoModal && (
            <>
               <div className="fixed inset-0 z-30" onClick={() => setShowCryptoModal(false)} />
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="absolute top-full mt-2 right-0 z-40 bg-surface border border-border rounded-xl p-2 shadow-xl min-w-[120px]"
               >
                 <div className="text-xs text-gray-500 dark:text-gray-400 m-2 font-bold uppercase">{t('market.crypto')}</div>
                 {CRYPTOS.filter(c => ['USDT', 'USDC'].includes(c)).map(crypto => (
                   <button
                     key={crypto}
                     onClick={() => {
                       setActiveCrypto(crypto);
                       setShowCryptoModal(false);
                       hapticFeedback('medium');
                     }}
                     className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${activeCrypto === crypto ? 'bg-shark-cyan/10 text-shark-cyan' : 'text-text hover:bg-black/5 dark:hover:bg-white/5'}`}
                   >
                     {crypto}
                     {activeCrypto === crypto && <div className="w-1.5 h-1.5 rounded-full bg-shark-cyan" />}
                   </button>
                 ))}
               </motion.div>
            </>
          )}
        </div>

        <button onClick={handleRefresh} className="text-gray-500 dark:text-gray-300 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/5 active:rotate-180 transition-all duration-500">
           <RefreshCw size={18} />
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-1 min-h-[300px]">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          orders.map(order => (
            <OrderCard 
              key={order.id} 
              order={order} 
              t={t}
              onClick={(order) => {
                setSelectedMerchant({ ...order.merchant, exchange: order.exchange, terms: order.terms });
                hapticFeedback('light');
              }}
            />
          ))
        )}
        {!loading && orders.length === 0 && (
           <div className="text-center py-10 text-gray-500">
             {t('market.no_orders')} {activeExchange}.
           </div>
        )}
      </div>

      {/* Merchant Modal */}
      <MerchantProfileModal 
        isOpen={!!selectedMerchant}
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
        t={t}
        theme={theme}
      />
    </div>
  );
};

export default MarketScreen;
