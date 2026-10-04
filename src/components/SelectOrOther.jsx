import React, { useState, useEffect } from 'react';

const OTHER_VALUE = '__other__';

// A categorical <select> that always offers "Other (specify)" so users are
// never blocked by a fixed list — picking it reveals a free-text input.
const SelectOrOther = ({
  label,
  required = false,
  name,
  value,
  onChange,
  options,
  otherPlaceholder = 'Please specify',
  full = false
}) => {
  const knownValues = options.map((o) => (typeof o === 'string' ? o : o.value));
  const [showOther, setShowOther] = useState(Boolean(value) && !knownValues.includes(value));

  useEffect(() => {
    setShowOther(Boolean(value) && !knownValues.includes(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const handleSelect = (e) => {
    const v = e.target.value;
    if (v === OTHER_VALUE) {
      setShowOther(true);
      onChange({ target: { name, value: '' } });
    } else {
      setShowOther(false);
      onChange({ target: { name, value: v } });
    }
  };

  return (
    <div className={`fg${full ? ' fg-full' : ''}`}>
      {label && <label>{label}{required ? ' *' : ''}</label>}
      <select name={name} value={showOther ? OTHER_VALUE : (value || '')} onChange={handleSelect} required={required && !showOther}>
        <option value="">Select...</option>
        {options.map((o) => {
          const val = typeof o === 'string' ? o : o.value;
          const text = typeof o === 'string' ? o : o.label;
          return <option key={val} value={val}>{text}</option>;
        })}
        <option value={OTHER_VALUE}>Other (specify)…</option>
      </select>
      {showOther && (
        <input
          style={{ marginTop: '.4rem' }}
          name={name}
          value={value || ''}
          onChange={onChange}
          placeholder={otherPlaceholder}
          required={required}
        />
      )}
    </div>
  );
};

export default SelectOrOther;
