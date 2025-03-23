import React from 'react';
import './UsageStats.css';

const UsageStats = ({ totalPatients, completionRate, averageTime }) => {
  // Convert average time to minutes and seconds
  const minutes = Math.floor(averageTime / 60);
  const seconds = averageTime % 60;
  const formattedTime = minutes > 0 
    ? `${minutes}분 ${seconds}초` 
    : `${seconds}초`;

  return (
    <div className="usage-stats">
      <div className="stat-card">
        <div className="stat-value">{totalPatients}</div>
        <div className="stat-label">총 환자 수</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">{completionRate}%</div>
        <div className="stat-label">완료율</div>
      </div>
      
      <div className="stat-card">
        <div className="stat-value">{formattedTime}</div>
        <div className="stat-label">평균 소요시간</div>
      </div>
    </div>
  );
};

export default UsageStats;
