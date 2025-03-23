import React from 'react';
import './DiagnosisSelection.css';

const DiagnosisSelection = ({ selectedDiagnoses, onDiagnosisChange }) => {
  const diagnoses = {
    eyeConditions: [
      { id: 'cataract', label: '백내장' },
      { id: 'glaucoma', label: '녹내장' },
      { id: 'retinopathy', label: '망막병증' }
    ],
    systemicConditions: [
      { id: 'diabetes', label: '당뇨' },
      { id: 'hypertension', label: '고혈압' },
      { id: 'heart_disease', label: '심장질환' }
    ],
    medications: [
      { id: 'anticoagulants', label: '항응고제' },
      { id: 'immunosuppressants', label: '면역억제제' }
    ]
  };

  return (
    <div className="diagnosis-selection">
      <div className="diagnosis-category">
        <h3>안과 질환</h3>
        <div className="options-container">
          {diagnoses.eyeConditions.map(condition => (
            <label key={condition.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedDiagnoses.includes(condition.id)}
                onChange={() => onDiagnosisChange(condition.id)}
              />
              {condition.label}
            </label>
          ))}
        </div>
      </div>

      <div className="diagnosis-category">
        <h3>전신 질환</h3>
        <div className="options-container">
          {diagnoses.systemicConditions.map(condition => (
            <label key={condition.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedDiagnoses.includes(condition.id)}
                onChange={() => onDiagnosisChange(condition.id)}
              />
              {condition.label}
            </label>
          ))}
        </div>
      </div>

      <div className="diagnosis-category">
        <h3>복용 중인 약물</h3>
        <div className="options-container">
          {diagnoses.medications.map(medication => (
            <label key={medication.id} className="checkbox-label">
              <input
                type="checkbox"
                checked={selectedDiagnoses.includes(medication.id)}
                onChange={() => onDiagnosisChange(medication.id)}
              />
              {medication.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DiagnosisSelection;
