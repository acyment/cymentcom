import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Formik } from 'formik';
import { PostHogProvider } from 'posthog-js/react';

import FieldWithInfo from '../FieldWithInfo.jsx';
import StepParticipantes from '../StepParticipantes.jsx';

const read = (relative) =>
  fs.readFileSync(path.resolve(__dirname, relative), 'utf8');

describe('lucide icon usage (static imports)', () => {
  it('renders the static Info icon inside FieldWithInfo tooltips', () => {
    const { container } = render(
      <Formik initialValues={{ test: '' }} onSubmit={() => {}}>
        {() => (
          <FieldWithInfo
            name="test"
            type="text"
            className=""
            autoFocus={false}
            tooltip="tooltip"
          />
        )}
      </Formik>,
    );

    expect(container.querySelector('svg')).toBeTruthy();
  });

  it('uses the static ArrowRight icon in StepParticipantes primary CTA', async () => {
    const user = userEvent.setup();
    const posthog = {
      capture: vi.fn(),
      identify: vi.fn(),
      people: { set: vi.fn() },
    };

    const { container } = render(
      <PostHogProvider client={posthog as any}>
        <Formik
          initialValues={{
            nombre: '',
            apellido: '',
            email: '',
            organizacion: '',
            rol: '',
          }}
          onSubmit={vi.fn()}
        >
          {() => <StepParticipantes idCurso="demo" />}
        </Formik>
      </PostHogProvider>,
    );

    const cta = await screen.findByRole('button', { name: /continuar/i });
    expect(within(cta).queryByRole('img', { hidden: true })).toBeNull();
    expect(container.querySelector('svg')).toBeTruthy();

    await user.click(cta);
    expect(posthog.capture).toHaveBeenCalledWith('next_to_billing');
  });

  it('imports lucide icons statically without useDynamicLucideIcon', () => {
    const expectations = {
      '../FieldWithInfo.jsx': {
        icon: 'info',
        component: '<InfoIcon',
      },
      '../StepParticipantes.jsx': {
        icon: 'arrow-right',
        component: '<ArrowRightIcon',
      },
      '../CourseDetail.jsx': {
        icon: 'arrow-left',
        component: '<ArrowLeftIcon',
      },
      '../../features/checkout/CheckoutPresenter.jsx': {
        icon: 'arrow-left',
        component: '<ArrowLeftIcon',
      },
    };

    for (const [file, { icon, component }] of Object.entries(expectations)) {
      const source = read(file);
      expect(source.includes("from '@/hooks/useDynamicLucideIcon'")).toBe(
        false,
      );
      const importPattern = new RegExp(
        `from ['"]lucide-react/dist/esm/icons/${icon}\\.js['"]`,
      );
      expect(source).toMatch(importPattern);
      expect(source.includes(component)).toBe(true);
    }
  });
});
