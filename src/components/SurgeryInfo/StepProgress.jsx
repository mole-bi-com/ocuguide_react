import React from 'react';
import './StepProgress.css';

const StepProgress = ({ steps, currentStep, onStepSelect }) => {
  return (
    <div className="step-progress">
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={`step-item ${currentStep === index ? 'active' : ''} ${
            step.locked ? 'locked' : ''
          }`}
          onClick={() => !step.locked && onStepSelect(index)}
        >
          <div className="step-number">{index + 1}</div>
          <div className="step-title">{step.title}</div>
          {step.locked && (
            <div className="step-lock">
              <span role="img" aria-label="locked">🔒</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StepProgress;
