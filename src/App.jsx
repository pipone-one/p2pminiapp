import React from 'react';
import MarketScreen from './components/MarketScreen';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <MarketScreen />
      <Navigation />
    </div>
  );
}

export default App;
