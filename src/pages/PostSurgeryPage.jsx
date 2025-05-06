import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '../context/PatientContext';
import { format, add, sub } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import CalendarSchedule from '../components/SurgeryInfo/CalendarSchedule';
import './PostSurgeryPage.css';

// 날짜 포맷팅 헬퍼 함수
const formatDate = (date) => {
  try {
    return format(new Date(date), 'yyyy년 MM월 dd일');
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
};

// AI 소견에서 "수술 준비 사항" 관련 부분만 추출하는 헬퍼 함수
const getPreparationText = (fullExplanation) => {
  if (!fullExplanation) {
    return 'AI 소견 정보를 불러오는 중입니다...';
  }
  // "수술 준비 사항"을 기준으로 텍스트 분리 시작
  const marker = '수술 준비 사항'; // 사용자가 제안한 마커 사용
  const startIndex = fullExplanation.indexOf(marker);

  if (startIndex === -1) {
    // 해당 문구를 찾지 못한 경우, 콘솔 경고 및 사용자 알림
    console.warn(`Marker '${marker}' not found in AI explanation.`);
    return '수술 준비 사항 섹션을 찾을 수 없습니다. AI 응답 형식을 확인해주세요.';
  }

  // 마커("수술 준비 사항")를 포함하여 이후의 텍스트를 반환
  return fullExplanation.substring(startIndex);
};

const PostSurgeryPage = () => {
  const { patientInfo } = usePatientContext();
  const navigate = useNavigate();

  if (!patientInfo) {
    navigate('/patient-info');
    return null;
  }

  const surgeryDate = new Date(patientInfo.surgery_date);
  const dayBefore = formatDate(sub(surgeryDate, { days: 1 }));
  const surgeryDay = formatDate(surgeryDate);
  const dayAfter = formatDate(add(surgeryDate, { days: 1 }));

  return (
    <div className="post-surgery-page">
      <h1 className="page-title">🗓️ 수술 후 주의사항 및 스케줄</h1>
      
      <div className="post-surgery-content">
        <div className="schedule-section">
          <h2>수술 전후 스케줄</h2>
          <div className="calendar-view">
            <CalendarSchedule patientInfo={patientInfo} />
          </div>
          
          <div className="schedule-detail">
            <h3>주요 일정</h3>
            <ul className="schedule-list">
              <li>
                <strong>{dayBefore}</strong>
                <p>- 수술 전날: 수술 시간 안내 전화</p>
              </li>
              <li>
                <strong>{surgeryDay}</strong>
                <p>- 수술 당일: 아침 약 복용, 당일 입원 및 퇴원</p>
              </li>
              <li>
                <strong>{dayAfter}</strong>
                <p>- 수술 다음날: 첫 번째 외래 진료</p>
              </li>
              <li>
                <strong>수술 1주일 후</strong>
                <p>- 주치의와 상의후 결정</p>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="precautions-section">
          <h2>수술 후 주의사항</h2>
          <div className="precautions-list">
            <ul>
              <li>수술 후 1주일간은 눈을 비비거나 누르지 않도록 주의</li>
              <li>처방된 안약을 정해진 시간에 점안</li>
              <li>수영장, 사우나 등은 2주 이상 피하기</li>
              <li>과도한 운동이나 무거운 물건 들기 피하기</li>
              <li>정기적인 외래 진료 방문하기</li>
            </ul>
          </div>
        </div>
        
        <div className="ai-opinion-section">
          <h2>AI 생성 소견</h2>
          <div className="ai-opinion-content">
            <ReactMarkdown>
              {getPreparationText(patientInfo.explain)}
            </ReactMarkdown>
          </div>
        </div>
      </div>

      <div className="navigation-buttons">
        <button 
          onClick={() => navigate('/surgery-info')} 
          className="nav-button"
        >
          백내장 수술 정보로 돌아가기
        </button>
        <button 
          onClick={() => navigate('/chatbot')} 
          className="nav-button next"
        >
          챗봇 상담하기
        </button>
      </div>
    </div>
  );
};

export default PostSurgeryPage; 