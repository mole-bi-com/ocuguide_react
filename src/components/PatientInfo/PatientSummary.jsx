import React from 'react';
import ReactMarkdown from 'react-markdown';
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
      
      <div className="summary-section ai-diagnosis">
        <h3>AI 생성 소견</h3>
        <div className="ai-diagnosis-content">
          <ReactMarkdown>{"안녕하세요, 환자님.\n\n검진 결과를 바탕으로 환자님의 상태에 대해 설명드리겠습니다.\n\n환자님은 일반적인 경우와 비교하여 수정체 관련 위험요인(들)을 추가로 가지고 있는 상태입니다.\n\n1. 백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.\n2. 심한 백내장을 제거하는 과정에서 나타나는 각막부종으로 시력 호전에 제한이 있을 수 있습니다.\n3. 수술 후 건성안 증상이 악화될 수 있어 이에 대한 지속적인 관리가 필요합니다.\n\n저희 세브란스 안과 병원 의료진은 이러한 위험요인(들)을 충분히 숙지하고 준비하겠습니다.\n\n현재 날짜는 2025-05-12이고, 수술 날짜는 2025-05-27로, 약 15일 남았습니다.\n\n각 기간별 주의사항 및 준비 사항:\n\n일주일전: \n- 수술 전날부터 안약을 처방대로 사용하세요\n- 메이크업을 피하고 안경만 착용하세요\n- 술, 담배를 삼가고 충분한 휴식을 취하세요\n\n당일: \n- 귀중품은 집에 두고 편안한 옷차림으로 오세요\n- 수술 후 귀가를 도와줄 보호자와 함께 내원하세요\n- 식사는 평소대로 하셔도 됩니다"}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default PatientSummary;
