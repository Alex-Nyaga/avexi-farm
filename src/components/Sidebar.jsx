import React from 'react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { currentSection, navigate, isStaff } = useApp();

  const navItems = [
    { section: 'Overview', items: [
      { id: 'dashboard', label: 'Dashboard', color: '#2a7a3a' }
    ]},
    { section: 'Livestock', items: [
      { id: 'cows', label: 'Cows', color: 'var(--cow-m)' },
      { id: 'sheep', label: 'Sheep', color: 'var(--sheep-m)' },
      { id: 'milk', label: 'Milk Records', color: 'var(--cow-m)', opacity: 0.6 },
      { id: 'vet', label: 'Veterinary', color: '#aaa' }
    ]},
    { section: 'Crops', items: [
      { id: 'potatoes', label: 'Potatoes', color: 'var(--potato-m)' }
    ]},
    { section: 'People', items: [
      { id: 'staff', label: 'Farm Staff', color: '#888' }
    ]},
    { section: 'Finance', items: [
      { id: 'finance', label: 'Transactions', color: 'var(--finance-m)', restricted: true }
    ]},
    { section: 'Reports', items: [
      { id: 'insights', label: 'Insights', color: '#6a4aaf' },
      { id: 'reports', label: 'Reports & PDF', color: '#4a6aaf' }
    ]},
    { section: 'System', items: [
      { id: 'settings', label: 'Settings', color: '#aaa' }
    ]}
  ];

  const handleNavClick = (item) => {
    if (item.restricted && isStaff()) {
      alert("⛔ Access denied");
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