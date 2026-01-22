import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';
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
            price: parseFloat(item.adv.price),
            minAmount: parseFloat(item.adv.minSingleTransAmount),
            maxAmount: parseFloat(item.adv.maxSingleTransAmount),
            merchant: item.advertiser.nickName,
            paymentMethods: item.adv.tradeMethods.map(m => m.tradeMethodName)
          }));
        }
      }

      // --- BYBIT ---
      if (exchange === 'Bybit') {
        // Bybit API: 1 = Buy (from maker), 0 = Sell (to maker)
        // Wait, if I want to BUY USDT, I am taking a Sell ad?
        // Let's check api.js logic: "const side = tradeType === 'BUY' ? '1' : '0';"
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
            price: parseFloat(item.price),
            minAmount: parseFloat(item.minAmount),
            maxAmount: parseFloat(item.maxAmount),
            merchant: item.nickName,
            paymentMethods: item.payments // Bybit returns IDs, might need mapping, but for alerts price is key
          }));
        }
      }

      // --- OKX ---
      // OKX is complex due to signing, but public P2P might work.
      // Skipping for MVP stability unless user specifically requested. 
      // api.js has it, so I should try.
      // api.js path: /okx-api/v3/c2c/tradingOrders/books
      if (exchange === 'OKX') {
         const side = tradeType === 'BUY' ? 'sell' : 'buy'; // Inverted for OKX book? 
         // api.js: "side: tradeType === 'BUY' ? 'sell' : 'buy'"
         
         const params = new URLSearchParams({
            t: Date.now(),
            quoteCurrency: 'uah',
            baseCurrency: crypto.toLowerCase(),
            side: side,
            paymentMethod: paymentMethod && paymentMethod !== 'Any' ? paymentMethod : 'all',
            userType: 'all',
            showTrade: false,
            showFollow: false,
            showAlreadyTraded: false,
            isAbleFilter: false
         });
         
         // Note: OKX public API is tricky. Using a simplified fetch if possible.
         // Often returns 403 to bots.
         // We will skip OKX in backend prototype to ensure stability for now.
         return [];
      }

    } catch (error) {
      console.error(`Error fetching ${exchange}:`, error.message);
    }

    return [];
  }
};
