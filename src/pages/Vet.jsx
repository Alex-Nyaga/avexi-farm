import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { fd, uid, today } from '../utils/helpers';

const Vet = () => {
  const { db, isAdminOrOwner, setDb, sdb } = useApp();
  const [showVetForm, setShowVetForm] = useState(false);
  const [formData, setFormData] = useState({
    animalTag: '',
    date: today(),
    reason: '',
    treatment: '',
    cost: '',
    notes: ''
  });

  const handleAddVetVisit = () => {
    setFormData({
      animalTag: '',
      date: today(),
      reason: '',
      treatment: '',
      cost: '',
      notes: ''
    });
    setShowVetForm(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newVisit = {
      ...formData,
      id: uid(),
      cost: Number(formData.cost) || 0,
      createdAt: today()
    };

    const updatedDb = {
      ...db,
      vetVisits: [...db.vetVisits, newVisit]
    };

    // Add expense transaction if cost > 0
    if (newVisit.cost > 0) {
      updatedDb.transactions = [
        ...db.transactions,
        {
          id: uid(),
          type: 'expense',
          date: formData.date,
          amount: newVisit.cost,
          source: 'Veterinary',
          category: 'Veterinary',
          desc: `Vet visit - ${formData.reason}`
        }
      ];
    }

    setDb(updatedDb);
    sdb();
    setShowVetForm(false);
  };

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">Veterinary Records</div>
        <div className="page-actions">
          {isAdminOrOwner() && (
            <button className="btn btn-primary btn-sm" onClick={handleAddVetVisit}>+ Add Vet Visit</button>
          )}
        </div>
      </div>

      {showVetForm && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Add Vet Visit</div>
            <button className="btn btn-outline btn-xs" onClick={() => setShowVetForm(false)}>Close</button>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="fg">
                <label>Animal Tag</label>
                <input name="animalTag" value={formData.animalTag} onChange={handleChange} placeholder="e.g. C-001" />
              </div>
              <div className="fg">
                <label>Date</label>
                <input type="date" name="date" value={formData.date} onChange={handleChange} max={today()} />
              </div>
              <div className="fg fg-full">
                <label>Reason</label>
                <input name="reason" value={formData.reason} onChange={handleChange} placeholder="e.g. Routine checkup, Illness" />
              </div>
              <div className="fg fg-full">
                <label>Treatment</label>
                <input name="treatment" value={formData.treatment} onChange={handleChange} placeholder="e.g. Antibiotics, Vaccination" />
              </div>
              <div className="fg">
                <label>Cost (KES)</label>
                <input type="number" name="cost" value={formData.cost} onChange={handleChange} placeholder="0" />
              </div>
            </div>
            <div className="fg fg-full mt1">
              <label>Notes</label>
              <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Additional details..." />
            </div>
            <div className="modal-actions">
              <button type="submit" className="btn btn-primary">Save Visit</button>
              <button type="button" className="btn btn-outline" onClick={() => setShowVetForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Vet Visits ({db.vetVisits.length})</div>
        </div>
        {db.vetVisits.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">Veterinary</div>
            No veterinary records yet.
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Animal</th>
                  <th>Reason</th>
                  <th>Treatment</th>
                  <th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {db.vetVisits.map(visit => (
                  <tr key={visit.id}>
                    <td>{fd(visit.date)}</td>
                    <td>{visit.animalTag || '—'}</td>
                    <td>{visit.reason || '—'}</td>
                    <td>{visit.treatment || '—'}</td>
                    <td>{visit.cost ? `KES ${Number(visit.cost).toLocaleString()}` : '—'}</td>
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

export default Vet;