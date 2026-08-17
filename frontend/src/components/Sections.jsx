import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Cursos from './Cursos';
import Hero from './Hero';
import ComoTrabajo from './ComoTrabajo';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Outlet } from '@tanstack/react-router';
import { CheckoutEntry } from '@/features/checkout/CheckoutEntry';
import CheckoutFlow from '@/features/checkout/CheckoutFlow';

const Sections = ({
  initialSlug = null,
  renderOutlet = true,
  onCourseDetailReady = () => {},
} = {}) => {
  const isMobile = useIsMobile();
  return (
    <Accordion.Root type="multiple">
      <Hero />
      <Cursos
        initialSlug={initialSlug}
        onCourseDetailReady={onCourseDetailReady}
      />
      <ComoTrabajo />
      {renderOutlet ? <Outlet /> : null}
      {/* Desktop keeps the inline modal experience via query param */}
      {!isMobile && (
        <CheckoutEntry title="Checkout">
          <CheckoutFlow />
        </CheckoutEntry>
      )}
    </Accordion.Root>
  );
};

export default Sections;
