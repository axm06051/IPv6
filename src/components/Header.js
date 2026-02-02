import React from 'react';
import { BsCalculator, BsList } from 'react-icons/bs';

function Header({ onOpenMenu }) {
  return (
    <header className="navbar navbar-dark bg-dark shadow-sm mb-4">
      <div className="container-fluid">
        <span className="navbar-brand mb-0 h1">
          <BsCalculator className="me-2" />
          IPv6 Practice Exercises
        </span>
        <small className="text-white-50 d-none d-md-inline">
          IPv6 addressing and prefix calculations
        </small>
        <button className="btn btn-outline-light btn-sm" onClick={onOpenMenu}>
          <BsList size={24} /> Menu
        </button>
      </div>
    </header>
  );
}

export default Header;