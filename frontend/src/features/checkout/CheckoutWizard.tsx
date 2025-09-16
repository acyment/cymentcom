import React, { useEffect } from 'react';
import { Wizard as RFWizard, useWizard } from 'react-formik-step-wizard';
import { useFormikContext } from 'formik';

export type CheckoutWizardStep = {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  validationSchema?: any;
};

export type CheckoutWizardProps = {
  initialValues?: Record<string, any>;
  steps: CheckoutWizardStep[];
  onSubmit: (values: any) => void;
};

function FocusOnStepChange() {
  const { activeStep } = useWizard();
  const { validateForm } = useFormikContext<any>();
  useEffect(() => {
    // Focus heading for a11y
    const h2 = document.querySelector('h2') as HTMLElement | null;
    if (h2) {
      if (!h2.hasAttribute('tabindex')) h2.setAttribute('tabindex', '-1');
      h2.focus();
    }
    // Ensure validation runs so isValid reflects required fields on mount
    validateForm();
  }, [activeStep?.id, validateForm]);
  return null;
}

function Footer() {
  const { isFirstStep, isLastStep, goToPreviousStep } = useWizard();
  const { isValid } = useFormikContext<any>();
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

export function CheckoutWizard({ steps, onSubmit }: CheckoutWizardProps) {
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
