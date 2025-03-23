import React, { useState, useEffect } from 'react';
import UsageChart from '../components/Statistics/UsageChart';
import UsageStats from '../components/Statistics/UsageStats';
import { getPatientStats, getStepStats } from '../services/api';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const [patientStats, setPatientStats] = useState(null);
  const [stepStats, setStepStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const patients = await getPatientStats();
        const steps = await getStepStats();
        
        setPatientStats(patients);
        setStepStats(steps);
        
        // Set current patient if available
        if (patients && patients.length > 0) {
          setCurrentPatient(patients[0]);
        }
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('통계 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  // Process data for charts
  const processChartData = () => {
    if (!stepStats) return null;
    
    // Group step durations by step name
    const stepDurations = {};
    stepStats.forEach(step => {
      if (!stepDurations[step.step_name]) {
        stepDurations[step.step_name] = [];
      }
      stepDurations[step.step_name].push(step.duration_seconds);
    });
    
    // Calculate average duration for each step
    const chartData = Object.keys(stepDurations).map(stepName => {
      const durations = stepDurations[stepName];
      const average = durations.reduce((sum, duration) => sum + duration, 0) / durations.length;
      return {
        name: stepName,
        value: Math.round(average)
      };
    });
    
    return chartData;
  };

  // Calculate step completion rate
  const calculateCompletionRate = () => {
    if (!stepStats || !patientStats) return 0;
    
    const uniqueSessions = new Set(stepStats.map(step => step.session_id));
    const completedStepCounts = {};
    
    stepStats.forEach(step => {
      if (!completedStepCounts[step.session_id]) {
        completedStepCounts[step.session_id] = 0;
      }
      completedStepCounts[step.session_id]++;
    });
    
    // Count sessions with all steps completed
    let completedSessions = 0;
    Object.values(completedStepCounts).forEach(count => {
      if (count >= 6) { // Assuming there are 6 steps in total
        completedSessions++;
      }
    });
    
    return uniqueSessions.size > 0 ? Math.round((completedSessions / uniqueSessions.size) * 100) : 0;
  };

  const chartData = processChartData();
  const completionRate = calculateCompletionRate();

  return (
    <div className="statistics-page">
      <h1 className="page-title">✨ OcuGUIDE 사용내역</h1>
      
      {loading ? (
        <div className="loading-message">통계 데이터를 불러오는 중입니다...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="stats-section">
            <h2>현재 OcuGUIDE 접속 환자 정보</h2>
            
            {currentPatient && (
              <div className="patient-info-card">
                <h3>환자 정보</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">환자번호:</span>
                    <span className="value">{currentPatient.patient_number}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">이름:</span>
                    <span className="value">{currentPatient.patient_name}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">성별:</span>
                    <span className="value">{currentPatient.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">생년월일:</span>
                    <span className="value">{currentPatient.birth_date}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">나이:</span>
                    <span className="value">{currentPatient.age}세</span>
                  </div>
                </div>
                
                <h3>수술 정보</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <span className="label">주치의:</span>
                    <span className="value">{currentPatient.primary_doctor}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">수술부위:</span>
                    <span className="value">{currentPatient.surgery_eye}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">수술날짜:</span>
                    <span className="value">{currentPatient.surgery_date}</span>
                  </div>
                  <div className="info-item">
                    <span className="label">수술 시간:</span>
                    <span className="value">{currentPatient.surgery_time}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="stats-section">
            <h2>ℹ️ 백내장수술정보 진행 단계</h2>
            
            <div className="stats-info-box">
              <p>백내장수술정보에서 필요한 정보 확인을 시작하세요.</p>
            </div>
            
            {chartData && chartData.length > 0 ? (
              <>
                <UsageStats 
                  totalPatients={patientStats.length}
                  completionRate={completionRate}
                  averageTime={chartData.reduce((sum, item) => sum + item.value, 0)}
                />
                
                <div className="chart-container">
                  <h3>단계별 평균 소요시간 (초)</h3>
                  <UsageChart data={chartData} />
                </div>
              </>
            ) : (
              <div className="no-data-message">
                아직 수집된 통계 데이터가 없습니다.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
