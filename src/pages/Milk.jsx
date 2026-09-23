import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import MilkForm from '../components/MilkForm';
import MilkChart from '../components/MilkChart';
import MilkProductionChart from '../components/MilkProductionChart';
import { fd } from '../utils/helpers';

const Milk = () => {
  const { db, isStaff, isAdminOrOwner } = useApp();
  const [showMilkForm, setShowMilkForm] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const handleAddRecord = () => {
    setSelectedRecordId(null);
    setShowMilkForm(true);
  };

  const handleEditRecord = (id) => {
    setSelectedRecordId(id);
    setShowMilkForm(true);
  };

  return (
    <div className="theme-cow">
      <div className="section-banner" style={{ background: 'var(--cow-l)' }}>
        <span style={{ fontSize: '2rem' }}>🥛</span>
        <div>
          <h3 style={{ color: 'var(--cow-h)' }}>Milk Records</h3>
          <p style={{ color: 'var(--cow-b)' }}>Track daily milk production from your cows</p>
        </div>
      </div>
      <div className="page-hdr">
        <div className="page-title" style={{ color: 'var(--cow-h)' }}>Milk Records</div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={handleAddRecord}>+ Add Milk Record</button>
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">All Records ({db.milkRecords.length})</div>
        </div>
        {db.milkRecords.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🥛</div>
            No milk records yet.
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Cow</th>
                  <th>AM (L)</th>
                  <th>PM (L)</th>
                  <th>Total (L)</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {db.milkRecords.map(record => (
                  <tr key={record.id}>
                    <td>{fd(record.date)}</td>
                    <td>{record.cowTag || '—'}</td>
                    <td>{record.am || 0}</td>
                    <td>{record.pm || 0}</td>
                    <td><strong>{(Number(record.am || 0) + Number(record.pm || 0)).toFixed(1)}</strong></td>
                    <td>
                      {(isAdminOrOwner() || (isStaff() && record.canEdit)) && (
                        <button className="btn btn-outline btn-xs" onClick={() => handleEditRecord(record.id)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {db.milkRecords.length > 0 && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Milk Production Chart</div>
          </div>
          <MilkChart />
        </div>
      )}

      {db.milkRecords.length > 0 && (
        <div className="card">
          <div className="card-hdr">
            <div className="card-title">Production by Cow</div>
          </div>
          <MilkProductionChart />
        </div>
      )}

      <MilkForm 
        isOpen={showMilkForm} 
        onClose={() => setShowMilkForm(false)} 
        recordId={selectedRecordId}
      />
    </div>
  );
};

export default Milk;