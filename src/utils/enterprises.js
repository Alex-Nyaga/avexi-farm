import { findCatalogueItem, findCategory } from './catalogue';

const len = (a) => (Array.isArray(a) ? a.length : 0);

// Which collections in the db hold data for each built-in enterprise.
const BUILTIN_DATA = {
  cows: ['cows', 'cowEvents', 'calves', 'milkRecords'],
  sheep: ['sheep', 'sheepEvents'],
  potatoes: ['plots', 'plotSeasons', 'cropActivities', 'sprayLog', 'boosterLog']
};

const BUILTIN_TX = {
  cows: /cow|milk|calf|calves/i,
  sheep: /sheep|wool/i,
  potatoes: /potato|crop/i
};

export const hasAnyData = (db) =>
  ['cows', 'sheep', 'plots', 'enterpriseRecords', 'transactions', 'staff'].some((k) => len(db[k]) > 0);

// Farms saved before the catalogue existed have no `enterprises` list, so we
// derive one from the data they already have instead of forcing onboarding.
export const getEnterprises = (db) => {
  if (Array.isArray(db.enterprises)) return db.enterprises;
  const derived = [];
  const add = (id) => {
    const item = findCatalogueItem(id);
    derived.push({ id, name: item.short, category: item.category, kind: item.kind, page: item.page || null, status: 'active' });
  };
  if (len(db.cows) || len(db.cowEvents) || len(db.milkRecords)) add('cows');
  if (len(db.sheep) || len(db.sheepEvents)) add('sheep');
  if (len(db.plots) || len(db.plotSeasons)) add('potatoes');
  return derived;
};

export const needsOnboarding = (db) => !Array.isArray(db.enterprises) && !hasAnyData(db);

export const makeEnterprise = (catalogueId, custom) => {
  if (custom) {
    const cat = findCategory(custom.category);
    return {
      id: 'x-' + custom.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30) + '-' + Date.now().toString(36).slice(-4),
      name: custom.name.trim(),
      category: cat.id,
      kind: cat.kind,
      page: null,
      status: 'active',
      custom: true
    };
  }
  const item = findCatalogueItem(catalogueId);
  return { id: item.id, name: item.short, category: item.category, kind: item.kind, page: item.page || null, status: 'active' };
};

export const sectionOf = (e) => e.page || `ent:${e.id}`;

export const enterpriseUsage = (db, e) => {
  let records = 0;
  let tx = 0;
  let money = 0;
  if (BUILTIN_DATA[e.id]) {
    records = BUILTIN_DATA[e.id].reduce((n, k) => n + len(db[k]), 0);
    const re = BUILTIN_TX[e.id];
    (db.transactions || []).forEach((t) => {
      if (re.test(`${t.category || ''} ${t.source || ''} ${t.desc || ''}`)) { tx += 1; money += Number(t.amount) || 0; }
    });
  } else {
    records = (db.enterpriseRecords || []).filter((r) => r.enterpriseId === e.id).length;
    (db.transactions || []).forEach((t) => {
      if (t.enterpriseId === e.id) { tx += 1; money += Number(t.amount) || 0; }
    });
  }
  return { records, tx, money };
};
