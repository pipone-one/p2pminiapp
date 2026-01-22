import React, { useState } from 'react';
import MarketScreen from './components/MarketScreen';
import AlertsScreen from './components/AlertsScreen';
import SettingsScreen from './components/SettingsScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import MerchantScreen from './components/MerchantScreen';
import Navigation from './components/Navigation';

function App() {
  const [activeTab, setActiveTab] = useState('Market');

  const renderScreen = () => {
    switch (activeTab) {
      case 'Market':
        return <MarketScreen />;
      case 'Alerts':
        return <AlertsScreen />;
      case 'Analytics':
        return <AnalyticsScreen />;
      case 'Merchant':
        return <MerchantScreen />;
      case 'Settings':
        return <SettingsScreen />;
      default:
        return <MarketScreen />;
    }
  };

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      {renderScreen()}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
