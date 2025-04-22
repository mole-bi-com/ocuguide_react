import React from 'react';
import './DiagnosisSummary.css';

const DiagnosisSummary = ({ patientInfo }) => {
  const formatDiagnosis = (diagnosis) => {
    if (!diagnosis) return '';
    
    return Object.entries(diagnosis).map(([category, items]) => {
      if (!items || items.length === 0) return null;
      return `${category}: ${items.join(', ')}`;
    }).filter(Boolean).join('\n');
  };

  if (!patientInfo) {
    return null;
  }

  return (
    <div className="diagnosis-summary">
      <div className="summary-section">
        <h2>진단 요약</h2>
        <div className="patient-details">
          <p><strong>환자번호:</strong> {patientInfo.patient_number}</p>
          <p><strong>환자명:</strong> {patientInfo.patient_name}</p>
          <p><strong>성별:</strong> {patientInfo.gender}</p>
          <p><strong>나이:</strong> {patientInfo.age}세</p>
          <p><strong>수술명:</strong> 백내장 수술</p>
          <p><strong>수술부위:</strong> {patientInfo.surgery_eye}</p>
          <p><strong>수술일:</strong> {patientInfo.surgery_date}</p>
          <p><strong>수술시간:</strong> {patientInfo.surgery_time}</p>
          <p><strong>주치의:</strong> {patientInfo.primary_doctor}</p>
          <p><strong>마취방법:</strong> 점안 마취</p>
          <p><strong>입원기간:</strong> 당일 퇴원</p>
        </div>
      </div>

      {/* Removed "등록된 1차 소견" section */}
      {/* Removed "수술 후 주의사항" section */}
    </div>
  );
};

export default DiagnosisSummary;
