import { getEnterprises, sectionOf } from './enterprises';

// Navigation is built from the enterprises the farmer has activated, so
// archived or removed enterprises never clutter the side pane.
export const buildNavGroups = (db) => {
  const active = getEnterprises(db).filter((e) => e.status === 'active');
  const animals = active.filter((e) => e.kind === 'animal');
  const crops = active.filter((e) => e.kind === 'crop');
  const has = (id) => active.some((e) => e.id === id);

  const livestockItems = animals.map((e) => ({ id: sectionOf(e), label: e.name }));
  if (has('cows')) livestockItems.push({ id: 'milk', label: 'Milk Records' });
  if (has('cows') || has('sheep')) livestockItems.push({ id: 'vet', label: 'Health Records' });

  const groups = [{ section: 'Overview', items: [{ id: 'dashboard', label: 'Dashboard' }] }];
  if (livestockItems.length) groups.push({ section: 'Livestock', items: livestockItems });
  if (crops.length) groups.push({ section: 'Crops', items: crops.map((e) => ({ id: sectionOf(e), label: e.name })) });
  groups.push(
    { section: 'Team', items: [{ id: 'staff', label: 'Staff' }] },
    { section: 'Finance', items: [{ id: 'finance', label: 'Income & Expenses', restricted: true }] },
    { section: 'Analytics', items: [{ id: 'insights', label: 'Insights' }, { id: 'reports', label: 'Reports' }] },
    { section: 'Account', items: [{ id: 'enterprises', label: 'My Farm', restricted: true }, { id: 'settings', label: 'Settings' }] }
  );
  return groups;
};
