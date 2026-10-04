import React from 'react';
import SelectOrOther from './SelectOrOther';
import { schemaForActivity } from '../utils/activitySchemas';

const renderField = (field, value, change) => field.type === 'select' ? (
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
);

const ActivityDetails = ({ kind, activity, category, value = {}, onChange }) => {
  const fields = schemaForActivity(kind, activity, category);
  if (!fields.length) return null;

  const change = (name, inputValue) => {
    onChange({ target: { name: `details.${name}`, value: inputValue } });
    if (primary?.name === name) {
      fields.filter((field) => field.name !== name).forEach((field) => {
        onChange({ target: { name: `details.${field.name}`, value: '' } });
      });
    }
  };
  const primary = fields.find((field) => field.progressive);
  const visibleFields = fields.filter((field) => {
    if (primary && field.name === primary.name) return true;
    if (field.when && Object.entries(field.when).some(([key, expected]) => value[key] !== expected)) return false;
    if (primary && !value[primary.name]) return false;
    return true;
  });

  return (
    <div className={primary ? 'activity-details activity-details--step' : 'activity-details'}>
      {primary && <div className="activity-step-label">Step 1 · Choose the method</div>}
      {visibleFields.filter((field) => !primary || field.name === primary.name).map((field) => renderField(field, value, change))}
      {primary && value[primary.name] && <div className="activity-step-label activity-step-label--next">Step 2 · Details for {value[primary.name].toLowerCase()} <span>(optional)</span></div>}
      {visibleFields.filter((field) => !primary || field.name !== primary.name).map((field) => renderField(field, value, change))}
      {kind === 'animal' && activity === 'Vaccination' && (
        <div className="fg fg-full">
          <small className="card-sub">Use the schedule advised by your local veterinarian and the vaccine label; timing varies by species, age, location and disease risk.</small>
        </div>
      )}
    </div>
  );
};

export default ActivityDetails;
