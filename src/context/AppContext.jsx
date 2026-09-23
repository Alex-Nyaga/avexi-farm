import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { buildNotifications } from '../utils/notifications';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [db, setDbState] = useState({
    cows: [],
    cowEvents: [],
    sheep: [],
    sheepEvents: [],
    milkRecords: [],
    calves: [],
    plots: [],
    plotSeasons: [],
    cropActivities: [],
    sprayLog: [],
    boosterLog: [],
    staff: [],
    staffPayments: [],
    vetVisits: [],
    transactions: []
  });
  const dbRef = useRef(db);
  const setDb = useCallback((nextDb) => {
    dbRef.current = nextDb;
    setDbState(nextDb);
  }, []);
  const [theme, setTheme] = useState('light');
  const [syncStatus, setSyncStatus] = useState('offline');
  const [notifications, setNotifications] = useState([]);
  const [currentSection, setCurrentSection] = useState('dashboard');

  const SK = 'avexi_v3';

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('av_theme') || 'light';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('av_theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  }, [theme]);

  // Auth headers
  const authHeaders = useCallback(() => {
    return { 'Content-Type': 'application/json', 'x-avexi-token': token || '' };
  }, [token]);

  // Database helpers
  const supaGet = useCallback(async () => {
    try {
      const res = await fetch('/api/db', { headers: authHeaders() });
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }, [authHeaders, token]);

  const supaSet = useCallback(async (payload) => {
    try {
      const res = await fetch('/api/db', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ data: payload })
      });
      const json = await res.json();
      return json.ok === true;
    } catch {
      return false;
    }
  }, [authHeaders, token]);

  // Sync functions
  const sdb = useCallback(async () => {
    const data = dbRef.current;
    localStorage.setItem(SK, JSON.stringify(data));
    setSyncStatus('syncing');
    const ok = await supaSet(data);
    setSyncStatus(ok ? 'online' : 'offline');
    setNotifications(buildNotifications(data));
  }, [supaSet]);

  const ldb = useCallback(async () => {
    setSyncStatus('syncing');
    const cloud = await supaGet();
    if (cloud) {
      setDb(cloud);
      localStorage.setItem(SK, JSON.stringify(cloud));
      setSyncStatus('online');
      setNotifications(buildNotifications(cloud));
    } else {
      const local = localStorage.getItem(SK);
      if (local) {
        try {
          const parsedData = JSON.parse(local);
          setDb(parsedData);
          setNotifications(buildNotifications(parsedData));
        } catch (e) {
          console.error('Error parsing local data:', e);
        }
      } else {
        const today = new Date().toISOString().slice(0, 10);
        const sampleData = {
          cows: [
            { id: 'cow1', tag: 'C-001', species: 'Friesian', breed: 'Friesian', colour: 'Black & white', sex: 'Female', dob: '2022-01-15', status: 'alive', weight: 450, avgMilkPerDay: 15, lactation: 'Milking' },
            { id: 'cow2', tag: 'C-002', species: 'Jersey', breed: 'Jersey', colour: 'Brown', sex: 'Female', dob: '2022-03-20', status: 'alive', weight: 380, avgMilkPerDay: 12, lactation: 'Milking' },
            { id: 'cow3', tag: 'C-003', species: 'Ayrshire', breed: 'Ayrshire', colour: 'Red & white', sex: 'Female', dob: '2021-11-10', status: 'alive', weight: 420, avgMilkPerDay: 14, lactation: 'Milking' },
            { id: 'cow4', tag: 'C-004', species: 'Friesian', breed: 'Friesian', colour: 'Black & white', sex: 'Female', dob: '2023-02-05', status: 'alive', weight: 350, avgMilkPerDay: 10, lactation: 'Milking' },
            { id: 'cow5', tag: 'C-005', species: 'Jersey', breed: 'Jersey', colour: 'Brown', sex: 'Female', dob: '2022-08-15', status: 'alive', weight: 365, avgMilkPerDay: 11, lactation: 'Milking' }
          ],
          cowEvents: [],
          sheep: [
            { id: 'sheep1', tag: 'S-001', species: 'Dorper', breed: 'Dorper', colour: 'White', sex: 'Female', dob: '2023-03-20', status: 'alive', weight: 65 },
            { id: 'sheep2', tag: 'S-002', species: 'Merino', breed: 'Merino', colour: 'White', sex: 'Female', dob: '2023-05-10', status: 'alive', weight: 55 },
            { id: 'sheep3', tag: 'S-003', species: 'Dorper', breed: 'Dorper', colour: 'White', sex: 'Male', dob: '2023-04-15', status: 'alive', weight: 70 },
            { id: 'sheep4', tag: 'S-004', species: 'Hampshire', breed: 'Hampshire', colour: 'Black', sex: 'Female', dob: '2023-06-01', status: 'alive', weight: 60 }
          ],
          sheepEvents: [],
          milkRecords: [
            { id: 'mr1', cowId: 'cow1', cowTag: 'C-001', date: '2024-09-20', am: 8, pm: 7, litres: 15 },
            { id: 'mr2', cowId: 'cow2', cowTag: 'C-002', date: '2024-09-20', am: 6, pm: 6, litres: 12 },
            { id: 'mr3', cowId: 'cow3', cowTag: 'C-003', date: '2024-09-20', am: 7, pm: 7, litres: 14 },
            { id: 'mr4', cowId: 'cow4', cowTag: 'C-004', date: '2024-09-20', am: 5, pm: 5, litres: 10 },
            { id: 'mr5', cowId: 'cow5', cowTag: 'C-005', date: '2024-09-20', am: 6, pm: 5, litres: 11 },
            { id: 'mr6', cowId: 'cow1', cowTag: 'C-001', date: '2024-09-21', am: 8, pm: 7, litres: 15 },
            { id: 'mr7', cowId: 'cow2', cowTag: 'C-002', date: '2024-09-21', am: 6, pm: 6, litres: 12 },
            { id: 'mr8', cowId: 'cow3', cowTag: 'C-003', date: '2024-09-21', am: 7, pm: 7, litres: 14 },
            { id: 'mr9', cowId: 'cow4', cowTag: 'C-004', date: '2024-09-21', am: 5, pm: 5, litres: 10 },
            { id: 'mr10', cowId: 'cow5', cowTag: 'C-005', date: '2024-09-21', am: 6, pm: 5, litres: 11 },
            { id: 'mr11', cowId: 'cow1', cowTag: 'C-001', date: '2024-09-22', am: 8, pm: 7, litres: 15 },
            { id: 'mr12', cowId: 'cow2', cowTag: 'C-002', date: '2024-09-22', am: 6, pm: 6, litres: 12 },
            { id: 'mr13', cowId: 'cow3', cowTag: 'C-003', date: '2024-09-22', am: 7, pm: 7, litres: 14 },
            { id: 'mr14', cowId: 'cow4', cowTag: 'C-004', date: '2024-09-22', am: 5, pm: 5, litres: 10 },
            { id: 'mr15', cowId: 'cow5', cowTag: 'C-005', date: '2024-09-22', am: 6, pm: 5, litres: 11 },
            { id: 'mr16', cowId: 'cow1', cowTag: 'C-001', date: '2024-09-23', am: 8, pm: 7, litres: 15 },
            { id: 'mr17', cowId: 'cow2', cowTag: 'C-002', date: '2024-09-23', am: 6, pm: 6, litres: 12 },
            { id: 'mr18', cowId: 'cow3', cowTag: 'C-003', date: '2024-09-23', am: 7, pm: 7, litres: 14 },
            { id: 'mr19', cowId: 'cow4', cowTag: 'C-004', date: '2024-09-23', am: 5, pm: 5, litres: 10 },
            { id: 'mr20', cowId: 'cow5', cowTag: 'C-005', date: '2024-09-23', am: 6, pm: 5, litres: 11 }
          ],
          calves: [
            { id: 'calf1', tag: 'CF-001', species: 'Friesian', breed: 'Friesian', colour: 'Black & white', sex: 'Female', dob: '2024-06-15', status: 'alive', weight: 45, damId: 'cow1', damTag: 'C-001' },
            { id: 'calf2', tag: 'CF-002', species: 'Jersey', breed: 'Jersey', colour: 'Brown', sex: 'Male', dob: '2024-07-20', status: 'alive', weight: 38, damId: 'cow2', damTag: 'C-002' }
          ],
          plots: [],
          plotSeasons: [
            { id: 'plot1', plotId: 'P-001', plotName: 'Plot A', variety: 'Shangi', plantedDate: '2024-03-15', status: 'active' },
            { id: 'plot2', plotId: 'P-002', plotName: 'Plot B', variety: 'Asante', plantedDate: '2024-04-10', status: 'active' }
          ],
          cropActivities: [],
          sprayLog: [],
          boosterLog: [],
          staff: [
            { id: 'staff1', name: 'John Kamau', role: 'Herdsman', phone: '0712345678', monthlySalary: 25000, status: 'active', startDate: '2023-01-15' },
            { id: 'staff2', name: 'Mary Wanjiku', role: 'Farm Manager', phone: '0723456789', monthlySalary: 45000, status: 'active', startDate: '2022-06-01' },
            { id: 'staff3', name: 'Peter Ochieng', role: 'Field Worker', phone: '0734567890', monthlySalary: 20000, status: 'active', startDate: '2023-08-20' }
          ],
          staffPayments: [],
          vetVisits: [],
          transactions: [
            { id: 'tx1', type: 'expense', date: '2024-09-01', amount: 25000, category: 'Feed', desc: 'Cattle feed purchase - September' },
            { id: 'tx2', type: 'income', date: '2024-09-05', amount: 45000, category: 'Milk Sales', desc: 'Milk sales to cooperative' },
            { id: 'tx3', type: 'expense', date: '2024-09-10', amount: 15000, category: 'Veterinary', desc: 'Vet visit - routine checkup' },
            { id: 'tx4', type: 'income', date: '2024-09-15', amount: 48000, category: 'Milk Sales', desc: 'Milk sales to cooperative' },
            { id: 'tx5', type: 'expense', date: '2024-09-18', amount: 8000, category: 'Equipment', desc: 'Fencing materials' },
            { id: 'tx6', type: 'income', date: '2024-09-20', amount: 46000, category: 'Milk Sales', desc: 'Milk sales to cooperative' },
            { id: 'tx7', type: 'expense', date: '2024-08-25', amount: 90000, category: 'Staff Salary', desc: 'August staff salaries' },
            { id: 'tx8', type: 'income', date: '2024-08-28', amount: 44000, category: 'Milk Sales', desc: 'Milk sales to cooperative' },
            { id: 'tx9', type: 'expense', date: '2024-08-15', amount: 22000, category: 'Feed', desc: 'Cattle feed purchase - August' },
            { id: 'tx10', type: 'income', date: '2024-08-20', amount: 43000, category: 'Milk Sales', desc: 'Milk sales to cooperative' },
            { id: 'tx11', type: 'expense', date: '2024-07-25', amount: 90000, category: 'Staff Salary', desc: 'July staff salaries' },
            { id: 'tx12', type: 'income', date: '2024-07-28', amount: 42000, category: 'Milk Sales', desc: 'Milk sales to cooperative' },
            { id: 'tx13', type: 'expense', date: '2024-07-15', amount: 20000, category: 'Feed', desc: 'Cattle feed purchase - July' },
            { id: 'tx14', type: 'income', date: '2024-07-20', amount: 41000, category: 'Milk Sales', desc: 'Milk sales to cooperative' }
          ]
        };
        setDb(sampleData);
        localStorage.setItem(SK, JSON.stringify(sampleData));
        setNotifications(buildNotifications(sampleData));
      }
      setSyncStatus('offline');
    }
  }, [supaGet]);

  // Auth functions
  const sha256 = async (str) => {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const doLogin = async (username, password) => {
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', username, password })
      });
      
      if (!res.ok) throw new Error('Could not reach server. Check your internet.');
      
      const result = await res.json();

      if (result.status === 'locked') {
        throw new Error(`Too many failed attempts. Try again in ${result.retry_in_minutes} minute(s).`);
      }
      if (result.status === 'wrong') {
        const left = result.attempts_left;
        throw new Error(left > 0
          ? `Incorrect username or password. ${left} attempt${left === 1 ? '' : 's'} left.`
          : 'Too many failed attempts. Locked for 15 minutes.');
      }
      if (result.status === 'blocked') {
        throw new Error('Your access has been restricted. Contact admin: Alex Nyaga — 0757934764.');
      }
      if (result.status !== 'ok') {
        throw new Error('Login failed. Try again.');
      }

      const user = { 
        id: result.id, 
        username: result.username, 
        name: result.full_name, 
        role: result.role 
      };
      
      setCurrentUser(user);
      setToken(result.token);
      sessionStorage.setItem('avexi_user', JSON.stringify(user));
      sessionStorage.setItem('avexi_token', result.token);

      // Log login
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-avexi-token': result.token },
        body: JSON.stringify({
          user_id: result.id, 
          username: result.username,
          full_name: result.full_name, 
          role: result.role,
          logged_in_at: new Date().toISOString(), 
          date: new Date().toISOString().slice(0, 10)
        })
      }).catch(() => {});

      await ldb();
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message || 'Login failed. Try again.' };
    }
  };

  const doLogout = useCallback(() => {
    sessionStorage.removeItem('avexi_user');
    sessionStorage.removeItem('avexi_token');
    setCurrentUser(null);
    setToken(null);
  }, []);

  const checkSession = useCallback(async () => {
    const stored = sessionStorage.getItem('avexi_user');
    if (!stored) return;

    let parsed;
    try {
      parsed = JSON.parse(stored);
    } catch (e) {
      sessionStorage.removeItem('avexi_user');
      return;
    }

    const storedToken = sessionStorage.getItem('avexi_token');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-avexi-token': storedToken || '' },
        body: JSON.stringify({ action: 'verify', userId: parsed.id })
      });
      const result = await res.json();

      if (!res.ok || !result || result.status !== 'ok') {
        throw new Error('Session verification failed');
      }
      const u = result;
      setCurrentUser({
        id: u.id,
        username: u.username,
        name: u.full_name,
        role: u.role
      });
      setToken(u.token);
      sessionStorage.setItem('avexi_user', JSON.stringify({
        id: u.id,
        username: u.username,
        name: u.full_name,
        role: u.role
      }));
      sessionStorage.setItem('avexi_token', u.token);
    } catch (e) {
      sessionStorage.removeItem('avexi_user');
      sessionStorage.removeItem('avexi_token');
      setCurrentUser(null);
      setToken(null);
      return;
    }

    await ldb();
  }, [ldb]);

  // Utility functions
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const today = () => new Date().toISOString().slice(0, 10);
  const fd = (d) => {
    if (!d) return '—';
    try {
      return new Date(d + 'T12:00:00').toLocaleDateString('en-KE', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return d;
    }
  };
  const ksh = (n) => 'KES ' + Number(n || 0).toLocaleString();
  const ageStr = (dob) => {
    if (!dob) return '—';
    const m = (new Date() - new Date(dob + 'T12:00:00')) / (1000 * 60 * 60 * 24 * 30.44);
    return m < 12 ? Math.round(m) + 'm' : Math.floor(m / 12) + 'y ' + Math.round(m % 12) + 'm';
  };
  const daysDiff = (d) => {
    if (!d) return null;
    return Math.round((new Date(d + 'T12:00:00') - new Date()) / (1000 * 60 * 60 * 24));
  };

  // Permission functions
  const isStaff = () => currentUser && currentUser.role === 'staff';
  const isAdminOrOwner = () => currentUser && (currentUser.role === 'admin' || currentUser.role === 'owner');
  const canEditMilkRecord = (record) => {
    if (isAdminOrOwner()) return true;
    if (!isStaff()) return false;
    if (!record.createdAt) return false;
    const age = Date.now() - new Date(record.createdAt).getTime();
    return age < 12 * 60 * 60 * 1000;
  };
  const milkEditTimeLeft = (record) => {
    if (!record.createdAt) return null;
    const age = Date.now() - new Date(record.createdAt).getTime();
    const left = 12 * 60 * 60 * 1000 - age;
    if (left <= 0) return null;
    const h = Math.floor(left / (1000 * 60 * 60));
    const m = Math.floor((left % (1000 * 60 * 60)) / (1000 * 60));
    return `${h}h ${m}m left to edit`;
  };
  const requireAdmin = (action) => {
    if (isAdminOrOwner()) return true;
    alert(`Access denied.\n\nOnly admin or farm owner can ${action}.\nYour role (${currentUser.role}) has view-only access except for milk records.`);
    return false;
  };

  // Navigation
  const navigate = useCallback((section) => {
    setCurrentSection(section);
  }, []);

  const value = {
    // State
    currentUser,
    token,
    db,
    setDb,
    theme,
    syncStatus,
    notifications,
    setNotifications,
    currentSection,
    
    // Actions
    toggleTheme,
    doLogin,
    doLogout,
    checkSession,
    sdb,
    ldb,
    navigate,
    
    // Utilities
    uid,
    today,
    fd,
    ksh,
    ageStr,
    daysDiff,
    
    // Permissions
    isStaff,
    isAdminOrOwner,
    canEditMilkRecord,
    milkEditTimeLeft,
    requireAdmin
  };

  // Expose for components that need direct access
  if (typeof window !== 'undefined') {
    window.__appContext = {
      setDb,
      sdb,
      db,
      notifications,
      setNotifications
    };
  }

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};