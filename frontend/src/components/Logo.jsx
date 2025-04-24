import React from 'react';
import { RoughNotation } from 'react-rough-notation';

const Logo = () => {
  return (
    <>
      <img src="static/images/logo.svg" className="Logo"></img>
      <RoughNotation
        type="circle"
        show={true}
        color="#7b68ee"
        strokeWidth={2.5}
        padding={12}
      >
        <span className="cartelBeta" title="Versión beta">
          Versión beta
        </span>
      </RoughNotation>
    </>
  );
};

export default Logo;
