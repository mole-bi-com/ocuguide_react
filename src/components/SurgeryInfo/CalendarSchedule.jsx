import React from 'react';
import './CalendarSchedule.css';

const CalendarSchedule = ({ patientInfo }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  return (
    <div className="calendar-schedule">
      <h3>수술 일정</h3>
      <div className="schedule-content">
        <div className="schedule-item">
          <h4>수술일</h4>
          <p>{formatDate(patientInfo.surgeryDate)}</p>
        </div>
        <div className="schedule-item">
          <h4>입원일</h4>
          <p>{formatDate(patientInfo.admissionDate)}</p>
        </div>
        <div className="schedule-item">
          <h4>퇴원일</h4>
          <p>{formatDate(patientInfo.dischargeDate)}</p>
        </div>
      </div>
    </div>
  );
};

export default CalendarSchedule;
