import { useIsMobile } from '@/hooks/useIsMobile';
import { BP_MD } from '@/styles/breakpoints';
import { useLocation, useNavigate } from '@tanstack/react-router';

export function useOpenCheckout() {
  const isMobile = useIsMobile(`(max-width: ${BP_MD}px)`);
  const navigate = useNavigate();
  const location = useLocation();

  return function openCheckout(params: {
    idCurso: number | string;
    nombreCorto?: string;
    costoUSD?: number | string;
    costoARS?: number | string;
  }) {
    const search = {
      idCurso: params.idCurso,
      nombreCorto: params.nombreCorto,
      costoUSD: params.costoUSD,
      costoARS: params.costoARS,
    } as any;

    if (isMobile) {
      navigate({ to: '/checkout', search, replace: false });
    } else {
      navigate({
        to: '/',
        search: { ...search, checkout: 1 },
        replace: location.pathname === '/',
      });
    }
  };
}
