import { useEffect, useMemo, useState } from 'react';
import { BarChart3, Bell, BookOpen, ChevronRight, CircleDollarSign, Cloud, CloudOff, LogOut, Menu, Moon, PawPrint, Settings, Sun, Users, Wheat, X } from 'lucide-react';
import { clearSession, FarmData, getFarmData, login, savedSession, saveFarmData, User } from './api';

type Section = 'dashboard' | 'cows' | 'sheep' | 'milk' | 'potatoes' | 'staff' | 'finance' | 'reports' | 'settings';
const emptyData: FarmData = { cows: [], sheep: [], milkRecords: [], transactions: [], staff: [], plotSeasons: [], vetVisits: [] };
const nav: Array<{ id: Section; label: string; icon: typeof PawPrint }> = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 }, { id: 'cows', label: 'Cows', icon: PawPrint },
  { id: 'sheep', label: 'Sheep', icon: PawPrint }, { id: 'milk', label: 'Milk Records', icon: BookOpen },
  { id: 'potatoes', label: 'Potatoes', icon: Wheat }, { id: 'staff', label: 'Staff', icon: Users },
  { id: 'finance', label: 'Finance', icon: CircleDollarSign }, { id: 'reports', label: 'Reports', icon: BookOpen },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function countAlive(items: unknown) { return Array.isArray(items) ? items.filter((item) => (item as Record<string, unknown>).status !== 'sold' && (item as Record<string, unknown>).status !== 'dead').length : 0; }
function money(value: number) { return new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES', maximumFractionDigits: 0 }).format(value); }

export default function App() {
  const [session, setSession] = useState(savedSession);
  const [data, setData] = useState<FarmData>(emptyData);
  const [section, setSection] = useState<Section>('dashboard');
  const [dark, setDark] = useState(() => localStorage.getItem('avexi_theme') === 'dark');
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(Boolean(session));
  const [error, setError] = useState('');

  useEffect(() => { document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('avexi_theme', dark ? 'dark' : 'light'); }, [dark]);
  useEffect(() => {
    if (!session) return;
    getFarmData(session.token).then((result) => { setData(result.data || emptyData); setOnline(true); }).catch((err: Error) => setError(err.message)).finally(() => setLoading(false));
  }, [session]);

  if (!session) return <Login onLogin={(next) => setSession(next)} />;
  const transactions = data.transactions || [];
  const income = transactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const expenses = transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount || 0), 0);
  const stats = [{ label: 'Live cows', value: countAlive(data.cows), tone: 'blue' }, { label: 'Live sheep', value: countAlive(data.sheep), tone: 'amber' }, { label: 'Active plots', value: countAlive(data.plotSeasons), tone: 'green' }, { label: "Today's milk", value: `${(data.milkRecords || []).filter((r) => r.date === new Date().toISOString().slice(0, 10)).reduce((sum, r) => sum + Number(r.litres || 0), 0).toFixed(1)} L`, tone: 'purple' }];
  const signOut = () => { clearSession(); setSession(null); };
  return <div className="app-shell">
    <header><button className="icon mobile-only" onClick={() => document.body.classList.toggle('nav-open')} aria-label="Open menu"><Menu /></button><div className="brand"><span className="brand-mark">◌</span><span>Avexi</span></div><div className="header-spacer" /><span className={`sync ${online ? 'online' : ''}`}>{online ? <Cloud size={14} /> : <CloudOff size={14} />} {online ? 'Synced' : 'Offline'}</span><button className="icon" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun /> : <Moon />}</button><button className="icon" onClick={signOut} aria-label="Sign out"><LogOut /></button></header>
    <div className="layout"><aside><div className="nav-title">Farm management</div>{nav.map(({ id, label, icon: Icon }) => <button key={id} className={section === id ? 'nav-link active' : 'nav-link'} onClick={() => { setSection(id); document.body.classList.remove('nav-open'); }}><Icon size={17} /><span>{label}</span><ChevronRight size={14} /></button>)}<div className="aside-user"><strong>{session.user.full_name}</strong><span>{session.user.role}</span></div></aside>
      <main>{loading ? <div className="loading">Loading your farm data…</div> : <><div className="page-heading"><div><p className="eyebrow">Avexi Farm</p><h1>{nav.find((item) => item.id === section)?.label}</h1></div><div className="user-pill">{session.user.full_name}</div></div>{error && <div className="notice error">{error}</div>}{section === 'dashboard' ? <Dashboard stats={stats} income={income} expenses={expenses} data={data} /> : <SectionView section={section} data={data} income={income} expenses={expenses} role={session.user.role} onSave={async (next) => { setData(next); try { await saveFarmData(session.token, next); setOnline(true); } catch (err) { setOnline(false); setError((err as Error).message); } }} />}</>}</main></div>
  </div>;
}

function Login({ onLogin }: { onLogin: (session: { token: string; user: User }) => void }) {
  const [username, setUsername] = useState(''); const [password, setPassword] = useState(''); const [error, setError] = useState(''); const [busy, setBusy] = useState(false);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setError(''); setBusy(true); try { onLogin(await login(username.trim(), password)); } catch (err) { setError((err as Error).message); } finally { setBusy(false); } };
  return <div className="auth"><div className="auth-card"><div className="brand auth-brand"><span className="brand-mark">◌</span><span>Avexi</span></div><p className="eyebrow">Farm management</p><h1>Welcome back</h1><p className="muted">Sign in to manage your livestock, crops and finances.</p><form onSubmit={submit}>{error && <div className="notice error">{error}</div>}<label>Username<input required value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" /></label><label>Password<input required minLength={8} type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" /></label><button className="primary full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button></form></div></div>;
}

function Dashboard({ stats, income, expenses, data }: { stats: Array<{ label: string; value: number | string; tone: string }>; income: number; expenses: number; data: FarmData }) {
  return <><div className="stats">{stats.map((stat) => <div className={`stat ${stat.tone}`} key={stat.label}><span>{stat.label}</span><strong>{stat.value}</strong></div>)}<div className="stat purple"><span>Net balance</span><strong>{money(income - expenses)}</strong></div></div><div className="content-grid"><section className="card"><div className="card-title"><h2>Recent transactions</h2><span className="muted">{(data.transactions || []).length} total</span></div>{(data.transactions || []).slice(-6).reverse().map((item, index) => <div className="list-row" key={item.id || index}><span>{item.category || 'Farm transaction'}<small>{item.date || 'No date'}</small></span><strong className={item.type === 'income' ? 'positive' : 'negative'}>{item.type === 'income' ? '+' : '-'}{money(Number(item.amount || 0))}</strong></div>)}{!(data.transactions || []).length && <Empty text="No transactions recorded yet." />}</section><section className="card"><div className="card-title"><h2>Farm overview</h2><Bell size={18} /></div><div className="overview"><p><strong>{countAlive(data.cows) + countAlive(data.sheep)}</strong> animals currently tracked</p><p><strong>{countAlive(data.staff)}</strong> staff members</p><p><strong>{countAlive(data.vetVisits)}</strong> veterinary records</p></div></section></div></>;
}

function SectionView({ section, data, income, expenses, role, onSave }: { section: Section; data: FarmData; income: number; expenses: number; role: User['role']; onSave: (data: FarmData) => Promise<void> }) {
  const collection = section === 'finance' ? data.transactions : section === 'potatoes' ? data.plotSeasons : data[section] as unknown;
  const rows = Array.isArray(collection) ? collection : [];
  const canEdit = role !== 'staff';
  const title = section === 'finance' ? `Income ${money(income)} · Expenses ${money(expenses)}` : `${rows.length} records`;
  return <section className="card section-card"><div className="card-title"><div><h2>{nav.find((item) => item.id === section)?.label}</h2><span className="muted">{title}</span></div>{canEdit && section !== 'reports' && section !== 'settings' && <button className="primary" onClick={() => onSave({ ...data, [section === 'potatoes' ? 'plotSeasons' : section]: [...rows, { id: crypto.randomUUID(), createdAt: new Date().toISOString(), status: 'active' }] })}>Add record</button>}</div>{section === 'settings' ? <SettingsPanel data={data} /> : section === 'reports' ? <Empty text="Reports are generated from your synced farm data." /> : rows.length ? <div className="table-wrap"><table><thead><tr><th>Record</th><th>Status</th><th>Date</th></tr></thead><tbody>{rows.map((row, index) => <tr key={String((row as Record<string, unknown>).id || index)}><td>{String((row as Record<string, unknown>).name || (row as Record<string, unknown>).category || (row as Record<string, unknown>).type || `Record ${index + 1}`)}</td><td><span className="badge">{String((row as Record<string, unknown>).status || 'recorded')}</span></td><td>{String((row as Record<string, unknown>).date || (row as Record<string, unknown>).createdAt || '—').slice(0, 10)}</td></tr>)}</tbody></table></div> : <Empty text="No records yet. Add your first record to get started." />}</section>;
}
function SettingsPanel({ data }: { data: FarmData }) { return <div className="settings-list"><div><strong>Cloud sync</strong><span className="muted">Your farm data is stored in Supabase through the protected API.</span></div><div><strong>Data collections</strong><span className="muted">{Object.keys(data).length} collections loaded</span></div><div><strong>Security</strong><span className="muted">Session credentials are held in session storage and never expose the Supabase service key.</span></div></div>; }
function Empty({ text }: { text: string }) { return <div className="empty">{text}</div>; }
