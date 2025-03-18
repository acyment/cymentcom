import React, { useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import axios from 'axios';
import {
  CardPayment,
  StatusScreen,
  initMercadoPago,
} from '@mercadopago/sdk-react';
import { useWizard } from 'react-formik-step-wizard';

const mercadopago = initMercadoPago(process.env.MP_PUBLIC_KEY, {
  locale: 'es-AR',
});

const inicializacionMercadoPago = {
  amount: 100,
};

const customizacionMercadoPago = {
  visual: {
    hideFormTitle: true,
  },
  paymentMethods: {
    maxInstallments: 3,
  },
};

const StepPago = ({ idCurso }) => {
  const posthog = usePostHog();
  const { values, goToPreviousStep } = useWizard();
  const pagoEnArgentina = values.StepFacturacion.pais === 'AR';
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mercadoPagoPaymentID, setMercadoPagoPaymentID] = useState(null);

  const onMercadoPagoSubmit = async (param) => {
    setIsLoading(true);
    setErrorMessage(null);
    return new Promise((resolve, reject) => {
      axios
        .post('/api/cursos/' + idCurso + '/inscripciones/', {
          procesador_pago: 'MP',
          nombre: values.StepParticipantes.nombre,
          apellido: values.StepParticipantes.apellido,
          email: values.StepParticipantes.email,
          organizacion: values.StepParticipantes.organizacion,
          rol: values.StepParticipantes.rol,
          pais: values.StepFacturacion.pais,
          nombreCompleto: values.StepFacturacion.nombreCompleto,
          identificacionFiscal: values.StepFacturacion.identificacionFiscal,
          direccion: values.StepFacturacion.direccion,
          telefono: values.StepFacturacion.telefono,
        })
        .then((response) => {
          const idFactura = response.data.id_factura;
          axios
            .post(
              '/api/process-mp-payment/',
              {
                id_factura: idFactura,
                transaction_amount: param.transaction_amount,
                payment_method_id: param.payment_method_id,
                installments: param.installments,
                issuer_id: param.issuer_id,
                token: param.token,
                payer: {
                  email: param.payer.email,
                  identification: {
                    type: param.payer.identification.type,
                    number: param.payer.identification.number,
                  },
                },
              },
              {
                headers: {
                  'Content-Type': 'application/json',
                },
              }
            )
            .then((response) => {
              setMercadoPagoPaymentID(response.data.id);
              setIsLoading(false);
              // Receive the payment result
              resolve(response.data);
            })
            .catch((error) => {
              setIsLoading(false);
              // Extract error message from response
              const errorMsg =
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Error al procesar el pago. Por favor, intente nuevamente.';
              setErrorMessage(errorMsg);
              console.error('Error processing payment:', error);
              // Handle the error response when attempting to create the payment
              reject(error);
            });
        })
        .catch((error) => {
          setIsLoading(false);
          // Extract error message from response
          console.log('Error response data:', error.response?.data);
          const errorMsg =
            error.response?.data?.error ||
            error.response?.data?.message ||
            error.response?.data ||
            'Error al crear la inscripción. Por favor, intente nuevamente.';
          setErrorMessage(errorMsg);
          console.error('Error processing payment:', error);
          reject(error);
        });
    });
  };

  const retryPayment = () => {
    setErrorMessage(null);
    // Reset any necessary state to allow the user to try again
  };

  return (
    <div style={{ flexShrink: 0 }}>
      <p className="TituloStep">Pago</p>
      {errorMessage && (
        <div
          className="ErrorMessage"
          style={{
            backgroundColor: '#FFF1F0',
            color: '#CF1322',
            padding: '12px 16px',
            borderRadius: '4px',
            marginBottom: '16px',
            border: '1px solid #FFA39E',
          }}
        >
          <p>
            <strong>Error:</strong> {errorMessage}
          </p>
          <button
            onClick={retryPayment}
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #CF1322',
              color: '#CF1322',
              padding: '4px 12px',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '8px',
            }}
          >
            Intentar nuevamente
          </button>
        </div>
      )}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <p>Procesando su pago...</p>
          {/* You could add a spinner here */}
        </div>
      )}
      {pagoEnArgentina && !isLoading && (
        <div>
          {!mercadoPagoPaymentID && !errorMessage && (
            <CardPayment
              onSubmit={onMercadoPagoSubmit}
              initialization={inicializacionMercadoPago}
              customization={customizacionMercadoPago}
            />
          )}
          {mercadoPagoPaymentID && (
            <StatusScreen
              initialization={{ paymentId: mercadoPagoPaymentID }}
            />
          )}
        </div>
      )}
      <button
        type="button"
        onClick={() => {
          posthog?.capture('back_to_billing');
          goToPreviousStep();
        }}
        className="BotonFormulario"
        disabled={isLoading}
      >
        Facturación
      </button>
    </div>
  );
};

export default StepPago;
