import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exchanges, getProxyCount } from './exchanges.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '../db/alerts.json');

// Ensure DB exists
if (!fs.existsSync(path.dirname(DB_PATH))) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
}
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify([]));
}

export class Monitor {
  constructor(bot) {
    this.bot = bot;
    this.alerts = this.loadAlerts();
    this.isScanning = false;
    this.scanInterval = 30000; // 30 seconds
  }

  loadAlerts() {
    try {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      return JSON.parse(data) || [];
    } catch (e) {
      return [];
    }
  }

  saveAlerts(alerts) {
    this.alerts = alerts;
    fs.writeFileSync(DB_PATH, JSON.stringify(alerts, null, 2));
  }

  addAlert(alert) {
    // Alert structure: { id, chatId, exchange, type, crypto, price, amount, paymentMethod, active: true }
    const exists = this.alerts.find(a => a.id === alert.id);
    if (exists) {
      this.alerts = this.alerts.map(a => a.id === alert.id ? alert : a);
    } else {
      this.alerts.push(alert);
    }
    this.saveAlerts(this.alerts);
  }

  removeAlert(id) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    this.saveAlerts(this.alerts);
  }

  start() {
    console.log('Monitor started. Alerts:', this.alerts.length);
    // Use a simpler loop with delay to enforce rate limits naturally
    this.runLoop();
  }

  async runLoop() {
    while (true) {
      await this.scan();
      // Wait 30 seconds before next full cycle, BUT ensuring we didn't just finish a long cycle
      await new Promise(r => setTimeout(r, 30000));
    }
  }

  async scan() {
    if (this.isScanning) return;
    this.isScanning = true;
    console.log(`Scanning... Active alerts: ${this.alerts.filter(a => a.active).length}`);

    try {
      // 1. Group active alerts
      const activeAlerts = this.alerts.filter(a => a.active);
      const groups = {};

      activeAlerts.forEach(alert => {
        const key = `${alert.exchange}|${alert.type}|${alert.crypto}|${alert.paymentMethod}`;
        if (!groups[key]) {
          groups[key] = {
            exchange: alert.exchange,
            type: alert.type,
            crypto: alert.crypto,
            paymentMethod: alert.paymentMethod,
            alerts: []
          };
        }
        groups[key].alerts.push(alert);
      });

      // 2. Process groups with STRICT Rate Limiting
      const groupKeys = Object.keys(groups);
      console.log(`Processing ${groupKeys.length} unique groups...`);

      // Dynamic delay based on proxy count
      // 1 proxy = 2000ms delay
      // 5 proxies = 400ms delay
      // 10 proxies = 200ms delay (min safe)
      const proxyCount = getProxyCount() || 1;
      const delayMs = Math.max(200, 2000 / proxyCount);
      console.log(`Using ${proxyCount} proxies. Delay between requests: ${delayMs.toFixed(0)}ms`);

      for (const key of groupKeys) {
        const group = groups[key];
        
        // RATE LIMIT: Wait dynamic time
        await new Promise(r => setTimeout(r, delayMs));

        try {
          const orders = await exchanges.getOrders({
            exchange: group.exchange,
            type: group.type,
            crypto: group.crypto,
            paymentMethod: group.paymentMethod,
            amount: null 
          });

          if (!orders || orders.length === 0) continue;

          // 3. Check alerts
          for (const alert of group.alerts) {
             // ... existing logic ...
             const bestOrder = orders.find(order => {
                const priceCondition = alert.type === 'buy' 
                  ? order.price <= parseFloat(alert.price)
                  : order.price >= parseFloat(alert.price);
                
                if (!priceCondition) return false;

                if (alert.amount && alert.amount !== 'Any') {
                   const userAmount = parseFloat(alert.amount);
                   if (userAmount < order.minAmount || userAmount > order.maxAmount) return false;
                }
                return true;
             });

             if (bestOrder) {
               this.triggerAlert(alert, bestOrder);
             }
          }
        } catch (err) {
          console.error(`Error processing group ${key}:`, err.message);
        }
      }

    } catch (e) {
      console.error('Scan error:', e);
    } finally {
      this.isScanning = false;
    }
  }

  triggerAlert(alert, order) {
    console.log(`Alert Triggered! User: ${alert.chatId}, Price: ${order.price}`);
    
    // Disable alert after trigger to avoid spam
    alert.active = false;
    alert.lastTriggered = Date.now();
    alert.matchedPrice = order.price;
    this.saveAlerts(this.alerts);

    // Send Telegram Notification
    if (this.bot && alert.chatId) {
      const emoji = alert.type === 'buy' ? '🟢' : '🔴';
      const action = alert.type === 'buy' ? 'Buy' : 'Sell';
      const text = `${emoji} *Price Alert Triggered!*\n\n` +
                   `Exchange: ${alert.exchange}\n` +
                   `Action: ${action} ${alert.crypto}\n` +
                   `Target Price: ${alert.price}\n` +
                   `Found Price: *${order.price}*\n` +
                   `Merchant: ${order.merchant}\n` +
                   `Link: ${order.paymentMethods.join(', ')}\n\n` +
                   `👉 Check app for details!`;
      
      this.bot.sendMessage(alert.chatId, text, { parse_mode: 'Markdown' })
        .catch(e => console.error(`Failed to send TG message to ${alert.chatId}:`, e.message));
    }
  }
}
