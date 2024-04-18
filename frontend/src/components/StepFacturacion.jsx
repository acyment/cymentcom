import React, { Fragment, useState } from 'react';
import { Field, ErrorMessage } from 'formik';
import { useWizard } from 'react-formik-step-wizard';
import * as Yup from 'yup';
import { Tooltip } from 'react-tooltip';
import axios from 'axios';

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

const StepFacturacion = () => {
  const { goToPreviousStep, activeStep } = useWizard();
  const [paisEsArgentina, setPaisEsArgentina] = useState(null);

  const countryWasSelected = (event) => {
    const eligioArgentina = event.target.value === 'AR';
    setPaisEsArgentina(eligioArgentina);
    const validationSchema = activeStep.validationSchema;

    if (eligioArgentina && !validationSchema.describe().fields['cuit']) {
      activeStep.validationSchema = validationSchema.concat(
        Yup.object().shape({
          cuit: Yup.string().required('No te olvides del cuit'),
        }),
      );
    } else if (!eligioArgentina && validationSchema.describe().fields.cuit)
      activeStep.validationSchema = validationSchema.omit(['cuit']);
  };

  const submitPagoStripe = () => {
    axios
      .post('/api/create-stripe-checkoutsession/')
      .then((response) => {
        window.location.href = response.data.checkout_url;
      })
      .catch((error) => {
        if (error.response && error.response.status === 302) {
          window.location.href = error.response.headers.location;
        } else {
          console.error('Error:', error);
        }
      });
  };
  return (
    <Fragment>
      <p className="TituloStep">Datos para facturación</p>
      <div className="Fieldset">
        <Field
          name="pais"
          as="select"
          onBlur={(e) => countryWasSelected(e)}
          className="Input"
        >
          <option value="">País*</option>
          {paises.map((pais) => (
            <option key={pais.value} value={pais.value}>
              {pais.label}
            </option>
          ))}
        </Field>
        <ErrorMessage name="pais" />
        <Field
          name="nombreCompleto"
          placeholder="Nombre Completo*"
          type="text"
          className="Input"
        />
        <ErrorMessage name="nombreCompleto" />

        <Field
          name="identificadorFiscal"
          placeholder={paisEsArgentina ? 'CUIT' : 'Identificación'}
          type="text"
          data-tooltip-id="my-tooltip"
          data-tooltip-content="Ingrese identificador fiscal (RUT, RUC, etc) o personal (cédula, documento, pasaporte) tal como deseas que aparezca en la factura"
          className="Input"
        />

        <Tooltip id="my-tooltip" />
        <Field
          name="direccion"
          placeholder="Dirección"
          type="text"
          className="Input"
        />
        <Field
          name="telefono"
          placeholder="Teléfono"
          type="text"
          className="Input"
        />
        <div className="DosBotonesFormulario">
          <button
            type="button"
            onClick={goToPreviousStep}
            className="BotonFormulario BotonIzquierda"
          >
            Participantes
          </button>
          <button
            type={paisEsArgentina ? 'submit' : 'button'}
            className="BotonFormulario BotonDerecha"
            onClick={paisEsArgentina ? () => {} : submitPagoStripe}
          >
            Pago
          </button>
        </div>
      </div>
    </Fragment>
  );
};

export default StepFacturacion;
