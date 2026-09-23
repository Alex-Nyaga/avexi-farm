import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import StaffForm from '../components/StaffForm';
import { fd } from '../utils/helpers';

const Staff = () => {
  const { db, isAdminOrOwner } = useApp();
  const [showStaffForm, setShowStaffForm] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState(null);

  const handleAddStaff = () => {
    setSelectedStaffId(null);
    setShowStaffForm(true);
  };

  const handleEditStaff = (id) => {
    setSelectedStaffId(id);
    setShowStaffForm(true);
  };

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">Farm Staff</div>
        <div className="page-actions">
          {isAdminOrOwner() && (
            <button className="btn btn-primary btn-sm" onClick={handleAddStaff}>+ Add Staff</button>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-hdr">
          <div className="card-title">All Staff ({db.staff.length})</div>
        </div>
        {db.staff.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">Staff</div>
            No staff members recorded.
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Phone</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {db.staff.map(member => (
                  <tr key={member.id}>
                    <td><strong>{member.name}</strong></td>
                    <td>{member.role || '—'}</td>
                    <td>{member.phone || '—'}</td>
                    <td>{member.monthlySalary ? `KES ${Number(member.monthlySalary).toLocaleString()}` : '—'}</td>
                    <td>
                      <span className={`badge ${member.status === 'active' ? 'bg-green' : 'bg-gray'}`}>
                        {member.status}
                      </span>
                    </td>
                    <td>
                      {isAdminOrOwner() && (
                        <button className="btn btn-outline btn-xs" onClick={() => handleEditStaff(member.id)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <StaffForm 
        isOpen={showStaffForm} 
        onClose={() => setShowStaffForm(false)} 
        staffId={selectedStaffId}
      />
    </div>
  );
};

export default Staff;