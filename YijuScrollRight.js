import React, { useState } from 'react';
import './YijuScrollRight.css';
import YijuStorygame from './YijuStoryGame';

const YijuScrollRight = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const handleClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIsExpanded(true);
      setIsAnimating(false); //reseting animation state
    }, 500);
  };
  
  return (
    <div className="data-breach-container">
      <h2 style={{ textAlign: "center" }}>Swipe right before they swipe your data</h2>
      
      {!isExpanded ? (
        <div className="swipe-container">
          <button 
            className={`swipe-button ${isAnimating ? 'animating' : ''}`}
            onClick={handleClick}
          >
            Unlock 🢂
          </button>
        </div>
      ) : (
        <div className="expanded-content">

  <YijuStorygame />
          <button onClick={() => setIsExpanded(false)}>Close</button>
        </div>
      )}
    </div>
  );
};

export default YijuScrollRight;