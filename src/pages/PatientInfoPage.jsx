// src/pages/PatientInfoPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '../context/PatientContext';
import { useAppContext } from '../context/AppContext';
import PatientForm from '../components/PatientInfo/PatientForm';
import PatientSummary from '../components/PatientInfo/PatientSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { savePatientInfo, startSession } from '../services/api';
import './PatientInfoPage.css';

const PatientInfoPage = () => {
  const { patientInfo, resetPatientInfo, updatePatientInfo } = usePatientContext();
  const { setCurrentSession } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleResetInfo = () => {
    if (window.confirm('환자 정보를 정말 재등록 하시겠습니까?')) {
      resetPatientInfo();
    }
  };

  const handleNavigateToSurgeryInfo = () => {
    navigate('/surgery-info');
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Submitting form data:', formData);
      
      // 환자 정보 객체 생성
      const patientData = {
        patient_number: formData.patient_number,
        patient_name: formData.name,
        gender: formData.gender,
        birth_date: formData.birth_date,
        age: parseInt(formData.age, 10) || 0,
        primary_doctor: formData.primary_doctor,
        surgery_eye: formData.surgery_eye,
        surgery_date: formData.surgery_date,
        surgery_time: formData.surgery_time,
        phone: formData.phone || '',
        email: formData.email || '',
        address: formData.address || '',
        emergency_contact: formData.emergencyContact || '',
        emergency_phone: formData.emergencyPhone || '',
        medical_history: formData.medicalHistory || '',
        allergies: formData.allergies || '',
        medications: formData.medications || ''
      };
      
      console.log('Prepared patient data:', patientData);
      
      // Supabase에 환자 정보 저장
      try {
        const savedData = await savePatientInfo(patientData);
        console.log('Patient info saved:', savedData);
        
        // 새 세션 시작
        try {
          const sessionId = await startSession(formData.patient_number);
          console.log('Session started:', sessionId);
          setCurrentSession(sessionId);
          
          // Context 업데이트
          updatePatientInfo(patientData);
        } catch (sessionError) {
          console.error('Session error:', sessionError);
          setError('세션 시작 중 오류가 발생했습니다. 환자 정보는 저장되었지만 진행이 어려울 수 있습니다.');
        }
      } catch (saveError) {
        console.error('Save error details:', saveError);
        setError(`환자 정보 저장 중 오류가 발생했습니다: ${saveError.message || '알 수 없는 오류'}`);
      }
    } catch (err) {
      console.error('Failed to save patient info:', err);
      console.error('Error details:', JSON.stringify(err, null, 2));
      setError('환자 정보 처리 중 오류가 발생했습니다. 다시 시도해 주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="patient-info-page">
      <h1 className="page-title">👨‍⚕️ 환자 정보 등록</h1>
      <div className="info-message">
        환자별 맞춤 안내를 제공합니다.
      </div>

      {isLoading && <LoadingSpinner />}
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

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