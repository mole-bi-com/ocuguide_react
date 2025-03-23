import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <p>로딩 중...</p>
    </div>
  );
};

export default LoadingSpinner; 