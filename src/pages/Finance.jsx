import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import FinanceForm from '../components/FinanceForm';
import FinanceChart from '../components/FinanceChart';
import MonthlyFinanceChart from '../components/MonthlyFinanceChart';
import { fd, ksh } from '../utils/helpers';

const Finance = () => {
  const { db, isAdminOrOwner, setDb, sdb } = useApp();
  const [showFinanceForm, setShowFinanceForm] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState(null);
  const [transactionType, setTransactionType] = useState('expense');

  const inc = db.transactions.filter(t => t.type === 'income').reduce((a, b) => a + Number(b.amount), 0);
  const exp = db.transactions.filter(t => t.type === 'expense').reduce((a, b) => a + Number(b.amount), 0);

  const handleAddIncome = () => {
    setSelectedTransactionId(null);
    setTransactionType('income');
    setShowFinanceForm(true);
  };

  const handleAddExpense = () => {
    setSelectedTransactionId(null);
    setTransactionType('expense');
    setShowFinanceForm(true);
  };

  const handleEditTransaction = (id) => {
    setSelectedTransactionId(id);
    const transaction = db.transactions.find(t => t.id === id);
    setTransactionType(transaction?.type || 'expense');
    setShowFinanceForm(true);
  };

  return (
    <div className="theme-finance">
      <div className="section-banner" style={{ background: 'var(--finance-l)' }}>
        <div>
          <h3 style={{ color: 'var(--finance-h)' }}>Financial Management</h3>
          <p style={{ color: 'var(--finance-b)' }}>Track income, expenses, and farm finances</p>
        </div>
      </div>
      <div className="page-hdr">
        <div className="page-title" style={{ color: 'var(--finance-h)' }}>Transactions</div>
        <div className="page-actions">
          {isAdminOrOwner() && (
            <>
              <button className="btn btn-primary btn-sm" onClick={handleAddIncome}>+ Add Income</button>
              <button className="btn btn-outline btn-sm" onClick={handleAddExpense}>+ Add Expense</button>
            </>
          )}
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat accent" style={{ '--accent-color': 'var(--green)' }}>
          <div className="stat-label">Total Income</div>
          <div className="stat-val" style={{ color: 'var(--green)' }}>{ksh(inc)}</div>
        </div>
        <div className="stat accent" style={{ '--accent-color': 'var(--red)' }}>
          <div className="stat-label">Total Expenses</div>
          <div className="stat-val" style={{ color: 'var(--red)' }}>{ksh(exp)}</div>
        </div>
        <div className="stat accent" style={{ '--accent-color': 'var(--finance-m)' }}>
          <div className="stat-label">Net Balance</div>
          <div 
            className="stat-val" 
            style={{ color: inc - exp >= 0 ? 'var(--green)' : 'var(--red)' }}
          >
            {ksh(inc - exp)}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Financial Overview</div>
        </div>
        <FinanceChart />
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">Monthly Trends</div>
        </div>
        <MonthlyFinanceChart />
      </div>

      <div className="card">
        <div className="card-hdr">
          <div className="card-title">All Transactions ({db.transactions.length})</div>
        </div>
        {db.transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">Finance</div>
            No transactions recorded.
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Amount</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {db.transactions.slice().reverse().map(tx => (
                  <tr key={tx.id}>
                    <td>{fd(tx.date)}</td>
                    <td>
                      <span className={`badge ${tx.type === 'income' ? 'bg-green' : 'bg-red'}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td>{tx.category || '—'}</td>
                    <td>{tx.desc || '—'}</td>
                    <td 
                      style={{ 
                        fontWeight: '600', 
                        color: tx.type === 'income' ? 'var(--green)' : 'var(--red)' 
                      }}
                    >
                      {tx.type === 'income' ? '+' : '-'}{ksh(tx.amount)}
                    </td>
                    <td>
                      {isAdminOrOwner() && (
                        <button className="btn btn-outline btn-xs" onClick={() => handleEditTransaction(tx.id)}>Edit</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <FinanceForm 
        isOpen={showFinanceForm} 
        onClose={() => setShowFinanceForm(false)} 
        transactionId={selectedTransactionId}
        transactionType={transactionType}
      />
    </div>
  );
};

export default Finance;