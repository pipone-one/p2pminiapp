import { api } from './api';

export const checkAlerts = async (alerts) => {
  const triggeredAlerts = [];
  const activeAlerts = alerts.filter(a => a.active);

  // We'll process alerts sequentially to avoid flooding the API
  // In a real app, we'd batch these or use a websocket
  for (const alert of activeAlerts) {
    try {
      // Parse alert data
      const [fiat, crypto] = alert.pair.split('/');
      const targetPrice = parseFloat(alert.price);
      
      // Fetch current orders matching criteria
      const orders = await api.getOrders({
        exchange: alert.exchange,
        type: alert.type, // 'buy' or 'sell'
        crypto: crypto,
        amount: alert.minAmount === 'Any' ? null : alert.minAmount,
        paymentMethod: alert.paymentMethod === 'Any' ? null : alert.paymentMethod
      });

      if (orders && orders.length > 0) {
        // Find best matching order
        // For BUY alert (we want to buy), we look for Sell orders with price <= target
        // For SELL alert (we want to sell), we look for Buy orders with price >= target
        
        const bestOrder = orders[0]; // Orders are usually sorted by best price
        const currentPrice = parseFloat(bestOrder.price);

        let isMatch = false;
        if (alert.type === 'buy') {
           // We want to buy cheap. If market price <= target, trigger.
           if (currentPrice <= targetPrice) isMatch = true;
        } else {
           // We want to sell expensive. If market price >= target, trigger.
           if (currentPrice >= targetPrice) isMatch = true;
        }

        if (isMatch) {
          triggeredAlerts.push({
            alert,
            matchedOrder: bestOrder
          });
        }
      }
    } catch (e) {
      console.error(`Error checking alert ${alert.id}:`, e);
    }
  }

  return triggeredAlerts;
};
