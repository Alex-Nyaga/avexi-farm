import React from 'react';
import { useApp } from '../context/AppContext';
import { getEnterprises, sectionOf } from '../utils/enterprises';

const Dashboard = () => {
  const { db, currentUser, notifications, navigate, isStaff } = useApp();
  const name = currentUser?.name?.split(' ')[0] || currentUser?.username || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const enterprises = getEnterprises(db).filter((item) => item.status !== 'archived');
  const hasCows = enterprises.some((item) => item.id === 'cows') || (db.cows || []).length > 0;
  const hasSheep = enterprises.some((item) => item.id === 'sheep') || (db.sheep || []).length > 0;
  const hasPotatoes = enterprises.some((item) => item.id === 'potatoes') || (db.plotSeasons || []).length > 0;

  const actions = [
    hasCows && { label: 'Record milk', section: 'milk', hint: 'Add today’s AM / PM yield' },
    hasCows && { label: 'Cattle records', section: 'cows', hint: 'Animals, health and events' },
    hasSheep && { label: 'Sheep records', section: 'sheep', hint: 'Animals and flock events' },
    hasPotatoes && { label: 'Crop records', section: 'potatoes', hint: 'Plots and field activities' },
    !isStaff() && (db.staff || []).length > 0 && { label: 'Team records', section: 'staff', hint: 'Review staff and work status' },
    ...enterprises.filter((item) => !item.page).map((item) => ({
      label: `${item.name} records`,
      section: sectionOf(item),
      hint: `${item.kind === 'crop' ? 'Crop' : 'Livestock'} activities`
    })),
    !isStaff() && { label: 'Record income or expense', section: 'finance', hint: 'Keep farm finances up to date' }
  ].filter(Boolean);

  return (
    <div className="home-page">
      <div className="page-hdr">
        <div>
          <div className="eyebrow">Farm home</div>
          <h1 className="page-title">{greeting}, {name}</h1>
        </div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('reports')}>Full farm report</button>
      </div>

      <section className={`home-focus ${notifications.length ? 'home-focus--alert' : ''}`} aria-live="polite">
        <div className="home-focus-icon" aria-hidden="true">{notifications.length ? '!' : '✓'}</div>
        <div>
          <div className="home-focus-title">{notifications.length ? `${notifications.length} item${notifications.length === 1 ? '' : 's'} need attention` : 'You’re up to date'}</div>
          <div className="home-focus-sub">{notifications.length ? 'Review these reminders and record today’s work.' : 'Choose a farm area below to continue.'}</div>
        </div>
        {notifications.length > 0 && <button className="btn btn-outline btn-sm" onClick={() => navigate('insights')}>Review reminders</button>}
      </section>

      {notifications.length > 0 && (
        <div className="home-reminders">
          {notifications.slice(0, 3).map((item, index) => (
            <div key={`${item.title}-${index}`} className="insight warn">
              <div><div className="insight-title">{item.title}</div><div className="insight-desc">{item.text}</div></div>
            </div>
          ))}
          {notifications.length > 3 && <button className="text-btn" onClick={() => navigate('insights')}>See all {notifications.length} reminders</button>}
        </div>
      )}

      <section className="home-actions" aria-label="Farm areas and actions">
        <div className="card-hdr">
          <div>
            <h2 className="card-title">What would you like to do?</h2>
            <div className="card-sub">Choose an area to record or review farm work.</div>
          </div>
        </div>
        <div className="home-action-grid">
          {actions.map((item) => (
            <button key={item.section} className="home-action-card" onClick={() => navigate(item.section)}>
              <span className="home-action-label">{item.label}</span>
              <span className="home-action-hint">{item.hint}</span>
              <span className="home-action-arrow" aria-hidden="true">→</span>
            </button>
          ))}
          <button className="home-action-card" onClick={() => navigate('reports')}>
            <span className="home-action-label">View reports</span>
            <span className="home-action-hint">Download a full record of your farm</span>
            <span className="home-action-arrow" aria-hidden="true">→</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
