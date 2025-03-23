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

      {patientInfo.diagnosis && (
        <div className="summary-section diagnosis-info">
          <h3>등록된 1차 소견</h3>
          {Object.entries(patientInfo.diagnosis).map(([category, items]) => {
            if (!items || items.length === 0) return null;
            return (
              <div key={category} className="diagnosis-item">
                <span className="category">{category}:</span>
                <span className="items">{items.join(', ')}</span>
              </div>
            );
          })}
        </div>
      )}

      <div className="summary-section">
        <h3>수술 후 주의사항</h3>
        <div className="precautions">
          <ol>
            <li>수술 후 1주일간은 눈을 비비지 마세요.</li>
            <li>수술 후 1주일간은 세안 시 눈 주변에 물이 들어가지 않도록 주의하세요.</li>
            <li>수술 후 1주일간은 과격한 운동을 피하세요.</li>
            <li>처방된 안약을 정해진 시간에 점안하세요.</li>
            <li>외출 시에는 선글라스를 착용하여 자외선을 차단하세요.</li>
            <li>먼지가 많은 곳은 피하고, 실내 활동을 권장합니다.</li>
            <li>정기적인 외래 진료를 통해 경과를 관찰하세요.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default DiagnosisSummary;
