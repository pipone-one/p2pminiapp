import React, { useState, useEffect } from 'react';
import { Plus, Search, X, ChevronDown, Bell, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { hapticFeedback } from '../utils/telegram';

const AlertsScreen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [pair, setPair] = useState('USDT/UAH');
  const [price, setPrice] = useState('');
  const [exchange, setExchange] = useState('Binance');

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    setLoading(true);
    // const data = await api.getAlerts(); // Removed mock call
    const saved = localStorage.getItem('user_alerts');
    const data = saved ? JSON.parse(saved) : [];
    setAlerts(data);
    setLoading(false);
  };

  const handleCreateAlert = async () => {
    if (!price) return;
    
    hapticFeedback('medium');
    
    // Create new alert object
    const newAlert = {
      id: Date.now(),
      pair,
      price,
      exchange,
      type: 'buy',
      active: true
    };
    
    const updatedAlerts = [...alerts, newAlert];
    setAlerts(updatedAlerts);
    localStorage.setItem('user_alerts', JSON.stringify(updatedAlerts));
    
    setIsModalOpen(false);
    setPrice('');
  };

  const handleDelete = async (id) => {
    hapticFeedback('medium');
    // await api.deleteAlert(id); // Removed mock call
    const updatedAlerts = alerts.filter(a => a.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('user_alerts', JSON.stringify(updatedAlerts));
  };

  return (
    <div className="pt-6 px-4 h-full relative pb-20">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Watchlist</h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {/* List or Empty State */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
             <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">No active alerts</h3>
          <p className="text-sm text-gray-500 max-w-[200px]">
            Tap '+' to create a new price alert for P2P market.
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
               className="bg-surface border border-white/5 p-4 rounded-2xl flex justify-between items-center"
             >
               <div>
                 <div className="flex items-center gap-2 mb-1">
                   <span className="font-bold text-white">{alert.pair}</span>
                   <span className="text-xs px-2 py-0.5 rounded bg-white/10 text-gray-300">{alert.exchange}</span>
                 </div>
                 <div className="text-sm text-gray-400">Target: <span className="text-soft-gold font-bold">{alert.price}</span></div>
               </div>
               <div className="flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                 <button onClick={() => handleDelete(alert.id)} className="text-gray-500 hover:text-red-500 transition-colors">
                   <Trash2 size={18} />
                 </button>
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
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 bg-[#0A0A0C] border-t border-white/10 rounded-t-[32px] z-50 p-6 pb-10 h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">New Alert</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-white/5 text-sm text-soft-gold hover:bg-white/10"
                >
                  Close
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Buy/Sell Selector */}
                <div>
                   <label className="text-sm text-gray-400 block mb-2">I want to</label>
                   <div className="flex gap-4">
                     <button className="text-lg font-bold text-white border-b-2 border-white pb-1">Buy</button>
                     <button className="text-lg font-bold text-gray-500 pb-1">Sell</button>
                   </div>
                </div>

                {/* Pair */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Pair</label>
                  <div className="flex items-center gap-2 text-xl font-medium text-soft-gold">
                    UAH <div className="p-1 rounded-full border border-soft-gold"><ChevronDown size={12}/></div> 
                    <span className="text-white">⇆</span>
                    USDT <div className="p-1 rounded-full border border-soft-gold"><ChevronDown size={12}/></div>
                  </div>
                </div>

                {/* Market */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Exchange</label>
                  <div className="text-xl font-medium text-soft-gold flex items-center gap-2">
                    {exchange} <div className="p-1 rounded-full border border-soft-gold"><ChevronDown size={12}/></div>
                  </div>
                </div>

                {/* Price Input */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Target Price</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="40.50"
                    className="w-full bg-surface border border-white/10 rounded-xl p-4 text-2xl font-bold text-white focus:border-shark-cyan focus:outline-none"
                  />
                </div>

                <button 
                  onClick={handleCreateAlert}
                  disabled={!price}
                  className="w-full py-4 bg-shark-cyan text-black font-bold rounded-xl text-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create Alert
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
