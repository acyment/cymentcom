import React from 'react';
import * as Yup from 'yup';
import { Field } from 'formik';
import { CheckoutWizard } from './CheckoutWizard';

export function CheckoutFlow() {
  const steps = [
    {
      id: 'info',
      title: 'Info',
      component: () => (
        <div>
          <h2>Step 1: Info</h2>
          <label htmlFor="name">Name</label>
          <Field id="name" name="name" />
        </div>
      ),
      validationSchema: Yup.object({ name: Yup.string().required('Required') }),
    },
    {
      id: 'contact',
      title: 'Contact',
      component: () => (
        <div>
          <h2>Step 2: Contact</h2>
          <label htmlFor="email">Email</label>
          <Field id="email" name="email" />
        </div>
      ),
      validationSchema: Yup.object({
        email: Yup.string().email('Invalid').required('Required'),
      }),
    },
  ];

  return <CheckoutWizard steps={steps} onSubmit={() => {}} />;
}

export default CheckoutFlow;
