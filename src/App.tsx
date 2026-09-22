import { useEffect, useMemo, useState } from 'react';
import {
  Archive, BarChart3, Bell, BookOpen, ChevronRight, CircleDollarSign, Cloud,
  CloudOff, Leaf, LogOut, Menu, Moon, MoreHorizontal, PawPrint, Plus, Settings,
  ShieldCheck, Sprout, Sun, Tractor, Users, Wheat, X,
} from 'lucide-react';
import { clearSession, FarmData, getFarmData, login, savedSession, saveFarmData, User } from './api';

type Section = 'dashboard' | 'finance' | 'reports' | 'settings' | string;
type Module = { id: string; label: string; description: string; icon: typeof PawPrint; collections: string[]; color: string };
type FarmConfig = { enabled: string[]; archived: string[]; configured: boolean };
type Row = Record<string, unknown>;

const modules: Module[] = [
  { id: 'livestock', label: 'Livestock', description: 'Cattle, sheep, goats, pigs and other animals', icon: PawPrint, collections: ['cows', 'sheep', 'calves'], color: '#397bb8' },
  { id: 'poultry', label: 'Poultry & eggs', description: 'Layers, broilers, breeders and egg sales', icon: Leaf, collections: ['poultry', 'eggRecords'], color: '#d18b35' },
  { id: 'dairy', label: 'Dairy & milk', description: 'Milk production, sales and dairy products', icon: Tractor, collections: ['milkRecords', 'dairyProducts'], color: '#5b83b5' },
  { id: 'crops', label: 'Crops & grains', description: 'Maize, wheat, beans, potatoes and field crops', icon: Wheat, collections: ['plots', 'plotSeasons', 'cropActivities'], color: '#4c9650' },
  { id: 'horticulture', label: 'Horticulture', description: 'Vegetables, fruits, flowers and herbs', icon: Sprout, collections: ['horticultureBatches'], color: '#3d9b76' },
  { id: 'aquaculture', label: 'Fish farming', description: 'Ponds, stocking, feed and fish harvests', icon: Leaf, collections: ['ponds', 'fishRecords'], color: '#398e9b' },
  { id: 'apiary', label: 'Beekeeping', description: 'Hives, honey harvests and bee products', icon: Leaf, collections: ['hives', 'honeyRecords'], color: '#b17b2d' },
  { id: 'processing', label: 'Processing & products', description: 'Flour, yoghurt, juice and packaged products', icon: BookOpen, collections: ['products', 'productionBatches'], color: '#8a5eab' },
  { id: 'sales', label: 'Commercial sales', description: 'Customers, orders, stock and deliveries', icon: CircleDollarSign, collections: ['customers', 'orders', 'inventory'], color: '#bd5b52' },
];
const baseNav = [
  { id: 'dashboard', label: 'Overview', icon: BarChart3 },
  { id: 'finance', label: 'Finance', icon: CircleDollarSign },
  { id: 'reports', label: 'Reports', icon: BookOpen },
  { id: 'settings', label: 'Farm setup', icon: Settings },
] as const;
const emptyData: FarmData = { cows: [], sheep: [], milkRecords: [], transactions: [], staff: [], plotSeasons: [], vetVisits: [] };

function count(items: unknown) { return Array.isArray(items) ? items.filter((row) => (row as Row).archived !== true && (row as Row).status !== 'sold' && (row as Row).status !== 'dead').length : 0; }
function totalRows(data: FarmData, module: Module) { return module.collections.reduce((n, key) => n + (Array.isArray(data[key]) ? (data[key] as unknown[]).length : 0), 0); }
function money(value: number) { return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value); }
function getConfig(data: FarmData): FarmConfig {
  const config = data.farmConfig as Partial<FarmConfig> | undefined;
  if (config?.configured) return { enabled: config.enabled || [], archived: config.archived || [], configured: true };
  const inferred = modules.filter((module) => totalRows(data, module) > 0).map((module) => module.id);
  return { enabled: inferred.length ? inferred : ['livestock', 'crops', 'dairy'], archived: [], configured: false };
}

export default function App() {
  const [session, setSession] = useState(savedSession);
  const [data, setData] = useState<FarmData>(emptyData);
  const [section, setSection] = useState<Section>('dashboard');
  const [dark, setDark] = useState(() => localStorage.getItem('avexi_theme') === 'dark');
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState('');
  const [setupOpen, setSetupOpen] = useState(false);

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('avexi_theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    if (!session) return;
    getFarmData(session.token).then((result) => {
      const next = result.data || emptyData; setData(next); setOnline(true);
      if (!(next.farmConfig as FarmConfig | undefined)?.configured) setSetupOpen(true);
    }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, [session]);
  if (!session) return <Login onLogin={setSession} />;
  if (loading) return <div className="loading-screen">Loading your farm workspace…</div>;

  const config = getConfig(data);
  const visibleModules = modules.filter((module) => config.enabled.includes(module.id) || config.archived.includes(module.id));
  const activeModules = visibleModules.filter((module) => !config.archived.includes(module.id));
  const transactions = Array.isArray(data.transactions) ? data.transactions as Array<Row & { type?: string; amount?: number }> : [];
  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const persist = async (next: FarmData) => { setData(next); try { await saveFarmData(session.token, next); setOnline(true); } catch (err) { setOnline(false); setError((err as Error).message); } };
  const signOut = () => { clearSession(); setSession(null); };
  const selectedModule = modules.find((module) => module.id === section);
  const title = selectedModule?.label || baseNav.find((item) => item.id === section)?.label || 'Overview';

  return <div className="app-shell">
    <header><button className="icon mobile-only" onClick={() => document.body.classList.toggle('nav-open')} aria-label="Open menu"><Menu /></button><div className="brand"><span className="brand-mark">◌</span><span>Avexi</span></div><span className="header-context">Commercial farm workspace</span><div className="header-spacer" /><span className={`sync ${online ? 'online' : ''}`}>{online ? <Cloud size={14} /> : <CloudOff size={14} />} {online ? 'Synced' : 'Offline'}</span><button className="icon" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</button><button className="icon" onClick={signOut} aria-label="Sign out"><LogOut /></button></header>
    <div className="layout"><aside><div className="nav-title">Workspace</div><nav>{baseNav.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'nav-link active' : 'nav-link'} onClick={() => { setSection(id); document.body.classList.remove('nav-open'); }}><Icon size={17} /><span>{label}</span><ChevronRight size={14} /></button>)}</nav><div className="nav-title module-title">My operations</div><nav>{activeModules.map((module) => { const Icon = module.icon; return <button key={module.id} className={section === module.id ? 'nav-link active module-link' : 'nav-link module-link'} style={{ '--module-color': module.color } as React.CSSProperties} onClick={() => { setSection(module.id); document.body.classList.remove('nav-open'); }}><Icon size={17} /><span>{module.label}</span><ChevronRight size={14} /></button>; })}</nav>{config.archived.length > 0 && <button className="archived-link" onClick={() => setSetupOpen(true)}><Archive size={15} /> Archived areas ({config.archived.length})</button>}<div className="aside-user"><strong>{session.user.full_name}</strong><span>{session.user.role}</span></div></aside>
      <main><div className="page-heading"><div><p className="eyebrow">Avexi Farm</p><h1>{title}</h1><p className="subheading">Track production, stock and commercial performance in one place.</p></div><div className="heading-actions"><button className="secondary" onClick={() => setSetupOpen(true)}><Plus size={16} /> Add operation</button><div className="user-pill">{session.user.full_name}</div></div></div>{error && <div className="notice error">{error}</div>}{section === 'dashboard' ? <Dashboard activeModules={activeModules} data={data} income={income} expenses={expenses} onOpen={(id) => setSection(id)} /> : section === 'finance' ? <Finance data={data} income={income} expenses={expenses} /> : section === 'reports' ? <Reports data={data} activeModules={activeModules} /> : section === 'settings' ? <SetupCard config={config} onOpen={() => setSetupOpen(true)} /> : selectedModule ? <ModuleView module={selectedModule} data={data} archived={config.archived.includes(selectedModule.id)} role={session.user.role} onSave={persist} /> : <Dashboard activeModules={activeModules} data={data} income={income} expenses={expenses} onOpen={(id) => setSection(id)} />}</main></div>
    {setupOpen && <SetupModal config={config} data={data} onClose={() => setSetupOpen(false)} onSave={async (next) => { await persist(next); setSetupOpen(false); }} />}
  </div>;
}

function Login({ onLogin }: { onLogin: (session: { token: string; user: User }) => void }) {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); setBusy(true); try { onLogin(await login(username.trim(), password)); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } };
  return <div className="auth"><div className="auth-art"><span className="brand-mark">◌</span><p>Avexi Farm</p><h2>Run the farm<br />like a business.</h2></div><div className="auth-card"><div className="brand auth-brand"><span className="brand-mark">◌</span><span>Avexi</span></div><p className="eyebrow">Commercial farm management</p><h1>Welcome back</h1><p className="muted">Manage production, people, products and sales with clarity.</p><form onSubmit={submit}>{error && <div className="notice error">{error}</div>}<label>Username<input required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></label><label>Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label><button className="primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div></div>;
}

function Dashboard({ activeModules, data, income, expenses, onOpen }: { activeModules: Module[]; data: FarmData; income: number; expenses: number; onOpen: (id: string) => void }) {
  const milk = (data.milkRecords as Row[] || []).filter((row) => row.date === new Date().toISOString().slice(0, 10)).reduce((sum, row) => sum + Number(row.litres || 0), 0);
  return <><div className="welcome-card"><div><span className="eyebrow">Today at a glance</span><h2>Your operation, your priorities.</h2><p>Choose the business areas you run. Avexi keeps your workspace focused while protecting every historical record.</p></div><button className="primary" onClick={() => onOpen('finance')}>View performance <ChevronRight size={16} /></button></div><div className="stats"><Stat label="Active areas" value={activeModules.length} tone="green" /><Stat label="Tracked animals" value={count(data.cows) + count(data.sheep) + count(data.calves)} tone="blue" /><Stat label="Today's milk" value={`${milk.toFixed(1)} L`} tone="purple" /><Stat label="Net balance" value={money(income - expenses)} tone={income - expenses >= 0 ? 'green' : 'red'} /></div><div className="section-heading"><div><h2>My operations</h2><p className="muted">Open an area to manage its records.</p></div><span className="badge">{activeModules.length} active</span></div><div className="operation-grid">{activeModules.map((module) => <button className="operation-card" key={module.id} onClick={() => onOpen(module.id)}><span className="operation-icon" style={{ background: `${module.color}18`, color: module.color }}><module.icon size={22} /></span><span><strong>{module.label}</strong><small>{module.description}</small><em>{totalRows(data, module)} records</em></span><ChevronRight size={17} /></button>)}</div><div className="content-grid"><section className="card"><div className="card-title"><h2>Recent activity</h2><span className="muted">{(data.transactions as unknown[] || []).length} transactions</span></div>{(data.transactions as Row[] || []).slice(-5).reverse().map((item, index) => <div className="list-row" key={String(item.id || index)}><span>{String(item.category || item.desc || 'Farm transaction')}<small>{String(item.date || 'No date')}</small></span><strong className={item.type === 'income' ? 'positive' : 'negative'}>{item.type === 'income' ? '+' : '-'}{money(Number(item.amount || 0))}</strong></div>)}{!(data.transactions as unknown[] || []).length && <Empty text="Your recent production and sales activity will appear here." />}</section><section className="card insight-card"><div className="card-title"><h2>Workspace rule</h2><ShieldCheck size={18} /></div><p>Areas with records can never be deleted. Archive them instead, so reports and audit history remain intact.</p><button className="text-button" onClick={() => onOpen('settings')}>Manage farm areas <ChevronRight size={15} /></button></section></div></>;
}
function Stat({ label, value, tone }: { label: string; value: string | number; tone: string }) { return <div className={`stat ${tone}`}><span>{label}</span><strong>{value}</strong></div>; }

function ModuleView({ module, data, archived, role, onSave }: { module: Module; data: FarmData; archived: boolean; role: User['role']; onSave: (data: FarmData) => Promise<void> }) {
  const rows: Row[] = module.collections.flatMap((key) => Array.isArray(data[key]) ? (data[key] as Row[]).map((row) => ({ ...row, _collection: key })) : []);
  const add = () => { const collection = module.collections[0]; const next = { ...data, [collection]: [...(Array.isArray(data[collection]) ? data[collection] as unknown[] : []), { id: crypto.randomUUID(), name: `New ${module.label} record`, status: 'active', date: new Date().toISOString().slice(0, 10) }] }; void onSave(next); };
  return <section className="card section-card"><div className="section-hero" style={{ '--module-color': module.color } as React.CSSProperties}><div className="hero-icon"><module.icon size={28} /></div><div><span className="eyebrow">{archived ? 'Archived area' : 'Active operation'}</span><h2>{module.label}</h2><p>{module.description}</p></div>{role !== 'staff' && !archived && <button className="primary" onClick={add}><Plus size={16} /> Add record</button>}</div>{archived && <div className="notice archived-notice"><Archive size={16} /> This area is archived. Its history remains available for reports. Restore it from Farm setup to add new records.</div>}{rows.length ? <div className="table-wrap"><table><thead><tr><th>Record</th><th>Type</th><th>Status</th><th>Date</th><th></th></tr></thead><tbody>{rows.map((row, index) => <tr key={String(row.id || index)}><td><strong>{String(row.name || row.tag || row.plotName || row.desc || `Record ${index + 1}`)}</strong></td><td>{String(row._collection)}</td><td><span className={`badge ${row.archived ? 'gray' : ''}`}>{String(row.status || 'recorded')}</span></td><td>{String(row.date || row.createdAt || '—').slice(0, 10)}</td><td><button className="icon small" aria-label="Record actions"><MoreHorizontal size={17} /></button></td></tr>)}</tbody></table></div> : <Empty text={`No ${module.label.toLowerCase()} records yet. Add your first record to get started.`} />}</section>;
}
function Finance({ data, income, expenses }: { data: FarmData; income: number; expenses: number }) { const transactions = (data.transactions as Row[] || []); return <><div className="stats"><Stat label="Income" value={money(income)} tone="green" /><Stat label="Expenses" value={money(expenses)} tone="red" /><Stat label="Net result" value={money(income - expenses)} tone="purple" /></div><section className="card section-card"><div className="card-title"><div><h2>Transactions</h2><p className="muted">Production, sales, costs and payroll in one ledger.</p></div><button className="primary"><Plus size={16} /> Add transaction</button></div>{transactions.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Description</th><th>Category</th><th>Amount</th></tr></thead><tbody>{transactions.slice().reverse().map((row, i) => <tr key={String(row.id || i)}><td>{String(row.date || '—')}</td><td>{String(row.desc || row.category || 'Transaction')}</td><td><span className="badge">{String(row.type || 'expense')}</span></td><td className={row.type === 'income' ? 'positive' : 'negative'}>{money(Number(row.amount || 0))}</td></tr>)}</tbody></table></div> : <Empty text="No financial records yet." />}</section></>; }
function Reports({ data, activeModules }: { data: FarmData; activeModules: Module[] }) { return <section className="card section-card"><div className="section-hero"><div className="hero-icon"><BookOpen /></div><div><span className="eyebrow">Management reporting</span><h2>Commercial reports</h2><p>Build reports from the areas you have selected. Archived data remains included.</p></div></div><div className="report-grid">{activeModules.map((module) => <div className="report-card" key={module.id}><module.icon size={18} /><strong>{module.label}</strong><span>{totalRows(data, module)} records available</span><button className="text-button">Open report <ChevronRight size={14} /></button></div>)}</div></section>; }
function SetupCard({ config, onOpen }: { config: FarmConfig; onOpen: () => void }) { return <section className="card setup-card"><span className="eyebrow">Farm workspace</span><h2>Choose what your farm does</h2><p>Enable areas you currently operate. Nothing with history is ever deleted; stopped operations are archived.</p><div className="setup-summary"><strong>{config.enabled.length}</strong><span>active areas</span><strong>{config.archived.length}</strong><span>archived areas</span></div><button className="primary" onClick={onOpen}>Manage operation areas <ChevronRight size={16} /></button></section>; }
function SetupModal({ config, data, onClose, onSave }: { config: FarmConfig; data: FarmData; onClose: () => void; onSave: (data: FarmData) => Promise<void> }) {
  const [selected, setSelected] = useState(config.enabled); const [archived, setArchived] = useState(config.archived);
  const toggle = (id: string) => { if (archived.includes(id)) setArchived(archived.filter((item) => item !== id)); setSelected(selected.includes(id) ? selected.filter((item) => item !== id) : [...selected, id]); };
  const archive = (id: string) => { setSelected(selected.filter((item) => item !== id)); setArchived(archived.includes(id) ? archived.filter((item) => item !== id) : [...archived, id]); };
  return <div className="modal-backdrop"><div className="setup-modal"><div className="modal-header"><div><span className="eyebrow">Workspace setup</span><h2>What do you operate?</h2><p>Select the commercial areas you want on your dashboard.</p></div><button className="icon" onClick={onClose} aria-label="Close"><X /></button></div><div className="module-picker">{modules.map((module) => { const active = selected.includes(module.id); const isArchived = archived.includes(module.id); return <div className={`picker-card ${active ? 'selected' : ''} ${isArchived ? 'archived' : ''}`} key={module.id}><button onClick={() => toggle(module.id)}><span className="picker-icon" style={{ color: module.color }}><module.icon size={21} /></span><span><strong>{module.label}</strong><small>{module.description}</small></span><span className="check">{active ? '✓' : isArchived ? 'Archived' : ''}</span></button>{isArchived ? <button className="archive-action restore" onClick={() => toggle(module.id)}>Restore</button> : active && totalRows(data, module) > 0 ? <button className="archive-action" onClick={() => archive(module.id)}><Archive size={13} /> Archive</button> : null}</div>; })}</div><div className="modal-footer"><span className="muted">You can add more later. Data is never silently removed.</span><button className="primary" onClick={() => void onSave({ ...data, farmConfig: { enabled: selected, archived, configured: true } })}>Save workspace</button></div></div></div>;
}
function Empty({ text }: { text: string }) { return <div className="empty">{text}</div>; }
