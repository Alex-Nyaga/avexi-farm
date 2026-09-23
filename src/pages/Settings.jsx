import React from 'react';
import { useApp } from '../context/AppContext';

const Settings = () => {
  const { currentUser, theme, toggleTheme, syncStatus, ldb, sdb } = useApp();

  const handleSync = async () => {
    await sdb();
    alert('Sync completed');
  };

  const handleRefresh = async () => {
    await ldb();
    alert('Data refreshed from cloud');
  };

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">Settings</div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Appearance</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Theme</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button 
              className={`btn ${theme === 'light' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => theme !== 'light' && toggleTheme()}
            >
              Light
            </button>
            <button 
              className={`btn ${theme === 'dark' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => theme !== 'dark' && toggleTheme()}
            >
              Dark
            </button>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Data Sync</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Sync Status</label>
          <div style={{ 
            padding: '.5rem 1rem', 
            borderRadius: '8px', 
            background: syncStatus === 'online' ? 'var(--green-l)' : syncStatus === 'offline' ? 'var(--amber-l)' : 'var(--blue-l)',
            color: syncStatus === 'online' ? 'var(--green)' : syncStatus === 'offline' ? 'var(--amber)' : 'var(--blue)',
            fontWeight: '600'
          }}>
            {syncStatus === 'online' ? 'Connected to Cloud' : syncStatus === 'offline' ? 'Local Mode' : 'Syncing...'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn btn-primary" onClick={handleSync}>
            Sync to Cloud
          </button>
          <button className="btn btn-outline" onClick={handleRefresh}>
            Refresh from Cloud
          </button>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Account</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Username</label>
          <div style={{ padding: '.5rem 0', fontWeight: '600' }}>{currentUser?.username}</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Name</label>
          <div style={{ padding: '.5rem 0', fontWeight: '600' }}>{currentUser?.name}</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Role</label>
          <div style={{ padding: '.5rem 0' }}>
            <span className={`badge ${currentUser?.role === 'admin' || currentUser?.role === 'owner' ? 'bg-green' : 'bg-blue'}`}>
              {currentUser?.role}
            </span>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Farm Information</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Farm Owner</label>
          <div style={{ padding: '.5rem 0' }}>Avelyne Wambui</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Administrator</label>
          <div style={{ padding: '.5rem 0' }}>Alex Nyaga</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Location</label>
          <div style={{ padding: '.5rem 0' }}>Nyandarua County, Kenya</div>
        </div>
      </div>
    </div>
  );
};

export default Settings;