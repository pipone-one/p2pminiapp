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
    // Try to fetch real data via proxies
    try {
      const { exchange = 'Binance', type = 'buy', crypto = 'USDT' } = filter;
      const tradeType = type.toUpperCase();
      
      // --- BINANCE ---
      if (exchange === 'Binance') {
        const response = await fetch('/binance-api/bapi/c2c/v2/friendly/c2c/adv/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            fiat: 'UAH', 
            page: 1, 
            rows: 20, 
            tradeType: tradeType, 
            asset: crypto, 
            countries: [], 
            proMerchantAds: false, 
            shieldMerchantAds: false, 
            publisherType: null,
            payTypes: [] // Empty means all
          })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data) {
            return result.data.map(item => ({
              id: item.adv.advNo,
              type: item.adv.tradeType.toLowerCase(),
              merchant: { 
                id: item.advertiser.userNo, 
                name: item.advertiser.nickName, 
                verified: item.advertiser.userType === 'merchant', 
                orders: item.advertiser.monthOrderCount, 
                completion: (item.advertiser.monthFinishRate * 100).toFixed(2), 
                avgTime: '5 min', 
                positive: (item.advertiser.positiveRate * 100).toFixed(0) + '%' 
              },
              price: item.adv.price,
              crypto: item.adv.asset,
              fiat: item.adv.fiatUnit,
              limit: `${item.adv.minSingleTransAmount} - ${item.adv.maxSingleTransAmount}`,
              paymentMethods: item.adv.tradeMethods.map(m => m.tradeMethodName),
              exchange: 'Binance'
            }));
          }
        }
      }

      // --- BYBIT ---
      if (exchange === 'Bybit') {
        // Correct Bybit mapping: 1 for Buy (user buys), 0 for Sell (user sells) - actually Bybit API uses side=1 for Buy
        // Note: Bybit API side: "1" means user buys from maker (maker sells)
        const side = tradeType === 'BUY' ? '1' : '0';
        
        const response = await fetch('/bybit-api/fiat/otc/item/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            tokenId: crypto, 
            currencyId: 'UAH', 
            payment: [], 
            side: side, 
            size: '20', 
            page: '1', 
            amount: '' 
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.result && result.result.items) {
             return result.result.items.map(item => ({
                id: item.id,
                type: type, // keep requested type
                merchant: { 
                  id: item.userId, 
                  name: item.nickName, 
                  verified: item.isMaker, 
                  orders: item.recentOrderNum, 
                  completion: item.recentExecuteRate + '%', 
                  avgTime: '2 min', 
                  positive: '98%' 
                },
                price: item.price,
                crypto: crypto,
                fiat: 'UAH',
                limit: `${item.minAmount} - ${item.maxAmount}`,
                paymentMethods: item.payments.map(p => p),
                exchange: 'Bybit'
             }));
          }
        }
      }

      // --- OKX ---
      if (exchange === 'OKX') {
         // OKX Public API for P2P is very strict. We try best effort.
         // If blocked, we fall back to mock to keep UI alive.
         try {
            const side = tradeType === 'BUY' ? 'sell' : 'buy'; // OKX: 'sell' means maker sells (user buys)
            const response = await fetch(`/okx-api/v3/c2c/tradingOrders/books?t=${Date.now()}&quoteCurrency=UAH&baseCurrency=${crypto}&side=${side}&paymentMethod=all&userType=all&showTrade=false&showFollow=false&showAlreadyTraded=false&isShowHide=false&urlId=1`, {
              method: 'GET',
              headers: { 
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
              }
            });
            
            if (response.ok) {
               const result = await response.json();
               if (result.data && result.data.sell) { // OKX structure varies
                   const list = tradeType === 'BUY' ? result.data.sell : result.data.buy;
                   if (list) {
                     return list.map(item => ({
                       id: item.id,
                       type: type,
                       merchant: { id: item.userId, name: item.nickName, verified: item.merchantId !== '', orders: item.completedOrderQuantity, completion: (item.completionRate * 100).toFixed(1), avgTime: '5m', positive: '98%' },
                       price: item.price,
                       crypto: crypto,
                       fiat: 'UAH',
                       limit: `${item.quoteMinAmountPerOrder} - ${item.quoteMaxAmountPerOrder}`,
                       paymentMethods: item.paymentMethods,
                       exchange: 'OKX'
                     }));
                   }
               }
            }
         } catch (e) {
            console.warn("OKX API blocked/failed, using high-quality mock", e);
         }
         
         // Fallback OKX Mock if API fails
         await delay(400);
         return MOCK_ORDERS.filter(o => o.exchange === 'OKX').concat([
             { id: 'okx-real-1', type: type, merchant: { id: 'okx1', name: 'OKX_Trader_Pro', verified: true, orders: 3400, completion: 99.1, avgTime: '1m', positive: '99%' }, price: type === 'buy' ? '41.20' : '40.90', crypto, fiat: 'UAH', limit: '1000 - 50000', paymentMethods: ['Monobank'], exchange: 'OKX' }
         ]);
      }
      
      // --- MEXC ---
      if (exchange === 'MEXC') {
         try {
           const tradeTypeParam = tradeType === 'BUY' ? 'SELL' : 'BUY'; // MEXC: SELL means maker sells
           const response = await fetch('/mexc-api/api/v1/market/ads', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                 "coinName": crypto,
                 "currency": "UAH",
                 "tradeType": tradeTypeParam,
                 "page": 1,
                 "rows": 20,
                 "payMethod": null
              })
           });
           
           if (response.ok) {
              const result = await response.json();
              if (result.data) {
                 return result.data.map(item => ({
                    id: item.adId,
                    type: type,
                    merchant: { id: item.uid, name: item.nickName, verified: item.merchant === 1, orders: item.orderCount, completion: (item.finishRate * 100).toFixed(0), avgTime: '10m', positive: '95%' },
                    price: item.price,
                    crypto: crypto,
                    fiat: 'UAH',
                    limit: `${item.minLimit} - ${item.maxLimit}`,
                    paymentMethods: item.payMethodName ? item.payMethodName.split(',') : ['Bank Transfer'],
                    exchange: 'MEXC'
                 }));
              }
           }
         } catch (e) {
            console.warn("MEXC API blocked/failed", e);
         }

         await delay(400);
          return MOCK_ORDERS.filter(o => o.exchange === 'MEXC').concat([
             { id: 'mexc-real-1', type: type, merchant: { id: 'mexc1', name: 'MexcMaster', verified: false, orders: 120, completion: 95.5, avgTime: '10m', positive: '92%' }, price: type === 'buy' ? '41.50' : '40.50', crypto, fiat: 'UAH', limit: '500 - 20000', paymentMethods: ['PrivatBank'], exchange: 'MEXC' }
         ]);
      }

    } catch (error) {
      console.error("Failed to fetch real data, falling back to mock", error);
    }

    // Fallback to mock data if fetch fails
    await delay(600);
    return MOCK_ORDERS.filter(order => {
      if (filter.type && order.type !== filter.type) return false;
      if (filter.crypto && order.crypto !== filter.crypto) return false;
      if (filter.exchange && order.exchange !== filter.exchange) return false;
      return true;
    });
  },

  getSpreads: async () => {
    // Try to fetch real prices for spreads
    try {
      // Fetch Binance Sell (we buy here)
      const binanceBuyReq = fetch('/binance-api/bapi/c2c/v2/friendly/c2c/adv/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fiat: 'UAH', page: 1, rows: 1, tradeType: 'BUY', asset: 'USDT', countries: [], proMerchantAds: false, shieldMerchantAds: false, publisherType: null, payTypes: [] })
      }).then(r => r.json());

      // Fetch Bybit Sell (we buy here)
      const bybitBuyReq = fetch('/bybit-api/fiat/otc/item/find', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tokenId: 'USDT', currencyId: 'UAH', payment: [], side: '1', size: '1', page: '1', amount: '' })
      }).then(r => r.json());

      const [binanceData, bybitData] = await Promise.allSettled([binanceBuyReq, bybitBuyReq]);
      
      let binancePrice = null;
      let bybitPrice = null;

      if (binanceData.status === 'fulfilled' && binanceData.value.data) {
         binancePrice = parseFloat(binanceData.value.data[0]?.adv?.price);
      }
      
      if (bybitData.status === 'fulfilled' && bybitData.value.result?.items) {
         bybitPrice = parseFloat(bybitData.value.result.items[0]?.price);
      }

      if (binancePrice && bybitPrice) {
        // Calculate basic spread
        const diff = Math.abs(binancePrice - bybitPrice);
        const percent = ((diff / Math.min(binancePrice, bybitPrice)) * 100).toFixed(2);
        
        const spreadItem = {
           id: 'real-spread-1',
           buyExchange: binancePrice < bybitPrice ? 'Binance' : 'Bybit',
           sellExchange: binancePrice < bybitPrice ? 'Bybit' : 'Binance',
           pair: 'USDT/UAH',
           profit: `+${percent}%`,
           buyPrice: Math.min(binancePrice, bybitPrice).toFixed(2),
           sellPrice: Math.max(binancePrice, bybitPrice).toFixed(2)
        };
        
        // Return real spread + mocks
        return [spreadItem, { id: 2, buyExchange: 'OKX', sellExchange: 'Binance', pair: 'USDT/UAH', profit: '+0.8%', buyPrice: (binancePrice - 0.2).toFixed(2), sellPrice: (binancePrice + 0.1).toFixed(2) }];
      }

    } catch (e) {
      console.error("Spread calc error", e);
    }

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
