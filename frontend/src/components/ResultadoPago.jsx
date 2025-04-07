import React, { useState } from 'react';
import { useSearch, useNavigate } from '@tanstack/react-router';
import HeaderDialogo from './HeaderDialogo';
import * as Dialog from '@radix-ui/react-dialog';

const ResultadoPago = () => {
  const {
    status,
    nombre_curso,
    fecha_curso,
    nombre_participante,
    apellido_participante,
    email_facturacion,
    email_participante,
    monto,
  } = useSearch({ strict: false });
  const navigate = useNavigate();
  const isSuccess = status === 'approved';
  const statusClassName = isSuccess ? 'status-success' : 'status-failure';

  // Handler for when Radix requests an open state change (e.g., Esc, overlay click, Dialog.Close)
  const handleOpenChange = (open) => {
    // We only care about the closing action
    if (!open) {
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

  return (
    <div className="ContenedorModal">
      <Dialog.Root open={true} modal={true} onOpenChange={handleOpenChange}>
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
                    <button
                      className="BotonFormulario BotonContinuar" /* onClick={handleGoHome} */
                    >
                      ¡Listo!
                    </button>
                  </Dialog.Close>
                ) : (
                  <>
                    <Dialog.Close asChild>
                      <button className="BotonFormulario BotonContinuar">
                        Reintentar más tarde
                      </button>
                    </Dialog.Close>
                  </>
                )}
              </div>

              <div className="footer-help">
                ¿Necesitas ayuda?{' '}
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
