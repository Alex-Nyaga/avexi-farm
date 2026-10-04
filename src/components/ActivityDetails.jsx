import React from 'react';
import SelectOrOther from './SelectOrOther';
import { schemaForActivity } from '../utils/activitySchemas';

const ActivityDetails = ({ kind, activity, category, value = {}, onChange }) => {
  const fields = schemaForActivity(kind, activity, category);
  if (!fields.length) return null;

  const change = (name, inputValue) => onChange({ target: { name: `details.${name}`, value: inputValue } });

  return (
    <>
      {fields.map((field) => field.type === 'select' ? (
        <SelectOrOther
          key={field.name}
          label={field.label}
          name={`details.${field.name}`}
          required={field.required}
          value={value[field.name] || ''}
          onChange={(event) => change(field.name, event.target.value)}
          options={field.options.filter((option) => option !== 'Other' && option !== 'other')}
          otherPlaceholder={field.placeholder || `Specify ${field.label.toLowerCase()}`}
        />
      ) : (
        <div className="fg" key={field.name}>
          <label>{field.label}{field.required ? ' *' : ''}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
            <input
              type={field.type}
              name={`details.${field.name}`}
              value={value[field.name] || ''}
              onChange={(event) => change(field.name, event.target.value)}
              placeholder={field.placeholder || ''}
              min={field.min}
              step={field.step}
              required={field.required}
              style={{ minWidth: 0 }}
            />
            {field.suffix && <span className="text-sm">{field.suffix}</span>}
          </div>
        </div>
      ))}
      {kind === 'animal' && activity === 'Vaccination' && (
        <div className="fg fg-full">
          <small className="card-sub">Use the schedule advised by your local veterinarian and the vaccine label; timing varies by species, age, location and disease risk.</small>
        </div>
      )}
    </>
  );
};

export default ActivityDetails;
