// Shared navigation structure for the sidebar (desktop) and the mobile
// drawer menu, so both stay in sync and use consistent, professional labels
// instead of playful ones (e.g. "Dashboard" instead of "Farm home").
export const navGroups = [
  { section: 'Overview', items: [
    { id: 'dashboard', label: 'Dashboard' }
  ]},
  { section: 'Livestock', items: [
    { id: 'cows', label: 'Cows' },
    { id: 'sheep', label: 'Sheep' },
    { id: 'milk', label: 'Milk Records' },
    { id: 'vet', label: 'Health Records' }
  ]},
  { section: 'Crops', items: [
    { id: 'potatoes', label: 'Potatoes' }
  ]},
  { section: 'Team', items: [
    { id: 'staff', label: 'Staff' }
  ]},
  { section: 'Finance', items: [
    { id: 'finance', label: 'Income & Expenses', restricted: true }
  ]},
  { section: 'Analytics', items: [
    { id: 'insights', label: 'Insights' },
    { id: 'reports', label: 'Reports' }
  ]},
  { section: 'Account', items: [
    { id: 'settings', label: 'Settings' }
  ]}
];

export const flatNavItems = navGroups.flatMap((g) => g.items);
