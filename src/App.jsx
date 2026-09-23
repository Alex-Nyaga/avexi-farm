import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import PwaBanner from './components/PwaBanner';
import Dashboard from './pages/Dashboard';
import Cows from './pages/Cows';
import Sheep from './pages/Sheep';
import Milk from './pages/Milk';
import Vet from './pages/Vet';
import Potatoes from './pages/Potatoes';
import Staff from './pages/Staff';
import Finance from './pages/Finance';
import Insights from './pages/Insights';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import './index.css';

const AppContent = () => {
  const { currentUser, currentSection, checkSession } = useApp();

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (!currentUser) {
    return <Auth />;
  }

  const renderPage = () => {
    switch (currentSection) {
      case 'dashboard':
        return <Dashboard />;
      case 'cows':
        return <Cows />;
      case 'sheep':
        return <Sheep />;
      case 'milk':
        return <Milk />;
      case 'vet':
        return <Vet />;
      case 'potatoes':
        return <Potatoes />;
      case 'staff':
        return <Staff />;
      case 'finance':
        return <Finance />;
      case 'insights':
        return <Insights />;
      case 'reports':
        return <Reports />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <Sidebar />
        <main>
          {renderPage()}
        </main>
      </div>
      <BottomNav />
      <PwaBanner />
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;