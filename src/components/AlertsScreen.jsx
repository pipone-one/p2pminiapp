import React, { useState, useEffect } from 'react';
import { Plus, Search, X, ChevronDown, ChevronUp, Bell, Trash2, ArrowRightLeft, Info, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticFeedback, getUser } from '../utils/telegram';

const BACKEND_URL = 'http://localhost:3000'; // Change to your VPS URL

const EXCHANGES = ['Binance', 'Bybit', 'OKX', 'MEXC'];
const PAYMENT_METHODS = [
  'Any', 'PrivatBank', 'Monobank', 'PUMB', 'Oschadbank', 'OTP Bank',
  'Raiffeisen Bank', 'UKRSIBBANK', 'Universal Bank', 'A-Bank',
  'Sense Bank', 'izibank', 'Sportbank', 'NEOBANK', 'Wise', 
  'Revolut', 'PayPal', 'Sepa', 'GeoPay'
];

const AlertsScreen = ({ theme, t }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  
  const EXCHANGE_STYLES = {
    Binance: { color: '#FCD535', bg: 'rgba(252, 213, 53, 0.1)' },
    Bybit: { color: '#FFB119', bg: 'rgba(255, 177, 25, 0.1)' },
    OKX: { 
      color: theme === 'light' ? '#000000' : '#FFFFFF', 
      bg: theme === 'light' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)' 
    },
    MEXC: { color: '#2B70FF', bg: 'rgba(43, 112, 255, 0.1)' }
  };

  // Form State
  const [type, setType] = useState('buy'); // buy | sell
  const [fiat, setFiat] = useState('UAH');
  const [crypto, setCrypto] = useState('USDT');
  const [exchange, setExchange] = useState('Binance');
  const [paymentMethod, setPaymentMethod] = useState('Any');
  const [minAmount, setMinAmount] = useState('');
  const [price, setPrice] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);

  // Dropdown States
  const [showExchangeDropdown, setShowExchangeDropdown] = useState(false);
  const [showPaymentDropdown, setShowPaymentDropdown] = useState(false);

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    const saved = localStorage.getItem('user_alerts');
    const data = saved ? JSON.parse(saved) : [];
    setAlerts(data);
  };

  const syncToBackend = async (newAlerts) => {
    const user = getUser();
    if (!user || !user.id) return;

    try {
      await fetch(`${BACKEND_URL}/api/sync-alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, alerts: newAlerts })
      });
    } catch (e) {
      // Backend might be offline, ignore
      console.log('Sync failed:', e);
    }
  };

  const handleCreateAlert = () => {
    if (!price) return;
    
    hapticFeedback('medium');
    
    const newAlert = {
      id: Date.now(),
      type,
      pair: `${fiat}/${crypto}`,
      exchange,
      paymentMethod,
      minAmount: minAmount || 'Any',
      price,
      isRecurring,
      active: true
    };
    
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem('user_alerts', JSON.stringify(updatedAlerts));
    syncToBackend(updatedAlerts);
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleDelete = (id) => {
    const newAlerts = alerts.filter(a => a.id !== id);
    setAlerts(newAlerts);
    localStorage.setItem('user_alerts', JSON.stringify(newAlerts));
    syncToBackend(newAlerts);
    hapticFeedback('light');
  };

  const handleReactivate = (id) => {
    const newAlerts = alerts.map(a => {
      if (a.id === id) {
        return { ...a, active: true, lastTriggered: null, matchedPrice: null };
      }
      return a;
    });
    setAlerts(newAlerts);
    localStorage.setItem('user_alerts', JSON.stringify(newAlerts));
    syncToBackend(newAlerts);
    hapticFeedback('selection');
  };

  const swapPair = () => {
    const temp = fiat;
    setFiat(crypto);
    setCrypto(temp);
    hapticFeedback('selection');
  };

  const resetForm = () => {
    setPrice('');
    setMinAmount('');
    setIsRecurring(false);
    setType('buy');
    setExchange('Binance');
    setPaymentMethod('Any');
    setShowExchangeDropdown(false);
    setShowPaymentDropdown(false);
  };

  return (
    <div className="pt-6 px-4 h-full relative pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">{t('alerts.title')}</h1>
        <button 
          onClick={() => { setIsModalOpen(true); hapticFeedback('light'); }}
          className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/20 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* List or Empty State */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-surface border border-border flex items-center justify-center mb-4">
             <Bell size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">{t('alerts.no_alerts')}</h3>
          <p className="text-sm text-gray-500 max-w-[200px]">
            {t('alerts.create_hint')}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
           {alerts.map(alert => (
             <motion.div 
               layout
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               key={alert.id} 
               className="bg-surface border border-border p-4 rounded-2xl relative overflow-hidden shadow-sm"
             >
               <div className="flex justify-between items-start mb-2">
                 <div className="flex items-center gap-2">
                   <span className={`text-sm font-bold uppercase ${alert.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                     {alert.type === 'buy' ? t('alerts.buy') : t('alerts.sell')}
                   </span>
                   <span className="text-sm font-bold text-text">{alert.pair}</span>
                 </div>
                 <div className="flex items-center gap-2">
                   <div className={`w-2 h-2 rounded-full ${alert.active ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
                   <button onClick={() => handleDelete(alert.id)} className="text-gray-500 hover:text-red-500">
                     <Trash2 size={16} />
                   </button>
                 </div>
               </div>
               
               <div className="flex justify-between items-end">
                 <div>
                   <div className="text-xs text-gray-400 mb-0.5">{alert.exchange} • {alert.paymentMethod === 'Any' ? t('alerts.any_payment') : alert.paymentMethod}</div>
                   <div className="text-2xl font-bold" style={{ color: EXCHANGE_STYLES[alert.exchange]?.color || 'var(--text)' }}>
                     {alert.price} ₴
                   </div>
                   {!alert.active && alert.matchedPrice && (
                     <div className="flex items-center gap-2 mt-1">
                       <span className="text-xs font-bold text-[#FCD535] animate-pulse">
                         {t('alerts.triggered_at')} {alert.matchedPrice} ₴
                       </span>
                       <button 
                         onClick={() => handleReactivate(alert.id)}
                         className="px-2 py-0.5 rounded-full bg-surface border border-border text-[10px] font-bold text-text hover:bg-gray-100 dark:hover:bg-white/10"
                       >
                         {t('alerts.reactivate')}
                       </button>
                     </div>
                   )}
                 </div>
                 {alert.minAmount !== 'Any' && (
                   <div className="text-xs text-gray-500 font-medium bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                     Min: {alert.minAmount}
                   </div>
                 )}
               </div>
             </motion.div>
           ))}
        </div>
      )}

      {/* New Alert Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-background border-t border-border rounded-t-[32px] z-[101] px-5 pt-5 pb-8 h-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-text">{t('alerts.create_modal')}</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1 rounded-full bg-surface text-[10px] font-bold text-[#FCD535] border border-[#FCD535]/20"
                >
                  {t('common.close')}
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                
                {/* Type Selector */}
                <div>
                   <div className="flex gap-2 bg-surface p-1 rounded-xl border border-border">
                     <button 
                       onClick={() => setType('buy')}
                       className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'buy' ? 'bg-green-500 text-black shadow-lg' : 'text-gray-500 hover:text-text hover:bg-gray-100 dark:hover:bg-white/5'}`}
                     >
                       {t('alerts.buy')}
                     </button>
                     <button 
                       onClick={() => setType('sell')}
                       className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${type === 'sell' ? 'bg-red-500 text-black shadow-lg' : 'text-gray-500 hover:text-text hover:bg-gray-100 dark:hover:bg-white/5'}`}
                     >
                       {t('alerts.sell')}
                     </button>
                   </div>
                </div>

                {/* Pair */}
                <div>
                  <div className="flex items-center justify-between bg-surface border border-border rounded-xl p-2">
                    <span className="text-xs text-gray-500 font-medium pl-1">{t('alerts.pair')}:</span>
                    <div className="flex items-center gap-2">
                      <button onClick={swapPair} className="flex items-center gap-1 text-sm font-bold text-text">
                        {fiat}
                      </button>
                      <button onClick={swapPair} className="p-1.5 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 active:rotate-180 transition-transform">
                         <ArrowRightLeft size={12} className="text-gray-400" />
                      </button>
                      <button onClick={swapPair} className="flex items-center gap-1 text-sm font-bold text-text">
                        {crypto}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Market Selector */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowExchangeDropdown(!showExchangeDropdown);
                      setShowPaymentDropdown(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface"
                    style={{ borderColor: EXCHANGE_STYLES[exchange]?.color }}
                  >
                    <span className="text-xs text-gray-500 font-medium">{t('alerts.market_label')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: EXCHANGE_STYLES[exchange]?.color }}>
                        {exchange}
                      </span>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${showExchangeDropdown ? 'rotate-180' : ''}`} style={{ color: EXCHANGE_STYLES[exchange]?.color }} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showExchangeDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl overflow-hidden z-20 shadow-xl"
                      >
                        {EXCHANGES.map((ex) => (
                          <button
                            key={ex}
                            onClick={() => {
                              setExchange(ex);
                              setShowExchangeDropdown(false);
                              hapticFeedback('selection');
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border-b border-border last:border-0"
                          >
                            <span className="font-bold text-sm" style={{ color: EXCHANGE_STYLES[ex].color }}>{ex}</span>
                            {exchange === ex && <Check size={14} style={{ color: EXCHANGE_STYLES[ex].color }} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Payment Methods Selector */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowPaymentDropdown(!showPaymentDropdown);
                      setShowExchangeDropdown(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl border border-border bg-surface"
                  >
                    <span className="text-xs text-gray-500 font-medium">{t('alerts.payment_label')}:</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text">
                        {paymentMethod === 'Any' ? t('alerts.any_payment') : paymentMethod}
                      </span>
                      <ChevronDown size={16} className={`text-gray-500 transition-transform duration-300 ${showPaymentDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {showPaymentDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface border border-border rounded-xl overflow-hidden z-20 shadow-xl max-h-[160px] overflow-y-auto"
                      >
                        {PAYMENT_METHODS.map((pm) => (
                          <button
                            key={pm}
                            onClick={() => {
                              setPaymentMethod(pm);
                              setShowPaymentDropdown(false);
                              hapticFeedback('selection');
                            }}
                            className="w-full flex items-center justify-between p-3 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors border-b border-border last:border-0"
                          >
                            <span className="font-medium text-sm text-text">{pm === 'Any' ? t('alerts.any_payment') : pm}</span>
                            {paymentMethod === pm && <Check size={14} className="text-[#FCD535]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Inputs Row */}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder={t('alerts.min_amount')}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-3 text-sm text-text focus:border-[#FCD535] focus:outline-none placeholder:text-gray-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={t('alerts.price_target')}
                      className="w-full bg-surface border border-border rounded-xl px-3 py-3 text-sm text-text focus:border-[#FCD535] focus:outline-none placeholder:text-gray-500"
                    />
                  </div>
                </div>

                {/* Recurring Toggle */}
                <div className="flex justify-between items-center py-1">
                   <div className="flex items-center gap-2">
                     <span className="text-xs text-text font-medium">{t('alerts.recurring')}</span>
                     <Info size={12} className="text-gray-500" />
                   </div>
                   <button 
                     onClick={() => setIsRecurring(!isRecurring)}
                     className={`w-10 h-5 rounded-full p-0.5 transition-colors ${isRecurring ? 'bg-[#FCD535]' : 'bg-gray-200 dark:bg-white/10'}`}
                   >
                     <div className={`w-4 h-4 rounded-full bg-white transition-transform ${isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
                   </button>
                </div>

                {/* Confirm Button */}
                <button 
                  onClick={handleCreateAlert}
                  disabled={!price}
                  className="w-full py-3 bg-[#FCD535] text-black font-bold rounded-xl text-base hover:bg-[#e0bc2e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2 shadow-lg shadow-[#FCD535]/20"
                >
                  {t('alerts.create')}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AlertsScreen;
