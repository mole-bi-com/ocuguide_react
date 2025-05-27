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
  const [showDiagnosis, setShowDiagnosis] = useState(false); // Keep state if needed elsewhere, otherwise can remove
  const [showUnderstandingPrompt, setShowUnderstandingPrompt] = useState(false);
  const [understandingLevel, setUnderstandingLevel] = useState(0); // Keep state if needed elsewhere, otherwise can remove
  const [showCompletionOptions, setShowCompletionOptions] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0); // Add state for card index
  const [nextButtonActive, setNextButtonActive] = useState(false);
  const [completedAudioSteps, setCompletedAudioSteps] = useState({});

  // Define initial steps data
  const initialSteps = [
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
          { caption: '백내장이란 무엇인가요?' },
          { caption: '백내장 수술은 어떻게 진행되나요?' },
          { caption: '백내장 수술시간은 어느정도 되나요?' },
          { caption: '백내장 수술 시 마취는 어떠한 방식으로 하나요?' }
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
      content: "백내장 수술 시 사용하는 인공수정체 종류와 특징에 대해 설명합니다.",
      media: {
        type: 'audio',
        files: [
          { caption: '인공수정체 기본 원리' },
          { caption: '다초점 인공수정체 (Multifocal)' },
          { caption: '강화 단초점 인공수정체' },
          { caption: '난시교정렌즈 (Toric)와 최종 결정' }
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
          { caption: '백내장 수술 후에는 언제부터 잘 보이게 되나요?' },
          { caption: '백내장 수술 이후 일상생활은 언제부터 가능한가요?' },
          { caption: '백내장 수술 후에는 안약을 얼마나 사용하나요?' },
          { caption: '백내장 수술 후에는 병원에 얼마나 자주 와야하나요?' }
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
          { caption: '수술 중 합병증' },
          { caption: '수술 후 경미한 부작용' },
          { caption: '수술 후 심한 합병증' },
          { caption: '인공수정체의 탈구/아탈구' },
          { caption: '각막부종' },
          { caption: '후낭혼탁' }
        ]
      }
    }
  ];

  // Filter out the unwanted step ("빈번한 질문 리스트") and re-map IDs sequentially
  const filteredSteps = initialSteps
    .filter(step => step.title !== "빈번한 질문 리스트")
    .map((step, index) => ({ ...step, id: index }));

  // Use the filtered and re-mapped steps in the state
  const [steps] = useState(filteredSteps);

  // Initialize component
  useEffect(() => {
    if (progress === -1) {
      console.log('Initializing progress state');
    }
  }, []); // Removed dependency to avoid reset on progress change

  // Initialize step tracking
  useEffect(() => {
    setStepStartTime(Date.now());
    setCurrentCardIndex(0); // Reset card index when step changes
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
    const progressPercentage = steps.length > 1 ?
      (progress + 1) / steps.length : 0;
    document.documentElement.style.setProperty('--progress-percentage', progressPercentage);
  }, [progress, steps.length]);

  // Calculate completion percentage
  const completionPercentage = Math.round(((progress + 1) / steps.length) * 100);

  // Add a function to check if audio is completed in the current step
  useEffect(() => {
    // Check if we already have a completed state for this step or if it's a previously completed step
    if (completedAudioSteps[currentStep] || currentStep <= progress) {
      setNextButtonActive(true);
      return;
    }
    
    // Check if the current step has audio content
    if (steps[currentStep]?.media?.type === 'audio') {
      // Initially set to inactive for audio steps - will be activated only when audio completes
      setNextButtonActive(false);
      
      // We'll listen for changes in audioCompleted from the InfoStep component
      const checkAudioCompletion = (event) => {
        if (event.detail?.stepId === currentStep) {
          // Only activate the button when audio completes on the last card
          if (event.detail?.isLastCard && event.detail?.completed) {
            setNextButtonActive(true);
            // Store the completed state for this step
            setCompletedAudioSteps(prev => ({
              ...prev,
              [currentStep]: true
            }));
          }
        }
      };
      
      window.addEventListener('audioCompleted', checkAudioCompletion);
      
      return () => {
        window.removeEventListener('audioCompleted', checkAudioCompletion);
      };
    } else {
      // For non-audio steps, the next button can be active immediately
      setNextButtonActive(true);
    }
  }, [currentStep, steps, completedAudioSteps, progress]);

  // Add a new effect to display a message when the next button becomes active
  useEffect(() => {
    if (nextButtonActive) {
      // If we're showing an active next button, we can add any additional UI feedback here
      // We no longer automatically deactivate the button - it should stay active
      // once the user has completed the necessary steps
    }
  }, [nextButtonActive, showUnderstandingPrompt]);

  // Make sure this effect doesn't auto-activate the button for audio steps
  useEffect(() => {
    // This effect now only handles non-audio steps or state synchronization
    // We should NOT automatically activate just for being on the last card of an audio step
    if (steps[currentStep]?.media?.type !== 'audio') {
      // This is a non-audio step, so we can activate the button
      setNextButtonActive(true);
    }
  }, [currentCardIndex, currentStep, steps]);

  const handleUnderstandingSelect = async (level) => {
    const endTime = Date.now();
    const duration = (endTime - stepStartTime) / 1000;

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
        updateStepDuration(step.id, Math.round(duration));
      } catch (error) {
        console.error('Failed to track step progress:', error);
      }
    }

    setShowUnderstandingPrompt(false);

    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      setProgress(currentStep); // Update progress after completing the current step
    } else {
      try {
        if (currentSession) {
          await completeSession(currentSession);
        }
        setProgress(currentStep); // Mark the last step as completed
        setShowCompletionOptions(true);
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
    }
  };

  // Improve the handleNextStep function to set active state immediately when clicked
  const handleNextStep = () => {
    // Card navigation is handled within InfoStep component by arrow buttons
    setNextButtonActive(true); // Activate button when clicked
    setShowUnderstandingPrompt(true);
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleGoToChatbot = () => {
    navigate('/chatbot');
  };

  const UnderstandingLevelPrompt = () => (
    <div className="understanding-prompt-overlay">
      <div className="understanding-prompt">
        <h3>이 단계의 내용을 얼마나 이해하셨나요?</h3>
        <p>선택한 단계에서 환자의 이해도를 알려주세요</p>
        <div className="understanding-levels">
          {[1, 2, 3].map(level => (
            <button
              key={level}
              className="understanding-level-btn"
              onClick={() => handleUnderstandingSelect(level)}
            >
              <span style={{ fontSize: level === 3 ? '5.5rem' : '4.5rem', fontWeight: 'bold', marginBottom: '8px' }}>
                {level === 1 ? '✗' :
                 level === 2 ? '△' :
                 '⬤'}
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px' }}>{level}단계</span>
              <span>
                {level === 1 ? '이해하지 못했음' :
                 level === 2 ? '약간 이해했음' :
                 '이해했음'}
              </span>
            </button>
          ))}
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
            className={`step-item ${index === currentStep && !showCompletionOptions ? 'active' : ''} ${index <= progress ? 'completed' : 'incomplete'} ${index <= progress ? 'clickable' : ''}`}
            onClick={() => {
              if (index <= progress) { // Allow clicking on completed steps to navigate back
                setCurrentStep(index);
                setCurrentCardIndex(0); // Reset card index when navigating to a specific step
                setShowCompletionOptions(false); // Hide completion options when navigating to a specific step
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
            {index === currentStep && !showCompletionOptions && (
              <div className="current-step-indicator"></div>
            )}
          </div>
        ))}
      </div>

      {!showCompletionOptions ? (
        <>
          <div className="step-content">
            {/* Render InfoStep or dynamic content based on step */}
            {typeof steps[currentStep].content === 'function' ? (
              steps[currentStep].content({ patientInfo })
            ) : (
              <InfoStep
                step={steps[currentStep]}
                patientInfo={patientInfo}
                currentCardIndex={currentCardIndex}
                setCurrentCardIndex={setCurrentCardIndex}
              />
            )}
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
              className={`nav-button next ${nextButtonActive ? 'active' : ''}`}
              disabled={
                // The button should be disabled when:
                // 1. It's an audio step AND
                // 2. Either it's not the last card OR the button isn't active yet (audio not completed)
                steps[currentStep].media?.type === 'audio' && 
                (!nextButtonActive || currentCardIndex < steps[currentStep].media.files.length - 1)
              }
            >
              {currentStep === steps.length - 1 ? '완료' : '다음 단계'}
            </button>
          </div>

          {/* Conditionally render additional components based on step */}
          {currentStep === 0 && patientInfo && (
             <div className="initial-diagnosis-section">
               <DiagnosisSummary patientInfo={patientInfo} />
             </div>
          )}
        </>
      ) : (
        <div className="completion-options-container">
          <h2>수술 정보 확인 완료!</h2>
          <p>모든 수술 정보를 확인하셨습니다. 다시 보고 싶은 단계가 있으면 위의 단계 버튼을 클릭하시거나, 다음 단계를 선택해주세요.</p>
          <div className="completion-buttons">
            <button onClick={handleGoToChatbot} className="nav-button next">
              챗봇 상담하기
            </button>
          </div>
        </div>
      )}

      {showUnderstandingPrompt && <UnderstandingLevelPrompt />}
    </div>
  );
};

export default SurgeryInfoPage; 