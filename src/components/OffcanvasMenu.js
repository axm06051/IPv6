import React, { useRef } from 'react';

function MenuItem({ icon: Icon, label, onClick }) {
  return (
    <button
      className="list-group-item list-group-item-action"
      onClick={onClick}
    >
      <Icon className="me-2" />
      {label}
    </button>
  );
}

function OffcanvasMenu({ show, onClose, menuItems }) {
  const offcanvasRef = useRef(null);

  return (
    <div
      ref={offcanvasRef}
      className={`offcanvas offcanvas-end ${show ? 'show' : ''}`}
      tabIndex="-1"
      style={{ visibility: show ? 'visible' : 'hidden' }}
      data-bs-backdrop="true"
    >
      <div className="offcanvas-header">
        <h5 className="offcanvas-title">Menu</h5>
        <button type="button" className="btn-close" onClick={onClose}></button>
      </div>
      <div className="offcanvas-body p-0">
        <div className="list-group list-group-flush">
          {menuItems.map((item, idx) => (
            <MenuItem
              key={idx}
              icon={item.icon}
              label={item.label}
              onClick={item.onClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default OffcanvasMenu;