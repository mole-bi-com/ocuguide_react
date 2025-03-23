// src/pages/PatientInfoPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '../context/PatientContext';
import PatientForm from '../components/PatientInfo/PatientForm';
import PatientSummary from '../components/PatientInfo/PatientSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './PatientInfoPage.css';

const PatientInfoPage = () => {
  const { patientInfo, resetPatientInfo, updatePatientInfo } = usePatientContext();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetInfo = () => {
    if (window.confirm('환자 정보를 정말 재등록 하시겠습니까?')) {
      resetPatientInfo();
    }
  };

  const handleNavigateToSurgeryInfo = () => {
    navigate('/surgery-info');
  };

  const handleSubmit = (formData) => {
    updatePatientInfo({
      patient_number: formData.patient_number,
      patient_name: formData.name,
      gender: formData.gender,
      birth_date: formData.birth_date,
      age: formData.age,
      primary_doctor: formData.primary_doctor,
      surgery_eye: formData.surgery_eye,
      surgery_date: formData.surgery_date,
      surgery_time: formData.surgery_time,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
      emergency_contact: formData.emergencyContact,
      emergency_phone: formData.emergencyPhone,
      medical_history: formData.medicalHistory,
      allergies: formData.allergies,
      medications: formData.medications
    });
  };

  return (
    <div className="patient-info-page">
      <h1 className="page-title">👨‍⚕️ 환자 정보 등록</h1>
      <div className="info-message">
        환자별 맞춤 안내를 제공합니다.
      </div>

      {isLoading && <LoadingSpinner />}

      {patientInfo && patientInfo.patient_name ? (
        <>
          <PatientSummary patientInfo={patientInfo} />
          <div className="success-message">
            환자정보가 등록되었습니다. 이제 백내장 수술정보로 이동하실 수 있습니다.
          </div>
          <div className="button-container">
            <button 
              className="reset-button" 
              onClick={handleResetInfo}
            >
              환자 정보 재등록
            </button>
            <button 
              className="primary-button" 
              onClick={handleNavigateToSurgeryInfo}
            >
              백내장 수술 정보로 이동
            </button>
          </div>
        </>
      ) : (
        <PatientForm onSubmit={handleSubmit} setIsLoading={setIsLoading} />
      )}
    </div>
  );
};

export default PatientInfoPage;