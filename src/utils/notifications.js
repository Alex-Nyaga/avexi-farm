import { daysDiff, nowTs } from './helpers';

export const buildNotifications = (db) => {
  const notifications = [];
  const now = new Date();

  // Collect deworming alerts grouped by due-date
  const dewOverdueByDate = {};
  const dewSoonByDate = {};
  const vaccOverdueByDate = {};
  const vaccSoonByDate = {};

  [...db.cows, ...db.sheep].forEach(a => {
    if (a.status !== 'alive') return;
    const kind = db.cows.find(x => x.id === a.id) ? 'Cow' : 'Sheep';
    
    // Deworming
    if (a.lastDeworming) {
      const next = new Date(a.lastDeworming + 'T12:00:00');
      next.setDate(next.getDate() + (a.dewormingIntervalDays || 90));
      const diff = Math.round((next - now) / (1000 * 60 * 60 * 24));
      const dateKey = next.toISOString().slice(0, 10);
      
      if (diff < 0) {
        if (!dewOverdueByDate[dateKey]) dewOverdueByDate[dateKey] = [];
        dewOverdueByDate[dateKey].push({ tag: a.tag, kind, daysAgo: Math.abs(diff) });
      } else if (diff <= 5) {
        if (!dewSoonByDate[dateKey]) dewSoonByDate[dateKey] = [];
        dewSoonByDate[dateKey].push({ tag: a.tag, kind, diff });
      }
    }
    
    // Vaccination
    if (a.nextVaccination) {
      const diff = daysDiff(a.nextVaccination);
      const dateKey = a.nextVaccination;
      
      if (diff !== null && diff < 0) {
        if (!vaccOverdueByDate[dateKey]) vaccOverdueByDate[dateKey] = [];
        vaccOverdueByDate[dateKey].push({ tag: a.tag, kind, daysAgo: Math.abs(diff) });
      } else if (diff !== null && diff <= 5) {
        if (!vaccSoonByDate[dateKey]) vaccSoonByDate[dateKey] = [];
        vaccSoonByDate[dateKey].push({ tag: a.tag, kind, diff });
      }
    }
  });

  // Emit deworming notifications
  Object.values(dewOverdueByDate).forEach(animals => {
    if (animals.length === 1) {
      const a = animals[0];
      notifications.push({
        type: 'alert',
        icon: '💊',
        title: `Deworming overdue: ${a.tag}`,
        text: `${a.kind} ${a.tag} — deworming was due ${a.daysAgo} day(s) ago!`,
        time: nowTs()
      });
    } else {
      const tags = animals.map(a => a.tag).join(', ');
      const maxDays = Math.max(...animals.map(a => a.daysAgo));
      notifications.push({
        type: 'alert',
        icon: '💊',
        title: `Deworming overdue: ${animals.length} animals`,
        text: `${animals.length} animals share the same overdue deworming date (up to ${maxDays}d overdue): ${tags}. Deworm all together.`,
        time: nowTs()
      });
    }
  });

  Object.values(dewSoonByDate).forEach(animals => {
    if (animals.length === 1) {
      const a = animals[0];
      notifications.push({
        type: 'warn',
        icon: '⚠️',
        title: `Deworming due soon: ${a.tag}`,
        text: `${a.kind} ${a.tag} — deworming due in ${a.diff} day(s). Prepare medication.`,
        time: nowTs()
      });
    } else {
      const tags = animals.map(a => a.tag).join(', ');
      const minDays = Math.min(...animals.map(a => a.diff));
      notifications.push({
        type: 'warn',
        icon: '⚠️',
        title: `Deworming due: ${animals.length} animals together`,
        text: `${animals.length} animals are all due for deworming in ${minDays} day(s): ${tags}. A great time to deworm the whole group at once!`,
        time: nowTs()
      });
    }
  });

  // Emit vaccination notifications
  Object.values(vaccOverdueByDate).forEach(animals => {
    if (animals.length === 1) {
      const a = animals[0];
      notifications.push({
        type: 'alert',
        icon: '💉',
        title: `Vaccination overdue: ${a.tag}`,
        text: `${a.kind} ${a.tag} vaccination was due ${a.daysAgo} day(s) ago!`,
        time: nowTs()
      });
    } else {
      const tags = animals.map(a => a.tag).join(', ');
      const maxDays = Math.max(...animals.map(a => a.daysAgo));
      notifications.push({
        type: 'alert',
        icon: '💉',
        title: `Vaccination overdue: ${animals.length} animals`,
        text: `${animals.length} animals share the same overdue vaccination date (up to ${maxDays}d overdue): ${tags}. Vaccinate all together.`,
        time: nowTs()
      });
    }
  });

  Object.values(vaccSoonByDate).forEach(animals => {
    if (animals.length === 1) {
      const a = animals[0];
      notifications.push({
        type: 'warn',
        icon: '💉',
        title: `Vaccination due: ${a.tag}`,
        text: `${a.kind} ${a.tag} — due in ${a.diff} day(s).`,
        time: nowTs()
      });
    } else {
      const tags = animals.map(a => a.tag).join(', ');
      const minDays = Math.min(...animals.map(a => a.diff));
      notifications.push({
        type: 'warn',
        icon: '💉',
        title: `Vaccination due: ${animals.length} animals together`,
        text: `${animals.length} animals all share the same upcoming vaccination date (in ${minDays} day(s)): ${tags}. Schedule a single vaccination session for all.`,
        time: nowTs()
      });
    }
  });

  // Potato spray schedule
  db.plotSeasons.filter(s => s.status === 'active').forEach(s => {
    const planted = new Date(s.plantedDate + 'T12:00:00');
    const weeksSince = Math.floor((now - planted) / (1000 * 60 * 60 * 24 * 7));
    
    if (weeksSince >= 9 && weeksSince <= 14) {
      const spraysDone = db.sprayLog.filter(l => l.seasonId === s.id).length;
      const spraysExpected = weeksSince - 8;
      
      if (spraysDone < spraysExpected) {
        notifications.push({
          type: 'warn',
          icon: '🌿',
          title: `Spray due: ${s.plotName || s.plotId}`,
          text: `Week ${weeksSince} of growing. ${spraysDone}/${spraysExpected} sprays done.`,
          time: nowTs()
        });
      }
    }
  });

  // Staff salary due
  db.staff.filter(s => s.status === 'active').forEach(s => {
    const lastPay = db.staffPayments.filter(p => p.staffId === s.id).sort((a, b) => b.date.localeCompare(a.date))[0];
    
    if (lastPay) {
      const days = Math.round((now - new Date(lastPay.date + 'T12:00:00')) / (1000 * 60 * 60 * 24));
      
      if (days >= 28) {
        notifications.push({
          type: 'info',
          icon: '👤',
          title: `Salary due: ${s.name}`,
          text: `Last paid ${days} days ago. Monthly salary: KES ${Number(s.monthlySalary || 0).toLocaleString()}.`,
          time: nowTs()
        });
      }
    }
  });

  return notifications;
};