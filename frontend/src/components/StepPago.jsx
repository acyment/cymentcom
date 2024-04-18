import React, { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import {
  CardPayment,
  StatusScreen,
  initMercadoPago,
} from '@mercadopago/sdk-react';
import { loadStripe } from '@stripe/stripe-js';
import { useWizard } from 'react-formik-step-wizard';
import {
  PaymentElement,
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';

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

const stripePromise = loadStripe(process.env.STRIPE_PUBLIC_KEY);

const StepPago = () => {
  const { values, goToPreviousStep } = useWizard();
  const pagoEnArgentina = values.StepFacturacion.pais === 'AR';

  const [stripeClientSecret, setStripeClientSecret] = useState(null);
  const [mercadoPagoPaymentID, setMercadoPagoPaymentID] = useState(null);

  const fetchStripeClientSecret = async () => {
    try {
      const paymentData = {
        product_id: 123,
        amount: 10,
        // ...
      };
      const response = await axios.post(
        '/api/create-stripe-payment-intent/',
        paymentData,
      );
      const { client_secret: fetchedClientSecret } = response.data;
      setStripeClientSecret(fetchedClientSecret);
    } catch (error) {
      console.error('Error fetching client secret:', error);
    }
  };

  useEffect(() => {
    if (!pagoEnArgentina && !stripeClientSecret) fetchStripeClientSecret();
  }, []);

  const onMercadoPagoSubmit = async (formData) => {
    // callback llamado al hacer clic en el botón enviar datos
    return new Promise((resolve, reject) => {
      axios
        .post('/api/process-mp-payment/', formData, {
          headers: {
            'Content-Type': 'application/json',
          },
        })
        .then((response) => {
          setMercadoPagoPaymentID(response.data.id);
          // Receive the payment result
          resolve(response.data);
        })
        .catch((error) => {
          // Handle the error response when attempting to create the payment
          reject(error);
        });
    });
  };

  return (
    <div>
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
      {!pagoEnArgentina && stripeClientSecret && (
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret: stripeClientSecret,
            appearance: {},
          }}
        >
          <PaymentElement />
        </Elements>
      )}
      <button
        type="button"
        onClick={goToPreviousStep}
        className="BotonFormulario"
      >
        Facturación
      </button>
    </div>
  );
};

export default StepPago;
