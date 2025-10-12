import React, { Suspense, lazy } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import Cursos from './Cursos';
import Hero from './Hero';
import { useIsMobile } from '@/hooks/useIsMobile';
import { Outlet } from '@tanstack/react-router';
import { CheckoutEntry } from '@/features/checkout/CheckoutEntry';
import CheckoutFlow from '@/features/checkout/CheckoutFlow';
import { loadIntervenciones } from './loadIntervenciones';
import { loadAgilidadProfunda } from './loadAgilidadProfunda';

const LazyIntervenciones = lazy(() => loadIntervenciones());
const LazyAgilidadProfunda = lazy(() => loadAgilidadProfunda());

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
      {!isMobile && (
        <Suspense fallback={<div data-testid="intervenciones-loading" />}>
          <LazyIntervenciones />
        </Suspense>
      )}
      {!isMobile && (
        <Suspense fallback={<div data-testid="agilidad-loading" />}>
          <LazyAgilidadProfunda />
        </Suspense>
      )}
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
