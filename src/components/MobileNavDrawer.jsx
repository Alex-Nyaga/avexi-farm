import React from 'react';
import { useApp } from '../context/AppContext';
import { navGroups } from '../utils/navItems';

// Mobile-only slide-in menu, opened via the header's hamburger button.
// Replaces the old bottom nav bar (which crammed 11 items into a
// horizontally-scrolling strip that got clipped on small screens).
const MobileNavDrawer = ({ open, onClose }) => {
  const { currentSection, navigate, isStaff } = useApp();

  const handleNavClick = (item) => {
    if (item.restricted && isStaff()) {
      alert('Access denied');
      return;
    }
    navigate(item.id);
    onClose();
  };

  return (
    <>
      <div className={`mobile-nav-overlay ${open ? 'open' : ''}`} onClick={onClose} />
      <nav className={`mobile-nav-drawer ${open ? 'open' : ''}`} aria-hidden={!open}>
        <div className="mobile-nav-drawer-hdr">
          <img src="/avexi-app-icon.svg" alt="" width="26" height="26" />
          <span>Menu</span>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close menu">✕</button>
        </div>
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
    </>
  );
};

export default MobileNavDrawer;
