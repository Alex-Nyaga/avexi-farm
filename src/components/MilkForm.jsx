import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { uid, today } from '../utils/helpers';

const MilkForm = ({ isOpen, onClose, recordId }) => {
  const { db, setDb, sdb, isStaff, canEditMilkRecord, isAdminOrOwner } = useApp();
  const [formData, setFormData] = useState({
    cowId: '',
    date: today(),
    am: '',
    pm: ''
  });

  const record = recordId ? db.milkRecords.find(r => r.id === recordId) : null;
  const timeLeft = record ? canEditMilkRecord(record) : null;

  useEffect(() => {
    if (record) {
      setFormData({
        cowId: record.cowId,
        date: record.date,
        am: record.am || '',
        pm: record.pm || ''
      });
    } else {
      setFormData({
        cowId: '',
        date: today(),
        am: '',
        pm: ''
      });
    }
  }, [record, recordId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.cowId) {
      alert('Please select a cow');
      return;
    }

    const cow = db.cows.find(c => c.id === formData.cowId);
    const newRecord = {
      ...formData,
      id: recordId || uid(),
      cowTag: cow?.tag || 'Unknown',
      litres: (Number(formData.am || 0) + Number(formData.pm || 0)).toFixed(1),
      createdAt: record?.createdAt || today()
    };

    let updatedDb;
    if (recordId) {
      const index = db.milkRecords.findIndex(r => r.id === recordId);
      if (index > -1) {
        updatedDb = {
          ...db,
          milkRecords: [
            ...db.milkRecords.slice(0, index),
            newRecord,
            ...db.milkRecords.slice(index + 1)
          ]
        };
      }
    } else {
      updatedDb = {
        ...db,
        milkRecords: [...db.milkRecords, newRecord]
      };
    }

    setDb(updatedDb);
    sdb();
    onClose();
  };

  const handleDelete = () => {
    if (!confirm('Delete this milk record?')) return;
    
    const updatedDb = {
      ...db,
      milkRecords: db.milkRecords.filter(r => r.id !== recordId)
    };

    setDb(updatedDb);
    sdb();
    onClose();
  };

  // Staff can only edit within 12 hours
  if (isStaff() && recordId && !timeLeft) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Edit Milk Record">
        <div style={{ padding: '1rem' }}>
          <p style={{ color: 'var(--red)', marginBottom: '1rem' }}>
            ⛔ You can only edit milk records within 12 hours of creation.
          </p>
          <button className="btn btn-outline" onClick={onClose}>Close</button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={record ? 'Edit Milk Record' : 'Add Milk Record'}>
      <form onSubmit={handleSubmit}>
        {timeLeft && (
          <div style={{ 
            padding: '0.5rem 1rem', 
            background: 'var(--amber-l)', 
            borderRadius: '8px', 
            marginBottom: '1rem',
            color: 'var(--amber)',
            fontSize: '0.85rem'
          }}>
            ⏰ {timeLeft}
          </div>
        )}
        
        <div className="form-grid">
          <div className="fg">
            <label>Cow *</label>
            <select name="cowId" value={formData.cowId} onChange={handleChange} required>
              <option value="">Select...</option>
              {db.cows.filter(c => c.status === 'alive').map(cow => (
                <option key={cow.id} value={cow.id}>{cow.tag} ({cow.breed || cow.species || ''})</option>
              ))}
            </select>
          </div>
          <div className="fg">
            <label>Date *</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} max={today()} required />
          </div>
          <div className="fg">
            <label>AM (Litres)</label>
            <input type="number" step="0.1" name="am" value={formData.am || ''} onChange={handleChange} placeholder="0" />
          </div>
          <div className="fg">
            <label>PM (Litres)</label>
            <input type="number" step="0.1" name="pm" value={formData.pm || ''} onChange={handleChange} placeholder="0" />
          </div>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">Save Record</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          {recordId && isAdminOrOwner() && (
            <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default MilkForm;