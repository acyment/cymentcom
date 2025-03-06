import React from 'react';
import { ErrorMessage } from 'formik';

const CustomErrorMessage = ({ name }) => {
  return (
    <ErrorMessage name={name}>
      {(msg) => (
        <div className="error-indicator">
          <svg
            className="error-icon"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="8" cy="8" r="7.5" stroke="#ff6b6b" />
            <path d="M8 4V9" stroke="#ff6b6b" strokeLinecap="round" />
            <circle cx="8" cy="12" r="1" fill="#ff6b6b" />
          </svg>
          <span className="error-text">{msg}</span>
        </div>
      )}
    </ErrorMessage>
  );
};

export default CustomErrorMessage;
