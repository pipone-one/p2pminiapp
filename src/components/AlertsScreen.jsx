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
    <div className="pt-8 px-4 h-full relative pb-24 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black tracking-tight">{t('alerts.title')}</h1>
        <button 
          onClick={() => { setIsModalOpen(true); hapticFeedback('light'); }}
          className="w-12 h-12 rounded-2xl bg-shark-cyan text-black flex items-center justify-center hover:bg-shark-cyan/90 transition-all shadow-lg shadow-shark-cyan/20 active:scale-95"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* List or Empty State */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-center">
          <div className="w-20 h-20 rounded-[24px] bg-surface border border-border flex items-center justify-center mb-6 shadow-xl shadow-black/5 relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-shark-cyan/5 to-transparent" />
             <Bell size={32} className="text-text-secondary relative z-10" />
          </div>
          <h3 className="text-xl font-bold mb-2">{t('alerts.no_alerts')}</h3>
          <p className="text-sm text-text-secondary font-medium max-w-[240px] leading-relaxed">
            {t('alerts.create_hint')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
           {alerts.map(alert => (
             <motion.div 
               layout
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               key={alert.id} 
               className="glass-card p-5 rounded-[24px] relative overflow-hidden group"
             >
               <div className="absolute inset-0 bg-gradient-to-r from-shark-cyan/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
               <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className="flex items-center gap-3">
                   <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${alert.type === 'buy' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                     {alert.type === 'buy' ? t('alerts.buy') : t('alerts.sell')}
                   </span>
                   <span className="text-base font-black text-text tracking-tight">{alert.pair}</span>
                 </div>
                 <div className="flex items-center gap-3">
                   <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white/10 ${alert.active ? 'bg-shark-cyan animate-pulse shadow-[0_0_8px_rgba(0,229,106,0.5)]' : 'bg-text-secondary'}`} />
                   <button onClick={() => handleDelete(alert.id)} className="text-text-secondary hover:text-error transition-colors p-1">
                     <Trash2 size={18} />
                   </button>
                 </div>
               </div>
               
               <div className="flex justify-between items-end relative z-10">
                 <div>
                   <div className="text-xs text-text-secondary font-bold mb-1 flex items-center gap-1.5">
                     <span style={{ color: EXCHANGE_STYLES[alert.exchange]?.color }}>{alert.exchange}</span>
                     <span className="w-1 h-1 rounded-full bg-border" />
                     <span>{alert.paymentMethod === 'Any' ? t('alerts.any_payment') : alert.paymentMethod}</span>
                   </div>
                   <div className="text-3xl font-black tracking-tighter drop-shadow-sm" style={{ color: EXCHANGE_STYLES[alert.exchange]?.color || 'var(--text)' }}>
                     {alert.price} <span className="text-lg text-text-secondary font-bold">₴</span>
                   </div>
                   {!alert.active && alert.matchedPrice && (
                     <div className="flex items-center gap-2 mt-2">
                       <span className="text-xs font-bold text-[#FCD535] animate-pulse bg-[#FCD535]/10 px-2 py-0.5 rounded-md border border-[#FCD535]/20">
                         {t('alerts.triggered_at')} {alert.matchedPrice} ₴
                       </span>
                       <button 
                         onClick={() => handleReactivate(alert.id)}
                         className="px-3 py-1 rounded-full bg-surface border border-border text-[10px] font-bold text-text hover:bg-white/10 transition-colors shadow-sm"
                       >
                         {t('alerts.reactivate')}
                       </button>
                     </div>
                   )}
                 </div>
                 {alert.minAmount !== 'Any' && (
                   <div className="text-[10px] font-bold text-text-secondary bg-surface border border-border px-2.5 py-1.5 rounded-lg uppercase tracking-wide">
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
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100]"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-border rounded-t-[32px] z-[101] px-6 pt-6 pb-10 h-auto max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-text tracking-tight">{t('alerts.create_modal')}</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-text-secondary hover:text-text transition-colors"
                >
                  <X size={18} strokeWidth={2.5} />
                </button>
              </div>

              {/* Form */}
              <div className="space-y-5">
                
                {/* Type Selector */}
                <div>
                   <div className="flex gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-transparent">
                     <button 
                       onClick={() => setType('buy')}
                       className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${type === 'buy' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'text-text-secondary hover:text-text'}`}
                     >
                       {t('alerts.buy')}
                     </button>
                     <button 
                       onClick={() => setType('sell')}
                       className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${type === 'sell' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'text-text-secondary hover:text-text'}`}
                     >
                       {t('alerts.sell')}
                     </button>
                   </div>
                </div>

                {/* Pair */}
                <div>
                  <div className="flex items-center justify-between bg-surface border border-border rounded-2xl p-3 shadow-sm">
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider pl-1">{t('alerts.pair')}</span>
                    <div className="flex items-center gap-3">
                      <button onClick={swapPair} className="flex items-center gap-1 text-base font-black text-text">
                        {fiat}
                      </button>
                      <button onClick={swapPair} className="p-2 rounded-full bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 active:rotate-180 transition-all text-text-secondary">
                         <ArrowRightLeft size={14} strokeWidth={2.5} />
                      </button>
                      <button onClick={swapPair} className="flex items-center gap-1 text-base font-black text-text">
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
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-surface shadow-sm active:scale-[0.99] transition-transform"
                    style={{ borderColor: showExchangeDropdown ? EXCHANGE_STYLES[exchange]?.color : 'var(--border)' }}
                  >
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t('alerts.market_label')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base font-black" style={{ color: EXCHANGE_STYLES[exchange]?.color }}>
                        {exchange}
                      </span>
                      <ChevronDown size={18} className={`transition-transform duration-300 ${showExchangeDropdown ? 'rotate-180' : ''}`} style={{ color: EXCHANGE_STYLES[exchange]?.color }} />
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {showExchangeDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl overflow-hidden z-20 shadow-2xl origin-top"
                      >
                        {EXCHANGES.map((ex) => (
                          <button
                            key={ex}
                            onClick={() => {
                              setExchange(ex);
                              setShowExchangeDropdown(false);
                              hapticFeedback('selection');
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-border/50 last:border-0"
                          >
                            <span className="font-bold text-sm" style={{ color: EXCHANGE_STYLES[ex].color }}>{ex}</span>
                            {exchange === ex && <Check size={16} style={{ color: EXCHANGE_STYLES[ex].color }} strokeWidth={3} />}
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
                    className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-surface shadow-sm active:scale-[0.99] transition-transform"
                  >
                    <span className="text-xs text-text-secondary font-bold uppercase tracking-wider">{t('alerts.payment_label')}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-text">
                        {paymentMethod === 'Any' ? t('alerts.any_payment') : paymentMethod}
                      </span>
                      <ChevronDown size={18} className={`text-text-secondary transition-transform duration-300 ${showPaymentDropdown ? 'rotate-180' : ''}`} />
                    </div>
                  </button>

                  <AnimatePresence>
                    {showPaymentDropdown && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-surface/95 backdrop-blur-xl border border-border rounded-2xl overflow-hidden z-20 shadow-2xl max-h-[240px] overflow-y-auto origin-top"
                      >
                        {PAYMENT_METHODS.map((pm) => (
                          <button
                            key={pm}
                            onClick={() => {
                              setPaymentMethod(pm);
                              setShowPaymentDropdown(false);
                              hapticFeedback('selection');
                            }}
                            className="w-full flex items-center justify-between p-4 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-border/50 last:border-0"
                          >
                            <span className="font-bold text-sm text-text">{pm === 'Any' ? t('alerts.any_payment') : pm}</span>
                            {paymentMethod === pm && <Check size={16} className="text-shark-cyan" strokeWidth={3} />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Inputs Row */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block ml-1">{t('alerts.min_amount')}</label>
                    <input 
                      type="number" 
                      value={minAmount}
                      onChange={(e) => setMinAmount(e.target.value)}
                      placeholder="0"
                      className="w-full bg-surface border border-border rounded-2xl px-4 py-3.5 text-base font-bold text-text focus:border-shark-cyan focus:ring-1 focus:ring-shark-cyan focus:outline-none placeholder:text-gray-400/50 shadow-sm transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1.5 block ml-1">{t('alerts.price_target')}</label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-surface border border-border rounded-2xl px-4 py-3.5 text-base font-bold text-text focus:border-shark-cyan focus:ring-1 focus:ring-shark-cyan focus:outline-none placeholder:text-gray-400/50 shadow-sm transition-all"
                    />
                  </div>
                </div>

                {/* Recurring Toggle */}
                <div className="flex justify-between items-center py-2 px-1">
                   <div className="flex items-center gap-2">
                     <span className="text-sm font-bold text-text">{t('alerts.recurring')}</span>
                     <Info size={14} className="text-text-secondary" />
                   </div>
                   <button 
                     onClick={() => setIsRecurring(!isRecurring)}
                     className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${isRecurring ? 'bg-shark-cyan' : 'bg-gray-200 dark:bg-white/10'}`}
                   >
                     <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${isRecurring ? 'translate-x-5' : 'translate-x-0'}`} />
                   </button>
                </div>

                {/* Confirm Button */}
                <button 
                  onClick={handleCreateAlert}
                  disabled={!price}
                  className="w-full py-4 bg-shark-cyan text-black font-black rounded-2xl text-lg hover:bg-[#00D060] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-shark-cyan/20 active:scale-[0.98]"
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
