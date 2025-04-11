// FormGroup.jsx
import React from 'react';

// Default visible to true if not provided
const FormGroup = ({ title, children, className = '', visible = true }) => {
  return (
    <div className={`form-group ${className}`}>
      {' '}
      {/* Outer div - no style needed here */}
      {/* Label is always visible */}
      <label className="form-group-title">{title}</label>
      {/* Content wrapper - apply conditional visibility here */}
      <div
        className="form-group-content"
        style={{ visibility: visible ? 'visible' : 'hidden' }}
      >
        {children}
      </div>
    </div>
  );
};

export default FormGroup;
