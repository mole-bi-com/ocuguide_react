import React, { createContext, useContext, useState } from 'react';

const PatientContext = createContext();

const initialDiagnosis = {
  "안과 질환": [],
  "전신 질환": [],
  "복용 중인 약물": []
};

const initialPatientInfo = {
  patient_number: "",
  patient_name: "",
  gender: "",
  birth_date: "",
  age: "",
  primary_doctor: "",
  surgery_eye: "",
  surgery_date: "",
  surgery_time: "",
  diagnosis: initialDiagnosis
};

export const PatientProvider = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState(initialPatientInfo);

  const updatePatientInfo = (newInfo) => {
    setPatientInfo(prev => ({
      ...prev,
      ...newInfo
    }));
  };

  const resetPatientInfo = () => {
    setPatientInfo(initialPatientInfo);
  };

  const value = {
    patientInfo,
    setPatientInfo,
    updatePatientInfo,
    resetPatientInfo
  };

  return (
    <PatientContext.Provider value={value}>
      {children}
    </PatientContext.Provider>
  );
};

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (context === undefined) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
}; 