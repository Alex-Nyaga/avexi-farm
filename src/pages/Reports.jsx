import React from 'react';
import { useApp } from '../context/AppContext';
import { ksh, fd } from '../utils/helpers';
import { ReportBuilder } from '../utils/reportPdf';

const sum = (arr, f) => arr.reduce((a, r) => a + (Number(f(r)) || 0), 0);
const monthKey = (d) => (d || '').slice(0, 7);
const byMonth = (rows, f) => {
  const m = {};
  rows.forEach((r) => {
    const k = monthKey(r.date);
    if (k) m[k] = (m[k] || 0) + (Number(f(r)) || 0);
  });
  const keys = Object.keys(m).sort().slice(-12);
  return { keys, vals: keys.map((k) => m[k]) };
};

const Reports = () => {
  const { db, currentUser, isStaff } = useApp();
  const staff = isStaff();
  const user = currentUser || { username: 'Unknown' };
  const make = (title, subtitle) => new ReportBuilder({ title, subtitle, user });

  const livestock = () => {
    const r = make('Livestock Report', `${db.cows.length + db.sheep.length} animals`);
    r.kpis([['Cows', db.cows.length], ['Sheep', db.sheep.length], ['Calves', (db.calves || []).length], ['Vet visits', (db.vetVisits || []).length]]);
    const rows = (a) => a.map((x) => [x.tag, x.breed || x.species || '—', x.sex || '—', x.status || '—', x.weight ? `${x.weight} kg` : '—']);
    r.table(['Tag', 'Breed', 'Sex', 'Status', 'Weight'], rows(db.cows), 'Cows');
    r.table(['Tag', 'Breed', 'Sex', 'Status', 'Weight'], rows(db.sheep), 'Sheep');
    r.signatures();
    r.save('livestock-report.pdf');
  };

  const milk = () => {
    const recs = db.milkRecords || [];
    const total = (x) => Number(x.am || 0) + Number(x.pm || 0);
    const litres = sum(recs, total);
    const sold = sum(recs, (x) => x.sold || x.litresSold || 0);
    const r = make('Milk Production Report', `${recs.length} records`);
    r.kpis([['Total litres', litres.toFixed(1)], ['Sold (L)', sold.toFixed(1)], ['Records', recs.length]]);
    const m = byMonth(recs, total);
    if (m.keys.length) {
      r.chart({ type: 'bar', labels: m.keys, datasets: [{ label: 'Litres', data: m.vals, backgroundColor: '#2a7a3a', borderRadius: 4 }], xTitle: 'Month', yTitle: 'Litres' }, 'Monthly production');
    }
    r.table(['Date', 'Cow', 'AM (L)', 'PM (L)', 'Total (L)'], recs.map((x) => [fd(x.date), x.cowTag || '—', x.am || 0, x.pm || 0, total(x).toFixed(1)]), 'Records');
    r.signatures();
    r.save('milk-report.pdf');
  };

  const finance = () => {
    const tx = db.transactions || [];
    const inc = sum(tx.filter((t) => t.type === 'income'), (t) => t.amount);
    const exp = sum(tx.filter((t) => t.type === 'expense'), (t) => t.amount);
    const r = make('Financial Report', 'Income & expenses');
    r.kpis([['Income', ksh(inc)], ['Expenses', ksh(exp)], ['Net', ksh(inc - exp)]]);
    const i = byMonth(tx.filter((t) => t.type === 'income'), (t) => t.amount);
    const e = byMonth(tx.filter((t) => t.type === 'expense'), (t) => t.amount);
    const keys = [...new Set([...i.keys, ...e.keys])].sort();
    if (keys.length) {
      const pick = (src) => keys.map((k) => src.vals[src.keys.indexOf(k)] || 0);
      r.chart({ type: 'bar', labels: keys, datasets: [
        { label: 'Income', data: pick(i), backgroundColor: '#2a7a3a', borderRadius: 4 },
        { label: 'Expenses', data: pick(e), backgroundColor: '#b03020', borderRadius: 4 }
      ], xTitle: 'Month', yTitle: 'KES' }, 'Income vs expenses');
    }
    const cats = {};
    tx.filter((t) => t.type === 'expense').forEach((t) => { const k = t.category || 'Other'; cats[k] = (cats[k] || 0) + Number(t.amount || 0); });
    const ck = Object.keys(cats);
    if (ck.length) {
      const palette = ['#2a7a3a', '#1a5a8a', '#956b10', '#b03020', '#6b4aa0', '#2a8a8a', '#8a5a2a', '#5a6b2a'];
      r.chart({ type: 'doughnut', labels: ck, datasets: [{ data: ck.map((k) => cats[k]), backgroundColor: ck.map((_, n) => palette[n % palette.length]) }], width: 900, height: 420 }, 'Expenses by category');
    }
    r.table(['Date', 'Type', 'Category', 'Description', 'Amount'], tx.map((t) => [fd(t.date), t.type, t.category || '—', t.desc || '—', ksh(t.amount)]), 'Transactions');
    r.signatures();
    r.save('financial-report.pdf');
  };

  const staffReport = () => {
    const list = db.staff || [];
    const r = make('Staff Report', `${list.length} members`);
    r.kpis([['Total', list.length], ['Active', list.filter((s) => s.status !== 'inactive').length], ['Left', list.filter((s) => s.status === 'inactive').length]]);
    r.table(['Name', 'Role', 'Phone', staff ? 'Status' : 'Salary', staff ? 'Started' : 'Status'], list.map((s) => staff
      ? [s.name, s.role || '—', s.phone || '—', s.status || '—', s.startDate ? fd(s.startDate) : '—']
      : [s.name, s.role || '—', s.phone || '—', s.monthlySalary ? ksh(s.monthlySalary) : '—', s.status === 'inactive' && s.leftDate ? `left ${fd(s.leftDate)}` : (s.status || '—')]), 'Team');
    r.signatures();
    r.save('staff-report.pdf');
  };

  const crop = () => {
    const seasons = db.plotSeasons || [];
    const r = make('Crop Report', `${seasons.length} seasons`);
    r.kpis([['Seasons', seasons.length], ['Plots', (db.plots || []).length]]);
    r.table(['Plot', 'Variety', 'Planted', 'Status'], seasons.map((s) => [s.plotName || s.plotId, s.variety || '—', s.plantedDate ? fd(s.plantedDate) : '—', s.status || '—']), 'Seasons');
    r.signatures();
    r.save('crop-report.pdf');
  };

  const items = [
    ['Livestock Report', 'Cows and sheep overview', livestock],
    ['Milk Production Report', 'Monthly graph, records and sales', milk],
    ['Crop Report', 'Plots and seasons', crop],
    !staff && ['Financial Report', 'Income, expenses, graphs', finance],
    ['Staff Report', 'Team members', staffReport]
  ].filter(Boolean);

  return (
    <div>
      <div className="page-hdr">
        <div className="page-title">Reports</div>
      </div>
      <div className="card">
        <div className="card-title">Available Reports</div>
        <div className="card-sub" style={{ marginBottom: '1rem' }}>
          Each PDF carries the download date and time, your name, and a sign-off block.
        </div>
        <div style={{ display: 'grid', gap: '.75rem' }}>
          {items.map(([t, s, fn]) => (
            <button key={t} type="button" className="btn btn-outline" style={{ justifyContent: 'space-between', textAlign: 'left' }} onClick={fn}>
              <span><strong>{t}</strong><br /><small>{s}</small></span>
              <span>Download PDF</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
