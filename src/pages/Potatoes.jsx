import React, { useState } from 'react';
import Modal from '../components/Modal';
import { useApp } from '../context/AppContext';
import { fd, today, uid } from '../utils/helpers';
import SelectOrOther from '../components/SelectOrOther';
import ActivityDetails from '../components/ActivityDetails';
import { formatActivityDetail, schemaForActivity } from '../utils/activitySchemas';

const CROP_ACTIVITIES = ['Land preparation', 'Planting', 'Weeding', 'Spraying', 'Fertilizer application', 'Hilling / earthing up', 'Pest / disease scouting', 'Harvest', 'Sale'];

const Potatoes = () => {
  const { db, isAdminOrOwner, setDb, sdb } = useApp();
  const [showPlotForm, setShowPlotForm] = useState(false);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [plotForm, setPlotForm] = useState({ name: '', variety: '', plantedDate: today() });
  const [activityForm, setActivityForm] = useState({ plotId: '', date: today(), activity: '', notes: '', cost: '', revenue: '', details: {} });

  const activeSeasons = db.plotSeasons.filter((season) => season.status === 'active');
  const recordableSeasons = db.plotSeasons.filter((season) => season.status === 'active' || season.status === 'harvested');

  const changeActivityField = (event) => {
    const { name, value } = event.target;
    if (name.startsWith('details.')) {
      const key = name.slice(8);
      setActivityForm((form) => ({ ...form, details: { ...form.details, [key]: value } }));
    } else if (name === 'activity') {
      setActivityForm((form) => ({ ...form, activity: value, details: {}, revenue: '' }));
    } else {
      setActivityForm((form) => ({ ...form, [name]: value }));
    }
  };

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

    const cost = Number(activityForm.cost) || 0;
    const revenue = Number(activityForm.revenue) || 0;
    const season = recordableSeasons.find((item) => item.id === activityForm.plotId);
    if (!season) return;
    if (activityForm.date > today()) {
      alert('Activity date cannot be in the future.');
      return;
    }
    for (const field of schemaForActivity('crop', activityForm.activity)) {
      if (field.required && !String(activityForm.details?.[field.name] ?? '').trim()) {
        alert(`${field.label} is required.`);
        return;
      }
      if (field.required && field.type === 'number' && Number(activityForm.details[field.name]) <= 0) {
        alert(`${field.label} must be greater than zero.`);
        return;
      }
    }

    if (activityForm.activity === 'Sale' && !db.cropActivities.some((record) => record.seasonId === season.id && record.activity === 'Harvest')) {
      alert('Record a harvest before recording a crop sale.');
      return;
    }
    if (activityForm.activity === 'Sale' && activityForm.revenue && revenue <= 0) {
      alert('Sale proceeds must be greater than zero when provided.');
      return;
    }
    const canPrecedePlanting = ['Land preparation', 'Field preparation'].includes(activityForm.activity);
    if (!canPrecedePlanting && activityForm.date < season.plantedDate) {
      alert(`This activity date (${fd(activityForm.date)}) is before the plot's planting date (${fd(season.plantedDate)}). Please check the date.`);
      return;
    }
    if (activityForm.activity === 'Sale') {
      const harvest = db.cropActivities.find((record) => record.seasonId === season.id && record.activity === 'Harvest');
      if (harvest && activityForm.date < harvest.date) {
        alert(`A sale cannot be dated before harvest (${fd(harvest.date)}).`);
        return;
      }
    }
    if (activityForm.activity === 'Harvest') {
      const sprayRecords = db.cropActivities.filter((record) => record.seasonId === season.id && record.activity === 'Spraying' && Number(record.details?.preHarvestInterval) > 0);
      for (const spray of sprayRecords) {
        const safeHarvestDate = new Date(`${spray.date}T12:00:00`);
        safeHarvestDate.setDate(safeHarvestDate.getDate() + Number(spray.details.preHarvestInterval));
        if (new Date(`${activityForm.date}T12:00:00`) < safeHarvestDate) {
          alert(`Harvest must wait until the product's ${spray.details.preHarvestInterval}-day pre-harvest interval has passed (${fd(safeHarvestDate.toISOString().slice(0, 10))}).`);
          return;
        }
      }
    }
    if (season.status === 'harvested' && activityForm.activity !== 'Sale') {
      alert('This season is marked as harvested. Only sales can be recorded now.');
      return;
    }

    const activity = {
      id: uid(),
      seasonId: season.id,
      plotId: season.plotId,
      plotName: season.plotName,
      date: activityForm.date,
      activity: activityForm.activity.trim(),
      notes: activityForm.notes.trim(),
      cost: activityForm.activity === 'Sale' ? revenue : cost,
      details: activityForm.details || {},
      createdAt: new Date().toISOString()
    };
    const updatedDb = {
      ...db,
      cropActivities: [...db.cropActivities, activity]
    };
    if (activityForm.activity === 'Sale' && revenue > 0) {
      updatedDb.transactions = [...db.transactions, {
        id: uid(),
        type: 'income',
        date: activityForm.date,
        amount: revenue,
        source: activity.details?.buyer || 'Crop sale',
        category: 'Crop Sale',
        desc: `Sale — ${season.plotName}${activity.details?.buyer ? ` (${activity.details.buyer})` : ''}`
      }];
    } else if (cost > 0) {
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

    // A harvest marks the end of that growing season
    if (activity.activity === 'Harvest') {
      const seasonIdx = db.plotSeasons.findIndex((s) => s.id === season.id);
      if (seasonIdx > -1) {
        updatedDb.plotSeasons = [
          ...db.plotSeasons.slice(0, seasonIdx),
          { ...db.plotSeasons[seasonIdx], status: 'harvested', harvestedDate: activityForm.date },
          ...db.plotSeasons.slice(seasonIdx + 1)
        ];
      }
    }

    setDb(updatedDb);
    await sdb();
    setShowActivityForm(false);
    setActivityForm({ plotId: '', date: today(), activity: '', notes: '', cost: '', revenue: '', details: {} });
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
            <button className="btn btn-outline btn-sm" onClick={() => setShowActivityForm(true)} disabled={!recordableSeasons.length}>
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
              <thead><tr><th>Date</th><th>Plot</th><th>Activity</th><th>Activity details</th><th>Cost / proceeds</th></tr></thead>
              <tbody>{db.cropActivities.slice().reverse().map((activity) => (
                <tr key={activity.id}>
                  <td>{fd(activity.date)}</td><td>{activity.plotName}</td><td>{activity.activity}</td>
                  <td>{[activity.notes, ...Object.entries(activity.details || {}).filter(([, value]) => value !== '' && value != null).map(([key, value]) => `${formatActivityDetail(key)}: ${value}`)].filter(Boolean).join(' · ') || '—'}</td>
                  <td>{activity.cost ? `KES ${Number(activity.cost).toLocaleString()}` : '—'}</td>
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
            <div className="fg">
              <label>Plot *</label>
              <select required name="plotId" value={activityForm.plotId} onChange={changeActivityField}>
                <option value="">Select plot</option>
                {recordableSeasons.map((season) => <option key={season.id} value={season.id}>{season.plotName}{season.status === 'harvested' ? ' (harvested)' : ''}</option>)}
              </select>
            </div>
            <div className="fg">
              <label>Date *</label>
              <input
                required
                type="date"
                name="date"
                max={today()}
                min={['Land preparation', 'Field preparation'].includes(activityForm.activity) ? undefined : recordableSeasons.find((s) => s.id === activityForm.plotId)?.plantedDate}
                value={activityForm.date}
                onChange={changeActivityField}
              />
            </div>
            <SelectOrOther
              label="Activity"
              required
              name="activity"
              value={activityForm.activity}
              onChange={changeActivityField}
              options={CROP_ACTIVITIES}
              otherPlaceholder="Describe the activity"
            />
            {schemaForActivity('crop', activityForm.activity).length > 0 && (
              <ActivityDetails kind="crop" activity={activityForm.activity} value={activityForm.details} onChange={changeActivityField} />
            )}
            {activityForm.activity && (
              activityForm.activity === 'Sale'
                ? <div className="fg"><label>Total sale proceeds (KES)</label><input type="number" min="0" step="any" name="revenue" value={activityForm.revenue} onChange={changeActivityField} placeholder="Optional — enter total if known" /></div>
                : <div className="fg"><label>Activity cost (KES)</label><input type="number" min="0" step="any" name="cost" value={activityForm.cost} onChange={changeActivityField} placeholder="0" /></div>
            )}
            <div className="fg fg-full"><label>Notes</label><textarea value={activityForm.notes} onChange={(e) => setActivityForm({ ...activityForm, notes: e.target.value })} placeholder="Products used, labour, or observations" /></div>
          </div>
          <div className="modal-actions"><button className="btn btn-primary" type="submit">Save activity</button><button className="btn btn-outline" type="button" onClick={() => setShowActivityForm(false)}>Cancel</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Potatoes;
