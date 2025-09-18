import React from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Cursos from './Cursos';
import Hero from './Hero';
import Intervenciones from './Intervenciones';
import AgilidadProfunda from './AgilidadProfunda';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Outlet } from '@tanstack/react-router';
import { CheckoutEntry } from '@/features/checkout/CheckoutEntry';
import CheckoutFlow from '@/features/checkout/CheckoutFlow';

const Sections = () => {
  const isMobile = useIsMobile();
  return (
    <Accordion.Root type="multiple">
      <Hero />
      <Cursos />
      {!isMobile && <Intervenciones />}
      {!isMobile && <AgilidadProfunda />}
      <Outlet />
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
