import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, RefreshCw, Server, Activity, Users, Shield, Terminal } from 'lucide-react';

const AdminScreen = ({ t, onBack }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('stats'); // stats | users | logs

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

      // Fetch Users
      const usersRes = await fetch(`${BACKEND_URL}/api/admin/users`, {
        headers: { 'x-admin-secret': password }
      });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }

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
      <div className="flex flex-col items-center justify-center h-full p-6 space-y-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px]" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative z-10 glass-card p-8 rounded-[32px] w-full max-w-xs flex flex-col items-center border border-shark-cyan/20 shadow-2xl shadow-shark-cyan/10"
        >
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-shark-cyan to-primary flex items-center justify-center mb-6 shadow-lg shadow-shark-cyan/30">
            <Shield className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
          <h2 className="text-2xl font-black text-text mb-1 tracking-tight">Admin Portal</h2>
          <p className="text-xs text-text-secondary font-bold uppercase tracking-widest mb-6">Restricted Access</p>
          
          <form onSubmit={handleLogin} className="w-full space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter Access Code"
              className="w-full p-4 rounded-xl bg-black/5 dark:bg-black/40 border border-border text-center font-mono text-lg tracking-widest focus:outline-none focus:border-shark-cyan focus:ring-1 focus:ring-shark-cyan transition-all placeholder:text-gray-500/50"
              autoFocus
            />
            {error && <p className="text-error text-xs font-bold text-center animate-pulse">{error}</p>}
            <button
              type="submit"
              className="w-full py-4 bg-shark-cyan text-black rounded-xl font-black text-lg tracking-wide hover:bg-[#00D060] transition-all shadow-lg shadow-shark-cyan/20 active:scale-[0.98]"
            >
              Unlock System
            </button>
          </form>
        </motion.div>
        <button onClick={onBack} className="text-text-secondary text-xs font-bold uppercase tracking-widest hover:text-text transition-colors relative z-10">
          Cancel Authentication
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:20px_20px] pointer-events-none" />
      
      {/* Header */}
      <div className="flex items-center justify-between p-6 bg-surface/80 backdrop-blur-xl border-b border-border relative z-20">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft className="w-5 h-5 text-text" strokeWidth={2.5} />
          </button>
          <div>
            <h2 className="font-black text-xl text-text tracking-tight">Command Center</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-shark-cyan animate-pulse shadow-[0_0_8px_rgba(0,229,106,0.5)]" />
              <span className="text-[10px] font-bold text-shark-cyan uppercase tracking-wider">System Online</span>
            </div>
          </div>
        </div>
        <button 
          onClick={fetchData} 
          className={`w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/10 transition-colors ${loading ? 'animate-spin' : ''}`}
        >
          <RefreshCw className="w-5 h-5 text-shark-cyan" strokeWidth={2.5} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex p-2 gap-2 bg-surface/50 backdrop-blur-sm border-b border-border overflow-x-auto relative z-20">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 py-2.5 px-4 whitespace-nowrap rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'stats' ? 'bg-shark-cyan text-black shadow-lg shadow-shark-cyan/20' : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2.5 px-4 whitespace-nowrap rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'users' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2.5 px-4 whitespace-nowrap rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
            activeTab === 'logs' ? 'bg-text text-surface' : 'text-text-secondary hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          Logs
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10">
        {error && (
          <div className="p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-sm font-bold flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-error animate-ping" />
            {error}
          </div>
        )}

        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-2 gap-3">
            <StatCard 
              icon={<Activity className="w-5 h-5 text-shark-cyan" />}
              label="Backend Status"
              value={stats.status}
              subValue={`Uptime: ${(stats.uptime / 60).toFixed(0)}m`}
              color="shark-cyan"
            />
            <StatCard 
              icon={<Users className="w-5 h-5 text-primary" />}
              label="Active Users"
              value={stats.users}
              color="primary"
            />
            <StatCard 
              icon={<Server className="w-5 h-5 text-purple-500" />}
              label="Active Proxies"
              value={stats.proxies}
              subValue="Round-Robin Active"
              color="purple-500"
            />
            <StatCard 
              icon={<Shield className="w-5 h-5 text-orange-500" />}
              label="Active Alerts"
              value={stats.activeAlerts}
              subValue={`Total: ${stats.alerts}`}
              color="orange-500"
            />
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 mb-2">
               <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Total Users</div>
                  <div className="text-2xl font-black text-text">{users.length}</div>
               </div>
               <div className="glass-card p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mb-1">Online (5m)</div>
                  <div className="text-2xl font-black text-shark-cyan drop-shadow-[0_0_8px_rgba(0,229,106,0.5)]">{users.filter(u => u.isOnline).length}</div>
               </div>
            </div>

            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="glass-card p-4 rounded-2xl border border-white/5 flex justify-between items-center group hover:bg-white/5 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="font-bold text-text">{user.firstName} {user.username ? `(@${user.username})` : ''}</div>
                      {user.isOnline && <div className="w-2 h-2 rounded-full bg-shark-cyan animate-pulse shadow-[0_0_8px_rgba(0,229,106,0.8)]" />}
                    </div>
                    <div className="text-[10px] font-bold text-text-secondary uppercase tracking-wider bg-black/20 dark:bg-white/5 px-2 py-1 rounded-md inline-block">
                      ID: {user.id.substring(0, 8)}...
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{user.platform || 'Unknown'}</div>
                    <div className="text-[10px] text-text-secondary font-mono">{user.ip || 'Hidden'}</div>
                  </div>
                </div>
              ))}
              {users.length === 0 && (
                 <div className="text-center text-text-secondary py-12 font-medium">No users detected yet</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'logs' && (
          <div className="glass-card rounded-2xl border border-white/10 p-4 font-mono text-[10px] overflow-x-auto bg-[#0d1117] text-gray-300 shadow-inner">
            <div className="flex items-center space-x-2 mb-3 pb-3 border-b border-white/10 text-shark-cyan font-bold uppercase tracking-wider">
              <Terminal className="w-3 h-3" />
              <span>System Output Stream</span>
            </div>
            <div className="space-y-1.5 h-[400px] overflow-y-auto custom-scrollbar">
              {logs.length === 0 ? (
                <p className="text-text-secondary italic opacity-50">Waiting for system logs...</p>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className="whitespace-pre-wrap break-all hover:bg-white/5 p-0.5 rounded transition-colors">
                    <span className="text-text-secondary mr-2">[{new Date().toLocaleTimeString()}]</span>
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

const StatCard = ({ icon, label, value, subValue, color }) => (
  <motion.div 
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="glass-card p-5 rounded-[24px] border border-white/10 relative overflow-hidden group"
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${color ? `from-${color}/5` : 'from-primary/5'} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className="flex justify-between items-start mb-3 relative z-10">
      <div className="p-2.5 bg-surface rounded-xl shadow-sm ring-1 ring-black/5 dark:ring-white/5">{icon}</div>
    </div>
    <div className="text-3xl font-black text-text tracking-tighter relative z-10 mb-1">{value}</div>
    <div className="text-[10px] text-text-secondary font-black uppercase tracking-widest relative z-10">{label}</div>
    {subValue && <div className="text-[10px] text-text-secondary/70 font-medium mt-1 relative z-10">{subValue}</div>}
  </motion.div>
);

export default AdminScreen;