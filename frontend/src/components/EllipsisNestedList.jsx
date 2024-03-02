import React, { useState } from 'react';

const EllipsisNestedList = ({
  fullContents,
  truncatedContents,
  maxItems,
  seeMoreText = 'Ver más...',
  seeLessText = 'Ver menos...',
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    setExpanded(!expanded);
  };

  const renderContent = () => {
    if (expanded) {
      return fullContents;
    } else {
      return truncatedContents;
    }
  };

  return (
    <div className="ContenidoCurso">
      {renderContent()}
      <button onClick={handleClick} className="VerMasMenos">
        {expanded ? seeLessText : seeMoreText}
      </button>
    </div>
  );
};

export default EllipsisNestedList;
