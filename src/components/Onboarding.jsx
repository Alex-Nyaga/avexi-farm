import React from 'react';
import { useApp } from '../context/AppContext';
import EnterprisePicker, { usePickerState } from './EnterprisePicker';
import { getEnterprises } from '../utils/enterprises';

// Shown the first time a farmer with an empty farm signs in.
const Onboarding = () => {
  const { db, setDb, sdb, currentUser } = useApp();
  const picker = usePickerState();
  const name = currentUser?.username || currentUser?.name || '';

  const finish = () => {
    if (!picker.count) return;
    setDb({ ...db, enterprises: [...getEnterprises(db), ...picker.build()] });
    sdb();
  };

  return (
    <div className="onboard">
      <div className="onboard-card">
        <div className="eyebrow">Welcome{name ? `, ${name}` : ''}</div>
        <h1 className="onboard-title">What do you farm?</h1>
        <p className="text-muted">
          Pick a category, then tick everything you rear or grow. Each choice gets its own page in your side menu.
          You can add, archive or remove them later under <strong>My Farm</strong>.
        </p>
        <EnterprisePicker selected={picker.selected} customItems={picker.customs} onToggle={picker.toggle} onAddCustom={picker.addCustom} />
        <div className="onboard-foot">
          <span className="text-muted text-sm">{picker.count} selected</span>
          <button type="button" className="btn btn-primary" disabled={!picker.count} onClick={finish}>
            Start farming →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
