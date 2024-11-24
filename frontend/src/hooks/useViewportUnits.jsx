import { useState, useEffect } from 'react';

const useViewportUnits = () => {
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const updateDimensions = () => {
      console.log('Updated height:', window.innerHeight);
      console.log('window.innerWidth:', window.innerWidth);
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Update on mount
    updateDimensions();

    console.log('Adding resize and orientationchange listeners.');
    // Add event listeners
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('orientationchange', updateDimensions);

    // Cleanup
    return () => {
      console.log('Removing listeners.');
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('orientationchange', updateDimensions);
    };
  }, []);

  return {
    // Get viewport unit value in pixels (number)
    vw: (units) => (dimensions.width * units) / 100,
    vh: (units) => (dimensions.height * units) / 100,

    // Get viewport unit value with px unit (string)
    vwPx: (units) => `${(dimensions.width * units) / 100}px`,
    vhPx: (units) => `${(dimensions.height * units) / 100}px`,

    // Raw viewport dimensions
    width: dimensions.width,
    height: dimensions.height,
  };
};

export default useViewportUnits;
