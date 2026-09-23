import React from 'react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { currentSection, navigate, isStaff } = useApp();

  const navItems = [
    { section: 'Farm today', items: [
      { id: 'dashboard', label: 'Farm home', color: '#2a7a3a' }
    ]},
    { section: 'Animals', items: [
      { id: 'cows', label: 'Cows', color: 'var(--cow-m)' },
      { id: 'sheep', label: 'Sheep', color: 'var(--sheep-m)' },
      { id: 'milk', label: 'Milk', color: 'var(--cow-m)', opacity: 0.6 },
      { id: 'vet', label: 'Animal health', color: '#78877c' }
    ]},
    { section: 'Crops', items: [
      { id: 'potatoes', label: 'Potatoes and planting', color: 'var(--potato-m)' }
    ]},
    { section: 'Farm team', items: [
      { id: 'staff', label: 'Workers', color: '#78877c' }
    ]},
    { section: 'Farm money', items: [
      { id: 'finance', label: 'Income and expenses', color: 'var(--finance-m)', restricted: true }
    ]},
    { section: 'Review', items: [
      { id: 'insights', label: 'Farm insights', color: '#657ca8' },
      { id: 'reports', label: 'Reports', color: '#657ca8' }
    ]},
    { section: 'Account', items: [
      { id: 'settings', label: 'Farm settings', color: '#78877c' }
    ]}
  ];

  const handleNavClick = (item) => {
    if (item.restricted && isStaff()) {
      alert("Access denied");
      return;
    }
    navigate(item.id);
  };

  return (
    <nav className="sidenav">
      {navItems.map((group) => (
        <div key={group.section}>
          <div className="nav-section">{group.section}</div>
          {group.items.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentSection === item.id ? 'active' : ''}`}
              style={{ '--active-color': item.color }}
              onClick={() => handleNavClick(item)}
            >
              <span 
                className="nav-dot" 
                style={{ 
                  background: item.color,
                  opacity: item.opacity || 1
                }}
              ></span>
              <span className="label">{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;