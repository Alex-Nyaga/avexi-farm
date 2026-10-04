import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import EnterprisePicker, { usePickerState } from '../components/EnterprisePicker';
import { getEnterprises, enterpriseUsage, sectionOf } from '../utils/enterprises';
import { findCategory } from '../utils/catalogue';

const STEP_TEXT = [
  'Are you sure you want to permanently delete this enterprise?',
  'This enterprise has financial history. Deleting it cannot be undone and there is NO backup. Continue?',
  'Final warning: type the enterprise name below to confirm permanent deletion. There is no backup and no way to recover it.'
];

const Enterprises = () => {
  const { db, setDb, sdb, ksh, navigate, requireAdmin } = useApp();
  const list = getEnterprises(db);
  const [showAdd, setShowAdd] = useState(false);
  const [target, setTarget] = useState(null);
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const picker = usePickerState();

  const save = (enterprises) => {
    setDb({ ...db, enterprises });
    sdb();
  };

  const addSelected = () => {
    const existing = new Set(list.map((e) => e.id));
    const fresh = picker.build().filter((e) => !existing.has(e.id));
    if (fresh.length) save([...list, ...fresh]);
    picker.reset();
    setShowAdd(false);
  };

  const setStatus = (id, status) => {
    if (!requireAdmin('change farm enterprises')) return;
    save(list.map((e) => (e.id === id ? { ...e, status, archivedAt: status === 'archived' ? new Date().toISOString().slice(0, 10) : undefined } : e)));
  };

  const closeDelete = () => { setTarget(null); setStep(0); setTyped(''); };

  const finishDelete = () => {
    save(list.filter((e) => e.id !== target.id));
    closeDelete();
  };

  const usage = target ? enterpriseUsage(db, target) : null;
  const hasFinance = usage && usage.tx > 0;
  const lastStep = hasFinance ? 2 : 0;
  const canAdvance = step < lastStep || (step === lastStep && (lastStep === 0 || typed.trim().toLowerCase() === target.name.toLowerCase()));

  const renderRow = (e) => {
    const u = enterpriseUsage(db, e);
    const cat = findCategory(e.category);
    return (
      <tr key={e.id}>
        <td><strong>{e.name}</strong><div className="text-muted text-sm">{cat?.name}</div></td>
        <td>{u.records} record{u.records === 1 ? '' : 's'}</td>
        <td>{u.tx ? `${u.tx} transaction${u.tx === 1 ? '' : 's'} (${ksh(u.money)})` : '—'}</td>
        <td className="row-actions">
          {e.status === 'active' ? (
            <>
              <button className="btn btn-outline btn-xs" onClick={() => navigate(sectionOf(e))}>Open</button>
              <button className="btn btn-outline btn-xs" onClick={() => setStatus(e.id, 'archived')}>Archive</button>
            </>
          ) : (
            <button className="btn btn-outline btn-xs" onClick={() => setStatus(e.id, 'active')}>Restore</button>
          )}
          <button className="btn btn-danger btn-xs" onClick={() => requireAdmin('delete enterprises') && setTarget(e)}>Delete</button>
        </td>
      </tr>
    );
  };

  const active = list.filter((e) => e.status === 'active');
  const archived = list.filter((e) => e.status !== 'active');

  const table = (rows, empty) => rows.length === 0 ? (
    <div className="empty-state">{empty}</div>
  ) : (
    <div className="tbl-wrap">
      <table>
        <thead><tr><th>Enterprise</th><th>Data</th><th>Finance</th><th></th></tr></thead>
        <tbody>{rows.map(renderRow)}</tbody>
      </table>
    </div>
  );

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">My Farm</div>
        <div className="page-actions">
          <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(true)}>+ Add enterprise</button>
        </div>
      </div>

      <div className="card">
        <div className="card-title">Active ({active.length})</div>
        {table(active, 'No active enterprises. Add one to get started.')}
      </div>
      <div className="card">
        <div className="card-title">Archived ({archived.length})</div>
        <div className="card-sub">Archived enterprises are hidden from the side menu but keep all their records.</div>
        {table(archived, 'Nothing archived.')}
      </div>

      <Modal isOpen={showAdd} onClose={() => { picker.reset(); setShowAdd(false); }} title="Add enterprises">
        <EnterprisePicker
          selected={picker.selected}
          customItems={picker.customs}
          taken={list.map((e) => e.id)}
          onToggle={picker.toggle}
          onAddCustom={picker.addCustom}
        />
        <div className="modal-actions">
          <button className="btn btn-primary" disabled={!picker.count} onClick={addSelected}>Add {picker.count || ''} selected</button>
          <button className="btn btn-outline" onClick={() => { picker.reset(); setShowAdd(false); }}>Cancel</button>
        </div>
      </Modal>

      <Modal isOpen={!!target} onClose={closeDelete} title={target ? `Delete ${target.name}` : ''}>
        {target && usage.records > 0 ? (
          <>
            <p>
              <strong>{target.name}</strong> still has {usage.records} record{usage.records === 1 ? '' : 's'}.
              Delete them one by one first — an enterprise can only be removed once it is empty.
            </p>
            <p className="text-muted">If you just don’t want to see it any more, archive it instead. Nothing is lost.</p>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { setStatus(target.id, 'archived'); closeDelete(); }}>Archive instead</button>
              <button className="btn btn-outline" onClick={closeDelete}>Close</button>
            </div>
          </>
        ) : target && (
          <>
            {hasFinance && <div className="badge bg-red" style={{ marginBottom: '.6rem' }}>Confirmation {step + 1} of 3</div>}
            <p>{hasFinance ? STEP_TEXT[step] : STEP_TEXT[0]}</p>
            {hasFinance && step === 2 && (
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={target.name} autoFocus />
            )}
            <div className="modal-actions">
              <button
                className="btn btn-danger"
                disabled={!canAdvance}
                onClick={() => (step < lastStep ? setStep(step + 1) : finishDelete())}
              >
                {step < lastStep ? 'Yes, continue' : 'Delete permanently'}
              </button>
              <button className="btn btn-outline" onClick={() => { setStatus(target.id, 'archived'); closeDelete(); }}>Archive instead</button>
              <button className="btn btn-outline" onClick={closeDelete}>Cancel</button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Enterprises;
