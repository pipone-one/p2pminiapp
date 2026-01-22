import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import TelegramBot from 'node-telegram-bot-api';
import { Monitor } from './services/monitor.js';
import { getProxyCount } from './services/exchanges.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// SECURITY: Helmet & Rate Limiting
app.use(helmet());
app.use(cors()); // Allow all for MVP, restrict in prod if needed
app.use(express.json({ limit: '10kb' })); // Body limit

// Rate Limit: 100 req per 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// LOGGING SYSTEM (In-Memory for Admin)
const logs = [];
const MAX_LOGS = 100;

// Custom stream for morgan
const logStream = {
  write: (message) => {
    const log = `[${new Date().toLocaleTimeString()}] ${message.trim()}`;
    logs.unshift(log);
    if (logs.length > MAX_LOGS) logs.pop();
    console.log(message.trim());
  }
};
app.use(morgan('short', { stream: logStream }));

const PORT = process.env.PORT || 3000;
const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'admin123'; // Set this in .env!

let bot = null;
if (TOKEN) {
  bot = new TelegramBot(TOKEN, { polling: true });
  console.log('Telegram Bot started');
} else {
  console.warn('WARNING: No TELEGRAM_BOT_TOKEN provided. Notifications will not be sent.');
}

const monitor = new Monitor(bot);
monitor.start();

// --- ADMIN API ---
const checkAdmin = (req, res, next) => {
  const secret = req.headers['x-admin-secret'];
  if (secret !== ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  next();
};

app.get('/api/admin/stats', checkAdmin, (req, res) => {
  const uptime = process.uptime();
  const alerts = monitor.alerts.length;
  const activeAlerts = monitor.alerts.filter(a => a.active).length;
  const users = new Set(monitor.alerts.map(a => a.chatId)).size;
  const proxies = getProxyCount();
  
  res.json({
    uptime: uptime.toFixed(0),
    alerts,
    activeAlerts,
    users,
    proxies,
    status: monitor.isScanning ? 'Scanning' : 'Idle'
  });
});

app.get('/api/admin/logs', checkAdmin, (req, res) => {
  res.json({ logs });
});

// API Endpoint to sync alerts from Frontend
app.post('/api/sync-alerts', (req, res) => {
  const { userId, alerts } = req.body;
  
  if (!userId || !Array.isArray(alerts)) {
    return res.status(400).json({ error: 'Invalid data' });
  }

  // Logic: Replace all alerts for this user with new ones
  // 1. Remove existing alerts for this user
  let currentAlerts = monitor.loadAlerts();
  currentAlerts = currentAlerts.filter(a => a.chatId !== userId);

  // 2. Add new alerts (ensure chatId is set)
  const newAlerts = alerts.map(a => ({
    ...a,
    chatId: userId,
    active: a.active !== false // Default to true if undefined
  }));

  const updatedAlerts = [...currentAlerts, ...newAlerts];
  monitor.saveAlerts(updatedAlerts);
  
  // Reload monitor memory
  monitor.alerts = updatedAlerts;

  console.log(`Synced ${newAlerts.length} alerts for user ${userId}`);
  res.json({ success: true, count: newAlerts.length });
});

app.get('/', (req, res) => {
  res.send('P2P Monitor Backend is running');
});

// Bot Commands
if (bot) {
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome! Open the Mini App to set up alerts.");
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
