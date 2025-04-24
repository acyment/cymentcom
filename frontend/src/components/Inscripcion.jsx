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

export const AppContext = React.createContext({});

const Inscripcion = ({ idCurso, nombreCorto, costoUSD, costoARS }) => {
  const posthog = usePostHog();

  // Track funnel start
  useEffect(() => {
    posthog?.capture('funnel_start', { course_id: idCurso });
  }, [idCurso]);

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
    return <HeaderDialogo stepNumber={stepNumber} />;
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
          <span>
            Curso elegido: <b>{nombreCorto}</b>
          </span>
          <div className="CostoCursoInfo">
            {paisEsArgentina === null ? (
              <>
                <span>
                  Costo para Argentina: <b>{costoARS} ARS + IVA</b>
                </span>
                <span>
                  Costo otros países: <b>{costoUSD} USD</b>
                </span>
              </>
            ) : paisEsArgentina ? (
              <span>
                Costo: <b>{costoARS} ARS + IVA</b>
              </span>
            ) : (
              <span>
                Costo: <b>{costoUSD} USD</b>
              </span>
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
      <ScrollArea.Scrollbar
        className="ScrollAreaScrollbar"
        orientation="vertical"
      >
        <ScrollArea.Thumb className="ScrollAreaThumb" />
      </ScrollArea.Scrollbar>
    </ScrollArea.Root>
  );
};

export default Inscripcion;
