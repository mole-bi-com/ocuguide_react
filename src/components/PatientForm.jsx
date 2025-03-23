import React, { useContext, useState } from 'react';
import { PatientContext } from '../context/PatientContext';
import './PatientForm.css';

const PatientForm = () => {
  const { patientInfo, updatePatientInfo, diagnosisCategories, updateDiagnosis } = useContext(PatientContext);
  const [errors, setErrors] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = [];

    // 유효성 검사
    if (!patientInfo.patient_number || !/^\d{7}$/.test(patientInfo.patient_number)) {
      newErrors.push("환자번호는 7자리 숫자여야 합니다.");
    }
    if (!patientInfo.patient_name) {
      newErrors.push("환자 이름을 입력해주세요.");
    }
    if (!patientInfo.gender) {
      newErrors.push("성별을 선택해주세요.");
    }
    if (!patientInfo.birth_date) {
      newErrors.push("생년월일을 입력해주세요.");
    }
    if (!patientInfo.primary_doctor) {
      newErrors.push("주치의를 선택해주세요.");
    }
    if (!patientInfo.surgery_eye) {
      newErrors.push("수술 부위를 선택해주세요.");
    }
    if (!patientInfo.surgery_date) {
      newErrors.push("수술 날짜를 선택해주세요.");
    }
    if (!patientInfo.surgery_time) {
      newErrors.push("수술 시간을 선택해주세요.");
    }

    setErrors(newErrors);

    if (newErrors.length === 0) {
      // 성공적으로 제출됨
      alert("환자 정보가 성공적으로 등록되었습니다.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'birth_date') {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() -
        ((today.getMonth() < birthDate.getMonth() || 
          (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0);
      
      updatePatientInfo({
        [name]: value,
        age: age.toString()
      });
    } else {
      updatePatientInfo({ [name]: value });
    }
  };

  const handleDiagnosisChange = (category, item, checked) => {
    const currentItems = patientInfo.diagnosis[category];
    const newItems = checked
      ? [...currentItems, item]
      : currentItems.filter(i => i !== item);
    updateDiagnosis(category, newItems);
  };

  return (
    <div className="patient-form-container">
      <h2>환자 정보 등록</h2>
      
      <form onSubmit={handleSubmit} className="patient-form">
        <div className="form-row">
          <div className="form-group">
            <label>환자번호</label>
            <input
              type="text"
              name="patient_number"
              placeholder="예: 23-12345"
              value={patientInfo.patient_number}
              onChange={handleInputChange}
              maxLength={7}
            />
          </div>
          <div className="form-group">
            <label>환자 이름</label>
            <input
              type="text"
              name="patient_name"
              placeholder="이름을 입력하세요"
              value={patientInfo.patient_name}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>성별</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="남성"
                  checked={patientInfo.gender === "남성"}
                  onChange={handleInputChange}
                />
                남성
              </label>
              <label>
                <input
                  type="radio"
                  name="gender"
                  value="여성"
                  checked={patientInfo.gender === "여성"}
                  onChange={handleInputChange}
                />
                여성
              </label>
            </div>
          </div>
          <div className="form-group">
            <label>생년월일</label>
            <input
              type="date"
              name="birth_date"
              value={patientInfo.birth_date}
              onChange={handleInputChange}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>주치의</label>
            <input
              type="text"
              name="primary_doctor"
              placeholder="주치의 이름"
              value={patientInfo.primary_doctor}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>수술 부위</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="surgery_eye"
                  value="좌안"
                  checked={patientInfo.surgery_eye === "좌안"}
                  onChange={handleInputChange}
                />
                좌안
              </label>
              <label>
                <input
                  type="radio"
                  name="surgery_eye"
                  value="우안"
                  checked={patientInfo.surgery_eye === "우안"}
                  onChange={handleInputChange}
                />
                우안
              </label>
              <label>
                <input
                  type="radio"
                  name="surgery_eye"
                  value="양안"
                  checked={patientInfo.surgery_eye === "양안"}
                  onChange={handleInputChange}
                />
                양안
              </label>
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>수술 날짜</label>
            <input
              type="date"
              name="surgery_date"
              value={patientInfo.surgery_date}
              onChange={handleInputChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="form-group">
            <label>수술 시간</label>
            <input
              type="time"
              name="surgery_time"
              value={patientInfo.surgery_time}
              onChange={handleInputChange}
              step="1800"
            />
          </div>
        </div>

        <h3>진단 정보</h3>
        {Object.entries(diagnosisCategories).map(([category, items]) => (
          <div key={category} className="diagnosis-category">
            <h4>{category}</h4>
            <div className="checkbox-group">
              {items.map(item => (
                <label key={item} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={patientInfo.diagnosis[category].includes(item)}
                    onChange={(e) => handleDiagnosisChange(category, item, e.target.checked)}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}

        {errors.length > 0 && (
          <div className="error-messages">
            {errors.map((error, index) => (
              <p key={index} className="error">{error}</p>
            ))}
          </div>
        )}

        <button type="submit" className="submit-button">환자 정보 등록</button>
      </form>
    </div>
  );
};

export default PatientForm; 