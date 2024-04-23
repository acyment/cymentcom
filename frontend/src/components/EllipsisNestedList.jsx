import React, { useState, useRef } from 'react';

const EllipsisNestedList = ({
  fullContents,
  truncatedContents,
  maxItems,
  seeMoreText = 'Ver más...',
  seeLessText = 'Ver menos...',
}) => {
  const [expanded, setExpanded] = useState(false);
  const refContenedor = useRef(null);

  const handleClick = () => {
    setExpanded(!expanded);
    if (expanded) {
      refContenedor.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    if (expanded) {
      return fullContents;
    } else {
      return truncatedContents;
    }
  };

  return (
    <div
      className="ContenidoCurso NavigationBarScrollOffset"
      ref={refContenedor}
    >
      {renderContent()}
      <button onClick={handleClick} className="VerMasMenos">
        {expanded ? seeLessText : seeMoreText}
      </button>
    </div>
  );
};

export default EllipsisNestedList;
