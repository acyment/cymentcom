import React, { useState, useEffect, Fragment } from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import { useWizard } from 'react-formik-step-wizard';
import { usePostHog } from 'posthog-js/react';
import CustomErrorMessage from './CustomErrorMessage';
import { ArrowRight, ArrowLeft, Info } from 'lucide-react';
import FieldWithInfo from './FieldWithInfo';
import CircleLoader from 'react-spinners/CircleLoader';
import { AnimatePresence, motion } from 'framer-motion';
import FormGroup from './FormGroup';
import CircleLoader from 'react-spinners/CircleLoader';
import { AnimatePresence, motion } from 'framer-motion';

const paises = [
  {
    label: 'Afganistán',
    value: 'AF',
  },
  {
    label: 'Albania',
    value: 'AL',
  },
  {
    label: 'Alemania',
    value: 'DE',
  },
  {
    label: 'Andorra',
    value: 'AD',
  },
  {
    label: 'Angola',
    value: 'AO',
  },
  {
    label: 'Antigua y Barbuda',
    value: 'AG',
  },
  {
    label: 'Arabia Saudita',
    value: 'SA',
  },
  {
    label: 'Argelia',
    value: 'DZ',
  },
  {
    label: 'Argentina',
    value: 'AR',
  },
  {
    label: 'Armenia',
    value: 'AM',
  },
  {
    label: 'Australia',
    value: 'AU',
  },
  {
    label: 'Austria',
    value: 'AT',
  },
  {
    label: 'Azerbaiyán',
    value: 'AZ',
  },
  {
    label: 'Bahamas',
    value: 'BS',
  },
  {
    label: 'Bahrein',
    value: 'BH',
  },
  {
    label: 'Bangladesh',
    value: 'BD',
  },
  {
    label: 'Barbados',
    value: 'BB',
  },
  {
    label: 'Belarús',
    value: 'BY',
  },
  {
    label: 'Belice',
    value: 'BZ',
  },
  {
    label: 'Benin',
    value: 'BJ',
  },
  {
    label: 'Bhután',
    value: 'BT',
  },
  {
    label: 'Bolivia (Estado Plurinacional de)',
    value: 'BO',
  },
  {
    label: 'Bosnia y Herzegovina',
    value: 'BA',
  },
  {
    label: 'Botswana',
    value: 'BW',
  },
  {
    label: 'Brasil',
    value: 'BR',
  },
  {
    label: 'Brunei Darussalam',
    value: 'BN',
  },
  {
    label: 'Bulgaria',
    value: 'BG',
  },
  {
    label: 'Burkina Faso',
    value: 'BF',
  },
  {
    label: 'Burundi',
    value: 'BI',
  },
  {
    label: 'Bélgica',
    value: 'BE',
  },
  {
    label: 'Cabo Verde',
    value: 'CV',
  },
  {
    label: 'Camboya',
    value: 'KH',
  },
  {
    label: 'Camerún',
    value: 'CM',
  },
  {
    label: 'Canadá',
    value: 'CA',
  },
  {
    label: 'Chad',
    value: 'TD',
  },
  {
    label: 'Chequia',
    value: 'CZ',
  },
  {
    label: 'Chile',
    value: 'CL',
  },
  {
    label: 'China',
    value: 'CN',
  },
  {
    label: 'Chipre',
    value: 'CY',
  },
  {
    label: 'Colombia',
    value: 'CO',
  },
  {
    label: 'Comoras',
    value: 'KM',
  },
  {
    label: 'Congo',
    value: 'CG',
  },
  {
    label: 'Costa Rica',
    value: 'CR',
  },
  {
    label: 'Croacia',
    value: 'HR',
  },
  {
    label: 'Cuba',
    value: 'CU',
  },
  {
    label: "Côte d'Ivoire",
    value: 'CI',
  },
  {
    label: 'Dinamarca',
    value: 'DK',
  },
  {
    label: 'Djibouti',
    value: 'DJ',
  },
  {
    label: 'Dominica',
    value: 'DM',
  },
  {
    label: 'Ecuador',
    value: 'EC',
  },
  {
    label: 'Egipto',
    value: 'EG',
  },
  {
    label: 'El Salvador',
    value: 'SV',
  },
  {
    label: 'Emiratos Árabes Unidos',
    value: 'AE',
  },
  {
    label: 'Eritrea',
    value: 'ER',
  },
  {
    label: 'Eslovaquia',
    value: 'SK',
  },
  {
    label: 'Eslovenia',
    value: 'SI',
  },
  {
    label: 'España',
    value: 'ES',
  },
  {
    label: 'Estados Unidos de América',
    value: 'US',
  },
  {
    label: 'Estonia',
    value: 'EE',
  },
  {
    label: 'Eswatini',
    value: 'SZ',
  },
  {
    label: 'Etiopía',
    value: 'ET',
  },
  {
    label: 'Federación de Rusia',
    value: 'RU',
  },
  {
    label: 'Fiji',
    value: 'FJ',
  },
  {
    label: 'Filipinas',
    value: 'PH',
  },
  {
    label: 'Finlandia',
    value: 'FI',
  },
  {
    label: 'Francia',
    value: 'FR',
  },
  {
    label: 'Gabón',
    value: 'GA',
  },
  {
    label: 'Gambia',
    value: 'GM',
  },
  {
    label: 'Georgia',
    value: 'GE',
  },
  {
    label: 'Ghana',
    value: 'GH',
  },
  {
    label: 'Granada',
    value: 'GD',
  },
  {
    label: 'Grecia',
    value: 'GR',
  },
  {
    label: 'Guatemala',
    value: 'GT',
  },
  {
    label: 'Guinea',
    value: 'GN',
  },
  {
    label: 'Guinea Ecuatorial',
    value: 'GQ',
  },
  {
    label: 'Guinea-Bissau',
    value: 'GW',
  },
  {
    label: 'Guyana',
    value: 'GY',
  },
  {
    label: 'Haití',
    value: 'HT',
  },
  {
    label: 'Honduras',
    value: 'HN',
  },
  {
    label: 'Hungría',
    value: 'HU',
  },
  {
    label: 'India',
    value: 'IN',
  },
  {
    label: 'Indonesia',
    value: 'ID',
  },
  {
    label: 'Iraq',
    value: 'IQ',
  },
  {
    label: 'Irlanda',
    value: 'IE',
  },
  {
    label: 'Irán (República Islámica del)',
    value: 'IR',
  },
  {
    label: 'Islandia',
    value: 'IS',
  },
  {
    label: 'Islas Cook',
    value: 'CK',
  },
  {
    label: 'Islas Feroe',
    value: 'FO',
  },
  {
    label: 'Islas Marshall',
    value: 'MH',
  },
  {
    label: 'Islas Salomón',
    value: 'SB',
  },
  {
    label: 'Israel',
    value: 'IL',
  },
  {
    label: 'Italia',
    value: 'IT',
  },
  {
    label: 'Jamaica',
    value: 'JM',
  },
  {
    label: 'Japón',
    value: 'JP',
  },
  {
    label: 'Jordania',
    value: 'JO',
  },
  {
    label: 'Kazajstán',
    value: 'KZ',
  },
  {
    label: 'Kenya',
    value: 'KE',
  },
  {
    label: 'Kirguistán',
    value: 'KG',
  },
  {
    label: 'Kiribati',
    value: 'KI',
  },
  {
    label: 'Kuwait',
    value: 'KW',
  },
  {
    label: 'Lesotho',
    value: 'LS',
  },
  {
    label: 'Letonia',
    value: 'LV',
  },
  {
    label: 'Liberia',
    value: 'LR',
  },
  {
    label: 'Libia',
    value: 'LY',
  },
  {
    label: 'Lituania',
    value: 'LT',
  },
  {
    label: 'Luxemburgo',
    value: 'LU',
  },
  {
    label: 'Líbano',
    value: 'LB',
  },
  {
    label: 'Macedonia del Norte',
    value: 'MK',
  },
  {
    label: 'Madagascar',
    value: 'MG',
  },
  {
    label: 'Malasia',
    value: 'MY',
  },
  {
    label: 'Malawi',
    value: 'MW',
  },
  {
    label: 'Maldivas',
    value: 'MV',
  },
  {
    label: 'Malta',
    value: 'MT',
  },
  {
    label: 'Malí',
    value: 'ML',
  },
  {
    label: 'Marruecos',
    value: 'MA',
  },
  {
    label: 'Mauricio',
    value: 'MU',
  },
  {
    label: 'Mauritania',
    value: 'MR',
  },
  {
    label: 'Micronesia (Estados Federados de)',
    value: 'FM',
  },
  {
    label: 'Mongolia',
    value: 'MN',
  },
  {
    label: 'Montenegro',
    value: 'ME',
  },
  {
    label: 'Mozambique',
    value: 'MZ',
  },
  {
    label: 'Myanmar',
    value: 'MM',
  },
  {
    label: 'México',
    value: 'MX',
  },
  {
    label: 'Mónaco',
    value: 'MC',
  },
  {
    label: 'Namibia',
    value: 'NA',
  },
  {
    label: 'Nauru',
    value: 'NR',
  },
  {
    label: 'Nepal',
    value: 'NP',
  },
  {
    label: 'Nicaragua',
    value: 'NI',
  },
  {
    label: 'Nigeria',
    value: 'NG',
  },
  {
    label: 'Niue',
    value: 'NU',
  },
  {
    label: 'Noruega',
    value: 'NO',
  },
  {
    label: 'Nueva Zelandia',
    value: 'NZ',
  },
  {
    label: 'Níger',
    value: 'NE',
  },
  {
    label: 'Omán',
    value: 'OM',
  },
  {
    label: 'Pakistán',
    value: 'PK',
  },
  {
    label: 'Palau',
    value: 'PW',
  },
  {
    label: 'Panamá',
    value: 'PA',
  },
  {
    label: 'Papua Nueva Guinea',
    value: 'PG',
  },
  {
    label: 'Paraguay',
    value: 'PY',
  },
  {
    label: 'Países Bajos',
    value: 'NL',
  },
  {
    label: 'Perú',
    value: 'PE',
  },
  {
    label: 'Polonia',
    value: 'PL',
  },
  {
    label: 'Portugal',
    value: 'PT',
  },
  {
    label: 'Qatar',
    value: 'QA',
  },
  {
    label: 'Reino Unido de Gran Bretaña e Irlanda del Norte',
    value: 'GB',
  },
  {
    label: 'República Centroafricana',
    value: 'CF',
  },
  {
    label: 'República Democrática Popular Lao',
    value: 'LA',
  },
  {
    label: 'República Democrática del Congo',
    value: 'CD',
  },
  {
    label: 'República Dominicana',
    value: 'DO',
  },
  {
    label: 'República Popular Democrática de Corea',
    value: 'KP',
  },
  {
    label: 'República Unida de Tanzanía',
    value: 'TZ',
  },
  {
    label: 'República de Corea',
    value: 'KR',
  },
  {
    label: 'República de Moldova',
    value: 'MD',
  },
  {
    label: 'República Árabe Siria',
    value: 'SY',
  },
  {
    label: 'Rumania',
    value: 'RO',
  },
  {
    label: 'Rwanda',
    value: 'RW',
  },
  {
    label: 'Saint Kitts y Nevis',
    value: 'KN',
  },
  {
    label: 'Samoa',
    value: 'WS',
  },
  {
    label: 'San Marino',
    value: 'SM',
  },
  {
    label: 'San Vicente y las Granadinas',
    value: 'VC',
  },
  {
    label: 'Santa Lucía',
    value: 'LC',
  },
  {
    label: 'Santo Tomé y Príncipe',
    value: 'ST',
  },
  {
    label: 'Senegal',
    value: 'SN',
  },
  {
    label: 'Serbia',
    value: 'RS',
  },
  {
    label: 'Seychelles',
    value: 'SC',
  },
  {
    label: 'Sierra Leona',
    value: 'SL',
  },
  {
    label: 'Singapur',
    value: 'SG',
  },
  {
    label: 'Somalia',
    value: 'SO',
  },
  {
    label: 'Sri Lanka',
    value: 'LK',
  },
  {
    label: 'Sudáfrica',
    value: 'ZA',
  },
  {
    label: 'Sudán',
    value: 'SD',
  },
  {
    label: 'Sudán del Sur',
    value: 'SS',
  },
  {
    label: 'Suecia',
    value: 'SE',
  },
  {
    label: 'Suiza',
    value: 'CH',
  },
  {
    label: 'Suriname',
    value: 'SR',
  },
  {
    label: 'Tailandia',
    value: 'TH',
  },
  {
    label: 'Tayikistán',
    value: 'TJ',
  },
  {
    label: 'Timor-Leste',
    value: 'TL',
  },
  {
    label: 'Togo',
    value: 'TG',
  },
  {
    label: 'Tokelau',
    value: 'TK',
  },
  {
    label: 'Tonga',
    value: 'TO',
  },
  {
    label: 'Trinidad y Tabago',
    value: 'TT',
  },
  {
    label: 'Turkmenistán',
    value: 'TM',
  },
  {
    label: 'Turquía',
    value: 'TR',
  },
  {
    label: 'Tuvalu',
    value: 'TV',
  },
  {
    label: 'Túnez',
    value: 'TN',
  },
  {
    label: 'Ucrania',
    value: 'UA',
  },
  {
    label: 'Uganda',
    value: 'UG',
  },
  {
    label: 'Uruguay',
    value: 'UY',
  },
  {
    label: 'Uzbekistán',
    value: 'UZ',
  },
  {
    label: 'Vanuatu',
    value: 'VU',
  },
  {
    label: 'Venezuela (República Bolivariana de)',
    value: 'VE',
  },
  {
    label: 'Viet Nam',
    value: 'VN',
  },
  {
    label: 'Yemen',
    value: 'YE',
  },
  {
    label: 'Zambia',
    value: 'ZM',
  },
  {
    label: 'Zimbabwe',
    value: 'ZW',
  },
];

const StepFacturacion = ({ idCurso }) => {
  const posthog = usePostHog();
  const {
    values: valuesCurrentStep,
    touched,
    errors,
    setFieldValue,
  } = useFormikContext();
  const {
    goToPreviousStep,
    values: valuesPreviousSteps,
    activeStep,
  } = useWizard();
  const [paisEsArgentina, setPaisEsArgentina] = useState(null);
  const isTipoFacturaDisabled =
    valuesCurrentStep.tipoIdentificacionFiscal !== 'CUIT';

  useEffect(() => {
    const selectedPais = valuesCurrentStep.pais;
    const eligioArgentina = selectedPais === 'AR';
    setPaisEsArgentina(eligioArgentina);

    const formElement = document.forms[0];
    if (formElement) {
      formElement.method = 'POST';
      formElement.action = eligioArgentina
        ? '/api/create-mp-preference/'
        : '/api/create-stripe-checkoutsession/';
    } else {
      console.warn(
        'StepFacturacion: Could not find form element to set action/method.',
      );
    }
  }, [valuesCurrentStep.pais]);

  // Use useEffect to automatically set TipoFactura to 'B' when it should be disabled
  useEffect(() => {
    // If the condition to disable is met AND the current value is not already 'B'
    if (isTipoFacturaDisabled && valuesCurrentStep.tipoFactura !== 'B') {
      // Set the value of tipoFactura to 'B'
      setFieldValue('tipoFactura', 'B');
    }
    // No need for an 'else' here - if it's CUIT, the user can select A or B freely,
    // and we don't want to override their choice.
  }, [
    valuesCurrentStep.tipoIdentificacionFiscal,
    valuesCurrentStep.tipoFactura,
    isTipoFacturaDisabled,
    setFieldValue,
  ]); // Dependencies array

  useEffect(() => {
    if (activeStep && valuesPreviousSteps?.StepParticipantes) {
      const nombrePrev = valuesPreviousSteps.StepParticipantes.nombre || '';
      const apellidoPrev = valuesPreviousSteps.StepParticipantes.apellido || '';
      const emailPrev = valuesPreviousSteps.StepParticipantes.email || '';

      const nombreCompletoPrev = `${nombrePrev} ${apellidoPrev}`.trim();

      // Use setFieldValue to update the form state correctly
      // Check if data exists and if the current field is empty or different
      if (nombreCompletoPrev && !valuesCurrentStep.nombreCompleto) {
        console.log(
          'Setting nombreCompleto from previous step (only if empty):',
          nombreCompletoPrev,
        );
        setFieldValue('nombreCompleto', nombreCompletoPrev, false);
      }
      if (emailPrev && !valuesCurrentStep.email) {
        console.log(
          'Setting email from previous step (only if empty):',
          emailPrev,
        );
        setFieldValue('email', emailPrev, false);
      }
    }
  }, [activeStep, valuesPreviousSteps, setFieldValue]);

  const { isValid, isSubmitting } = useFormikContext();

  return (
    <Fragment>
      <h3 className="form-title">Datos para facturación</h3>
      <div className="form-row">
        <div className="form-element">
          <label htmlFor="NombreCompleto">Nombre completo*</label>
          <div className="input-container">
            <FieldWithInfo
              name="nombreCompleto"
              type="text"
              className="form-control"
              autoFocus={true}
              tooltip="Nombre de la persona jurídica para organizaciones o el nombre completo del participante en el caso de individuos"
            />
            <CustomErrorMessage name="nombreCompleto" />
          </div>
        </div>
        <div className="form-element">
          <label htmlFor="email">Email*</label>
          <div className="input-container">
            <FieldWithInfo
              name="email"
              type="text"
              className="form-control"
              tooltip="Email al que debe llegar la factura"
            />
            <CustomErrorMessage name="email" />
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-element">
          <label htmlFor="pais">País*</label>
          <div className="input-container">
            <Field id="pais" name="pais" as="select" className="form-control ">
              <option value="">País*</option>
              {paises.map((pais) => (
                <option key={pais.value} value={pais.value}>
                  {pais.label}
                </option>
              ))}
            </Field>
            <CustomErrorMessage name="pais" />
          </div>
        </div>
        <div className="form-element">
          <label htmlFor="ireccion">
            Dirección{paisEsArgentina ? '*' : ''}
          </label>
          <div className="input-container">
            <Field
              id="direccion"
              name="direccion"
              type="text"
              className="form-control"
            />
            <CustomErrorMessage name="direccion" />
          </div>
        </div>
      </div>

      <AnimatePresence>
        {valuesCurrentStep.pais != null && ( // Check if country is selected
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }} // Important for height animation
          >
            <FormGroup
              title="Información fiscal"
              // visible prop might not be needed if using AnimatePresence correctly
            >
              {paisEsArgentina ? (
                <>
                  <div className="triple-form-row">
                    <div className="form-element">
                      <label htmlFor="tipoIdentificacionFiscal">Tipo ID*</label>{' '}
                      <div className="input-container">
                        <Field
                          id="tipoIdentificacionFiscal"
                          name="tipoIdentificacionFiscal"
                          as="select"
                          className="form-control"
                        >
                          <option value="">Tipo*</option>
                          <option key="DNI" value="DNI">
                            DNI
                          </option>
                          <option key="CUIT" value="CUIT">
                            CUIT
                          </option>
                          <option key="CUIL" value="CUIL">
                            CUIL
                          </option>
                        </Field>
                        <CustomErrorMessage name="tipoIdentificacionFiscal" />
                      </div>
                    </div>
                    <div className="form-element">
                      <label htmlFor="identificacionFiscal">
                        Número identificación*
                      </label>{' '}
                      <div className="input-container">
                        <Field
                          id="identificacionFiscal"
                          name="identificacionFiscal"
                          type="text"
                          className="form-control"
                        />
                        <CustomErrorMessage name="identificacionFiscal" />
                      </div>
                    </div>
                    <div className="form-element">
                      <label htmlFor="tipoFactura">Tipo factura*</label>{' '}
                      <div className="input-container">
                        <Field
                          id="tipoFactura"
                          name="tipoFactura"
                          as="select"
                          className="form-control"
                          disabled={isTipoFacturaDisabled}
                        >
                          <option value="">Tipo factura*</option>
                          <option key="A" value="A">
                            A
                          </option>
                          <option key="B" value="B">
                            B
                          </option>
                        </Field>
                        <CustomErrorMessage name="tipoFactura" />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Fragment might not be needed here
                <div className="form-element">
                  {' '}
                  {/* Wrap in form-element for consistency? */}
                  <label htmlFor="identificacionFiscal">
                    Identificación
                  </label>{' '}
                  <div className="input-container">
                    <FieldWithInfo
                      id="identificacionFiscal" // ID can be useful for label's htmlFor
                      name="identificacionFiscal"
                      type="text"
                      className="form-control"
                      tooltip="Identificación fiscal (RUC, RUT, etc. según corresponda) o identificación personal"
                    />
                    {/* Add CustomErrorMessage if this field can have errors outside Argentina */}
                    <CustomErrorMessage name="identificacionFiscal" />
                  </div>
                </div>
              )}
            </FormGroup>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="DosBotonesFormulario">
        <button
          type="button"
          className="BotonFormulario BotonVolver"
          onClick={() => {
            posthog?.capture('back_to_participants');
            goToPreviousStep();
          }}
          disabled={isSubmitting}
        >
          <ArrowLeft />
          Volver{'  '}
        </button>
        <button
          type="submit"
          className="BotonFormulario BotonContinuar"
          disabled={!isValid || isSubmitting}
        >
          {isSubmitting ? ( // Show loader when submitting
            <CircleLoader size={20} color="#ffffff" />
          ) : (
            <>
              Continuar <ArrowRight />
            </>
          )}
        </button>
      </div>
    </Fragment>
  );
};

export default StepFacturacion;
