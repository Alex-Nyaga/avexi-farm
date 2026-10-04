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
    const sold = sum(recs, (x) => x.soldLitres || x.litresSold || x.sold || 0);
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

  const fullFarm = () => {
    const r = make('Full Farm Report', 'Complete farm register and activity history');
    const cows = db.cows || [];
    const calves = db.calves || [];
    const sheep = db.sheep || [];
    const milkRecords = db.milkRecords || [];
    const enterprises = db.enterprises || [];
    const enterpriseRecords = db.enterpriseRecords || [];
    const seasons = db.plotSeasons || [];
    const cropActivities = db.cropActivities || [];
    const cowEvents = db.cowEvents || [];
    const sheepEvents = db.sheepEvents || [];
    const transactions = staff ? [] : (db.transactions || []);
    const staffList = db.staff || [];

    r.kpis([
      ['Cattle & calves', cows.length + calves.length],
      ['Sheep', sheep.length],
      ['Milk records', milkRecords.length],
      ['Crop seasons', seasons.length],
      ['Farm activities', enterpriseRecords.length + cropActivities.length]
    ]);

    const animalRows = (items) => items.map((a) => [a.tag || '—', a.breed || a.species || '—', a.sex || '—', a.dob ? fd(a.dob) : '—', a.status || '—', a.weight ? `${a.weight} kg` : '—']);
    r.table(['Tag', 'Breed / type', 'Sex', 'Born', 'Status', 'Weight'], animalRows(cows), 'Cattle');
    r.table(['Tag', 'Breed / type', 'Sex', 'Born', 'Status', 'Weight'], animalRows(calves), 'Calves');
    r.table(['Tag', 'Breed / type', 'Sex', 'Born', 'Status', 'Weight'], animalRows(sheep), 'Sheep');

    const allEvents = [...cowEvents.map((e) => ({ ...e, species: 'Cattle' })), ...sheepEvents.map((e) => ({ ...e, species: 'Sheep' }))]
      .sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));
    r.table(['Date', 'Group', 'Animal ID', 'Event', 'Product / notes', 'Dose / outcome'], allEvents.map((e) => [
      e.date ? fd(e.date) : '—', e.species, e.tag || e.animalId || '—', e.event || '—',
      [e.vaccineType, e.drug, e.cause, e.notes].filter(Boolean).join(' · ') || '—',
      [e.dosage, e.vaccineRoute, e.outcome, e.withdrawalPeriod].filter(Boolean).join(' · ') || '—'
    ]), 'Animal health, breeding and lifecycle events');

    r.table(['Date', 'Animal', 'AM (L)', 'PM (L)', 'Total (L)', 'Sold (L)', 'Buyer'], milkRecords.map((m) => [
      m.date ? fd(m.date) : '—', m.cowTag || m.animalTag || '—', m.am || 0, m.pm || 0,
      (Number(m.am || 0) + Number(m.pm || 0)).toFixed(1), m.soldLitres || m.litresSold || m.sold || 0, m.buyer || '—'
    ]), 'Milk production and sales');

    r.table(['Enterprise', 'Category', 'Type', 'Status'], enterprises.map((e) => [e.name, e.category || '—', e.kind || '—', e.status || 'active']), 'Farm enterprises');
    r.table(['Date', 'Enterprise', 'Activity', 'Quantity', 'Cost / proceeds', 'Details', 'Notes'], enterpriseRecords.map((x) => [
      x.date ? fd(x.date) : '—', enterprises.find((e) => e.id === x.enterpriseId)?.name || x.enterpriseId || '—', x.activity || '—',
      x.quantity !== '' && x.quantity != null ? `${x.quantity} ${x.unit || ''}` : '—',
      x.money ? ksh(x.money) : '—',
      Object.entries(x.details || {}).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}: ${v}`).join('; ') || '—',
      x.notes || '—'
    ]), 'Livestock and crop activity records');

    r.table(['Plot', 'Variety', 'Planted', 'Harvested', 'Status'], seasons.map((s) => [
      s.plotName || s.plotId || '—', s.variety || '—', s.plantedDate ? fd(s.plantedDate) : '—',
      s.harvestedDate ? fd(s.harvestedDate) : '—', s.status || '—'
    ]), 'Crop seasons');
    r.table(['Plot', 'Created'], (db.plots || []).map((plot) => [plot.name || plot.id || '—', plot.createdAt ? fd(plot.createdAt.slice(0, 10)) : '—']), 'Plots');
    r.table(['Date', 'Plot', 'Activity', 'Details', 'Notes', 'Cost / proceeds'], cropActivities.map((x) => [
      x.date ? fd(x.date) : '—', x.plotName || '—', x.activity || '—',
      Object.entries(x.details || {}).filter(([, v]) => v !== '' && v != null).map(([k, v]) => `${k}: ${v}`).join('; ') || '—',
      x.notes || '—', x.cost ? ksh(x.cost) : '—'
    ]), 'Crop field operations');
    r.table(['Date', 'Plot / season', 'Product', 'Target / dose', 'Notes'], (db.sprayLog || []).map((x) => [
      x.date ? fd(x.date) : '—', seasons.find((s) => s.id === x.seasonId)?.plotName || x.plotName || '—',
      x.product || x.chemical || '—', [x.target, x.dosage, x.preHarvestInterval ? `${x.preHarvestInterval} day PHI` : ''].filter(Boolean).join(' · ') || '—',
      x.notes || '—'
    ]), 'Legacy crop spray log');
    r.table(['Date', 'Plot / season', 'Activity', 'Product / notes'], (db.boosterLog || []).map((x) => [
      x.date ? fd(x.date) : '—', seasons.find((s) => s.id === x.seasonId)?.plotName || x.plotName || '—',
      x.activity || x.type || '—', [x.product, x.notes].filter(Boolean).join(' · ') || '—'
    ]), 'Other crop input log');

    r.table(['Date', 'Animal', 'Reason / diagnosis', 'Treatment', 'Cost', 'Follow-up'], (db.vetVisits || []).map((v) => [
      v.date ? fd(v.date) : '—', v.animalTag || v.tag || v.animalId || '—', v.reason || v.diagnosis || '—',
      v.treatment || '—', v.cost ? ksh(v.cost) : '—', v.followUpDate ? fd(v.followUpDate) : '—'
    ]), 'Veterinary visits');

    if (!staff) {
      const income = sum(transactions.filter((t) => t.type === 'income'), (t) => t.amount);
      const expenses = sum(transactions.filter((t) => t.type === 'expense'), (t) => t.amount);
      r.kpis([['Total income', ksh(income)], ['Total expenses', ksh(expenses)], ['Net balance', ksh(income - expenses)]]);
      r.table(['Date', 'Type', 'Category', 'Description', 'Source', 'Amount'], transactions.map((t) => [
        t.date ? fd(t.date) : '—', t.type || '—', t.category || '—', t.desc || '—', t.source || '—', ksh(t.amount)
      ]), 'All financial transactions');
    }

    r.table(['Staff member', 'Role', 'Phone', 'Status', 'Start date', 'Left date', ...(!staff ? ['Monthly salary'] : [])], staffList.map((s) => [
      s.name || '—', s.role || '—', s.phone || '—', s.status || '—', s.startDate ? fd(s.startDate) : '—',
      s.leftDate ? fd(s.leftDate) : '—', ...(!staff ? [s.monthlySalary ? ksh(s.monthlySalary) : '—'] : [])
    ]), 'Staff register');
    if (!staff) {
      r.table(['Date', 'Staff', 'Type', 'Amount', 'Notes'], (db.staffPayments || []).map((p) => [
        p.date ? fd(p.date) : '—', p.staffName || p.name || p.staffId || '—', p.type || 'Payment',
        p.amount ? ksh(p.amount) : '—', p.notes || p.desc || '—'
      ]), 'Staff payments');
    }
    r.signatures();
    r.save('full-farm-report.pdf');
  };

  const items = [
    ['Full Farm Report', 'All livestock, crops, milk, health, staff and finances', fullFarm],
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
            <button key={t} type="button" className="btn btn-outline report-download" onClick={fn}>
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
