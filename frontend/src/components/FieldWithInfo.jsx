import React from 'react';
import { Field, useFormikContext } from 'formik';
import { Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

const FieldWithInfo = ({ name, type, className, autoFocus, tooltip }) => {
  const { touched, errors } = useFormikContext();
  const fieldTouched = touched[name];
  const fieldError = errors[name];

  return (
    <div className="input-container">
      <Field
        id={name}
        name={name}
        type={type}
        className={className}
        autoFocus={autoFocus}
      />
      {!(fieldTouched && fieldError) && tooltip && (
        <div className="field-icon">
          <span
            data-tooltip-id="nombre-completo-info"
            data-tooltip-content={tooltip}
            href="#"
            onClick={(e) => e.preventDefault()}
            tabIndex={-1}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
              textDecoration: 'none',
              cursor: 'default',
            }}
          >
            <Info
              color="#666"
              size={20}
              tabIndex={-1}
              focusable="false" // This is key for SVG elements
              aria-hidden="true"
            />
          </span>
          <Tooltip
            id={`${name}-info`}
            place="top"
            effect="solid"
            style={{
              backgroundColor: '#333',
              color: '#fff',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              maxWidth: '250px',
              zIndex: 9999,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default FieldWithInfo;
