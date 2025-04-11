import React, { useEffect, useRef } from 'react';
import { Field, useFormikContext } from 'formik';
import { Info } from 'lucide-react';
import { Tooltip } from 'react-tooltip';

// List of keys that should NOT clear the field when pressed
const PRESERVE_VALUE_KEYS = [
  'Tab',
  'Shift',
  'Control',
  'Alt',
  'Meta', // Cmd/Windows key
  'CapsLock',
  'Escape',
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
  'Enter', // Usually submits or adds newline, let it behave normally
  // Function keys (F1-F12) - check separately if needed
];

// Helper to check for F-keys
const isFunctionKey = (key) =>
  key.length > 1 &&
  key.startsWith('F') &&
  !isNaN(parseInt(key.substring(1), 10));

const FieldWithInfo = ({
  name,
  type,
  className,
  autoFocus,
  tooltip,
  defaultValueOnFocus,
  onFocus,
  onKeyDown, // Capture original onKeyDown if passed
  ...props
}) => {
  const { touched, errors, setFieldValue, values, initialValues } =
    useFormikContext();

  const inputRef = useRef(null);

  // --- Effect to set initial value if field is empty ---
  useEffect(() => {
    const currentValue = values[name];
    const originalInitialValue = initialValues[name];

    if (
      defaultValueOnFocus !== undefined &&
      (currentValue === '' ||
        currentValue === null ||
        currentValue === undefined) &&
      (originalInitialValue === '' ||
        originalInitialValue === null ||
        originalInitialValue === undefined)
    ) {
      setFieldValue(name, defaultValueOnFocus, false);
    }
  }, [name, defaultValueOnFocus, setFieldValue, initialValues, values]);

  // --- Focus Handler - For selection ---
  const handleFocus = (event) => {
    const inputElement = event.target; // Or use inputRef.current

    setTimeout(() => {
      if (
        inputElement &&
        typeof inputElement.select === 'function' &&
        inputElement.value
      ) {
        // Only select if there's actually a value to select
        inputElement.select();
      }
    }, 0);

    if (onFocus) {
      onFocus(event);
    }
  };

  // --- KeyDown Handler - To clear default value on typing ---
  const handleKeyDown = (event) => {
    const inputElement = event.target; // Or use inputRef.current
    const currentValue = inputElement.value; // Get current value directly from input

    // Check if the current value matches the default *and* a default exists
    if (
      defaultValueOnFocus !== undefined &&
      currentValue === defaultValueOnFocus
    ) {
      // Check if the pressed key should PRESERVE the value
      if (PRESERVE_VALUE_KEYS.includes(event.key) || isFunctionKey(event.key)) {
        // If it's a navigation/modifier key, do nothing, let default behavior occur
      } else {
        // If it's any other key (likely starting to type), clear the field.
        // Setting value to '' here happens *before* the browser inserts the new character.
        setFieldValue(name, '', false);
        // No need to preventDefault, allow the key press to proceed on the now-empty field
      }
    }

    // Call the original onKeyDown handler if it was passed as a prop
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  const tooltipId = `${name}-info-tooltip`;

  return (
    <div className="input-container">
      <Field
        innerRef={inputRef}
        id={name}
        name={name}
        type={type}
        className={className}
        autoFocus={autoFocus}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown} // <-- Add the keydown handler
        {...props}
      />
      {tooltip && !(touched[name] && errors[name]) && (
        <div className="field-icon">
          {/* Tooltip JSX remains the same */}
          <a
            data-tooltip-id={tooltipId}
            data-tooltip-content={tooltip}
            href="#"
            onClick={(e) => e.preventDefault()}
            tabIndex={-1}
            style={{
              display: 'flex',
              alignItems: 'center',
              color: 'inherit',
              textDecoration: 'none',
            }}
          >
            <Info
              color="#666"
              size={20}
              tabIndex={-1}
              focusable="false"
              aria-hidden="true"
            />
          </a>
          <Tooltip
            id={tooltipId}
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
