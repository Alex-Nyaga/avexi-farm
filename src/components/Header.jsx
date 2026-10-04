import React from 'react';
import { useApp } from '../context/AppContext';

const Header = ({ onMenuClick }) => {
  const { syncStatus, toggleTheme, doLogout, notifications, currentUser } = useApp();
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

  const syncLabel = syncStatus === 'online' ? 'Connected' : syncStatus === 'offline' ? 'Saved on this device' : 'Syncing';
  const userName = currentUser?.name || currentUser?.username || 'My';

  return (
    <>
      <header>
        <button className="hamburger-btn" onClick={onMenuClick} type="button" aria-label="Open menu">
          <span /><span /><span />
        </button>
        <div className="hdr-logo">
          <img className="hdr-logo-image" src="/avexi-wordmark.svg" alt="Avexi Farm" />
        </div>
        <div className="hdr-spacer" />
        <div className="hdr-farm">
          <div style={{ fontWeight: '600', fontSize: '.78rem' }}>{userName}&apos;s Farm</div>
          <div>Nyandarua, Kenya</div>
        </div>
        <span id="sync-indicator" className="status-label" title={syncLabel} role="status" aria-label={`Data status: ${syncLabel}`}>
          <span className={`sync-dot sync-dot--${syncStatus}`} />
        </span>
        <button className="text-btn icon-btn" id="notif-btn" onClick={() => setShowNotifPanel(!showNotifPanel)} type="button" aria-label={`Notifications${notifications.length > 0 ? `, ${notifications.length} unread` : ''}`} title="Notifications">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
          {notifications.length > 0 && <span className="badge bg-red">{notifications.length}</span>}
        </button>
        <button className="text-btn icon-btn" onClick={toggleTheme} id="theme-btn" type="button" aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'} title={isDark ? 'Light mode' : 'Dark mode'}>
          {isDark ? (
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42"/></svg>
          ) : (
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.5 15.5A8.5 8.5 0 0 1 8.5 3.5 8.5 8.5 0 1 0 20.5 15.5Z"/></svg>
          )}
        </button>
        <button className="text-btn header-signout" onClick={doLogout} type="button" aria-label="Sign out" title="Sign out">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6"/></svg>
          <span>Sign out</span>
        </button>
      </header>

      <div className={`notif-panel ${showNotifPanel ? 'open' : ''}`}>
        <div className="notif-header">
          <span>Notifications</span><span className="badge bg-red">{notifications.length}</span>
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
