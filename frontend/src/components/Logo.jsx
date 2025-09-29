import React from 'react';

const Logo = () => {
  return (
    <a
      href="#hero"
      aria-label="Ir al inicio"
      onClick={(e) => {
        // Prevent full page reload and perform smooth scroll
        e.preventDefault();
        const el = document.getElementById('hero');
        if (el && el.scrollIntoView) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
        // Reflect the hash without adding history entries
        if (typeof history !== 'undefined' && history.replaceState) {
          history.replaceState(null, '', '#hero');
        }
      }}
      className="LogoLink"
    >
      <img src="/static/images/logo.svg" className="Logo" />
    </a>
  );
};

export default Logo;
