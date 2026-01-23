import { hapticFeedback } from '../utils/telegram';

// No mocks, no delays. Strict API only.

export const api = {
  getOrders: async (filter = {}) => {
    console.log("Fetching orders via Backend Proxy:", filter);
    try {
      const { exchange, type, crypto, amount, paymentMethod } = filter;
      
      const response = await fetch('/api/exchanges/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
             exchange, 
             type, 
             crypto, 
             amount, 
             paymentMethod 
          })
      });

      if (response.ok) {
         const data = await response.json();
         // Backend now returns the full standardized format
         return data;
      }
      
    } catch (error) {
      console.error("Backend Proxy Error:", error);
    }
    return [];
  },

  getSpreads: async (minAmount = 1000) => {
    console.log(`Calculating spreads via Backend Proxy (minAmount: ${minAmount})...`);
    const exchanges = ['Binance', 'Bybit', 'OKX', 'MEXC'];
    const results = {};

    try {
      const requests = [];

      // Helper to push requests
      const addRequest = (exchange, type) => {
         const promise = fetch('/api/exchanges/orders', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ 
               exchange, 
               type, 
               crypto: 'USDT', 
               amount: minAmount, 
               paymentMethod: null // Any
             })
         }).then(r => r.json()).then(data => {
             if (data && data.length > 0 && data[0].price) {
                return { exchange, type, price: parseFloat(data[0].price) };
             }
             return null;
         }).catch(() => null);

         requests.push(promise);
      };

      exchanges.forEach(ex => {
        addRequest(ex, 'BUY');
        addRequest(ex, 'SELL');
      });

      const responses = await Promise.all(requests);
      
      responses.forEach(res => {
        if (res) {
          if (!results[res.exchange]) results[res.exchange] = {};
          results[res.exchange][res.type] = res.price;
        }
      });

      // Calculate Spreads
      const spreads = [];
      const exchangeNames = Object.keys(results);

      exchangeNames.forEach(buyEx => {
        exchangeNames.forEach(sellEx => {
          // Allow same exchange to see internal spread too? Usually arbitrage is different exchanges.
          // But user might want to see if they can buy low and sell high on same exchange (merchant spread).
          // Let's include all combinations.
          
          const buyPrice = results[buyEx]?.BUY; // Price I buy at (Merchant Sell)
          const sellPrice = results[sellEx]?.SELL; // Price I sell at (Merchant Buy)

          if (buyPrice && sellPrice) {
            const profitPercent = ((sellPrice - buyPrice) / buyPrice) * 100;
            
            spreads.push({
              id: `${buyEx}-${sellEx}`,
              buyExchange: buyEx,
              sellExchange: sellEx,
              buyPrice: buyPrice.toFixed(2),
              sellPrice: sellPrice.toFixed(2),
              profit: profitPercent.toFixed(2) + '%',
              pair: 'USDT/UAH'
            });
          }
        });
      });

      return spreads.sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit));

    } catch (error) {
      console.error("Spread calculation error:", error);
      return [];
    }
  },

  getMerchantDetails: async (exchange, merchantId) => {
    console.log(`Fetching merchant details for ${exchange} / ${merchantId}`);
    try {
      if (exchange === 'Binance') {
        const response = await fetch('/binance-api/bapi/c2c/v2/friendly/c2c/advertiser/query-detail', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userNo: merchantId })
        });

        if (response.ok) {
          const result = await response.json();
          if (result.data) {
             const d = result.data;
             return {
               name: d.nickName,
               verified: d.userType === 'merchant',
               orders: d.monthOrderCount,
               completion: (d.monthFinishRate * 100).toFixed(2),
               avgTime: d.avgReleaseTimeOfLatest30d ? (d.avgReleaseTimeOfLatest30d / 60).toFixed(1) + ' min' : 'N/A',
               positive: (d.positiveRate * 100).toFixed(0) + '%',
               registeredDays: d.registerDays,
               totalOrders: d.orderCount,
               // Add more fields if needed
             };
          }
        }
      }
      
      // For other exchanges, we might not have a direct public profile endpoint easily accessible.
      // We will return null to indicate "use existing data" or implement if endpoints found.
      return null;

    } catch (error) {
      console.error("Failed to fetch merchant details", error);
      return null;
    }
  }
};
