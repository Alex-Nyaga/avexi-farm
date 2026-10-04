import React, { useState } from 'react';
import { CATEGORIES } from '../utils/catalogue';
import { makeEnterprise } from '../utils/enterprises';

// Holds the picker selection and turns it into enterprise records.
export const usePickerState = () => {
  const [selected, setSelected] = useState([]);
  const [customs, setCustoms] = useState([]);
  const toggle = (id) => {
    if (id.startsWith('custom:')) {
      const [, category, ...rest] = id.split(':');
      const name = rest.join(':');
      setCustoms((cs) => cs.filter((c) => !(c.category === category && c.name === name)));
      return;
    }
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  };
  const addCustom = (c) => setCustoms((cs) => (cs.some((x) => x.name.toLowerCase() === c.name.toLowerCase()) ? cs : [...cs, c]));
  const build = () => [...selected.map((id) => makeEnterprise(id)), ...customs.map((c) => makeEnterprise(null, c))];
  const reset = () => { setSelected([]); setCustoms([]); };
  return { selected, customs, toggle, addCustom, build, reset, count: selected.length + customs.length };
};

// Two-step picker: choose a category, then tick the sub-categories you farm.
// `taken` ids are already registered and shown as disabled.
const EnterprisePicker = ({ selected, onToggle, taken = [], customItems = [], onAddCustom }) => {
  const [openCat, setOpenCat] = useState(CATEGORIES[0].id);
  const [customName, setCustomName] = useState('');
  const category = CATEGORIES.find((c) => c.id === openCat);
  const countIn = (c) => c.items.filter((i) => selected.includes(i.id) || taken.includes(i.id)).length;

  const addCustom = () => {
    const name = customName.trim();
    if (!name) return;
    onAddCustom({ name, category: openCat });
    setCustomName('');
  };

  return (
    <div className="picker">
      <div className="picker-cats" role="tablist">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={openCat === c.id}
            className={`picker-cat ${openCat === c.id ? 'active' : ''}`}
            onClick={() => setOpenCat(c.id)}
          >
            {c.name}
            {countIn(c) > 0 && <span className="picker-count">{countIn(c)}</span>}
          </button>
        ))}
      </div>
      <div className="picker-items">
        {category.items.map((i) => {
          const isTaken = taken.includes(i.id);
          const on = selected.includes(i.id) || isTaken;
          return (
            <button
              key={i.id}
              type="button"
              disabled={isTaken}
              className={`picker-item ${on ? 'on' : ''}`}
              onClick={() => onToggle(i.id)}
            >
              <span className="picker-check">{on ? '✓' : ''}</span>
              {i.name}
              {isTaken && <small> · added</small>}
            </button>
          );
        })}
        {customItems.filter((c) => c.category === openCat).map((c) => (
          <button key={c.name} type="button" className="picker-item on" onClick={() => onToggle(`custom:${c.category}:${c.name}`)}>
            <span className="picker-check">✓</span>{c.name}
          </button>
        ))}
      </div>
      <div className="picker-other">
        <input
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustom(); } }}
          placeholder={`Not listed? Add your own under ${category.name}`}
          maxLength={40}
        />
        <button type="button" className="btn btn-outline btn-sm" onClick={addCustom}>Add other</button>
      </div>
    </div>
  );
};

export default EnterprisePicker;
