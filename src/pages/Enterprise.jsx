import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import SelectOrOther from '../components/SelectOrOther';
import { ACTIVITIES, UNITS } from '../utils/catalogue';
import { getEnterprises } from '../utils/enterprises';
import { uid, today, fd, ksh } from '../utils/helpers';

const START = { animal: ['Purchase / Stocking', 'Birth / Hatching'], crop: ['Planting / Sowing'] };
const END = { animal: ['Sale', 'Mortality', 'Culling'], crop: ['Harvest'] };

const blank = () => ({ date: today(), activity: '', quantity: '', unit: '', money: '', party: '', notes: '' });

// Generic record keeper for every catalogue enterprise that has no dedicated page.
const Enterprise = ({ enterpriseId }) => {
  const { db, setDb, sdb, isAdminOrOwner, isStaff, navigate } = useApp();
  const enterprise = getEnterprises(db).find((e) => e.id === enterpriseId);
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(blank());
  const [error, setError] = useState('');

  if (!enterprise) {
    return (
      <div className="card"><div className="empty-state">This enterprise is no longer on your farm.</div>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('dashboard')}>Back to dashboard</button></div>
    );
  }

  const kind = enterprise.kind;
  const records = (db.enterpriseRecords || [])
    .filter((r) => r.enterpriseId === enterpriseId)
    .sort((a, b) => b.date.localeCompare(a.date));
  const canMoney = isAdminOrOwner();
  const isIncome = (a) => /sale|harvest|production/i.test(a) && !/mortality|cull/i.test(a);
  const set = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const openNew = () => { setEditId(null); setForm(blank()); setError(''); setOpen(true); };
  const openEdit = (r) => { setEditId(r.id); setForm({ ...blank(), ...r, quantity: r.quantity ?? '', money: r.money ?? '' }); setError(''); setOpen(true); };

  // Agricultural ordering: nothing can happen before stocking/planting, and
  // end-of-cycle events (harvest, sale, death) cannot precede it.
  const validate = () => {
    if (!form.date) return 'Choose a date.';
    if (form.date > today()) return 'The date cannot be in the future.';
    if (!form.activity) return 'Choose an activity.';
    const others = records.filter((r) => r.id !== editId);
    const starts = others.filter((r) => START[kind].includes(r.activity)).map((r) => r.date).sort();
    if (START[kind].includes(form.activity) === false && starts.length && form.date < starts[0]) {
      return `This cannot be dated before ${kind === 'crop' ? 'planting' : 'stocking'} (${fd(starts[0])}).`;
    }
    if (END[kind].includes(form.activity) && !starts.length) {
      return `Record ${kind === 'crop' ? 'planting' : 'stocking / birth'} first — ${form.activity.toLowerCase()} needs an earlier start date.`;
    }
    if (END[kind].includes(form.activity) && starts.length && form.date < starts[0]) {
      return `${form.activity} (${fd(form.date)}) cannot be before ${fd(starts[0])}.`;
    }
    if (form.money !== '' && Number(form.money) < 0) return 'Amount cannot be negative.';
    return '';
  };

  const submit = (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    const old = editId ? (db.enterpriseRecords || []).find((r) => r.id === editId) : null;
    const rec = {
      id: editId || uid(),
      enterpriseId,
      date: form.date,
      activity: form.activity,
      quantity: form.quantity === '' ? '' : Number(form.quantity),
      unit: form.unit,
      notes: form.notes,
      party: canMoney ? form.party : old?.party || '',
      money: canMoney ? (form.money === '' ? '' : Number(form.money)) : old?.money ?? '',
      createdAt: old?.createdAt || new Date().toISOString()
    };
    let transactions = db.transactions || [];
    if (canMoney) {
      transactions = transactions.filter((t) => t.id !== old?.transactionId);
      if (rec.money > 0) {
        const income = isIncome(rec.activity);
        const txId = uid();
        rec.transactionId = txId;
        transactions = [...transactions, {
          id: txId, type: income ? 'income' : 'expense', date: rec.date, amount: rec.money,
          category: income ? (kind === 'crop' ? 'Crop Sale' : 'Animal Sale') : 'Other Expense', source: enterprise.name, enterpriseId,
          desc: `${rec.activity} — ${enterprise.name}${rec.party ? ` (${rec.party})` : ''}`
        }];
      } else {
        delete rec.transactionId;
      }
    } else if (old?.transactionId) {
      rec.transactionId = old.transactionId;
    }
    const all = db.enterpriseRecords || [];
    const enterpriseRecords = editId ? all.map((r) => (r.id === editId ? rec : r)) : [...all, rec];
    setDb({ ...db, enterpriseRecords, transactions });
    sdb();
    setOpen(false);
  };

  const remove = (r) => {
    if (!confirm('Delete this record? Any linked income/expense stays in Finance.')) return;
    setDb({ ...db, enterpriseRecords: db.enterpriseRecords.filter((x) => x.id !== r.id) });
    sdb();
  };

  const totalIn = records.filter((r) => r.transactionId && isIncome(r.activity)).reduce((a, r) => a + (Number(r.money) || 0), 0);
  const totalOut = records.filter((r) => r.transactionId && !isIncome(r.activity)).reduce((a, r) => a + (Number(r.money) || 0), 0);

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">{enterprise.name}</div>
        <div className="page-actions">
          {canMoney && <button className="btn btn-primary btn-sm" onClick={openNew}>+ Add record</button>}
        </div>
      </div>

      {canMoney && !isStaff() && (
        <div className="stat-grid">
          <div className="stat"><div className="stat-label">Records</div><div className="stat-val">{records.length}</div></div>
          <div className="stat"><div className="stat-label">Income</div><div className="stat-val">{ksh(totalIn)}</div></div>
          <div className="stat"><div className="stat-label">Expenses</div><div className="stat-val">{ksh(totalOut)}</div></div>
        </div>
      )}

      <div className="card">
        <div className="card-title">Activity log</div>
        {records.length === 0 ? (
          <div className="empty-state">No records yet. Start with {kind === 'crop' ? 'planting' : 'stocking or birth'}.</div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead><tr><th>Date</th><th>Activity</th><th>Quantity</th>{canMoney && <th>Amount</th>}{canMoney && <th>Buyer / supplier</th>}<th>Notes</th><th></th></tr></thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r.id}>
                    <td>{fd(r.date)}</td>
                    <td>{r.activity}</td>
                    <td>{r.quantity !== '' && r.quantity != null ? `${r.quantity} ${r.unit || ''}` : '—'}</td>
                    {canMoney && <td>{r.money ? ksh(r.money) : '—'}</td>}
                    {canMoney && <td>{r.party || '—'}</td>}
                    <td>{r.notes || '—'}</td>
                    <td className="row-actions">
                      {canMoney && <button className="btn btn-outline btn-xs" onClick={() => openEdit(r)}>Edit</button>}
                      {canMoney && <button className="btn btn-danger btn-xs" onClick={() => remove(r)}>Delete</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={open} onClose={() => setOpen(false)} title={`${editId ? 'Edit' : 'Add'} record — ${enterprise.name}`}>
        <form onSubmit={submit}>
          {error && <div className="auth-err" style={{ display: 'block', marginBottom: '.75rem' }}>{error}</div>}
          <div className="form-grid">
            <div className="fg">
              <label>Date *</label>
              <input type="date" name="date" value={form.date} onChange={set} max={today()} required />
            </div>
            <SelectOrOther label="Activity" required name="activity" value={form.activity} onChange={set} options={ACTIVITIES[kind]} />
            <div className="fg">
              <label>Quantity</label>
              <input type="number" min="0" step="any" name="quantity" value={form.quantity} onChange={set} placeholder="0" />
            </div>
            <SelectOrOther label="Unit" name="unit" value={form.unit} onChange={set} options={UNITS[kind]} />
            {canMoney && (
              <>
                <div className="fg">
                  <label>Amount (KES)</label>
                  <input type="number" min="0" name="money" value={form.money} onChange={set} placeholder="Leave blank if none" />
                </div>
                <div className="fg">
                  <label>Buyer / supplier</label>
                  <input name="party" value={form.party} onChange={set} placeholder="Name" />
                </div>
              </>
            )}
          </div>
          <div className="fg fg-full mt1">
            <label>Notes</label>
            <textarea name="notes" value={form.notes} onChange={set} />
          </div>
          <div className="modal-actions">
            <button type="submit" className="btn btn-primary">Save</button>
            <button type="button" className="btn btn-outline" onClick={() => setOpen(false)}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Enterprise;
