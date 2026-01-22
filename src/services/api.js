// Mock Data
const MOCK_ORDERS = [
  {
    id: 1,
    type: 'buy',
    merchant: { id: 'm1', name: 'udaleser', verified: false, orders: 1250, completion: 99.5, avgTime: '2 min', positive: '99%' },
    price: '40.05',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '400 - 401',
    paymentMethods: ['Bank Credit Dnipro'],
    exchange: 'Binance'
  },
  {
    id: 2,
    type: 'buy',
    merchant: { id: 'm2', name: 'soliks99', verified: false, orders: 3420, completion: 98.2, avgTime: '5 min', positive: '97%' },
    price: '42.50',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '400 - 430',
    paymentMethods: ['Alliance bank'],
    exchange: 'Binance'
  },
  {
    id: 3,
    type: 'buy',
    merchant: { id: 'm3', name: 'Currency_exchange_Kh', verified: false, orders: 450, completion: 95.0, avgTime: '15 min', positive: '92%' },
    price: '44.33',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '529 - 530',
    paymentMethods: ['Monobank', 'Bank Vlasnyi Rakhunok'],
    exchange: 'Bybit'
  },
  {
    id: 4,
    type: 'buy',
    merchant: { id: 'm4', name: 'timaan_t', verified: false, orders: 850, completion: 97.0, avgTime: '8 min', positive: '98%' },
    price: '44.34',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '2660 - 2660',
    paymentMethods: ['Monobank', 'A-Bank', 'Bank Vlasnyi Rakhunok'],
    exchange: 'Bybit'
  },
  {
    id: 5,
    type: 'sell',
    merchant: { id: 'm5', name: 'CryptoKing', verified: true, orders: 5000, completion: 99.9, avgTime: '1 min', positive: '100%' },
    price: '39.80',
    crypto: 'USDT',
    fiat: 'UAH',
    limit: '1000 - 100000',
    paymentMethods: ['Monobank'],
    exchange: 'Binance'
  }
];

let alerts = [];

// Simulate network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
  getOrders: async (filter = {}) => {
    await delay(600);
    return MOCK_ORDERS.filter(order => {
      if (filter.type && order.type !== filter.type) return false;
      if (filter.crypto && order.crypto !== filter.crypto) return false;
      // Simple mock filtering
      return true;
    });
  },

  getSpreads: async () => {
    await delay(800);
    return [
      { id: 1, buyExchange: 'Binance', sellExchange: 'Bybit', pair: 'USDT/UAH', profit: '+1.2%', buyPrice: '40.05', sellPrice: '40.55' },
      { id: 2, buyExchange: 'OKX', sellExchange: 'Binance', pair: 'USDT/UAH', profit: '+0.8%', buyPrice: '40.10', sellPrice: '40.42' },
      { id: 3, buyExchange: 'MexC', sellExchange: 'Huobi', pair: 'BTC/UAH', profit: '+2.1%', buyPrice: '1650000', sellPrice: '1685000' },
    ];
  },

  createAlert: async (alertData) => {
    await delay(400);
    const newAlert = { id: Date.now(), ...alertData, active: true };
    alerts.push(newAlert);
    return newAlert;
  },

  getAlerts: async () => {
    await delay(300);
    return [...alerts];
  },
  
  deleteAlert: async (id) => {
    await delay(300);
    alerts = alerts.filter(a => a.id !== id);
    return true;
  }
};
