import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';
import { fd, today, uid } from '../utils/helpers';

const Potatoes = () => {
  const { db, isAdminOrOwner, setDb, sdb } = useApp();
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [plotForm, setPlotForm] = useState({ name: '', variety: '', plantedDate: today() });
  const [activityForm, setActivityForm] = useState({ plotId: '', date: today(), activity: '', notes: '', cost: '' });

  const activeSeasons = db.plotSeasons.filter((season) => season.status === 'active');

  const savePlot = async (event) => {
    event.preventDefault();
    const name = plotForm.name.trim();
    if (!name) return;

    const plotId = uid();
    const updatedDb = {
      ...db,
      plots: [...db.plots, { id: plotId, name, createdAt: new Date().toISOString() }],
      plotSeasons: [...db.plotSeasons, {
        id: uid(),
        plotId,
        plotName: name,
        variety: plotForm.variety.trim(),
        plantedDate: plotForm.plantedDate,
        status: 'active',
        createdAt: new Date().toISOString()
      }]
    };
    setDb(updatedDb);
    await sdb();
    setShowPlotForm(false);
  };

  const saveActivity = async (event) => {
    event.preventDefault();
    if (!activityForm.plotId || !activityForm.activity.trim()) return;

    const season = activeSeasons.find((item) => item.id === activityForm.plotId);
    const cost = Number(activityForm.cost) || 0;
    const activity = {
      id: uid(),
      seasonId: season.id,
      plotId: season.plotId,
      plotName: season.plotName,
      date: activityForm.date,
      activity: activityForm.activity.trim(),
      notes: activityForm.notes.trim(),
      cost,
      createdAt: new Date().toISOString()
    };
    const updatedDb = {
      ...db,
      cropActivities: [...db.cropActivities, activity]
    };
    if (cost > 0) {
      updatedDb.transactions = [...db.transactions, {
        id: uid(),
        type: 'expense',
        date: activityForm.date,
        amount: cost,
        source: 'Crop activity',
        category: 'Crop inputs',
        desc: `${activity.activity} - ${season.plotName}`
      }];
    }
    setDb(updatedDb);
    await sdb();
    setShowActivityForm(false);
  };

  return (
    <div className="theme-potato">
      <div className="section-banner" style={{ background: 'var(--potato-l)' }}>
        <div>
          <h3 style={{ color: 'var(--potato-h)' }}>Potatoes and planting</h3>
          <p style={{ color: 'var(--potato-b)' }}>Keep each plot, planting season, and field activity in one place.</p>
        </div>
      </div>
      <div className="page-hdr">
        <div className="page-title">Crop records</div>
        {isAdminOrOwner() && (
          <div className="page-actions">
            <button className="btn btn-primary btn-sm" onClick={() => setShowPlotForm(true)}>Add plot</button>
            <button className="btn btn-outline btn-sm" onClick={() => setShowActivityForm(true)} disabled={!activeSeasons.length}>
              Log activity
            </button>
          </div>
        )}
      </div>
      {!activeSeasons.length && isAdminOrOwner() && (
        <div className="insight info">Add a plot first, then use “Log activity” to record planting, spraying, weeding, or harvesting.</div>
      )}
      <div className="card">
        <div className="card-hdr">
          <div>
            <div className="card-title">Active growing seasons</div>
            <div className="card-sub">{activeSeasons.length} currently active</div>
          </div>
        </div>
        {!activeSeasons.length ? (
          <div className="empty-state"><div className="empty-icon">No active plots</div>No crop seasons have been added yet.</div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Plot</th><th>Planted</th><th>Variety</th><th>Status</th></tr></thead>
              <tbody>{activeSeasons.map((season) => (
                <tr key={season.id}>
                  <td><strong>{season.plotName || season.plotId}</strong></td>
                  <td>{fd(season.plantedDate)}</td>
                  <td>{season.variety || 'Not recorded'}</td>
                  <td><span className="badge bg-green">Active</span></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>
      <div className="card">
        <div className="card-hdr">
          <div>
            <div className="card-title">Recent field activities</div>
            <div className="card-sub">Costs are automatically added to farm expenses.</div>
          </div>
        </div>
        {!db.cropActivities.length ? (
          <div className="tbl-empty">No crop activities recorded yet.</div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Date</th><th>Plot</th><th>Activity</th><th>Notes</th><th>Cost</th></tr></thead>
              <tbody>{db.cropActivities.slice().reverse().map((activity) => (
                <tr key={activity.id}>
                  <td>{fd(activity.date)}</td><td>{activity.plotName}</td><td>{activity.activity}</td>
                  <td>{activity.notes || '—'}</td><td>{activity.cost ? `KES ${Number(activity.cost).toLocaleString()}` : '—'}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={showPlotForm} onClose={() => setShowPlotForm(false)} title="Add a potato plot">
        <form onSubmit={savePlot}>
          <div className="form-grid">
            <div className="fg"><label>Plot name</label><input required value={plotForm.name} onChange={(e) => setPlotForm({ ...plotForm, name: e.target.value })} placeholder="e.g. Lower field" /></div>
            <div className="fg"><label>Potato variety</label><input value={plotForm.variety} onChange={(e) => setPlotForm({ ...plotForm, variety: e.target.value })} placeholder="e.g. Shangi" /></div>
            <div className="fg"><label>Planting date</label><input required type="date" max={today()} value={plotForm.plantedDate} onChange={(e) => setPlotForm({ ...plotForm, plantedDate: e.target.value })} /></div>
          </div>
          <div className="modal-actions"><button className="btn btn-primary" type="submit">Save plot</button><button className="btn btn-outline" type="button" onClick={() => setShowPlotForm(false)}>Cancel</button></div>
        </form>
      </Modal>
      <Modal isOpen={showActivityForm} onClose={() => setShowActivityForm(false)} title="Log field activity">
        <form onSubmit={saveActivity}>
          <div className="form-grid">
            <div className="fg"><label>Plot</label><select required value={activityForm.plotId} onChange={(e) => setActivityForm({ ...activityForm, plotId: e.target.value })}><option value="">Select plot</option>{activeSeasons.map((season) => <option key={season.id} value={season.id}>{season.plotName}</option>)}</select></div>
            <div className="fg"><label>Date</label><input required type="date" max={today()} value={activityForm.date} onChange={(e) => setActivityForm({ ...activityForm, date: e.target.value })} /></div>
            <div className="fg"><label>Activity</label><input required value={activityForm.activity} onChange={(e) => setActivityForm({ ...activityForm, activity: e.target.value })} placeholder="e.g. Spraying, weeding" /></div>
            <div className="fg"><label>Cost (KES)</label><input type="number" min="0" value={activityForm.cost} onChange={(e) => setActivityForm({ ...activityForm, cost: e.target.value })} placeholder="0" /></div>
            <div className="fg fg-full"><label>Notes</label><textarea value={activityForm.notes} onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })} placeholder="Products used, labour, or observations" /></div>
          </div>
          <div className="modal-actions"><button className="btn btn-primary" type="submit">Save activity</button><button className="btn btn-outline" type="button" onClick={() => setShowActivityForm(false)}>Cancel</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Potatoes;
