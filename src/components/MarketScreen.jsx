import React, { useState, useEffect } from 'react';
import OrderCard from './OrderCard';
import { Search, Filter, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

const EXCHANGES = ['Binance', 'Bybit', 'OKX', 'MEXC'];
const MOCK_ORDERS = [
  {
    id: 1,
    type: 'buy',
    merchant: { name: 'FastTrader', verified: true, orders: 1250, completion: 99.5 },
    price: '41,250',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '5,000 - 150,000',
    paymentMethods: ['Monobank', 'PrivatBank']
  },
  {
    id: 2,
    type: 'buy',
    merchant: { name: 'CryptoKing', verified: true, orders: 3420, completion: 98.2 },
    price: '41,255',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '10,000 - 500,000',
    paymentMethods: ['Monobank']
  },
  {
    id: 3,
    type: 'buy',
    merchant: { name: 'AlexP2P', verified: false, orders: 450, completion: 95.0 },
    price: '41,260',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '1,000 - 20,000',
    paymentMethods: ['PUMB', 'Izibank']
  }
];

const SkeletonCard = () => (
  <div className="bg-surface backdrop-blur-md rounded-2xl p-4 border border-white/5 mb-3 shadow-lg animate-pulse">
    <div className="flex justify-between items-start mb-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/10" />
        <div className="flex flex-col gap-1">
          <div className="w-20 h-3 bg-white/10 rounded" />
          <div className="w-16 h-2 bg-white/10 rounded" />
        </div>
      </div>
      <div className="w-24 h-6 bg-white/10 rounded" />
    </div>
    <div className="flex justify-between items-end">
      <div className="flex flex-col gap-2">
        <div className="w-32 h-3 bg-white/10 rounded" />
        <div className="flex gap-2">
          <div className="w-16 h-5 bg-white/10 rounded-lg" />
          <div className="w-16 h-5 bg-white/10 rounded-lg" />
        </div>
      </div>
      <div className="w-24 h-8 bg-white/10 rounded-xl" />
    </div>
  </div>
);

const MarketScreen = () => {
  const [activeExchange, setActiveExchange] = useState('Binance');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [activeExchange]);

  return (
    <div className="pt-4 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Market</h1>
        <div className="flex gap-2">
           <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
             <Search size={20} />
           </button>
           <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
             <Filter size={20} />
           </button>
        </div>
      </div>

      {/* Exchanges Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {EXCHANGES.map((ex) => (
          <button
            key={ex}
            onClick={() => setActiveExchange(ex)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
              activeExchange === ex
                ? 'bg-shark-cyan text-black shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            {ex}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="space-y-1">
        {loading ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          MOCK_ORDERS.map(order => (
            <OrderCard key={order.id} order={order} />
          ))
        )}
      </div>
    </div>
  );
};

export default MarketScreen;
