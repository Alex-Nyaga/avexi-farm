import React from 'react';
import { useApp } from '../context/AppContext';
import { navGroups } from '../utils/navItems';

const Sidebar = () => {
  const { currentSection, navigate, isStaff } = useApp();

  const handleNavClick = (item) => {
    if (item.restricted && isStaff()) {
      alert("Access denied");
      return;
    }
    navigate(item.id);
  };

  return (
    <nav className="sidenav">
      {navGroups.map((group) => (
        <div key={group.section}>
          <div className="nav-section">{group.section}</div>
          {group.items.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${currentSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <span className="label">{item.label}</span>
            </div>
          ))}
        </div>
      ))}
    </nav>
  );
};

export default Sidebar;