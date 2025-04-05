import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '../context/PatientContext';
import { useAppContext } from '../context/AppContext';
import StepProgress from '../components/SurgeryInfo/StepProgress';
import InfoStep from '../components/SurgeryInfo/InfoStep';
import DiagnosisSummary from '../components/SurgeryInfo/DiagnosisSummary';
import CalendarSchedule from '../components/SurgeryInfo/CalendarSchedule';
import { trackStepProgress, completeSession } from '../services/api';
import './SurgeryInfoPage.css';
import { format, add, sub } from 'date-fns';
import ReactMarkdown from 'react-markdown';

// 날짜 포맷팅 헬퍼 함수 추가 (useState 선언 전에)
const formatDate = (date) => {
  try {
    return format(new Date(date), 'yyyy년 MM월 dd일');
  } catch (error) {
    console.error("Error formatting date:", error);
    return String(date);
  }
};

// AI 소견에서 "수술 준비 사항" 관련 부분만 추출하는 헬퍼 함수 수정
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
  // (이제 추출된 텍스트 자체에 제목이 포함됨)
  return fullExplanation.substring(startIndex); 
};

const SurgeryInfoPage = () => {
  const { patientInfo } = usePatientContext();
  const { 
    currentStep, 
    setCurrentStep, 
    progress, 
    setProgress,
    currentSession,
    updateStepDuration 
  } = useAppContext();
  const navigate = useNavigate();
  const [stepStartTime, setStepStartTime] = useState(Date.now());
  const [showDiagnosis, setShowDiagnosis] = useState(false);
  const [showUnderstandingPrompt, setShowUnderstandingPrompt] = useState(false);
  const [understandingLevel, setUnderstandingLevel] = useState(0);

  // Steps information
  const [steps] = useState([
    { 
      id: 0, 
      title: "정보 개요",
      content: `백내장 수술정보에서는 백내장 수술에 관하여 환자분들께서 가장 궁금해하고, 꼭 알아야 할 정보를 단계별로 제공합니다.
      수술 과정부터 회복, 주의사항까지 핵심적인 내용을 담아 환자분들께서 수술 전 안심하고 준비할 수 있도록 돕겠습니다.`,
      media: {
        type: 'text',
        content: [
          "앞으로의 동의 과정을 위해서, 관련 정보를 단계별로 확인해주세요.",
          "하나의 정보를 확인 후, 다음 단계로 버튼을 누르시면 다음 단계를 확인할 수 있습니다."
        ]
      }
    },
    { 
      id: 1, 
      title: "백내장의 정의, 수술 과정",
      content: "백내장의 정의와 수술 과정을 설명합니다.",
      media: {
        type: 'audio',
        files: [
          {
            caption: '백내장이란 무엇인가요?'
          },
          {
            caption: '백내장 수술은 어떻게 진행되나요?'
          },
          {
            caption: '백내장 수술 시 마취는 어떠한 방식으로 하나요?'
          },
          {
            caption: '백내장 수술 입원은 며칠 동안 하나요?'
          }
        ],
        video: {
          url: 'https://drive.google.com/file/d/1DTmGn-RaQs9R7T3k1VfbPf1TiOQ0xki0/preview',
          caption: '백내장 수술 영상'
        }
      }
    },
    { 
      id: 2, 
      title: "인공수정체 결정",
      content: "인공수정체의 종류와 선택 방법을 안내합니다.",
      media: {
        type: 'audio',
        files: [
          {
            caption: '백내장 수술시 눈의 도수는 어떻게 되나요?'
          },
          {
            caption: '백내장 수술시 넣을 수 있는 인공수정체의 종류에는 어떤 것이 있나요?'
          }
        ]
      }
    },
    { 
      id: 3, 
      title: "백내장 수술 후 시력, 일상생활",
      content: "수술 후 시력 회복과 일상생활에 대해 설명합니다.",
      media: {
        type: 'audio',
        files: [
          {
            caption: '백내장 수술 후에는 바로 잘 보이게 되나요?'
          },
          {
            caption: '백내장 수술 이후 일상생활은 언제부터 가능한가요?'
          },
          {
            caption: '백내장 수술 후에는 안약을 얼마나 사용하나요?'
          },
          {
            caption: '백내장 수술 후에는 병원에 얼마나 자주 와야하나요?'
          }
        ]
      }
    },
    { 
      id: 4, 
      title: "백내장 수술의 합병증과 부작용",
      content: "발생 가능한 합병증과 부작용에 대해 설명합니다.",
      media: {
        type: 'audio',
        files: [
          {
            caption: '백내장 수술의 부작용에는 어떤 것들이 있나요?'
          }
        ]
      }
    },
    { 
      id: 5, 
      title: "빈번한 질문 리스트",
      content: "자주 묻는 질문들에 대한 답변입니다.",
      media: {
        type: 'audio',
        files: [
          {
            caption: '양쪽 눈을 동시에 수술이 가능한가요?'
          },
          {
            caption: '수술 당일에는 어떻게 준비해야 하나요?'
          },
          {
            caption: '백내장 수술 전에 복용하지 말아야 할 약제가 있을까요?'
          }
        ]
      }
    },
    { 
      id: 6, 
      title: "수술 후 주의사항 및 스케줄",
      content: ({ patientInfo }) => {
        const surgeryDate = new Date(patientInfo.surgery_date);
        const dayBefore = formatDate(sub(surgeryDate, { days: 1 }));
        const surgeryDay = formatDate(surgeryDate);
        const dayAfter = formatDate(add(surgeryDate, { days: 1 }));
        const weekAfter = formatDate(add(surgeryDate, { weeks: 1 }));

        return (
          <div>
            <div className="surgery-schedule">
              <h4>수술 전후 스케줄</h4>
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
                  <strong>{weekAfter}</strong>
                  <p>- 수술 1주일 후: 경과 관찰 진료</p>
                </li>
              </ul>
            </div>
            <div className="post-op-care">
              <h4>수술 후 주의사항</h4>
              <ul>
                <li>수술 후 1주일간은 눈을 비비거나 누르지 않도록 주의</li>
                <li>처방된 안약을 정해진 시간에 점안</li>
                <li>수영장, 사우나 등은 2주 이상 피하기</li>
                <li>과도한 운동이나 무거운 물건 들기 피하기</li>
                <li>정기적인 외래 진료 방문하기</li>
              </ul>
            </div>
          </div>
        );
      },
      media: {
        type: 'audio',
        files: [
          {
            url: '/assets/audio/surgery-info/q6_1.mp3',
            caption: '수술 후 주의해야 할 것에는 무엇이 있나요?'
          }
        ]
      }
    }
  ]);

  // Initialize component
  useEffect(() => {
    // 컴포넌트 마운트 시 progress가 -1이면(초기값) 현재 단계에 맞게 조정
    if (progress === -1) {
      // 아직 완료된 단계가 없으므로 -1로 유지
      // (이 상태에서는 첫 번째 단계만 접근 가능)
      console.log('Initializing progress state');
    }
  }, []);

  // Initialize step tracking
  useEffect(() => {
    setStepStartTime(Date.now());
  }, [currentStep]);

  // Redirect if no patient info
  useEffect(() => {
    if (!patientInfo) {
      navigate('/patient-info');
      return;
    }
  }, [patientInfo, navigate]);

  // Set progress percentage CSS variable
  useEffect(() => {
    // progress는 완료된 단계의 인덱스를 나타내므로, 전체 단계수에서 계산
    const progressPercentage = steps.length > 1 ? 
      (progress + 1) / steps.length : 0;  // progress + 1은 완료된 단계 수
    document.documentElement.style.setProperty('--progress-percentage', progressPercentage);
  }, [progress, steps.length]);

  // Calculate completion percentage
  const completionPercentage = Math.round(((progress + 1) / steps.length) * 100);

  const handleUnderstandingSelect = async (level) => {
    const endTime = Date.now();
    const duration = (endTime - stepStartTime) / 1000; // Convert to seconds
    
    // Record current step data with understanding level
    if (currentSession) {
      const step = steps[currentStep];
      try {
        await trackStepProgress(currentSession, {
          stepId: step.id,
          stepName: step.title,
          startTime: new Date(stepStartTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          durationSeconds: Math.round(duration),
          understandingLevel: level
        });
        
        // Update local step timing
        updateStepDuration(step.id, Math.round(duration));
      } catch (error) {
        console.error('Failed to track step progress:', error);
      }
    }

    // Hide understanding prompt
    setShowUnderstandingPrompt(false);
    
    // Move to next step
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // progress는 완료된 단계의 인덱스를 의미함
      setProgress(currentStep);
    } else {
      // Complete the session if this is the last step
      try {
        if (currentSession) {
          await completeSession(currentSession);
        }
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
      
      // 마지막 단계도 progress에 포함
      setProgress(currentStep);
      
      // Navigate to summary page or show diagnosis
      setShowDiagnosis(true);
    }
  };

  const handleNextStep = () => {
    // Show understanding prompt
    setShowUnderstandingPrompt(true);
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      // progress는 이전 상태를 유지 (이전에 완료한 단계에 대한 정보는 변경하지 않음)
    }
  };

  // New Understanding Level Component
  const UnderstandingLevelPrompt = () => (
    <div className="understanding-prompt-overlay">
      <div className="understanding-prompt">
        <h3>이 단계의 내용을 얼마나 이해하셨나요?</h3>
        <p>선택한 단계에서 환자의 이해도를 알려주세요</p>
        
        <div className="understanding-levels">
          <button 
            className="understanding-level-btn" 
            onClick={() => handleUnderstandingSelect(1)}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>1단계</span>
            <span>이해하지 못했음</span>
          </button>
          <button 
            className="understanding-level-btn" 
            onClick={() => handleUnderstandingSelect(2)}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>2단계</span>
            <span>약간 이해했음</span>
          </button>
          <button 
            className="understanding-level-btn" 
            onClick={() => handleUnderstandingSelect(3)}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>3단계</span>
            <span>대체로 이해했음</span>
          </button>
          <button 
            className="understanding-level-btn" 
            onClick={() => handleUnderstandingSelect(4)}
          >
            <span style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '8px' }}>4단계</span>
            <span>완전히 이해했음</span>
          </button>
        </div>
      </div>
    </div>
  );

  if (!patientInfo) {
    return null;
  }

  return (
    <div className="surgery-info-page">
      <h1 className="page-title">🏥 백내장 수술 정보</h1>
      
      <div className="progress-overview">
        <div className="progress-bar-container">
          <div className="progress-bar-label">
            <span>진행 상태: <strong>{completionPercentage}%</strong> 완료</span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-bar-fill" 
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="step-progress">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step-item ${index === currentStep ? 'active' : ''} ${index <= progress ? 'completed' : 'incomplete'}`}
            onClick={() => {
              // 이미 완료된 단계나 현재 진행 중인 단계+1까지만 이동 가능
              if (index <= progress + 1) {
                setCurrentStep(index);
              }
            }}
          >
            <div className="step-number">
              {index <= progress ? (
                <span className="step-completion-icon">✓</span>
              ) : (
                index + 1
              )}
            </div>
            <div className="step-title">{step.title}</div>
            {index === currentStep && (
              <div className="current-step-indicator"></div>
            )}
          </div>
        ))}
      </div>

      <div className="step-content">
        <InfoStep step={steps[currentStep]} patientInfo={patientInfo} />
      </div>

      <div className="step-navigation">
        <button 
          onClick={handlePrevStep}
          disabled={currentStep === 0}
          className="nav-button prev"
        >
          이전 단계
        </button>
        <button 
          onClick={handleNextStep}
          disabled={currentStep === steps.length - 1}
          className="nav-button next"
        >
          다음 단계
        </button>
      </div>

      {currentStep === 0 && patientInfo && (
        <div className="initial-diagnosis-section">
           <DiagnosisSummary patientInfo={patientInfo} />
        </div>
      )}

      {currentStep === steps.length - 1 && patientInfo && (
        <div className="combined-schedule-prep-section"> 
          <div className="calendar-section"> 
            <CalendarSchedule patientInfo={patientInfo} />
          </div>
          <div className="ai-prep-section"> 
            <div className="ai-prep-content">
              <ReactMarkdown>
                {getPreparationText(patientInfo.explain)}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      )}

      {showUnderstandingPrompt && <UnderstandingLevelPrompt />}
    </div>
  );
};

export default SurgeryInfoPage; 