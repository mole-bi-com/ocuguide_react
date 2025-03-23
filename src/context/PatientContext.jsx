import React, { createContext, useContext, useState } from 'react';

const PatientContext = createContext();

export const usePatientContext = () => {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatientContext must be used within a PatientProvider');
  }
  return context;
};

const initialDiagnosis = {
  "안과 질환": [],
  "전신 질환": [],
  "복용 중인 약물": []
};

const diagnosisCategories = {
  "안과 질환": ["백내장", "녹내장", "망막병증"],
  "전신 질환": ["당뇨", "고혈압", "심장질환"],
  "복용 중인 약물": ["항고혈압제", "면역억제제"]
};

export const PatientProvider = ({ children }) => {
  const [patientInfo, setPatientInfo] = useState({
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
  });

  const updatePatientInfo = (newInfo) => {
    setPatientInfo(prev => ({
      ...prev,
      ...newInfo
    }));
  };

  const resetPatientInfo = () => {
    setPatientInfo({
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
    });
  };

  const updateDiagnosis = (category, selectedItems) => {
    setPatientInfo(prev => ({
      ...prev,
      diagnosis: {
        ...prev.diagnosis,
        [category]: selectedItems
      }
    }));
  };

  return (
    <PatientContext.Provider value={{ 
      patientInfo, 
      updatePatientInfo, 
      resetPatientInfo,
      updateDiagnosis,
      diagnosisCategories 
    }}>
      {children}
    </PatientContext.Provider>
  );
}; 