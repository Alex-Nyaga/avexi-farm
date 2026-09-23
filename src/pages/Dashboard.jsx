import React from 'react';
import { useApp } from '../context/AppContext';
import DashboardCharts from '../components/DashboardCharts';
import { fd } from '../utils/helpers';

const Dashboard = () => {
  const { db, currentUser, notifications, navigate, isStaff, ksh, today } = useApp();

  const ac = db.cows.filter(c => c.status === 'alive').length;
  const as = db.sheep.filter(s => s.status === 'alive').length;
  const ap = db.plotSeasons.filter(s => s.status === 'active').length;
  const inc = db.transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const exp = db.transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);
  const todayMilk = db.milkRecords.filter(r => r.date === today()).reduce((a, b) => a + Number(b.litres || 0), 0);
  const recentTx = db.transactions.slice(-6).reverse();

  return (
    <div>
      <div className="page-hdr">
        <div>
          <div className="page-title">Good day, {currentUser?.name} 👋</div>
          <div className="text-muted text-sm">
            {new Date().toLocaleDateString('en-KE', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long', 
              year: 'numeric' 
            })}
          </div>
        </div>
        <div className="page-actions">
          <button className="btn btn-outline btn-sm" onClick={() => navigate('reports')}>
            📄 Reports
          </button>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat accent" style={{ '--accent-color': 'var(--cow-m)' }}>
          <div className="stat-label">Live Cows</div>
          <div className="stat-val">{ac}</div>
          <div className="stat-sub">{db.calves.filter(c => c.status === 'alive').length} calves</div>
        </div>
        <div className="stat accent" style={{ '--accent-color': 'var(--sheep-m)' }}>
          <div className="stat-label">Live Sheep</div>
          <div className="stat-val">{as}</div>
          <div className="stat-sub">{db.sheep.filter(s => s.status === 'alive').length} total</div>
        </div>
        <div className="stat accent" style={{ '--accent-color': 'var(--potato-m)' }}>
          <div className="stat-label">Active Plots</div>
          <div className="stat-val">{ap}</div>
          <div className="stat-sub">potato seasons</div>
        </div>
        <div className="stat accent" style={{ '--accent-color': 'var(--cow-m)' }}>
          <div className="stat-label">Today's Milk</div>
          <div className="stat-val">
            {todayMilk.toFixed(1)}<span style={{ fontSize: '1rem' }}>L</span>
          </div>
          <div className="stat-sub">combined AM+PM</div>
        </div>
        {!isStaff() && (
          <div className="stat accent" style={{ '--accent-color': 'var(--green)' }}>
            <div className="stat-label">Net Balance</div>
            <div 
              className="stat-val" 
              style={{ 
                fontSize: '1.2rem', 
                color: inc - exp >= 0 ? 'var(--green)' : 'var(--red)' 
              }}
            >
              {ksh(inc - exp)}
            </div>
            <div className="stat-sub">income − expenses</div>
          </div>
        )}
        <div className="stat">
          <div className="stat-label">Notifications</div>
          <div 
            className="stat-val" 
            style={{ color: notifications.length > 0 ? 'var(--red)' : 'var(--green)' }}
          >
            {notifications.length}
          </div>
          <div className="stat-sub">
            {notifications.length > 0 ? 'action needed' : 'all clear'}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Farm Overview</div>
        </div>
        <DashboardCharts />
      </div>

      {notifications.length > 0 && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">⚠️ Active Alerts</div>
          </div>
          {notifications.slice(0, 4).map((n, idx) => (
            <div key={idx} className={`insight ${n.type === 'alert' ? 'alert' : 'warn'}`}>
              <div className="insight-icon">{n.icon}</div>
              <div>
                <div className="insight-title">{n.title}</div>
                <div className="insight-desc">{n.text}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isStaff() && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Recent Transactions</div>
            <button className="btn btn-outline btn-sm" onClick={() => navigate('finance')}>
              View all
            </button>
          </div>
          {recentTx.length === 0 ? (
            <div className="tbl-empty">No transactions yet.</div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTx.map(t => (
                    <tr key={t.id}>
                      <td>{fd(t.date)}</td>
                      <td>
                        <span className={`badge ${t.type === 'income' ? 'bg-green' : 'bg-red'}`}>
                          {t.type}
                        </span>
                      </td>
                      <td>{t.category || '—'}</td>
                      <td 
                        style={{ 
                          fontWeight: '600', 
                          color: t.type === 'income' ? 'var(--green)' : 'var(--red)' 
                        }}
                      >
                        {t.type === 'income' ? '+' : '-'}{ksh(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.75rem' }} className="mt1">
        <div 
          className="card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('cows')}
        >
          <div 
            style={{ 
              background: 'var(--cow-l)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '.75rem', 
              textAlign: 'center', 
              marginBottom: '.5rem', 
              fontSize: '1.5rem' 
            }}
          >
            🐄
          </div>
          <div style={{ fontWeight: '600', textAlign: 'center', color: 'var(--cow-h)' }}>
            Manage Cows
          </div>
        </div>
        <div 
          className="card" 
          style={{ cursor: 'pointer' }} 
          onClick={() => navigate('sheep')}
        >
          <div 
            style={{ 
              background: 'var(--sheep-l)', 
              borderRadius: 'var(--radius-sm)', 
              padding: '.75rem', 
              textAlign: 'center', 
              marginBottom: '.5rem', 
              fontSize: '1.5rem' 
            }}
          >
            🐑
          </div>
          <div style={{ fontWeight: '600', textAlign: 'center', color: 'var(--sheep-h)' }}>
            Manage Sheep
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;