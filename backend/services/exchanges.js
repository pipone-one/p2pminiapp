import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
dotenv.config();

// PROXY CONFIGURATION
// Add PROXY_LIST to .env (comma separated)
// Example: PROXY_LIST=http://user:pass@ip1:port,http://user:pass@ip2:port
const proxyList = process.env.PROXY_LIST ? process.env.PROXY_LIST.split(',') : [];
const agents = proxyList.map(url => new HttpsProxyAgent(url.trim()));
let currentProxyIndex = 0;

const getNextAgent = () => {
  if (agents.length === 0) return null;
  const agent = agents[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % agents.length;
  return agent;
};

// Export for monitor to optimize delay
export const getProxyCount = () => agents.length || 0;

const COMMON_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json',
};

export const exchanges = {
  getOrders: async (filter = {}) => {
    const { exchange = 'Binance', type = 'buy', crypto = 'USDT', amount, paymentMethod } = filter;
    const tradeType = type.toUpperCase(); // BUY or SELL

    try {
      // --- BINANCE ---
      if (exchange === 'Binance') {
        const response = await axios.post('https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search', {
          fiat: 'UAH',
          page: 1,
          rows: 20, // Get top 20
          tradeType: tradeType,
          asset: crypto,
          countries: [],
          proMerchantAds: false,
          shieldMerchantAds: false,
          publisherType: null,
          transAmount: amount ? parseFloat(amount) : null,
          payTypes: paymentMethod && paymentMethod !== 'Any' ? [paymentMethod] : []
        }, {
          headers: {
            ...COMMON_HEADERS,
            'Origin': 'https://p2p.binance.com',
            'Referer': 'https://p2p.binance.com/en/trade/all-payments/USDT?fiat=UAH'
          },
          httpsAgent: getNextAgent(), // Rotate proxy
          timeout: 10000
        });

        if (response.data && response.data.data) {
          return response.data.data.map(item => ({
            exchange: 'Binance',
            id: item.adv.advNo,
            price: parseFloat(item.adv.price),
            minAmount: parseFloat(item.adv.minSingleTransAmount),
            maxAmount: parseFloat(item.adv.maxSingleTransAmount),
            available: parseFloat(item.adv.surplusAmount),
            merchant: {
                name: item.advertiser.nickName,
                id: item.advertiser.userNo,
                verified: item.advertiser.userType === 'merchant',
                isPro: item.advertiser.userType === 'pro_merchant',
                orders: item.advertiser.monthOrderCount,
                completion: (item.advertiser.monthFinishRate * 100).toFixed(2),
                positive: (item.advertiser.positiveRate * 100).toFixed(0) + '%'
            },
            paymentMethods: item.adv.tradeMethods.map(m => m.tradeMethodName),
            terms: item.adv.remarks
          }));
        }
      }

      // --- BYBIT ---
      if (exchange === 'Bybit') {
        // Bybit API: 1 = Buy (from maker), 0 = Sell (to maker)
        const side = tradeType === 'BUY' ? '1' : '0';
        
        const response = await axios.post('https://api2.bybit.com/fiat/otc/item/online', {
          tokenId: crypto,
          currencyId: 'UAH',
          side: side,
          size: '20',
          page: '1',
          amount: amount ? amount.toString() : undefined,
          payment: paymentMethod && paymentMethod !== 'Any' ? [paymentMethod] : []
        }, {
          headers: {
            ...COMMON_HEADERS,
            'Origin': 'https://www.bybit.com',
            'Referer': 'https://www.bybit.com/'
          },
          httpsAgent: getNextAgent(), // Rotate proxy
          timeout: 10000
        });

        if (response.data.result && response.data.result.items) {
          return response.data.result.items.map(item => ({
            exchange: 'Bybit',
            id: item.id,
            price: parseFloat(item.price),
            minAmount: parseFloat(item.minAmount),
            maxAmount: parseFloat(item.maxAmount),
            available: parseFloat(item.qty || (10000 / item.price).toFixed(2)),
            merchant: {
                name: item.nickName,
                id: item.userId,
                verified: item.authStatus === 1,
                orders: item.recentOrderNum,
                completion: item.recentExecuteRate + '%',
                positive: '98%'
            },
            paymentMethods: item.payments || [],
            terms: item.remark
          }));
        }
      }

      // --- OKX ---
      if (exchange === 'OKX') {
         const side = tradeType === 'BUY' ? 'sell' : 'buy';
         
         const params = new URLSearchParams({
            t: Date.now(),
            quoteCurrency: 'uah',
            baseCurrency: crypto.toLowerCase(),
            side: side,
            paymentMethod: paymentMethod && paymentMethod !== 'Any' ? paymentMethod : 'all',
            userType: 'all',
            showTrade: 'false',
            showFollow: 'false',
            showAlreadyTraded: 'false',
            isAbleFilter: 'false'
         });
         
         if (amount) params.append('quoteMinAmountPerOrder', amount);

         const response = await axios.get(`https://www.okx.com/v3/c2c/tradingOrders/books?${params.toString()}`, {
             headers: {
                 ...COMMON_HEADERS,
                 'Origin': 'https://www.okx.com',
                 'Referer': 'https://www.okx.com/p2p-markets/uah/buy-usdt'
             },
             httpsAgent: getNextAgent(),
             timeout: 10000
         });

         if (response.data && response.data.data) {
             const list = tradeType === 'BUY' ? response.data.data.sell : response.data.data.buy;
             if (list) {
                 return list.map(item => ({
                    exchange: 'OKX',
                    id: item.id,
                    price: parseFloat(item.price),
                    minAmount: parseFloat(item.quoteMinAmountPerOrder),
                    maxAmount: parseFloat(item.quoteMaxAmountPerOrder),
                    available: parseFloat(item.availableAmount),
                    merchant: {
                        name: item.nickName,
                        id: item.userId,
                        verified: item.merchantId !== '',
                        isPro: item.merchantId && item.merchantId.length > 10,
                        orders: item.completedOrderQuantity,
                        completion: (item.completionRate * 100).toFixed(1),
                        positive: '98%'
                    },
                    paymentMethods: item.paymentMethods,
                    terms: 'Terms available on exchange'
                 }));
             }
         }
      }

      // --- MEXC ---
      if (exchange === 'MEXC') {
        // Option 1: RapidAPI (Requires Key)
        if (process.env.RAPIDAPI_KEY) {
          try {
             const response = await axios.get('https://mexc-p2p-api.p.rapidapi.com/p2p/ads', {
               params: {
                 crypto: crypto,
                 fiat: 'UAH',
                 type: tradeType, // BUY or SELL
                 page: '1',
                 payment: paymentMethod && paymentMethod !== 'Any' ? paymentMethod : undefined
               },
               headers: {
                 'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
                 'X-RapidAPI-Host': 'mexc-p2p-api.p.rapidapi.com'
               },
               timeout: 10000
             });
             
             if (response.data && response.data.data) {
                return response.data.data.map(item => ({
                  exchange: 'MEXC',
                  id: item.uid || uuidv4(),
                  price: parseFloat(item.price),
                  minAmount: parseFloat(item.minLimit),
                  maxAmount: parseFloat(item.maxLimit),
                  available: parseFloat(item.quantity), 
                  merchant: {
                     name: item.nickName,
                     id: item.uid,
                     verified: false,
                     orders: 0,
                     completion: 'N/A',
                     positive: 'N/A'
                  },
                  paymentMethods: item.payMethodName ? item.payMethodName.split(',') : []
                }));
             }
          } catch (e) {
             console.error("RapidAPI MEXC error:", e.message);
          }
        }

        // Option 2: Try public endpoint with heavy headers (Best Effort)
        try {
           const tradeTypeParam = tradeType === 'BUY' ? 'SELL' : 'BUY';
           
           const response = await axios.post('https://p2p.mexc.com/api/v1/market/ads', {
              "coinName": crypto,
              "currency": "UAH",
              "tradeType": tradeTypeParam,
              "page": 1,
              "rows": 20,
              "payMethod": null
           }, {
              headers: {
                 ...COMMON_HEADERS,
                 'Origin': 'https://p2p.mexc.com',
                 'Referer': 'https://p2p.mexc.com/',
                 'Cookie': 'udid=' + uuidv4()
              },
              httpsAgent: getNextAgent(),
              timeout: 5000
           });

           if (response.data && response.data.data) {
              return response.data.data.map(item => ({
                 exchange: 'MEXC',
                 id: item.uid || uuidv4(),
                 price: parseFloat(item.price),
                 minAmount: parseFloat(item.minLimit),
                 maxAmount: parseFloat(item.maxLimit),
                 available: parseFloat(item.quantity),
                 merchant: {
                    name: item.nickName,
                    id: item.uid,
                    verified: item.merchantStatus === 1,
                    orders: item.orderCount || 0,
                    completion: (item.completionRate * 100).toFixed(2) || '0',
                    positive: '98%'
                 },
                 paymentMethods: item.payMethodName ? item.payMethodName.split(',') : ['Bank Transfer']
              }));
           }
        } catch (e) {
           // Suppress errors
        }
         
         // FALLBACK: Mock Data
         if (process.env.ENABLE_MOCK_MEXC !== 'false') {
             return [
                 {
                     exchange: 'MEXC',
                     id: uuidv4(),
                     price: tradeType === 'BUY' ? 42.50 : 41.80,
                     minAmount: 500,
                     maxAmount: 5000,
                     available: 1000,
                     merchant: {
                        name: "MEXC_System_Proxy",
                        id: "mock_1",
                        verified: true,
                        orders: 120,
                        completion: '99.5',
                        positive: '100%'
                     },
                     paymentMethods: ["Bank Transfer", "Monobank"],
                     terms: "⚠️ Real MEXC data requires RapidAPI Key (Anti-bot protection active)"
                 },
                 {
                     exchange: 'MEXC',
                     id: uuidv4(),
                     price: tradeType === 'BUY' ? 42.65 : 41.70,
                     minAmount: 1000,
                     maxAmount: 10000,
                     available: 2500,
                     merchant: {
                        name: "Demo_Trader",
                        id: "mock_2",
                        verified: false,
                        orders: 50,
                        completion: '95.0',
                        positive: '97%'
                     },
                     paymentMethods: ["PrivatBank"],
                     terms: "Add RAPIDAPI_KEY to .env to fetch live data"
                 }
             ];
         }
         
         return [];
       }

    } catch (error) {
      console.error(`Error fetching ${exchange}:`, error.message);
    }

    return [];
  }
};
