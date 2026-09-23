import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { useApp } from '../context/AppContext';
import { uid, today } from '../utils/helpers';

const StaffForm = ({ isOpen, onClose, staffId }) => {
  const { db, setDb, sdb, isAdminOrOwner } = useApp();
  const [formData, setFormData] = useState({});

  const staff = staffId ? db.staff.find(s => s.id === staffId) : null;

  useEffect(() => {
    if (staff) {
      setFormData(staff);
    } else {
      setFormData({
        name: '',
        role: '',
        phone: '',
        monthlySalary: '',
        status: 'active',
        startDate: today(),
        notes: ''
      });
    }
  }, [staff, staffId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      alert('Name is required');
      return;
    }

    const newStaff = {
      ...formData,
      id: staffId || uid(),
      monthlySalary: Number(formData.monthlySalary) || 0,
      createdAt: staff?.createdAt || today()
    };

    let updatedDb;
    if (staffId) {
      const index = db.staff.findIndex(s => s.id === staffId);
      if (index > -1) {
        updatedDb = {
          ...db,
          staff: [
            ...db.staff.slice(0, index),
            newStaff,
            ...db.staff.slice(index + 1)
          ]
        };
      }
    } else {
      updatedDb = {
        ...db,
        staff: [...db.staff, newStaff]
      };
    }

    setDb(updatedDb);
    sdb();
    onClose();
  };

  const handleDelete = () => {
    if (!confirm('Delete this staff member?')) return;
    
    const updatedDb = {
      ...db,
      staff: db.staff.filter(s => s.id !== staffId)
    };

    setDb(updatedDb);
    sdb();
    onClose();
  };

  if (!isAdminOrOwner()) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={staff ? 'Edit Staff' : 'Add Staff'}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="fg fg-full">
            <label>Name *</label>
            <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full name" required />
          </div>
          <div className="fg">
            <label>Role</label>
            <input name="role" value={formData.role || ''} onChange={handleChange} placeholder="e.g. Herdsman, Farm Manager" />
          </div>
          <div className="fg">
            <label>Phone</label>
            <input name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="07XXXXXXXX" />
          </div>
          <div className="fg">
            <label>Monthly Salary (KES)</label>
            <input type="number" name="monthlySalary" value={formData.monthlySalary || ''} onChange={handleChange} placeholder="0" />
          </div>
          <div className="fg">
            <label>Status</label>
            <select name="status" value={formData.status || 'active'} onChange={handleChange}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="fg">
            <label>Start Date</label>
            <input type="date" name="startDate" value={formData.startDate || today()} onChange={handleChange} />
          </div>
        </div>

        <div className="fg fg-full mt1">
          <label>Notes</label>
          <textarea name="notes" value={formData.notes || ''} onChange={handleChange} placeholder="Additional information..." />
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">Save Staff</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          {staffId && <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>}
        </div>
      </form>
    </Modal>
  );
};

export default StaffForm;