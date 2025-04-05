import React from 'react';
import './CalendarSchedule.css';

const CalendarSchedule = ({ patientInfo }) => {
  const formatDate = (dateString) => {
    if (!dateString || isNaN(new Date(dateString))) {
      console.warn("Invalid date string passed to formatDate:", dateString);
      return '날짜 정보 없음';
    }
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  if (!patientInfo) {
    return <div className="calendar-schedule">환자 정보 로딩 중...</div>;
  }

  return (
    <div className="calendar-schedule">
      <h3>수술 일정</h3>
      <div className="schedule-content">
        <div className="schedule-item">
          <h4>수술일</h4>
          <p>{formatDate(patientInfo.surgery_date)}</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarSchedule;
