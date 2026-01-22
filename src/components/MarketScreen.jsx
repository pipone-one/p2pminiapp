import React, { useState } from 'react';
import { ChevronDown, RefreshCw, Filter } from 'lucide-react';
import OrderCard from './OrderCard';
import MerchantProfileModal from './MerchantProfileModal';

const EXCHANGES = ['Binance', 'Bybit', 'OKX', 'MEXC'];
const CRYPTOS = ['USDT', 'USDC', 'BTC', 'ETH', 'BNB'];

const MOCK_ORDERS = [
  {
    id: 1,
    type: 'buy',
    merchant: { name: 'udaleser', verified: false, orders: 1250, completion: 99.5 },
    price: '40.05',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '400 - 401',
    paymentMethods: ['Bank Credit Dnipro']
  },
  {
    id: 2,
    type: 'buy',
    merchant: { name: 'soliks99', verified: false, orders: 3420, completion: 98.2 },
    price: '42.50',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '400 - 430',
    paymentMethods: ['Alliance bank']
  },
  {
    id: 3,
    type: 'buy',
    merchant: { name: 'Currency_exchange_Kh', verified: false, orders: 450, completion: 95.0 },
    price: '44.33',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '529 - 530',
    paymentMethods: ['Monobank', 'Bank Vlasnyi Rakhunok']
  },
    {
    id: 4,
    type: 'buy',
    merchant: { name: 'timaan_t', verified: false, orders: 850, completion: 97.0 },
    price: '44.34',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '2660 - 2660',
    paymentMethods: ['Monobank', 'A-Bank', 'Bank Vlasnyi Rakhunok']
  }
];

const MarketScreen = () => {
  const [activeTab, setActiveTab] = useState('buy'); // buy | sell
  const [activeCrypto, setActiveCrypto] = useState('USDT');
  const [selectedMerchant, setSelectedMerchant] = useState(null);

  return (
    <div className="pt-2 px-4 pb-4">
      {/* Top Header */}
      <div className="flex justify-between items-center mb-4 pt-2">
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium">
          Биржа <ChevronDown size={14} />
        </button>
        <div className="font-bold text-lg">P2P</div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/10 text-sm font-medium">
          UAH <ChevronDown size={14} />
        </button>
      </div>

      {/* Buy/Sell Tabs */}
      <div className="flex gap-4 mb-4 text-lg font-semibold">
        <button 
          onClick={() => setActiveTab('buy')}
          className={activeTab === 'buy' ? 'text-white' : 'text-gray-500'}
        >
          Покупка
        </button>
        <button 
          onClick={() => setActiveTab('sell')}
          className={activeTab === 'sell' ? 'text-white' : 'text-gray-500'}
        >
          Продажа
        </button>
      </div>

      {/* Crypto Tabs */}
      <div className="flex gap-4 overflow-x-auto pb-2 mb-2 no-scrollbar border-b border-white/5">
        {CRYPTOS.map(crypto => (
          <button
            key={crypto}
            onClick={() => setActiveCrypto(crypto)}
            className={`pb-2 text-sm font-medium transition-colors relative ${
              activeCrypto === crypto ? 'text-soft-gold' : 'text-gray-400'
            }`}
          >
            {crypto}
            {activeCrypto === crypto && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-soft-gold rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2">
           <button className="flex items-center gap-1 text-xs text-gray-300">
             Сумма <ChevronDown size={12} />
           </button>
           <button className="flex items-center gap-1 text-xs text-gray-300">
             Способ оплаты <ChevronDown size={12} />
           </button>
        </div>
        <button className="text-gray-300">
           <RefreshCw size={16} />
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-1">
        {MOCK_ORDERS.map(order => (
          <OrderCard 
            key={order.id} 
            order={order} 
            onClick={(order) => setSelectedMerchant(order.merchant)}
          />
        ))}
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

export default MarketScreen;
