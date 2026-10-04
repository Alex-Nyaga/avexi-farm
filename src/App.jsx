import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Auth from './components/Auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MobileNavDrawer from './components/MobileNavDrawer';
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
import Enterprises from './pages/Enterprises';
import Enterprise from './pages/Enterprise';
import Onboarding from './components/Onboarding';
import { needsOnboarding } from './utils/enterprises';
import './index.css';

const AppContent = () => {
  const { currentUser, currentSection, checkSession, db, dbLoaded, loadFailed, retryLoad, doLogout, isAdminOrOwner, isStaff } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Close the mobile drawer whenever the user navigates to a new section
  useEffect(() => {
    setMobileNavOpen(false);
  }, [currentSection]);

  if (!currentUser) {
    return <Auth />;
  }

  if (!dbLoaded) {
    return <div className="boot">Loading your farm…</div>;
  }

  if (loadFailed) {
    return (
      <div className="boot">
        <div className="boot-card">
          <h2>Can’t reach your farm data</h2>
          <p className="text-muted">You appear to be offline and nothing is saved on this device yet. Reconnect and try again.</p>
          <div className="modal-actions">
            <button className="btn btn-primary" onClick={retryLoad}>Try again</button>
            <button className="btn btn-outline" onClick={doLogout}>Sign out</button>
          </div>
        </div>
      </div>
    );
  }

  if (isAdminOrOwner() && needsOnboarding(db)) {
    return <Onboarding />;
  }

  const renderPage = () => {
    if (currentSection.startsWith('ent:')) return <Enterprise enterpriseId={currentSection.slice(4)} />;
    if (isStaff() && ['finance', 'enterprises'].includes(currentSection)) return <Dashboard />;
    switch (currentSection) {
      case 'enterprises':
        return <Enterprises />;
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
      <Header onMenuClick={() => setMobileNavOpen(true)} />
      <div className="app-body">
        <Sidebar />
        <main>
          {renderPage()}
        </main>
      </div>
      <MobileNavDrawer open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
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