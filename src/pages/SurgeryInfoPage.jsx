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
      title: "수술 후 주의사항",
      content: "수술 후 주의해야 할 사항들을 안내합니다.",
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

  const handleNextStep = async () => {
    const endTime = Date.now();
    const duration = (endTime - stepStartTime) / 1000; // Convert to seconds
    
    // Record current step data
    if (currentSession) {
      const step = steps[currentStep];
      try {
        await trackStepProgress(currentSession, {
          stepId: step.id,
          stepName: step.title,
          startTime: new Date(stepStartTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          durationSeconds: Math.round(duration)
        });
        
        // Update local step timing
        updateStepDuration(step.id, Math.round(duration));
      } catch (error) {
        console.error('Failed to track step progress:', error);
      }
    }
    
    // Move to next step
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      setProgress(Math.round(((currentStep + 1) / (steps.length - 1)) * 100));
    } else {
      // Complete the session if this is the last step
      try {
        if (currentSession) {
          await completeSession(currentSession);
        }
      } catch (error) {
        console.error('Failed to complete session:', error);
      }
      
      // Navigate to summary page or show diagnosis
      setShowDiagnosis(true);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      setProgress(Math.round(((currentStep - 1) / (steps.length - 1)) * 100));
    }
  };

  if (!patientInfo) {
    return null;
  }

  return (
    <div className="surgery-info-page">
      <h1 className="page-title">🏥 백내장 수술 정보</h1>
      
      <div className="step-progress">
        {steps.map((step, index) => (
          <div
            key={step.id}
            className={`step-item ${index === currentStep ? 'active' : ''} ${index <= progress ? 'completed' : ''}`}
            onClick={() => {
              setCurrentStep(index);
              setProgress(Math.max(progress, index));
            }}
          >
            <div className="step-number">{step.id + 1}</div>
            <div className="step-title">{step.title}</div>
          </div>
        ))}
      </div>

      <div className="step-content">
        <InfoStep step={steps[currentStep]} />
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

      {currentStep === 0 && (
        <DiagnosisSummary patientInfo={patientInfo} />
      )}

      {currentStep === steps.length - 1 && (
        <div className="calendar-section">
          <CalendarSchedule patientInfo={patientInfo} />
        </div>
      )}
    </div>
  );
};

export default SurgeryInfoPage; 