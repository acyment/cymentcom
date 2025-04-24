import React from 'react';
import { formatPrice } from '../utils/formatPrice';

const CostoCurso = ({
  costoUSD,
  costoARS,
  costoSinDescuentoARS,
  costoSinDescuentoUSD,
}) => {
  return (
    <div className="ContenedorPagos">
      <div className="TarjetaPago">
        <div className="TarjetaEncabezado">
          <h2>Pagos en Argentina</h2>
          <p className="Descargo">Los precios pueden variar sin aviso previo</p>
        </div>
        <div className="TarjetaContenido">
          <div className="ContenedorPrecio">
            <div className="ContenedorOferta">
              <span className="PrecioTachado">
                ARS
                {formatPrice(costoSinDescuentoARS)}{' '}
              </span>
            </div>
            <p className="Precio">ARS {formatPrice(costoARS)}</p>
            <p className="IVA">(+IVA)</p>
          </div>

          <ul className="MetodosPago">
            <li>Pagá con tarjeta crédito, débito o dinero en cuenta</li>
            <li>Escribinos si quieres hacer transferencia bancaria</li>
          </ul>
          <button
            onClick={() =>
              document
                .getElementById('calendario-curso')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="BotonPago"
          >
            Calendario
          </button>
          <p className="Nota">
            NOTA: Aplica exclusivamente si resides actualmente en Argentina,
            para pagos con tarjetas emitidas en Argentina y/o cuentas radicadas
            en Argentina y además posees CUIT argentino para poder generarte la
            factura correspondiente. La política de devolución contempla una
            anticipación de hasta 96 horas hábiles antes del comienzo del curso.
          </p>
        </div>
      </div>

      <div className="TarjetaPago">
        <div className="TarjetaEncabezado">
          <h2>Pagos fuera de Argentina</h2>
        </div>
        <div className="TarjetaContenido">
          <div className="ContenedorPrecio">
            <div className="ContenedorOferta">
              <span className="PrecioTachado">
                USD
                {formatPrice(costoSinDescuentoUSD)}{' '}
              </span>
            </div>
            <p className="Precio">USD {formatPrice(costoUSD)}</p>
          </div>
          <ul className="MetodosPago">
            <li>Válido solamente para pagos fuera de Argentina</li>
            <li>Puedes pagar con cualquier tarjeta de crédito</li>
          </ul>
          <button
            onClick={() =>
              document
                .getElementById('calendario-curso')
                ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
            className="BotonPago"
          >
            Calendario
          </button>
          <p className="Nota">
            NOTA: Aplica si no resides actualmente en Argentina y cuentas con
            una dirección de residencia de un país diferente a Argentina para
            poder generarte la factura correspondiente. La política de
            devolución contempla una anticipación de hasta 96 horas hábiles
            antes del comienzo del curso.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CostoCurso;
