// src/pages/PatientInfoPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '../context/PatientContext';
import { useAppContext } from '../context/AppContext';
import PatientForm from '../components/PatientInfo/PatientForm';
import PatientSummary from '../components/PatientInfo/PatientSummary';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { savePatientInfo, startSession, getDiagnosisDraft } from '../services/api';
import './PatientInfoPage.css';

const PatientInfoPage = () => {
  const { patientInfo, resetPatientInfo, updatePatientInfo } = usePatientContext();
  const { setCurrentSession } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 환자 정보로부터 AI 진단용 메시지 생성
  const createDiagnosisMessage = (patientData) => {
    // 진단 정보 텍스트로 변환
    const diagnosisText = Object.entries(patientData.diagnosis || {})
      .filter(([_, items]) => items && items.length > 0)
      .map(([category, items]) => `${category}: ${items.join(', ')}`)
      .join(', ');

    return {
      role: "user",
      content: `환자의 정보는 다음과 같습니다.\n      이름: ${patientData.patient_name}, \n      성별: ${patientData.gender}, \n      나이: ${patientData.age}, \n      수술부위: ${patientData.surgery_eye}, \n      검사 결과: ${diagnosisText}, \n      오늘 날짜: ${new Date().toISOString().split('T')[0]}, \n      수술 날짜: ${patientData.surgery_date}`
    };
  };

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
      console.log('Submitting form data from Page:', formData);
      
      // 환자 정보 객체 생성 (diagnosis 포함)
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
        medications: formData.medications || '',
        diagnosis: formData.diagnosis || {}
      };
      
      console.log('Prepared patient data:', patientData);
      
      // Supabase에 환자 정보 저장
      try {
        const savedData = await savePatientInfo(patientData);
        console.log('Patient info saved:', savedData);
        
        // --- AI 종합 소견 생성 시작 ---
        setIsLoading(true); // 로딩 상태 유지 또는 다시 활성화 (이미 true일 수 있음)
        try {
          const diagnosisMessage = createDiagnosisMessage(patientData);
          console.log('Generating AI diagnosis with message:', diagnosisMessage);

          const explain = await getDiagnosisDraft(diagnosisMessage);
          console.log('AI diagnosis generated:', explain);

          // explain 정보 추가 (# 제거 포함)
          patientData.explain = explain.replace(/#/g, "");
          console.log('Updated patientData with explain:', patientData);

        } catch (diagnosisError) {
          console.error('Error generating diagnosis:', diagnosisError);
          // 오류 발생 시 사용자에게 알릴 메시지를 explain 필드에 저장
          patientData.explain = "AI 소견 생성 중 오류가 발생했습니다. 백내장 수술 정보 페이지에서 자세한 정보를 확인하세요.";
          setError('AI 소견 생성 중 오류가 발생했습니다. 정보는 저장되었으나 소견을 확인하려면 다시 시도해주세요.'); // 사용자에게 에러 표시
        }
        // --- AI 종합 소견 생성 끝 ---

        // Context 업데이트 (explain 포함된 patientData 사용)
        updatePatientInfo(patientData);

        // 새 세션 시작
        try {
          const sessionId = await startSession(formData.patient_number);
          console.log('Session started:', sessionId);
          setCurrentSession(sessionId);
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
      setIsLoading(false); // 모든 작업 완료 후 로딩 상태 해제
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
          {patientInfo.diagnosis && Object.keys(patientInfo.diagnosis).length > 0 && (
            <div className="diagnosis-summary">
              <h4>등록된 소견</h4>
              {Object.entries(patientInfo.diagnosis)
                .filter(([_, items]) => items && items.length > 0)
                .map(([category, items]) => (
                  <div key={category}>
                    <strong>{category}:</strong> {items.join(', ')}
                  </div>
                ))}
            </div>
          )}
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