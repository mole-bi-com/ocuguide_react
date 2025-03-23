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
  const [speechMode, setSpeechMode] = useState(false);
  const [currentSession, setCurrentSession] = useState(null);
  const [stepsTiming, setStepsTiming] = useState({});

  const updateStepDuration = (stepId, duration) => {
    setStepsTiming(prev => ({
      ...prev,
      [stepId]: duration
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
    speechMode,
    setSpeechMode,
    currentSession,
    setCurrentSession,
    stepsTiming,
    updateStepDuration
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export default AppProvider; 