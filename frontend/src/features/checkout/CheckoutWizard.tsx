import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export type CheckoutWizardStep = {
  id: string;
  title: string;
  component: React.ComponentType<any>;
  validationSchema?: { validateSync: (values: any, opts?: any) => any };
};

export type CheckoutWizardProps = {
  initialValues: Record<string, any>;
  steps: CheckoutWizardStep[];
  onSubmit: (values: any) => void;
};

export function CheckoutWizard({
  initialValues,
  steps,
  onSubmit,
}: CheckoutWizardProps) {
  const [index, setIndex] = useState(0);
  const [values, setValues] = useState<Record<string, any>>({
    ...initialValues,
  });
  const contentRef = useRef<HTMLDivElement | null>(null);

  // Capture input changes within the step content (uncontrolled inputs)
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const handler = (ev: Event) => {
      const t = ev.target as HTMLInputElement | HTMLTextAreaElement | null;
      if (t && 'name' in t && t.name) {
        setValues((prev) => ({ ...prev, [t.name]: (t as any).value }));
      }
    };
    el.addEventListener('input', handler, true);
    return () => el.removeEventListener('input', handler, true);
  }, []);

  const current = steps[index];

  const isCurrentValid = useMemo(() => {
    if (!current?.validationSchema) return true;
    try {
      current.validationSchema.validateSync(values, { abortEarly: false });
      return true;
    } catch (_) {
      return false;
    }
  }, [current, values]);

  const goNext = useCallback(() => {
    if (!isCurrentValid) return;
    setIndex((i) => Math.min(i + 1, steps.length - 1));
  }, [isCurrentValid, steps.length]);

  const goBack = useCallback(() => {
    setIndex((i) => Math.max(i - 1, 0));
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!isCurrentValid) return;
      if (index < steps.length - 1) {
        goNext();
      } else {
        onSubmit(values);
      }
    },
    [goNext, index, isCurrentValid, onSubmit, steps.length, values],
  );

  // Focus first heading in the step for accessibility
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    // Rehydrate uncontrolled inputs with stored values when switching steps
    const fields = el.querySelectorAll(
      'input[name], textarea[name], select[name]',
    ) as NodeListOf<HTMLInputElement>;
    fields.forEach((field) => {
      const name = field.getAttribute('name') || '';
      if (name && Object.prototype.hasOwnProperty.call(values, name)) {
        const v = (values as any)[name] ?? '';
        if ((field as any).value !== v) (field as any).value = v;
      }
    });

    const h2 = el.querySelector('h2') as HTMLElement | null;
    if (h2) {
      if (!h2.hasAttribute('tabindex')) h2.setAttribute('tabindex', '-1');
      h2.focus();
    }
  }, [index, values]);

  const StepComp = current.component;

  return (
    <form onSubmit={handleSubmit} aria-label="Checkout wizard">
      <div ref={contentRef}>
        <StepComp />
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
        <button type="button" onClick={goBack} disabled={index === 0}>
          Back
        </button>
        {index < steps.length - 1 ? (
          <button type="button" onClick={goNext} disabled={!isCurrentValid}>
            Next
          </button>
        ) : (
          <button type="submit" disabled={!isCurrentValid}>
            Submit
          </button>
        )}
      </div>
    </form>
  );
}
