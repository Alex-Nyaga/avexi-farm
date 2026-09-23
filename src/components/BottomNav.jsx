import React from 'react';
import { useApp } from '../context/AppContext';

const BottomNav = () => {
  const { currentSection, navigate, isStaff } = useApp();
  const navItems = [
    { id: 'dashboard', label: 'Home', color: '#2a7a3a' },
    { id: 'cows', label: 'Cows', color: 'var(--cow-m)' },
    { id: 'sheep', label: 'Sheep', color: 'var(--sheep-m)' },
    { id: 'milk', label: 'Milk', color: 'var(--cow-m)' },
    { id: 'potatoes', label: 'Crops', color: 'var(--potato-m)' },
    { id: 'finance', label: 'Finance', color: 'var(--finance-m)', restricted: true },
    { id: 'staff', label: 'Staff', color: '#888' },
    { id: 'vet', label: 'Vet', color: '#888' },
    { id: 'insights', label: 'Insights', color: '#6a4aaf' },
    { id: 'reports', label: 'Reports', color: '#4a6aaf' },
    { id: 'settings', label: 'Settings', color: '#aaa' }
  ];

  return (
    <div className="bnav">
      {navItems.map((item) => (
        <button
          key={item.id}
          id={`bn-${item.id}`}
          className={`bnav-item ${currentSection === item.id ? 'active' : ''}`}
          style={{ '--active-color': item.color }}
          onClick={() => {
            if (!item.restricted || !isStaff()) navigate(item.id);
          }}
          type="button"
        >
          {item.label}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
