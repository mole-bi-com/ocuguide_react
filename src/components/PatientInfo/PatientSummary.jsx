import React from 'react';
import './PatientSummary.css';

const PatientSummary = ({ patientInfo }) => {
  if (!patientInfo) {
    return null;
  }

  return (
    <div className="patient-summary">
      <h2>등록된 환자정보</h2>
      
      <div className="summary-section personal-info">
        <h3>개인 정보</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">환자번호:</span>
            <span className="value">{patientInfo.patient_number}</span>
          </div>
          <div className="info-item">
            <span className="label">이름:</span>
            <span className="value">{patientInfo.patient_name}</span>
          </div>
          <div className="info-item">
            <span className="label">성별:</span>
            <span className="value">{patientInfo.gender}</span>
          </div>
          <div className="info-item">
            <span className="label">생년월일:</span>
            <span className="value">{patientInfo.birth_date}</span>
          </div>
          <div className="info-item">
            <span className="label">나이:</span>
            <span className="value">{patientInfo.age}세</span>
          </div>
        </div>
      </div>
      
      <div className="summary-section operation-info">
        <h3>수술 정보</h3>
        <div className="info-grid">
          <div className="info-item">
            <span className="label">주치의:</span>
            <span className="value">{patientInfo.primary_doctor}</span>
          </div>
          <div className="info-item">
            <span className="label">수술부위:</span>
            <span className="value">{patientInfo.surgery_eye}</span>
          </div>
          <div className="info-item">
            <span className="label">수술날짜:</span>
            <span className="value">{patientInfo.surgery_date}</span>
          </div>
          <div className="info-item">
            <span className="label">수술 시간:</span>
            <span className="value">{patientInfo.surgery_time}</span>
          </div>
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
      
      {patientInfo.explain && (
        <div className="summary-section ai-diagnosis">
          <h3>AI 생성 소견</h3>
          <div className="ai-diagnosis-content">
            {patientInfo.explain}
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientSummary;
