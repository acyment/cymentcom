import React, { useEffect, useState, useMemo } from 'react';
import { Wizard as RFWizard, useWizard } from 'react-formik-step-wizard';
import { useFormikContext } from 'formik';

// JS wrapper around react-formik-step-wizard

function FocusOnStepChange() {
  const { activeStep } = useWizard();
  const { validateForm } = useFormikContext();
  const [announcement, setAnnouncement] = useState('');

  const srOnly = useMemo(
    () => ({
      position: 'absolute',
      width: 1,
      height: 1,
      padding: 0,
      margin: -1,
      overflow: 'hidden',
      clip: 'rect(0 0 0 0)',
      whiteSpace: 'nowrap',
      border: 0,
    }),
    [],
  );

  useEffect(() => {
    // Announce step change without moving focus
    const titleEl =
      document.querySelector('.DialogContent h3.form-title') ||
      document.querySelector('h3.form-title');
    const text = (titleEl?.textContent || activeStep?.id || 'Paso actualizado')
      .toString()
      .trim();
    setAnnouncement(text);

    // Ensure validation runs so isValid reflects required fields on mount
    validateForm();
  }, [activeStep?.id, validateForm]);

  return (
    <div
      aria-live="polite"
      role="status"
      style={srOnly}
      data-testid="wizard-announcer"
    >
      {announcement}
    </div>
  );
}

function Footer() {
  const { isFirstStep, isLastStep, goToPreviousStep } = useWizard();
  const { isValid } = useFormikContext();
  return (
    <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
      <button type="button" onClick={goToPreviousStep} disabled={isFirstStep}>
        Back
      </button>
      <button type="submit" disabled={!isValid}>
        {isLastStep ? 'Submit' : 'Next'}
      </button>
    </div>
  );
}

export function CheckoutWizard({ steps, onSubmit }) {
  const rfSteps = steps.map((s) => ({
    id: s.id,
    component: <s.component />,
    validationSchema: s.validationSchema,
    disableNextOnErrors: true,
  }));

  return (
    <RFWizard
      steps={rfSteps}
      onCompleted={onSubmit}
      header={<FocusOnStepChange />}
      footer={<Footer />}
    />
  );
}
