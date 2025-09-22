import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as Yup from 'yup';
import { Field } from 'formik';
import { CheckoutWizard } from '@/features/checkout/CheckoutWizard';

function StepOne() {
  return (
    <div>
      <h2>Step 1: Info</h2>
      <label htmlFor="name">Name</label>
      <Field id="name" name="name" />
    </div>
  );
}

function StepTwo() {
  return (
    <div>
      <h2>Step 2: Contact</h2>
      <label htmlFor="email">Email</label>
      <Field id="email" name="email" />
    </div>
  );
}

const steps = [
  {
    id: 'info',
    title: 'Info',
    component: StepOne,
    validationSchema: Yup.object({
      name: Yup.string().required('Required'),
    }),
  },
  {
    id: 'contact',
    title: 'Contact',
    component: StepTwo,
    validationSchema: Yup.object({
      email: Yup.string().email('Invalid').required('Required'),
    }),
  },
];

describe('CheckoutWizard', () => {
  it('disables Next until current step is valid and advances when valid', async () => {
    const user = userEvent.setup();
    render(
      <CheckoutWizard
        initialValues={{ name: '', email: '' }}
        steps={steps}
        onSubmit={vi.fn()}
      />,
    );

    // Step 1 visible
    expect(
      screen.getByRole('heading', { name: /step 1: info/i }),
    ).toBeInTheDocument();

    // Next disabled until valid
    const nextBtn = await screen.findByRole('button', { name: /next/i });
    await waitFor(() => expect(nextBtn).toBeDisabled());

    // Fill valid value
    await user.type(screen.getByLabelText(/name/i), 'Ada');

    // Next enabled and moves to Step 2
    expect(nextBtn).toBeEnabled();
    await user.click(nextBtn);

    expect(
      screen.getByRole('heading', { name: /step 2: contact/i }),
    ).toBeInTheDocument();
  });

  it('Back returns to previous step with preserved values', async () => {
    const user = userEvent.setup();
    render(
      <CheckoutWizard
        initialValues={{ name: '', email: '' }}
        steps={steps}
        onSubmit={vi.fn()}
      />,
    );

    // Complete step 1 and go to step 2
    await user.type(screen.getByLabelText(/name/i), 'Ada');
    await user.click(screen.getByRole('button', { name: /next/i }));
    expect(
      screen.getByRole('heading', { name: /step 2: contact/i }),
    ).toBeInTheDocument();

    // Back to step 1
    await user.click(screen.getByRole('button', { name: /back/i }));
    expect(
      screen.getByRole('heading', { name: /step 1: info/i }),
    ).toBeInTheDocument();

    // Value preserved
    expect(screen.getByLabelText(/name/i)).toHaveValue('Ada');
  });

  it('calls onSubmit with merged values when final step is valid', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CheckoutWizard
        initialValues={{ name: '', email: '' }}
        steps={steps}
        onSubmit={onSubmit}
      />,
    );

    // Step 1
    await user.type(screen.getByLabelText(/name/i), 'Ada');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Step 2 requires valid email
    const submitBtn = await screen.findByRole('button', { name: /submit/i });
    await waitFor(() => expect(submitBtn).toBeDisabled());

    await user.type(screen.getByLabelText(/email/i), 'ada@example.com');

    expect(submitBtn).toBeEnabled();
    await user.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Ada',
      email: 'ada@example.com',
    });
  });

  it('announces step change via aria-live without moving focus to heading', async () => {
    const user = userEvent.setup();
    render(
      <CheckoutWizard
        initialValues={{ name: '', email: '' }}
        steps={steps}
        onSubmit={vi.fn()}
      />,
    );

    await user.type(screen.getByLabelText(/name/i), 'Ada');
    await user.click(screen.getByRole('button', { name: /next/i }));

    // Heading is present
    expect(
      screen.getByRole('heading', { name: /step 2: contact/i }),
    ).toBeInTheDocument();

    // We now announce step changes via aria-live instead of shifting focus
    const announcer = screen.getByTestId('wizard-announcer');
    // Our announcer uses the closest form title or the step id; here it's the id
    expect(announcer).toHaveTextContent(/contact/i);
  });
});
