import React, { useState, useEffect } from 'react';
import './PatientForm.css';

// 소견 분류 상세 내용 (파이썬 코드 참고)
const diagnosisCategories = {
  '전안부': ["안검염(마이봄샘 기능장애 포함)", "건성안"],
  '각막': ["내피세포 이상 1200개 미만", "내피세포 이상 1200~1500개", "각막혼탁","기타각막질환"],
  '전방': ["얕은 전방", "산동 저하", "소대 이상", "급성폐쇄각녹내장", "거짓비늘증후군", "외상"],
  '수정체': ["심한 백내장(백색, 갈색, 후낭하혼탁 포함)", "안저검사 불가"],
  '망막': ["망막질환 (황반변성, 당뇨망막병증 등)"],
  '시신경': ["녹내장", "뇌병변으로 인한 시야장애"]
};

const PatientForm = ({ onSubmit, setIsLoading }) => {
  const [formData, setFormData] = useState({
    patient_number: '',
    name: '',
    age: '',
    gender: '',
    birth_date: '',
    primary_doctor: '',
    surgery_eye: '',
    surgery_date: '',
    surgery_time: '',
    diagnosis: {} // diagnosis 필드 초기화
  });

  // diagnosis 상태 초기화
  useEffect(() => {
    const initialDiagnosis = {};
    Object.keys(diagnosisCategories).forEach(category => {
      initialDiagnosis[category] = [];
    });
    setFormData(prev => ({ ...prev, diagnosis: initialDiagnosis }));
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.patient_number) {
      newErrors.patient_number = '환자번호를 입력해주세요';
    }
    
    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    }
    
    if (!formData.birth_date) {
      newErrors.birth_date = '생년월일을 입력해주세요';
    }
    
    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요';
    }

    if (!formData.primary_doctor) {
      newErrors.primary_doctor = '주치의를 입력해주세요';
    }

    if (!formData.surgery_eye) {
      newErrors.surgery_eye = '수술 부위를 선택해주세요';
    }

    if (!formData.surgery_date) {
      newErrors.surgery_date = '수술 날짜를 선택해주세요';
    }

    if (!formData.surgery_time) {
      newErrors.surgery_time = '수술 시간을 선택해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // 생년월일이 변경될 때 나이 자동 계산
    if (name === 'birth_date') {
      const birthDate = new Date(value);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear() -
        ((today.getMonth() < birthDate.getMonth() || 
          (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) ? 1 : 0);
      
      setFormData(prev => ({
        ...prev,
        age: age.toString()
      }));
    }
  };

  // 소견 정보 체크박스 변경 핸들러
  const handleDiagnosisChange = (e) => {
    const { name: category, value: item, checked } = e.target;
    setFormData(prev => {
      const currentCategoryItems = prev.diagnosis[category] || [];
      let updatedCategoryItems;
      if (checked) {
        // 항목 추가
        updatedCategoryItems = [...currentCategoryItems, item];
      } else {
        // 항목 제거
        updatedCategoryItems = currentCategoryItems.filter(i => i !== item);
      }
      return {
        ...prev,
        diagnosis: {
          ...prev.diagnosis,
          [category]: updatedCategoryItems
        }
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        if (typeof onSubmit === 'function') {
          // 제출 시 diagnosis 데이터 포함
          console.log("Submitting form data including diagnosis:", formData);
          onSubmit(formData);
        } else {
          console.error('onSubmit is not a function');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <form className="patient-form" onSubmit={handleSubmit}>
      <div className="form-section">
        <h3>기본 정보</h3>
        <div className="form-group">
          <label htmlFor="patient_number">환자번호 *</label>
          <input
            type="text"
            id="patient_number"
            name="patient_number"
            value={formData.patient_number}
            onChange={handleChange}
            placeholder="예: 2024001"
            className={errors.patient_number ? 'error' : ''}
          />
          {errors.patient_number && <span className="error-message">{errors.patient_number}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="name">이름 *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={errors.name ? 'error' : ''}
          />
          {errors.name && <span className="error-message">{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="birth_date">생년월일 *</label>
            <div className="birthdate-inputs">
              <input
                type="date"
                id="birth_date"
                name="birth_date"
                value={formData.birth_date}
                onChange={handleChange}
                max={new Date().toISOString().split('T')[0]}
                className={`date-input ${errors.birth_date ? 'error' : ''}`}
              />
              <div className="numeric-date-container">
                <input
                  type="number"
                  placeholder="년"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.birth_date ? new Date(formData.birth_date).getFullYear() : ''}
                  onChange={(e) => {
                    const year = e.target.value;
                    const currentDate = formData.birth_date ? new Date(formData.birth_date) : new Date();
                    currentDate.setFullYear(year);
                    const newDateString = currentDate.toISOString().split('T')[0];
                    handleChange({ target: { name: 'birth_date', value: newDateString } });
                  }}
                  className="numeric-date-input year-input"
                />
                <span className="date-separator">-</span>
                <input
                  type="number"
                  placeholder="월"
                  min="1"
                  max="12"
                  value={formData.birth_date ? new Date(formData.birth_date).getMonth() + 1 : ''}
                  onChange={(e) => {
                    const month = parseInt(e.target.value, 10) - 1; // JavaScript months are 0-indexed
                    const currentDate = formData.birth_date ? new Date(formData.birth_date) : new Date();
                    currentDate.setMonth(month);
                    const newDateString = currentDate.toISOString().split('T')[0];
                    handleChange({ target: { name: 'birth_date', value: newDateString } });
                  }}
                  className="numeric-date-input month-input"
                />
                <span className="date-separator">-</span>
                <input
                  type="number"
                  placeholder="일"
                  min="1"
                  max="31"
                  value={formData.birth_date ? new Date(formData.birth_date).getDate() : ''}
                  onChange={(e) => {
                    const day = e.target.value;
                    const currentDate = formData.birth_date ? new Date(formData.birth_date) : new Date();
                    currentDate.setDate(day);
                    const newDateString = currentDate.toISOString().split('T')[0];
                    handleChange({ target: { name: 'birth_date', value: newDateString } });
                  }}
                  className="numeric-date-input day-input"
                />
              </div>
            </div>
            {errors.birth_date && <span className="error-message">{errors.birth_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="age">나이</label>
            <input
              type="text"
              id="age"
              name="age"
              value={formData.age}
              readOnly
              className="readonly"
            />
          </div>
        </div>

        <div className="form-group">
          <label>성별 *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="gender"
                value="남성"
                checked={formData.gender === "남성"}
                onChange={handleChange}
              />
              남성
            </label>
            <label>
              <input
                type="radio"
                name="gender"
                value="여성"
                checked={formData.gender === "여성"}
                onChange={handleChange}
              />
              여성
            </label>
          </div>
          {errors.gender && <span className="error-message">{errors.gender}</span>}
        </div>
      </div>

      <div className="form-section">
        <h3>수술 정보</h3>
        <div className="form-group">
          <label htmlFor="primary_doctor">주치의 *</label>
          <input
            type="text"
            id="primary_doctor"
            name="primary_doctor"
            value={formData.primary_doctor}
            onChange={handleChange}
            className={errors.primary_doctor ? 'error' : ''}
          />
          {errors.primary_doctor && <span className="error-message">{errors.primary_doctor}</span>}
        </div>

        <div className="form-group">
          <label>수술 부위 *</label>
          <div className="radio-group">
            <label>
              <input
                type="radio"
                name="surgery_eye"
                value="좌안"
                checked={formData.surgery_eye === "좌안"}
                onChange={handleChange}
              />
              좌안
            </label>
            <label>
              <input
                type="radio"
                name="surgery_eye"
                value="우안"
                checked={formData.surgery_eye === "우안"}
                onChange={handleChange}
              />
              우안
            </label>
            <label>
              <input
                type="radio"
                name="surgery_eye"
                value="양안"
                checked={formData.surgery_eye === "양안"}
                onChange={handleChange}
              />
              양안
            </label>
          </div>
          {errors.surgery_eye && <span className="error-message">{errors.surgery_eye}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="surgery_date">수술 날짜 *</label>
            <input
              type="date"
              id="surgery_date"
              name="surgery_date"
              value={formData.surgery_date}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
              className={errors.surgery_date ? 'error' : ''}
            />
            {errors.surgery_date && <span className="error-message">{errors.surgery_date}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="surgery_time">수술 시간 *</label>
            <input
              type="time"
              id="surgery_time"
              name="surgery_time"
              value={formData.surgery_time}
              onChange={handleChange}
              className={errors.surgery_time ? 'error' : ''}
            />
            {errors.surgery_time && <span className="error-message">{errors.surgery_time}</span>}
          </div>
        </div>
      </div>

      <div className="form-section diagnosis-section">
        <h3>소견 정보</h3>
        {Object.entries(diagnosisCategories).map(([category, items]) => (
          <div key={category} className="diagnosis-category">
            <h4>{category}</h4>
            <div className="checkbox-group">
              {items.map((item, index) => (
                <label key={`${category}-${index}`}>
                  <input
                    type="checkbox"
                    name={category} // 카테고리 이름을 name으로 사용
                    value={item}   // 항목 값을 value로 사용
                    checked={formData.diagnosis[category]?.includes(item) || false}
                    onChange={handleDiagnosisChange}
                  />
                  {item}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="form-actions">
        <button type="submit" className="submit-button">
          환자 정보 저장
        </button>
      </div>
    </form>
  );
};

export default PatientForm; 