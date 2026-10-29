import React from 'react';
import { useApp } from '../context/AppContext';
import { playAlarm, alarmEnabled, setAlarmEnabled, unlockAudio } from '../utils/alarm';

const Settings = () => {
  const { currentUser, theme, toggleTheme } = useApp();

  const [alarmOn, setAlarmOn] = React.useState(alarmEnabled());
  const toggleAlarm = (on) => { setAlarmEnabled(on); setAlarmOn(on); if (on) { unlockAudio(); playAlarm(); } };

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
          <div className="card-title">Alerts</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Alarm sound (follows your device volume)</label>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button className={`btn ${alarmOn ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleAlarm(true)}>On</button>
            <button className={`btn ${!alarmOn ? 'btn-primary' : 'btn-outline'}`} onClick={() => toggleAlarm(false)}>Off</button>
            <button className="btn btn-outline" onClick={() => { unlockAudio(); playAlarm(); }} disabled={!alarmOn}>Test sound</button>
          </div>
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
          <div className="card-title">Farm information</div>
        </div>
        <div className="fg" style={{ marginBottom: '1rem' }}>
          <label>Farm owner</label>
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