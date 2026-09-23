import React from 'react';
import { useApp } from '../context/AppContext';

const Insights = () => {
  const { db, notifications } = useApp();

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">Insights</div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm">Refresh</button>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Active Alerts ({notifications.length})</div>
        </div>
        {notifications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">All Clear</div>
            No alerts at this time.
          </div>
        ) : (
          <div>
            {notifications.map((n, idx) => (
              <div key={idx} className={`insight ${n.type === 'alert' ? 'alert' : n.type === 'warn' ? 'warn' : n.type === 'info' ? 'info' : 'ok'}`}>
                <div>
                  <div className="insight-title">{n.title}</div>
                  <div className="insight-desc">{n.text}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Farm Overview</div>
        </div>
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-label">Total Cows</div>
            <div className="stat-val">{db.cows.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Total Sheep</div>
            <div className="stat-val">{db.sheep.length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Active Plots</div>
            <div className="stat-val">{db.plotSeasons.filter(s => s.status === 'active').length}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Staff Members</div>
            <div className="stat-val">{db.staff.filter(s => s.status === 'active').length}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Insights;