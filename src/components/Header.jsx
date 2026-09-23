import React from 'react';
import { useApp } from '../context/AppContext';

const Header = () => {
  const { syncStatus, toggleTheme, doLogout, notifications } = useApp();
  const [showNotifPanel, setShowNotifPanel] = React.useState(false);

  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notif-panel') && !event.target.closest('#notif-btn')) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

  return (
    <>
      <header>
        <div className="hdr-logo"><span className="hdr-name">Avexi</span></div>
        <div className="hdr-spacer" />
        <div className="hdr-farm">
          <div style={{ fontWeight: '600', fontSize: '.78rem' }}>Avelyne Wambui&apos;s Farm</div>
          <div>Nyandarua, Kenya</div>
        </div>
        <span id="sync-indicator" className="status-label">
          {syncStatus === 'online' ? 'Cloud' : syncStatus === 'offline' ? 'Local' : 'Syncing'}
        </span>
        <button className="text-btn" id="notif-btn" onClick={() => setShowNotifPanel(!showNotifPanel)} type="button">
          Notifications {notifications.length > 0 && <span className="badge bg-red">{notifications.length}</span>}
        </button>
        <button className="text-btn" onClick={toggleTheme} id="theme-btn" type="button">
          {isDark ? 'Light mode' : 'Dark mode'}
        </button>
        <button className="text-btn" onClick={doLogout} type="button">Sign out</button>
      </header>

      <div className={`notif-panel ${showNotifPanel ? 'open' : ''}`}>
        <div className="notif-header">
          Notifications <span className="badge bg-red">{notifications.length}</span>
        </div>
        {notifications.length === 0 ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)', fontSize: '.85rem' }}>
            All clear. No alerts.
          </div>
        ) : notifications.map((notification, index) => (
          <div key={index} className="notif-item">
            <div className="notif-body">
              <div className="notif-title">{notification.title}</div>
              <div className="notif-text">{notification.text}</div>
              <div className="notif-time">{notification.time}</div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default Header;
