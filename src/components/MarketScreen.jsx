import React, { useState, useEffect } from 'react';
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

const MarketScreen = () => {
  const [activeTab, setActiveTab] = useState('buy'); // buy | sell
  const [activeCrypto, setActiveCrypto] = useState('USDT');
  const [activeExchange, setActiveExchange] = useState('Binance');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await api.getOrders({ type: activeTab, crypto: activeCrypto });
      // Simulate filtering by exchange on client side for now as mock data is limited
      const filtered = data.filter(o => !o.exchange || o.exchange === activeExchange || activeExchange === 'Binance'); 
      setOrders(data); // Using all data for demo purposes if specific exchange data is missing
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab, activeCrypto, activeExchange]);

  const handleRefresh = () => {
    hapticFeedback('medium');
    fetchOrders();
  };

  return (
    <div className="pt-2 px-4 pb-20">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4 pt-2">
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium hover:bg-white/20 transition-colors">
          {activeExchange} <ChevronDown size={14} />
        </button>
        <div className="font-bold text-lg tracking-tight">P2P Market</div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium hover:bg-white/20 transition-colors">
          UAH <ChevronDown size={14} />
        </button>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-6 mb-4 text-lg font-bold">
        <button 
          onClick={() => { setActiveTab('buy'); hapticFeedback('light'); }}
          className={`transition-colors relative pb-1 ${activeTab === 'buy' ? 'text-white' : 'text-gray-500'}`}
        >
          Buy
          {activeTab === 'buy' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-shark-cyan shadow-[0_0_10px_#00F0FF]" />}
        </button>
        <button 
          onClick={() => { setActiveTab('sell'); hapticFeedback('light'); }}
          className={`transition-colors relative pb-1 ${activeTab === 'sell' ? 'text-white' : 'text-gray-500'}`}
        >
          Sell
          {activeTab === 'sell' && <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-shark-cyan shadow-[0_0_10px_#00F0FF]" />}
        </button>
      </div>

      {/* Crypto Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
        {CRYPTOS.map(crypto => (
          <button
            key={crypto}
            onClick={() => { setActiveCrypto(crypto); hapticFeedback('light'); }}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all whitespace-nowrap ${
              activeCrypto === crypto
                ? 'bg-white text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {crypto}
          </button>
        ))}
      </div>

      {/* Exchange & Filters Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
           {EXCHANGES.map(ex => (
             <button 
               key={ex}
               onClick={() => { setActiveExchange(ex); hapticFeedback('light'); }}
               className={`text-xs font-medium px-2 py-1 rounded-lg transition-colors ${activeExchange === ex ? 'text-shark-cyan bg-shark-cyan/10 border border-shark-cyan/20' : 'text-gray-400'}`}
             >
               {ex}
             </button>
           ))}
        </div>
        <button onClick={handleRefresh} className="text-gray-300 p-2 rounded-full hover:bg-white/5 active:rotate-180 transition-all duration-500">
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
              onClick={(order) => {
                setSelectedMerchant(order.merchant);
                hapticFeedback('light');
              }}
            />
          ))
        )}
        {!loading && orders.length === 0 && (
           <div className="text-center py-10 text-gray-500">
             No orders found for this configuration.
           </div>
        )}
      </div>

      {/* Merchant Modal */}
      <MerchantProfileModal 
        isOpen={!!selectedMerchant}
        merchant={selectedMerchant}
        onClose={() => setSelectedMerchant(null)}
      />
    </div>
  );
};
import { motion } from 'framer-motion';

export default MarketScreen;
