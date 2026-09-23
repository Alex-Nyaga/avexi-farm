import React from 'react';
import { useApp } from '../context/AppContext';
import { fd } from '../utils/helpers';

const Potatoes = () => {
  const { db, isAdminOrOwner } = useApp();

  return (
    <div className="theme-potato">
      <div className="section-banner" style={{ background: 'var(--potato-l)' }}>
        <span style={{ fontSize: '2rem' }}>🥔</span>
        <div>
          <h3 style={{ color: 'var(--potato-h)' }}>Potato Management</h3>
          <p style={{ color: 'var(--potato-b)' }}>Track potato crops, seasons, and activities</p>
        </div>
      </div>
      <div className="page-hdr">
        <div className="page-title" style={{ color: 'var(--potato-h)' }}>Potatoes</div>
        <div className="page-actions">
          {isAdminOrOwner() && (
            <>
              <button className="btn btn-primary btn-sm">+ Add Plot</button>
              <button className="btn btn-outline btn-sm">+ Log Activity</button>
            </>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Active Seasons ({db.plotSeasons.filter(s => s.status === 'active').length})</div>
        </div>
        {db.plotSeasons.filter(s => s.status === 'active').length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🥔</div>
            No active potato seasons.
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Plot</th>
                  <th>Planted</th>
                  <th>Variety</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {db.plotSeasons.filter(s => s.status === 'active').map(season => (
                  <tr key={season.id}>
                    <td><strong>{season.plotName || season.plotId}</strong></td>
                    <td>{fd(season.plantedDate)}</td>
                    <td>{season.variety || '—'}</td>
                    <td><span className="badge bg-green">active</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Potatoes;