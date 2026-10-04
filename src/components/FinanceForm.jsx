import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import SelectOrOther from './SelectOrOther';
import { getEnterprises } from '../utils/enterprises';
import { useApp } from '../context/AppContext';
import { uid, today } from '../utils/helpers';

const FinanceForm = ({ isOpen, onClose, transactionId, transactionType }) => {
  const { db, setDb, sdb, isAdminOrOwner } = useApp();
  const [formData, setFormData] = useState({});

  const transaction = transactionId ? db.transactions.find(t => t.id === transactionId) : null;

  useEffect(() => {
    if (transaction) {
      setFormData(transaction);
    } else {
      setFormData({
        type: transactionType || 'expense',
        date: today(),
        amount: '',
        category: '',
        source: '',
        desc: ''
      });
    }
  }, [transaction, transactionId, transactionType]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Enter an amount greater than zero');
      return;
    }
    if (formData.date > today()) {
      alert('The date cannot be in the future.');
      return;
    }

    const newTransaction = {
      ...formData,
      id: transactionId || uid(),
      amount: Number(formData.amount),
      createdAt: transaction?.createdAt || today()
    };

    let updatedDb;
    if (transactionId) {
      const index = db.transactions.findIndex(t => t.id === transactionId);
      if (index > -1) {
        updatedDb = {
          ...db,
          transactions: [
            ...db.transactions.slice(0, index),
            newTransaction,
            ...db.transactions.slice(index + 1)
          ]
        };
      }
    } else {
      updatedDb = {
        ...db,
        transactions: [...db.transactions, newTransaction]
      };
    }

    setDb(updatedDb);
    sdb();
    onClose();
  };

  const handleDelete = () => {
    if (!confirm('Delete this transaction?')) return;
    
    const updatedDb = {
      ...db,
      transactions: db.transactions.filter(t => t.id !== transactionId)
    };

    setDb(updatedDb);
    sdb();
    onClose();
  };

  if (!isAdminOrOwner()) return null;

  const categories = formData.type === 'income' 
    ? ['Milk Sales', 'Animal Sale', 'Crop Sale', 'Eggs Sale', 'Produce Sale']
    : ['Feed', 'Veterinary', 'Staff Salary', 'Equipment', 'Maintenance', 'Seeds & Fertilizer', 'Transport'];

  const sources = ['General', ...getEnterprises(db).map((e) => e.name)];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={transaction ? 'Edit Transaction' : `Add ${transactionType === 'income' ? 'Income' : 'Expense'}`}>
      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="fg">
            <label>Type *</label>
            <select name="type" value={formData.type || 'expense'} onChange={handleChange} required>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <div className="fg">
            <label>Date *</label>
            <input type="date" name="date" value={formData.date || today()} onChange={handleChange} required />
          </div>
          <div className="fg">
            <label>Amount (KES) *</label>
            <input type="number" name="amount" value={formData.amount || ''} onChange={handleChange} placeholder="0" required />
          </div>
          <SelectOrOther label="Category" name="category" value={formData.category} onChange={handleChange} options={categories} />
          <SelectOrOther label="Source / Enterprise" name="source" value={formData.source} onChange={handleChange} options={sources} />
        </div>

        <div className="fg fg-full mt1">
          <label>Description</label>
          <textarea name="desc" value={formData.desc || ''} onChange={handleChange} placeholder="Transaction details..." />
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary">Save Transaction</button>
          <button type="button" className="btn btn-outline" onClick={onClose}>Cancel</button>
          {transactionId && <button type="button" className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>}
        </div>
      </form>
    </Modal>
  );
};

export default FinanceForm;