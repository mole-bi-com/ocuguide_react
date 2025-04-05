import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-container">
      <div className="loading-bar-container">
        <div className="loading-bar-fill"></div>
      </div>
      <p>로딩 중...</p>
    </div>
  );
};

export default LoadingSpinner; 