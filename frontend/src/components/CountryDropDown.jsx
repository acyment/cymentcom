import React from 'react';
import { countryList } from 'react-select-country-list';

function CountryDropdown({ className, onSelect }) {
  const options = [
    {
      name: 'Afganistán',
      code: 'AF',
    },
    {
      name: 'Albania',
      code: 'AL',
    },
    {
      name: 'Alemania',
      code: 'DE',
    },
    {
      name: 'Andorra',
      code: 'AD',
    },
    {
      name: 'Angola',
      code: 'AO',
    },
    {
      name: 'Antigua y Barbuda',
      code: 'AG',
    },
    {
      name: 'Arabia Saudita',
      code: 'SA',
    },
    {
      name: 'Argelia',
      code: 'DZ',
    },
    {
      name: 'Argentina',
      code: 'AR',
    },
    {
      name: 'Armenia',
      code: 'AM',
    },
    {
      name: 'Australia',
      code: 'AU',
    },
    {
      name: 'Austria',
      code: 'AT',
    },
    {
      name: 'Azerbaiyán',
      code: 'AZ',
    },
    {
      name: 'Bahamas',
      code: 'BS',
    },
    {
      name: 'Bahrein',
      code: 'BH',
    },
    {
      name: 'Bangladesh',
      code: 'BD',
    },
    {
      name: 'Barbados',
      code: 'BB',
    },
    {
      name: 'Belarús',
      code: 'BY',
    },
    {
      name: 'Belice',
      code: 'BZ',
    },
    {
      name: 'Benin',
      code: 'BJ',
    },
    {
      name: 'Bhután',
      code: 'BT',
    },
    {
      name: 'Bolivia (Estado Plurinacional de)',
      code: 'BO',
    },
    {
      name: 'Bosnia y Herzegovina',
      code: 'BA',
    },
    {
      name: 'Botswana',
      code: 'BW',
    },
    {
      name: 'Brasil',
      code: 'BR',
    },
    {
      name: 'Brunei Darussalam',
      code: 'BN',
    },
    {
      name: 'Bulgaria',
      code: 'BG',
    },
    {
      name: 'Burkina Faso',
      code: 'BF',
    },
    {
      name: 'Burundi',
      code: 'BI',
    },
    {
      name: 'Bélgica',
      code: 'BE',
    },
    {
      name: 'Cabo Verde',
      code: 'CV',
    },
    {
      name: 'Camboya',
      code: 'KH',
    },
    {
      name: 'Camerún',
      code: 'CM',
    },
    {
      name: 'Canadá',
      code: 'CA',
    },
    {
      name: 'Chad',
      code: 'TD',
    },
    {
      name: 'Chequia',
      code: 'CZ',
    },
    {
      name: 'Chile',
      code: 'CL',
    },
    {
      name: 'China',
      code: 'CN',
    },
    {
      name: 'Chipre',
      code: 'CY',
    },
    {
      name: 'Colombia',
      code: 'CO',
    },
    {
      name: 'Comoras',
      code: 'KM',
    },
    {
      name: 'Congo',
      code: 'CG',
    },
    {
      name: 'Costa Rica',
      code: 'CR',
    },
    {
      name: 'Croacia',
      code: 'HR',
    },
    {
      name: 'Cuba',
      code: 'CU',
    },
    {
      name: "Côte d'Ivoire",
      code: 'CI',
    },
    {
      name: 'Dinamarca',
      code: 'DK',
    },
    {
      name: 'Djibouti',
      code: 'DJ',
    },
    {
      name: 'Dominica',
      code: 'DM',
    },
    {
      name: 'Ecuador',
      code: 'EC',
    },
    {
      name: 'Egipto',
      code: 'EG',
    },
    {
      name: 'El Salvador',
      code: 'SV',
    },
    {
      name: 'Emiratos Árabes Unidos',
      code: 'AE',
    },
    {
      name: 'Eritrea',
      code: 'ER',
    },
    {
      name: 'Eslovaquia',
      code: 'SK',
    },
    {
      name: 'Eslovenia',
      code: 'SI',
    },
    {
      name: 'España',
      code: 'ES',
    },
    {
      name: 'Estados Unidos de América',
      code: 'US',
    },
    {
      name: 'Estonia',
      code: 'EE',
    },
    {
      name: 'Eswatini',
      code: 'SZ',
    },
    {
      name: 'Etiopía',
      code: 'ET',
    },
    {
      name: 'Federación de Rusia',
      code: 'RU',
    },
    {
      name: 'Fiji',
      code: 'FJ',
    },
    {
      name: 'Filipinas',
      code: 'PH',
    },
    {
      name: 'Finlandia',
      code: 'FI',
    },
    {
      name: 'Francia',
      code: 'FR',
    },
    {
      name: 'Gabón',
      code: 'GA',
    },
    {
      name: 'Gambia',
      code: 'GM',
    },
    {
      name: 'Georgia',
      code: 'GE',
    },
    {
      name: 'Ghana',
      code: 'GH',
    },
    {
      name: 'Granada',
      code: 'GD',
    },
    {
      name: 'Grecia',
      code: 'GR',
    },
    {
      name: 'Guatemala',
      code: 'GT',
    },
    {
      name: 'Guinea',
      code: 'GN',
    },
    {
      name: 'Guinea Ecuatorial',
      code: 'GQ',
    },
    {
      name: 'Guinea-Bissau',
      code: 'GW',
    },
    {
      name: 'Guyana',
      code: 'GY',
    },
    {
      name: 'Haití',
      code: 'HT',
    },
    {
      name: 'Honduras',
      code: 'HN',
    },
    {
      name: 'Hungría',
      code: 'HU',
    },
    {
      name: 'India',
      code: 'IN',
    },
    {
      name: 'Indonesia',
      code: 'ID',
    },
    {
      name: 'Iraq',
      code: 'IQ',
    },
    {
      name: 'Irlanda',
      code: 'IE',
    },
    {
      name: 'Irán (República Islámica del)',
      code: 'IR',
    },
    {
      name: 'Islandia',
      code: 'IS',
    },
    {
      name: 'Islas Cook',
      code: 'CK',
    },
    {
      name: 'Islas Feroe',
      code: 'FO',
    },
    {
      name: 'Islas Marshall',
      code: 'MH',
    },
    {
      name: 'Islas Salomón',
      code: 'SB',
    },
    {
      name: 'Israel',
      code: 'IL',
    },
    {
      name: 'Italia',
      code: 'IT',
    },
    {
      name: 'Jamaica',
      code: 'JM',
    },
    {
      name: 'Japón',
      code: 'JP',
    },
    {
      name: 'Jordania',
      code: 'JO',
    },
    {
      name: 'Kazajstán',
      code: 'KZ',
    },
    {
      name: 'Kenya',
      code: 'KE',
    },
    {
      name: 'Kirguistán',
      code: 'KG',
    },
    {
      name: 'Kiribati',
      code: 'KI',
    },
    {
      name: 'Kuwait',
      code: 'KW',
    },
    {
      name: 'Lesotho',
      code: 'LS',
    },
    {
      name: 'Letonia',
      code: 'LV',
    },
    {
      name: 'Liberia',
      code: 'LR',
    },
    {
      name: 'Libia',
      code: 'LY',
    },
    {
      name: 'Lituania',
      code: 'LT',
    },
    {
      name: 'Luxemburgo',
      code: 'LU',
    },
    {
      name: 'Líbano',
      code: 'LB',
    },
    {
      name: 'Macedonia del Norte',
      code: 'MK',
    },
    {
      name: 'Madagascar',
      code: 'MG',
    },
    {
      name: 'Malasia',
      code: 'MY',
    },
    {
      name: 'Malawi',
      code: 'MW',
    },
    {
      name: 'Maldivas',
      code: 'MV',
    },
    {
      name: 'Malta',
      code: 'MT',
    },
    {
      name: 'Malí',
      code: 'ML',
    },
    {
      name: 'Marruecos',
      code: 'MA',
    },
    {
      name: 'Mauricio',
      code: 'MU',
    },
    {
      name: 'Mauritania',
      code: 'MR',
    },
    {
      name: 'Micronesia (Estados Federados de)',
      code: 'FM',
    },
    {
      name: 'Mongolia',
      code: 'MN',
    },
    {
      name: 'Montenegro',
      code: 'ME',
    },
    {
      name: 'Mozambique',
      code: 'MZ',
    },
    {
      name: 'Myanmar',
      code: 'MM',
    },
    {
      name: 'México',
      code: 'MX',
    },
    {
      name: 'Mónaco',
      code: 'MC',
    },
    {
      name: 'Namibia',
      code: 'NA',
    },
    {
      name: 'Nauru',
      code: 'NR',
    },
    {
      name: 'Nepal',
      code: 'NP',
    },
    {
      name: 'Nicaragua',
      code: 'NI',
    },
    {
      name: 'Nigeria',
      code: 'NG',
    },
    {
      name: 'Niue',
      code: 'NU',
    },
    {
      name: 'Noruega',
      code: 'NO',
    },
    {
      name: 'Nueva Zelandia',
      code: 'NZ',
    },
    {
      name: 'Níger',
      code: 'NE',
    },
    {
      name: 'Omán',
      code: 'OM',
    },
    {
      name: 'Pakistán',
      code: 'PK',
    },
    {
      name: 'Palau',
      code: 'PW',
    },
    {
      name: 'Panamá',
      code: 'PA',
    },
    {
      name: 'Papua Nueva Guinea',
      code: 'PG',
    },
    {
      name: 'Paraguay',
      code: 'PY',
    },
    {
      name: 'Países Bajos',
      code: 'NL',
    },
    {
      name: 'Perú',
      code: 'PE',
    },
    {
      name: 'Polonia',
      code: 'PL',
    },
    {
      name: 'Portugal',
      code: 'PT',
    },
    {
      name: 'Qatar',
      code: 'QA',
    },
    {
      name: 'Reino Unido de Gran Bretaña e Irlanda del Norte',
      code: 'GB',
    },
    {
      name: 'República Centroafricana',
      code: 'CF',
    },
    {
      name: 'República Democrática Popular Lao',
      code: 'LA',
    },
    {
      name: 'República Democrática del Congo',
      code: 'CD',
    },
    {
      name: 'República Dominicana',
      code: 'DO',
    },
    {
      name: 'República Popular Democrática de Corea',
      code: 'KP',
    },
    {
      name: 'República Unida de Tanzanía',
      code: 'TZ',
    },
    {
      name: 'República de Corea',
      code: 'KR',
    },
    {
      name: 'República de Moldova',
      code: 'MD',
    },
    {
      name: 'República Árabe Siria',
      code: 'SY',
    },
    {
      name: 'Rumania',
      code: 'RO',
    },
    {
      name: 'Rwanda',
      code: 'RW',
    },
    {
      name: 'Saint Kitts y Nevis',
      code: 'KN',
    },
    {
      name: 'Samoa',
      code: 'WS',
    },
    {
      name: 'San Marino',
      code: 'SM',
    },
    {
      name: 'San Vicente y las Granadinas',
      code: 'VC',
    },
    {
      name: 'Santa Lucía',
      code: 'LC',
    },
    {
      name: 'Santo Tomé y Príncipe',
      code: 'ST',
    },
    {
      name: 'Senegal',
      code: 'SN',
    },
    {
      name: 'Serbia',
      code: 'RS',
    },
    {
      name: 'Seychelles',
      code: 'SC',
    },
    {
      name: 'Sierra Leona',
      code: 'SL',
    },
    {
      name: 'Singapur',
      code: 'SG',
    },
    {
      name: 'Somalia',
      code: 'SO',
    },
    {
      name: 'Sri Lanka',
      code: 'LK',
    },
    {
      name: 'Sudáfrica',
      code: 'ZA',
    },
    {
      name: 'Sudán',
      code: 'SD',
    },
    {
      name: 'Sudán del Sur',
      code: 'SS',
    },
    {
      name: 'Suecia',
      code: 'SE',
    },
    {
      name: 'Suiza',
      code: 'CH',
    },
    {
      name: 'Suriname',
      code: 'SR',
    },
    {
      name: 'Tailandia',
      code: 'TH',
    },
    {
      name: 'Tayikistán',
      code: 'TJ',
    },
    {
      name: 'Timor-Leste',
      code: 'TL',
    },
    {
      name: 'Togo',
      code: 'TG',
    },
    {
      name: 'Tokelau',
      code: 'TK',
    },
    {
      name: 'Tonga',
      code: 'TO',
    },
    {
      name: 'Trinidad y Tabago',
      code: 'TT',
    },
    {
      name: 'Turkmenistán',
      code: 'TM',
    },
    {
      name: 'Turquía',
      code: 'TR',
    },
    {
      name: 'Tuvalu',
      code: 'TV',
    },
    {
      name: 'Túnez',
      code: 'TN',
    },
    {
      name: 'Ucrania',
      code: 'UA',
    },
    {
      name: 'Uganda',
      code: 'UG',
    },
    {
      name: 'Uruguay',
      code: 'UY',
    },
    {
      name: 'Uzbekistán',
      code: 'UZ',
    },
    {
      name: 'Vanuatu',
      code: 'VU',
    },
    {
      name: 'Venezuela (República Bolivariana de)',
      code: 'VE',
    },
    {
      name: 'Viet Nam',
      code: 'VN',
    },
    {
      name: 'Yemen',
      code: 'YE',
    },
    {
      name: 'Zambia',
      code: 'ZM',
    },
    {
      name: 'Zimbabwe',
      code: 'ZW',
    },
  ];

  const handleSelect = (event) => {
    const selectedCountry = event.target.value;
    onSelect(selectedCountry);
  };

  return (
    <select className={className} onChange={handleSelect}>
      <option value="" disabled selected>
        País
      </option>
      {options.map((option) => (
        <option key={option.code} value={option.code}>
          {option.name}
        </option>
      ))}
    </select>
  );
}

export default CountryDropdown;
