import React, { useState } from 'react';
import { Plus, Search, X, ChevronDown, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AlertsScreen = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alerts, setAlerts] = useState([]);

  return (
    <div className="pt-6 px-4 h-full relative">
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

      {/* Empty State */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-32 text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
             <Search size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium mb-1">Ничего не найдено</h3>
          <p className="text-sm text-gray-500 max-w-[200px]">
            Нажмите '+' для получения уведомлений об изменении цены.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
           {/* Render alerts here */}
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
                <h2 className="text-2xl font-bold">Новое уведомление</h2>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-full bg-white/5 text-sm text-soft-gold hover:bg-white/10"
                >
                  Закрыть
                </button>
              </div>

              {/* Form */}
              <div className="space-y-6">
                {/* Buy/Sell Selector */}
                <div>
                   <label className="text-sm text-gray-400 block mb-2">Я хочу</label>
                   <div className="flex gap-4">
                     <button className="text-lg font-bold text-white border-b-2 border-white pb-1">Купить</button>
                     <button className="text-lg font-bold text-gray-500 pb-1">Продать</button>
                   </div>
                </div>

                {/* Pair */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Выберите пару:</label>
                  <div className="flex items-center gap-2 text-xl font-medium text-soft-gold">
                    UAH <div className="p-1 rounded-full border border-soft-gold"><ChevronDown size={12}/></div> 
                    <span className="text-white">⇆</span>
                    USDT <div className="p-1 rounded-full border border-soft-gold"><ChevronDown size={12}/></div>
                  </div>
                </div>

                {/* Market */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Выберите рынок:</label>
                  <div className="text-xl font-medium text-soft-gold flex items-center gap-2">
                    Binance <div className="p-1 rounded-full border border-soft-gold"><ChevronDown size={12}/></div>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="text-sm text-gray-400 block mb-2">Выберите способы оплаты:</label>
                  <div className="text-xl font-medium text-white flex items-center gap-2">
                    Любой <div className="p-1 rounded-full border border-white/30"><ChevronDown size={12}/></div>
                  </div>
                </div>

                {/* Inputs Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Минимальная сумма:</label>
                    <input 
                      type="text" 
                      placeholder="Сумма (необязате..." 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-soft-gold/50"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 block mb-2">Граничная цена:</label>
                    <input 
                      type="text" 
                      placeholder="Цена" 
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:border-soft-gold/50"
                    />
                  </div>
                </div>

                {/* Toggle */}
                <div className="flex justify-between items-center py-2">
                  <div className="flex items-center gap-2">
                    <span className="text-white">Повторное оповещение</span>
                    <Bell size={14} className="text-soft-gold" />
                  </div>
                  <div className="w-12 h-7 bg-white/20 rounded-full relative">
                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-md" />
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="w-full py-4 bg-soft-gold text-black font-bold rounded-xl text-lg hover:bg-yellow-400 transition-colors mt-4"
                >
                  Подтвердить
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
