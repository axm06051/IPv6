import React from 'react';

function Card({ title, children, className = '' }) {
  return (
    <div className={`card shadow-sm ${className}`}>
      <div className="card-header bg-primary text-white">
        <h5 className="card-title mb-0">{title}</h5>
      </div>
      <div className="card-body">{children}</div>
    </div>
  );
}

export default Card;