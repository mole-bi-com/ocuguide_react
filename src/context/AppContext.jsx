import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepDurations, setStepDurations] = useState({});
  const [speechMode, setSpeechMode] = useState(false);

  const updateStepDuration = (stepId, duration) => {
    setStepDurations(prev => ({
      ...prev,
      [stepId]: (prev[stepId] || 0) + duration
    }));
  };

  const toggleSpeechMode = () => {
    setSpeechMode(prev => !prev);
  };

  const value = {
    isLoading,
    setIsLoading,
    error,
    setError,
    currentStep,
    setCurrentStep,
    progress,
    setProgress,
    stepDurations,
    updateStepDuration,
    speechMode,
    toggleSpeechMode
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}; 