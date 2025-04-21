import React, { useEffect } from 'react'; // Removed useState as it wasn't used
import { useSearch, useNavigate } from '@tanstack/react-router';
import HeaderDialogo from './HeaderDialogo';
import * as Dialog from '@radix-ui/react-dialog';

const ResultadoPago = () => {
  console.log('ResultadoPago component mounting...');
  console.log('Initial window.location.href:', window.location.href);

  // --- HOOKS FIRST ---
  const navigate = useNavigate(); // Declare navigate early
  const searchParams = useSearch({ strict: false });
  console.log('Params from useSearch on mount:', searchParams);

  // --- EXTRACT PARAMS NEXT ---
  const {
    status, // Now 'status' is declared
    nombre_curso,
    fecha_curso,
    nombre_participante,
    apellido_participante,
    email_facturacion,
    email_participante,
    monto,
  } = searchParams;

  // --- DERIVED VALUES ---
  const isSuccess = status === 'approved'; // Now this line works
  const statusClassName = isSuccess ? 'status-success' : 'status-failure';

  // --- EFFECT HOOKS ---
  useEffect(() => {
    console.log('ResultadoPago useEffect triggered.');
    const currentSearchParams = new URLSearchParams(window.location.search);
    console.log(
      'Params from URLSearchParams in useEffect:',
      Object.fromEntries(currentSearchParams.entries()),
    );
    // You could potentially force a state update here if needed, but try to avoid it
  }, []); // Empty dependency array means it runs once after mount

  // --- EVENT HANDLERS ---
  // Handler for when Radix requests an open state change (e.g., Esc, overlay click, Dialog.Close)
  const handleOpenChange = (open) => {
    // We only care about the closing action
    if (!open) {
      console.log('Dialog closing, navigating to /');
      try {
        navigate({
          to: '/',
          search: {}, // Clear search params
          replace: true, // Replace history entry
        });
      } catch (navError) {
        console.error('Error during immediate navigation:', navError);
      }
    }
  };

  // --- RENDER LOGIC ---
  console.log(
    'Rendering with status:',
    status,
    'Is Success:',
    isSuccess, // Use the derived variable
  );

  return (
    <div className="ContenedorModal">
      {/* Keep open={true} only if this component should ALWAYS show the dialog */}
      {/* If it's conditionally rendered, manage open state elsewhere */}
      <Dialog.Root
        defaultOpen={true}
        modal={true}
        onOpenChange={handleOpenChange}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="DialogOverlay" />
          <Dialog.Content className="DialogContent">
            <HeaderDialogo stepNumber={4} />
            <div className="form-container">
              <div className={`status-header ${statusClassName}`}>
                <img
                  src={`static/images/${isSuccess ? 'ok.svg' : 'error.svg'}`}
                  alt="Status"
                  className="status-icon"
                />
                <Dialog.Title asChild>
                  <h1 className="status-title">
                    {isSuccess ? '¡Pago Exitoso!' : 'Error en el Pago'}
                  </h1>
                </Dialog.Title>
                <Dialog.Description asChild>
                  <p className="status-subtitle">
                    {isSuccess
                      ? `¡Felicitaciones, ${nombre_participante}! Tu inscripción ha sido confirmada.`
                      : `Lo sentimos, ${nombre_participante}. No pudimos procesar tu pago.`}
                  </p>
                </Dialog.Description>
              </div>

              <div className="details-box">
                <h2 className="details-title">
                  {isSuccess
                    ? 'Resumen de la transacción'
                    : 'Detalles del intento'}
                </h2>
                <div className="details-content">
                  <p>
                    <strong>Curso:</strong> {nombre_curso} ({fecha_curso})
                  </p>
                  <p>
                    <strong>
                      {isSuccess ? 'Monto Pagado:' : 'Monto Intentado:'}
                    </strong>{' '}
                    {monto}
                  </p>
                  {isSuccess && email_facturacion && (
                    <p>
                      <strong>Factura:</strong> Se enviará a {email_facturacion}{' '}
                      en breve.
                    </p>
                  )}
                  {/* Log status directly if needed for debugging */}
                  {/* <p><strong>Status Raw:</strong> {status}</p> */}
                </div>
              </div>

              {isSuccess ? (
                <div className="next-steps">
                  <h2 className="next-steps-title">Próximos pasos:</h2>
                  <ul className="next-steps-list">
                    <li>
                      Recibirás un correo electrónico de bienvenida en breve con
                      los detalles de acceso.
                    </li>
                    <li>
                      Asegúrate de revisar tu bandeja de entrada (y la carpeta
                      de spam).
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="action-guidance">
                  <h2 className="action-guidance-title">¿Qué puedes hacer?</h2>
                  <ul className="action-guidance-list">
                    <li>
                      Verifica los datos de tu método de pago e inténtalo de
                      nuevo.
                    </li>
                    <li>Considera usar un método de pago diferente.</li>
                    <li>
                      Contacta a tu banco si crees que pueden estar bloqueando
                      la transacción.
                    </li>
                  </ul>
                </div>
              )}

              <div className="button-container">
                {isSuccess ? (
                  <Dialog.Close asChild>
                    {/* The Dialog.Close will trigger handleOpenChange */}
                    <button className="BotonFormulario BotonContinuar">
                      ¡Listo!
                    </button>
                  </Dialog.Close>
                ) : (
                  <>
                    <Dialog.Close asChild>
                      {/* The Dialog.Close will trigger handleOpenChange */}
                      <button className="BotonFormulario BotonContinuar">
                        Reintentar más tarde
                      </button>
                    </Dialog.Close>
                  </>
                )}
              </div>

              <div className="footer-help">
                ¿Necesitas ayuda?{' '}
                {/* Using Dialog.Close here will also navigate home immediately */}
                <Dialog.Close asChild>
                  <a href="#contacto" className="help-link">
                    Contactanos
                  </a>
                </Dialog.Close>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
};

export default ResultadoPago;
