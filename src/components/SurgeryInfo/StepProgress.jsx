import React from 'react';
import './StepProgress.css';

const StepProgress = ({ steps, currentStep, onStepSelect }) => {
  return (
    <div className="step-progress">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`step-item ${currentStep === index ? 'active' : ''} ${
            step.locked ? 'locked' : index < currentStep ? 'completed' : 'incomplete'
          }`}
          onClick={() => !step.locked && onStepSelect(index)}
        >
          <div className="step-number">
            {index < currentStep ? (
              <span className="step-completion-icon">✓</span>
            ) : (
              index + 1
            )}
          </div>
          <div className="step-title">{step.title}</div>
          {step.locked && (
            <div className="step-lock">
              <span role="img" aria-label="locked">🔒</span>
            </div>
          )}
          {currentStep === index && (
            <div className="current-step-indicator"></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepProgress;
