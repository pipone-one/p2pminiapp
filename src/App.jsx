import React, { useState, useEffect } from 'react';
import MarketScreen from './components/MarketScreen';
import AlertsScreen from './components/AlertsScreen';
import SettingsScreen from './components/SettingsScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import Navigation from './components/Navigation';
import Notification from './components/Notification';
import AdminScreen from './components/AdminScreen';
import { translations } from './utils/translations';
import { checkAlerts } from './services/monitoring';
import { hapticFeedback } from './utils/telegram';

function App() {
  const [activeTab, setActiveTab] = useState('Market');
  const [theme, setTheme] = useState('dark');
  const [language, setLanguage] = useState('ru');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [toastNotifications, setToastNotifications] = useState([]);
  const [adminClicks, setAdminClicks] = useState(0);

  useEffect(() => {
    // Initial theme setup
    document.documentElement.classList.add('dark');
  }, []);

  // Monitoring Effect
  useEffect(() => {
    if (!notificationsEnabled) return;

    const intervalId = setInterval(async () => {
      const savedAlerts = localStorage.getItem('user_alerts');
      if (!savedAlerts) return;

      const alerts = JSON.parse(savedAlerts);
      const activeAlerts = alerts.filter(a => a.active);

      if (activeAlerts.length === 0) return;

      const triggered = await checkAlerts(activeAlerts);

      if (triggered.length > 0) {
        // Update alerts in storage
        const updatedAlerts = alerts.map(alert => {
          const match = triggered.find(t => t.alert.id === alert.id);
          if (match) {
            return {
              ...alert,
              active: alert.isRecurring, // Disable if not recurring
              lastTriggered: Date.now(),
              matchedPrice: match.matchedOrder.price
            };
          }
          return alert;
        });

        localStorage.setItem('user_alerts', JSON.stringify(updatedAlerts));

        // Create notifications
        const newToasts = triggered.map(t => ({
          id: Date.now() + Math.random(),
          alertId: t.alert.id,
          title: t.alert.type === 'buy' ? 'Price Drop Alert!' : 'Price Spike Alert!',
          message: `${t.alert.pair} reached ${t.matchedOrder.price} on ${t.alert.exchange}`,
          timestamp: Date.now()
        }));

        setToastNotifications(prev => [...newToasts, ...prev]);
        hapticFeedback('success');
      }
    }, 15000); // Check every 15 seconds

    return () => clearInterval(intervalId);
  }, [notificationsEnabled]);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  const t = (path) => {
    const keys = path.split('.');
    let current = translations[language];
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    return current;
  };

  const removeNotification = (id) => {
    setToastNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleOpenAlert = (alertId) => {
    setActiveTab('Alerts');
    // We could pass a prop to highlight the alert, but for now just switching tab is enough
  };

  const handleAdminTrigger = () => {
    setAdminClicks(prev => {
      if (prev + 1 >= 5) {
        setActiveTab('Admin');
        return 0;
      }
      return prev + 1;
    });
  };

  const renderScreen = () => {
    const commonProps = { theme, t };

    if (activeTab === 'Admin') {
      return <AdminScreen {...commonProps} onBack={() => setActiveTab('Settings')} />;
    }

    switch (activeTab) {
      case 'Market':
        return <MarketScreen {...commonProps} />;
      case 'Alerts':
        return <AlertsScreen {...commonProps} />;
      case 'Analytics':
        return <AnalyticsScreen {...commonProps} />;
      case 'Settings':
        return (
          <SettingsScreen 
            {...commonProps} 
            toggleTheme={toggleTheme} 
            language={language}
            setLanguage={setLanguage}
            notifications={notificationsEnabled}
            setNotifications={setNotificationsEnabled}
          />
        );
      default:
        return <MarketScreen {...commonProps} />;
    }
  };

  return (
    <div className={`min-h-screen bg-background text-text pb-24 ${theme}`}>
      <Notification 
        notifications={toastNotifications} 
        removeNotification={removeNotification}
        onOpenAlert={handleOpenAlert}
      />
      {renderScreen()}
      {activeTab !== 'Admin' && (
        <Navigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          t={t}
          onLogoClick={handleAdminTrigger}
        />
      )}
    </div>
  );
}

export default App;
