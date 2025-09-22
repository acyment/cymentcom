import React, { useState, useEffect } from 'react';
import { usePostHog } from 'posthog-js/react';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import { useWizard, Wizard } from 'react-formik-step-wizard';
import { useFormikContext } from 'formik';
import StepParticipantes from './StepParticipantes';
import StepFacturacion from './StepFacturacion';
import * as Yup from 'yup';
import HeaderDialogo from './HeaderDialogo';
import axios from 'axios';
import { formatPrice } from '@/utils/formatPrice';

export const AppContext = React.createContext({});

const Inscripcion = ({ idCurso, nombreCorto, costoUSD, costoARS, onClose }) => {
  const posthog = usePostHog();

  // Track funnel start
  useEffect(() => {
    posthog?.capture('funnel_start', { course_id: idCurso });
  }, [idCurso]);

  // Tag the underlying form for explicit selection elsewhere
  useEffect(() => {
    const form = document.querySelector('form');
    if (form) form.setAttribute('data-inscripcion-form', 'true');
  }, []);

  const trackFunnelStep = (step) => {
    posthog?.capture(step);
  };

  const steps = [
    {
      id: 'StepParticipantes',
      component: <StepParticipantes idCurso={idCurso} />,
      validationSchema: Yup.object({
        nombre: Yup.string().required('No te olvides del nombre'),
        apellido: Yup.string().required('No te olvides del apellido'),
        email: Yup.string().required('No te olvides del e-mail'),
      }),
      hidePrevious: true,
      // onSubmit: () => trackFunnelStep('Participant Info'),
    },
    {
      id: 'StepFacturacion',

      onSubmit: async (stepValues, allValues, actions) => {
        try {
          const paisEsArgentina = stepValues.pais === 'AR';

          const response = await axios.post(
            `/api/cursos/${idCurso}/inscripciones/`,
            {
              procesador_pago: paisEsArgentina ? 'MP' : 'STRIPE',
              nombre: allValues.StepParticipantes.nombre,
              apellido: allValues.StepParticipantes.apellido,
              email: allValues.StepParticipantes.email,
              organizacion: allValues.StepParticipantes.organizacion,
              rol: allValues.StepParticipantes.rol,
              pais: stepValues.pais,
              nombreCompleto: stepValues.nombreCompleto,
              tipoIdentificacionFiscal:
                stepValues.tipoIdentificacionFiscal ?? '',
              identificacionFiscal: stepValues.identificacionFiscal,
              tipoFactura: stepValues.tipoFactura,
              direccion: stepValues.direccion,
              telefono: stepValues.telefono,
              emailFacturacion: stepValues.email,
            },
          );

          const idFactura = response.data.id_factura;
          const form = document.createElement('form');
          form.method = 'POST';
          form.action = paisEsArgentina
            ? '/api/create-mp-preference/'
            : '/api/create-stripe-checkoutsession/';

          const addHiddenField = (form, name, value) => {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = name;
            input.value = value;
            form.appendChild(input);
          };

          addHiddenField(form, 'id_factura', idFactura);
          addHiddenField(form, 'allow_promotion_codes', true);
          document.body.appendChild(form);
          form.submit();

          return stepValues;
        } catch (error) {
          console.error('Submission error:', error);
          actions.setSubmitting(false);
          throw error;
        }
      },
      component: <StepFacturacion idCurso={idCurso} />,
      validationSchema: Yup.object({
        pais: Yup.string().required('No te olvides del país'),
        nombreCompleto: Yup.string().required('No te olvides del nombre'),
        email: Yup.string().required('No te olvides del e-mail'),
        direccion: Yup.string().when('pais', {
          is: (pais) => pais === 'AR',
          then: (schema) => schema.required('No te olvides de la dirección'),
        }),
        identificacionFiscal: Yup.string().when('pais', {
          is: (pais) => pais === 'AR',
          then: (schema) =>
            schema.required(
              'No te olvides de ingresar tu identificación fiscal',
            ),
        }),
        tipoIdentificacionFiscal: Yup.string().when('pais', {
          is: (pais) => pais === 'AR',
          then: (schema) =>
            schema.required(
              'No te olvides de elegir el tipo de identificación fiscal',
            ),
        }),
        tipoFactura: Yup.string().when('pais', {
          is: (pais) => pais === 'AR',
          then: (schema) =>
            schema.required('No te olvides de elegir el tipo de factura'),
        }),
      }),
      // onSubmit: () => trackFunnelStep('Billing Info'),
    },
  ];

  function HeaderInscripcion() {
    const { stepNumber } = useWizard();
    return <HeaderDialogo stepNumber={stepNumber} onClose={onClose} />;
  }

  function StepWrapper({ nombreCorto, costoUSD, costoARS }) {
    const { activeStep } = useWizard();
    const { values } = useFormikContext(); // Get formik context directly
    const [paisEsArgentina, setPaisEsArgentina] = useState(null);

    useEffect(() => {
      // Get country value directly from form state
      const selectedPais = values.pais ?? null;
      // Only set Argentina flag if country is selected, otherwise keep null
      setPaisEsArgentina(selectedPais ? selectedPais === 'AR' : null);
    }, [values.pais]); // Track pais field changes

    return (
      <div className="form-container">
        <div className="CursoInfo">
          <div className="ColumnaCursoInfo">
            <span>Curso elegido:</span>{' '}
            <span>
              <b>{nombreCorto}</b>
            </span>
          </div>
          <div className="CostoCursoInfo">
            {paisEsArgentina === null ? (
              <>
                <div className="ColumnaCursoInfo">
                  <span>Costo para Argentina:</span>
                  <span>
                    {' '}
                    <b>{formatPrice(costoARS)} ARS + IVA</b>
                  </span>
                </div>
                <div className="ColumnaCursoInfo">
                  <span>Costo otros países:</span>
                  <span>
                    {' '}
                    <b>{formatPrice(costoUSD)} USD</b>
                  </span>
                </div>
              </>
            ) : paisEsArgentina ? (
              <div className="ColumnaCursoInfo">
                <span>Costo:</span>
                <span>
                  {' '}
                  <b>{formatPrice(costoARS)} ARS + IVA</b>
                </span>
              </div>
            ) : (
              <div className="ColumnaCursoInfo">
                <span>Costo:</span>
                <span>
                  {' '}
                  <b>{formatPrice(costoUSD)} USD</b>
                </span>
              </div>
            )}
          </div>
        </div>
        {activeStep.component}
      </div>
    );
  }

  return (
    <ScrollArea.Root>
      <ScrollArea.Viewport>
        <div className="ContenedorModal">
          <Wizard
            steps={steps}
            wrapper={
              <StepWrapper
                nombreCorto={nombreCorto}
                costoUSD={costoUSD}
                costoARS={costoARS}
              />
            }
            header={<HeaderInscripcion />}
          />
        </div>
      </ScrollArea.Viewport>
      <ScrollArea.Scrollbar asChild orientation="vertical">
        <div className="ScrollAreaScrollbar" tabIndex={-1} aria-hidden="true">
          <ScrollArea.Thumb className="ScrollAreaThumb" />
        </div>
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};

export default Inscripcion;
