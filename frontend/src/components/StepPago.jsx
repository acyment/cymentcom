import React, { Fragment, useState, useEffect } from 'react';
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
  const { values, goToPreviousStep } = useWizard();
  const pagoEnArgentina = values.StepFacturacion.pais === 'AR';

  const [mercadoPagoPaymentID, setMercadoPagoPaymentID] = useState(null);

  const onMercadoPagoSubmit = async (param) => {
    console.log(param);
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
              },
            )
            .then((response) => {
              setMercadoPagoPaymentID(response.data.id);
              // Receive the payment result
              resolve(response.data);
            })
            .catch((error) => {
              // TODO: Instalar framework de logging?
              console.log(error);
              // Handle the error response when attempting to create the payment
              reject(error);
            });
        })
        .catch((error) => {
          console.log(error);
          // Handle the error response when attempting to create the inscription
          reject(error);
        });
    });
  };

  return (
    <div style={{ flexShrink: 0 }}>
      <p className="TituloStep">Pago</p>
      {pagoEnArgentina && (
        <div>
          {!mercadoPagoPaymentID && (
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
          if (window.posthog) {
            window.posthog.capture('back_to_billing');
          }
          goToPreviousStep();
        }}
        className="BotonFormulario"
      >
        Facturación
      </button>
    </div>
  );
};

export default StepPago;
