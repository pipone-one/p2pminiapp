import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Server, Activity, Users, Shield, Terminal } from 'lucide-react';

const AdminScreen = ({ t, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats'); // stats | logs

  const BACKEND_URL = 'http://localhost:3000'; // In prod, this should be dynamic or relative

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'admin123') { // Simple client-side check for MVP UI, real auth is on server
      setIsAuthenticated(true);
      fetchData();
    } else {
      setError('Invalid password');
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      // Fetch Stats
      const statsRes = await fetch(`${BACKEND_URL}/api/admin/stats`, {
        headers: { 'x-admin-secret': password }
      });
      if (!statsRes.ok) throw new Error('Failed to fetch stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch Logs
      const logsRes = await fetch(`${BACKEND_URL}/api/admin/logs`, {
        headers: { 'x-admin-secret': password }
      });
      if (!logsRes.ok) throw new Error('Failed to fetch logs');
      const logsData = await logsRes.json();
      setLogs(logsData.logs || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(fetchData, 5000); // Auto-refresh every 5s
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-4">
        <Shield className="w-16 h-16 text-primary" />
        <h2 className="text-xl font-bold text-text">Admin Command Center</h2>
        <form onSubmit={handleLogin} className="w-full max-w-xs space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin PIN"
            className="w-full p-3 rounded-xl bg-surface border border-border text-text focus:outline-none focus:border-primary"
          />
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            className="w-full py-3 bg-primary text-white rounded-xl font-semibold hover:opacity-90"
          >
            Access System
          </button>
        </form>
        <button onClick={onBack} className="text-secondary text-sm">
          Return to App
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-surface border-b border-border">
        <div className="flex items-center space-x-3">
          <button onClick={onBack} className="p-2 hover:bg-background rounded-full">
            <ArrowLeft className="w-5 h-5 text-text" />
          </button>
          <h2 className="font-bold text-lg text-text">System Status</h2>
        </div>
        <button 
          onClick={fetchData} 
          className={`p-2 rounded-full hover:bg-background ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5 text-primary" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 space-x-2 bg-background border-b border-border">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'stats' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 rounded-lg text-sm font-medium ${
            activeTab === 'logs' ? 'bg-primary text-white' : 'text-secondary hover:bg-surface'
          }`}
        >
          Server Logs
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">
            {error}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 gap-4">
            <StatCard 
              icon={<Activity className="w-5 h-5 text-green-500" />}
              label="Backend Status"
              value={stats.status}
              subValue={`Uptime: ${(stats.uptime / 60).toFixed(0)}m`}
            />
            <StatCard 
              icon={<Users className="w-5 h-5 text-blue-500" />}
              label="Active Users"
              value={stats.users}
            />
            <StatCard 
              icon={<Server className="w-5 h-5 text-purple-500" />}
              label="Active Proxies"
              value={stats.proxies}
              subValue="Round-Robin Active"
            />
            <StatCard 
              icon={<Shield className="w-5 h-5 text-orange-500" />}
              label="Active Alerts"
              value={stats.activeAlerts}
              subValue={`Total: ${stats.alerts}`}
            />
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="bg-surface rounded-xl border border-border p-4 font-mono text-xs overflow-x-auto">
            <div className="flex items-center space-x-2 mb-2 text-secondary">
              <Terminal className="w-4 h-4" />
              <span>Real-time Server Output</span>
            </div>
            <div className="space-y-1">
              {logs.length === 0 ? (
                <p className="text-secondary italic">No logs available</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="text-text whitespace-nowrap">
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, subValue }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-surface p-4 rounded-xl border border-border"
  >
    <div className="flex justify-between items-start mb-2">
      <div className="p-2 bg-background rounded-lg">{icon}</div>
    </div>
    <div className="text-2xl font-bold text-text">{value}</div>
    <div className="text-xs text-secondary font-medium mb-1">{label}</div>
    {subValue && <div className="text-xs text-secondary/70">{subValue}</div>}
  </motion.div>
);

export default AdminScreen;