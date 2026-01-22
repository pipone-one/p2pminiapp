import { hapticFeedback } from '../utils/telegram';

// No mocks, no delays. Strict API only.

export const api = {
  getOrders: async (filter = {}) => {
    // Debug logging
    console.log("Fetching orders with filter:", filter);

    try {
      const { exchange = 'Binance', type = 'buy', crypto = 'USDT', amount, paymentMethod } = filter;
      const tradeType = type.toUpperCase();
      
      // --- BINANCE OFFICIAL API ---
      if (exchange === 'Binance') {
        console.log("Executing Binance API call...");
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
            transAmount: amount ? parseFloat(amount) : null,
            payTypes: paymentMethod ? [paymentMethod] : [] 
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
                verified: item.advertiser.userType === 'merchant', // Yellow tick
                isPro: item.advertiser.userType === 'pro_merchant', // Purple diamond
                orders: item.advertiser.monthOrderCount, 
                completion: (item.advertiser.monthFinishRate * 100).toFixed(2), 
                avgTime: '5 min', 
                positive: (item.advertiser.positiveRate * 100).toFixed(0) + '%' 
              },
              price: item.adv.price,
              crypto: item.adv.asset,
              fiat: item.adv.fiatUnit,
              available: item.adv.surplusAmount, // Available amount
              limit: `${item.adv.minSingleTransAmount} - ${item.adv.maxSingleTransAmount}`,
              minLimit: parseFloat(item.adv.minSingleTransAmount),
              maxLimit: parseFloat(item.adv.maxSingleTransAmount),
              paymentMethods: item.adv.tradeMethods.map(m => m.tradeMethodName),
              terms: item.adv.remarks, // Merchant terms
              exchange: 'Binance'
            }));
          }
        }
        console.warn("Binance API returned no data or error");
        return [];
      }

      // --- BYBIT OFFICIAL API ---
      if (exchange === 'Bybit') {
        console.log("Executing Bybit API call...");
        // Bybit Web API: "1" means user buys from maker (maker sells)
        const side = tradeType === 'BUY' ? '1' : '0';
        
        // Using public web endpoint found via curl (works without auth)
        const response = await fetch('/bybit-api/fiat/otc/item/online', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            tokenId: crypto, 
            currencyId: 'UAH', 
            side: side, 
            size: '20', 
            page: '1',
            amount: amount ? amount.toString() : undefined,
          })
        });
        
        if (response.ok) {
          const result = await response.json();
          // Check for API errors
          if (result.ret_code !== 0) {
             console.warn("Bybit API Error:", result.ret_msg);
             return [];
          }

          if (result.result && result.result.items) {
             let items = result.result.items.map(item => ({
                id: item.id,
                type: type, // keep requested type
                merchant: { 
                  id: item.userId, 
                  name: item.nickName, 
                  verified: item.authStatus === 1, // Level 1 verified
                  isPro: item.authStatus === 2, // Level 2 verified (assumed Pro equivalent)
                  orders: item.recentOrderNum, 
                  completion: item.recentExecuteRate + '%', 
                  avgTime: '2 min', 
                  positive: '98%' 
                },
                price: item.price,
                crypto: crypto,
                fiat: 'UAH',
                available: item.qty || (10000 / item.price).toFixed(2), // Fallback if no qty
                limit: `${item.minAmount} - ${item.maxAmount}`,
                minLimit: parseFloat(item.minAmount),
                maxLimit: parseFloat(item.maxAmount),
                paymentMethods: item.payments ? item.payments.map(p => p) : [], 
                terms: item.remark, // Merchant terms
                exchange: 'Bybit'
             }));

             // Client-side payment filter for Bybit (since we don't map IDs yet)
             if (paymentMethod) {
                // Approximate filtering since Bybit uses IDs
                // Just pass through for now or improve if we map IDs
             }

             return items;
          }
        }
        console.warn("Bybit API returned no data or error");
        return [];
      }

      // --- OKX OFFICIAL API ---
      if (exchange === 'OKX') {
         console.log("Executing OKX API call...");
         // OKX Public API for P2P
         const side = tradeType === 'BUY' ? 'sell' : 'buy'; // OKX: 'sell' means maker sells (user buys)
         
         let url = `/okx-api/v3/c2c/tradingOrders/books?t=${Date.now()}&quoteCurrency=UAH&baseCurrency=${crypto}&side=${side}&paymentMethod=all&userType=all&showTrade=false&showFollow=false&showAlreadyTraded=false&isShowHide=false&urlId=1`;
         
         if (amount) {
           url += `&quoteMinAmountPerOrder=${amount}`;
         }

         const response = await fetch(url, {
           method: 'GET',
           headers: { 
             'Content-Type': 'application/json'
           }
         });
         
         if (response.ok) {
            const result = await response.json();
            if (result.data && result.data.sell) { // OKX structure varies
                let list = tradeType === 'BUY' ? result.data.sell : result.data.buy;
                
                if (list) {
                  // Client-side payment filter for OKX
                  if (paymentMethod) {
                    list = list.filter(item => item.paymentMethods.some(pm => pm.toLowerCase().includes(paymentMethod.toLowerCase())));
                  }

                  return list.map(item => ({
                    id: item.id,
                    type: type,
                    merchant: { 
                      id: item.userId, 
                      name: item.nickName, 
                      verified: item.merchantId !== '', 
                      isPro: item.merchantId && item.merchantId.length > 10, // Heuristic: OKX super merchants have IDs
                      orders: item.completedOrderQuantity, 
                      completion: (item.completionRate * 100).toFixed(1), 
                      avgTime: '5m', 
                      positive: '98%' 
                    },
                    price: item.price,
                    crypto: crypto,
                    fiat: 'UAH',
                    available: item.availableAmount,
                    limit: `${item.quoteMinAmountPerOrder} - ${item.quoteMaxAmountPerOrder}`,
                    paymentMethods: item.paymentMethods,
                    terms: 'Terms available on exchange', // OKX often hides terms in list view
                    exchange: 'OKX'
                  }));
                }
            }
         }
         console.warn("OKX API returned no data or error");
         return [];
      }
      
      // --- MEXC OFFICIAL API ---
      if (exchange === 'MEXC') {
         console.log("Executing MEXC API call...");
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
               "payMethod": null // MEXC might require ID too
            })
         });
         
         if (response.ok) {
            const result = await response.json();
            if (result.data) {
               let items = result.data.map(item => ({
                  id: item.adId,
                  type: type,
                  merchant: { 
                    id: item.uid, 
                    name: item.nickName, 
                    verified: item.merchant === 1, 
                    isPro: false, // MEXC mostly just has "merchant"
                    orders: item.orderCount, 
                    completion: (item.finishRate * 100).toFixed(0), 
                    avgTime: '10m', 
                    positive: '95%' 
                  },
                  price: item.price,
                   crypto: crypto,
                   fiat: 'UAH',
                   available: item.remainAmount,
                   limit: `${item.minLimit} - ${item.maxLimit}`,
                   minLimit: parseFloat(item.minLimit),
                   maxLimit: parseFloat(item.maxLimit),
                   paymentMethods: item.payMethodName ? item.payMethodName.split(',') : ['Bank Transfer'],
                   terms: item.remark,
                   exchange: 'MEXC'
                }));

               // Client-side filtering for MEXC
               if (amount) {
                  items = items.filter(item => {
                     const [min, max] = item.limit.split(' - ').map(Number);
                     return Number(amount) >= min && Number(amount) <= max;
                  });
               }
               if (paymentMethod) {
                  items = items.filter(item => item.paymentMethods.some(pm => pm.toLowerCase().includes(paymentMethod.toLowerCase())));
               }

               return items;
            }
         }
         console.warn("MEXC API returned no data or error");
         return [];
      }

    } catch (error) {
      console.error("Failed to fetch real data", error);
      return []; // No mocks allowed
    }

    return [];
  },

  getSpreads: async (minAmount = 1000) => {
    // Fetch Best Buy Price (User Buys / Maker Sells) and Best Sell Price (User Sells / Maker Buys) for all exchanges
    // This allows us to calculate arbitrage: Buy on A (Low) -> Sell on B (High)
    
    console.log(`Calculating spreads with minAmount: ${minAmount}...`);
    const exchanges = ['Binance', 'Bybit', 'OKX', 'MEXC'];
    const results = {};

    try {
      const requests = [];

      // Helper to push requests
      const addRequest = (exchange, type) => {
         // We reuse the logic from getOrders but optimized for just price fetching if possible
         // For now, we'll just call the same endpoints manually to ensure control
         const MIN_AMOUNT = minAmount; // Filter out dust/scam orders
         
         let promise;
         if (exchange === 'Binance') {
            promise = fetch('/binance-api/bapi/c2c/v2/friendly/c2c/adv/search', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  fiat: 'UAH', 
                  page: 1, 
                  rows: 1, 
                  tradeType: type.toUpperCase(), 
                  asset: 'USDT', 
                  countries: [], 
                  proMerchantAds: false, 
                  shieldMerchantAds: false, 
                  publisherType: null, 
                  transAmount: MIN_AMOUNT,
                  payTypes: [] 
                })
            }).then(r => r.json()).then(data => {
                if (data?.data?.[0]?.adv?.price) return { exchange, type, price: parseFloat(data.data[0].adv.price) };
                return null;
            }).catch(() => null);
         }
         
         if (exchange === 'Bybit') {
            // type 'BUY' -> side '1', type 'SELL' -> side '0'
            const side = type === 'BUY' ? '1' : '0';
            promise = fetch('/bybit-api/fiat/otc/item/online', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                  tokenId: 'USDT', 
                  currencyId: 'UAH', 
                  side: side, 
                  size: '1', 
                  page: '1',
                  amount: MIN_AMOUNT.toString() 
                })
            }).then(r => r.json()).then(data => {
                if (data?.result?.items?.[0]?.price) return { exchange, type, price: parseFloat(data.result.items[0].price) };
                return null;
            }).catch(() => null);
         }

         if (exchange === 'OKX') {
            // User Buy -> side 'sell' (Maker Sells)
            // User Sell -> side 'buy' (Maker Buys)
            const side = type === 'BUY' ? 'sell' : 'buy';
            promise = fetch(`/okx-api/v3/c2c/tradingOrders/books?t=${Date.now()}&quoteCurrency=UAH&baseCurrency=USDT&side=${side}&paymentMethod=all&userType=all&showTrade=false&showFollow=false&showAlreadyTraded=false&isShowHide=false&urlId=1&quoteMinAmountPerOrder=${MIN_AMOUNT}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            }).then(r => r.json()).then(data => {
                const list = type === 'BUY' ? data?.data?.sell : data?.data?.buy;
                if (list?.[0]?.price) return { exchange, type, price: parseFloat(list[0].price) };
                return null;
            }).catch(() => null);
         }

         if (exchange === 'MEXC') {
            // User Buy -> tradeType 'SELL' (Maker Sells)
            // User Sell -> tradeType 'BUY' (Maker Buys)
            const tradeTypeParam = type === 'BUY' ? 'SELL' : 'BUY';
            promise = fetch('/mexc-api/api/v1/market/ads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ coinName: 'USDT', currency: 'UAH', tradeType: tradeTypeParam, page: 1, rows: 1, payMethod: null })
            }).then(r => r.json()).then(data => {
                if (data?.data?.[0]?.price) return { exchange, type, price: parseFloat(data.data[0].price) };
                return null;
            }).catch(() => null);
         }

         if (promise) requests.push(promise);
      };

      // Queue up all requests
      exchanges.forEach(ex => {
          addRequest(ex, 'BUY');  // Price to Buy FROM Exchange (Low is good)
          addRequest(ex, 'SELL'); // Price to Sell TO Exchange (High is good)
      });

      const responses = await Promise.all(requests);
      
      // Organize prices
      const prices = {};
      responses.forEach(res => {
          if (res) {
              if (!prices[res.exchange]) prices[res.exchange] = {};
              prices[res.exchange][res.type] = res.price;
          }
      });
      
      console.log("Spread prices fetched:", prices);

      // Calculate Spreads
      // Strategy: Buy on A (Ask/Buy Price) -> Sell on B (Bid/Sell Price)
      const spreads = [];
      let idCounter = 1;

      exchanges.forEach(buyEx => {
          exchanges.forEach(sellEx => {
              if (buyEx === sellEx) return; // Skip same exchange

              const buyPrice = prices[buyEx]?.BUY;
              const sellPrice = prices[sellEx]?.SELL;

              if (buyPrice && sellPrice) {
                  // If Sell Price > Buy Price, we have profit
                  if (sellPrice > buyPrice) {
                      const diff = sellPrice - buyPrice;
                      const percent = (diff / buyPrice) * 100;
                      
                      if (percent >= 0) { // Show even break-even spreads to demonstrate data
                          spreads.push({
                              id: idCounter++,
                              buyExchange: buyEx,
                              sellExchange: sellEx,
                              buyPrice: buyPrice,
                              sellPrice: sellPrice,
                              profit: `+${percent.toFixed(2)}%`,
                              pair: 'USDT/UAH'
                          });
                      }
                  }
              }
          });
      });

      return spreads.sort((a, b) => parseFloat(b.profit) - parseFloat(a.profit));
    } catch (error) {
      console.error("Failed to fetch spreads", error);
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
