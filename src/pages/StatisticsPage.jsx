import React, { useState, useEffect } from 'react';
import UsageChart from '../components/Statistics/UsageChart';
import UsageStats from '../components/Statistics/UsageStats';
import UnderstandingChart from '../components/Statistics/UnderstandingChart';
import { getPatientStats, getStepStats, getUnderstandingStats, getPatientProgress } from '../services/api';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const [patientStats, setPatientStats] = useState(null);
  const [stepStats, setStepStats] = useState(null);
  const [understandingStats, setUnderstandingStats] = useState(null);
  const [patientProgress, setPatientProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPatient, setCurrentPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const patients = await getPatientStats();
        const steps = await getStepStats();
        const understanding = await getUnderstandingStats();
        const progress = await getPatientProgress();
        
        setPatientStats(patients);
        setStepStats(steps);
        setUnderstandingStats(understanding || []);
        setPatientProgress(progress || []);
        
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

  // Process understanding level data for visualization
  const processUnderstandingData = () => {
    if (!understandingStats || understandingStats.length === 0) return null;
    
    // 새로운 형식의 데이터 처리
    return understandingStats.map(stat => {
      // 이해도 높음 (레벨 3, 4)과 낮음(레벨 1, 2) 계산
      const highUnderstanding = (stat.level_3_count || 0) + (stat.level_4_count || 0);
      const lowUnderstanding = (stat.level_1_count || 0) + (stat.level_2_count || 0);
      
      return {
        name: stat.step_name,
        understood: highUnderstanding,
        notUnderstood: lowUnderstanding,
        understandingRate: stat.understanding_rate || 0
      };
    });
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
  const understandingData = processUnderstandingData();
  const completionRate = calculateCompletionRate();

  // Render understanding level bars
  const renderUnderstandingBars = () => {
    if (!understandingData || understandingData.length === 0) {
      return <div className="no-data-message">이해도 데이터가 없습니다.</div>;
    }

    return (
      <div className="understanding-bars">
        {understandingData.map((item, index) => (
          <div key={index} className="understanding-bar-item">
            <div className="bar-label">{item.name}</div>
            <div className="bar-container">
              <div className="bar-wrapper">
                <div 
                  className="bar-fill understood" 
                  style={{width: `${item.understandingRate}%`}}
                ></div>
                <span className="bar-percentage">{item.understandingRate}%</span>
              </div>
              <div className="understanding-legend">
                <span className="understood-legend">잘 이해함</span>
                <span className="not-understood-legend">이해 부족</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 환자 데이터와 진행 상태 데이터 결합
  const combinePatientData = () => {
    if (!patientStats) return [];
    
    return patientStats.map(patient => {
      // 해당 환자의 진행 상태 찾기
      const progress = patientProgress.find(p => p.patient_number === patient.patient_number);
      
      return {
        ...patient,
        progress: progress || {
          completed_steps: 0,
          total_steps: 6,
          completion_rate: 0,
          current_step: '시작 전',
          is_completed: false
        }
      };
    });
  };

  // 환자 데이터 결합 및 필터링
  const combinedPatientData = combinePatientData();
  
  // Filter patients based on search term
  const filteredPatients = combinedPatientData 
    ? combinedPatientData.filter(patient => 
        patient.patient_number?.toString().includes(searchTerm) || 
        patient.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.primary_doctor?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // 진행 상태에 따른 색상 클래스 지정
  const getProgressColorClass = (completionRate) => {
    if (completionRate === 0) return 'progress-not-started';
    if (completionRate < 40) return 'progress-started';
    if (completionRate < 80) return 'progress-ongoing';
    return 'progress-completed';
  };

  // 진행 상태에 따른 더 자세한 설명 생성
  const getProgressDescription = (progress) => {
    if (!progress) return { stage: '시작 전', desc: '아직 시작하지 않았습니다' };
    
    const { current_step, completion_rate } = progress;
    
    if (completion_rate === 0) {
      return { stage: '시작 전', desc: '아직 시작하지 않았습니다' };
    }
    
    if (completion_rate === 100) {
      return { stage: '완료', desc: '모든 단계를 완료했습니다' };
    }
    
    if (current_step.includes('단계 진행 중')) {
      const step = current_step.replace('단계 진행 중', '').trim();
      return { stage: `${step}단계`, desc: `${step}단계 진행 중입니다` };
    }
    
    return { stage: current_step, desc: '진행 중입니다' };
  };

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

          <div className="stats-section">
            <h2>📊 단계별 환자 이해도</h2>
            
            <div className="stats-info-box">
              <p>각 단계별로 환자의 이해도를 보여줍니다. 이해도가 낮은 단계는 추가 설명이 필요할 수 있습니다.</p>
            </div>
            
            {understandingData && understandingData.length > 0 ? (
              <>
                <UnderstandingChart data={understandingData} />
                {renderUnderstandingBars()}
              </>
            ) : (
              <div className="no-data-message">이해도 데이터가 없습니다.</div>
            )}
          </div>

          <div className="stats-section">
            <h2>👨‍👩‍👧‍👦 등록된 환자 목록</h2>
            
            <div className="stats-info-box">
              <p>현재 시스템에 등록된 모든 환자의 목록입니다. 진행 상태 및 완료율 정보도 확인하실 수 있습니다.</p>
            </div>

            <div className="patient-list-controls">
              <div className="search-box">
                <input
                  type="text"
                  placeholder="환자 이름, 번호 또는 담당의로 검색..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="search-input"
                />
                <span className="search-icon">🔍</span>
              </div>
              <div className="patient-count">
                총 <strong>{filteredPatients.length}</strong>명의 환자가 등록되어 있습니다.
              </div>
            </div>
            
            {filteredPatients && filteredPatients.length > 0 ? (
              <div className="patient-list-table-container">
                <table className="patient-list-table">
                  <thead>
                    <tr>
                      <th>환자번호</th>
                      <th>이름</th>
                      <th>성별</th>
                      <th>나이</th>
                      <th>담당의사</th>
                      <th>수술부위</th>
                      <th className="highlight-column">📋 진행 상태</th>
                      <th className="highlight-column">📊 완료율</th>
                      <th>수술날짜</th>
                      <th>등록일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map((patient, index) => (
                      <tr key={index} className={currentPatient && currentPatient.patient_number === patient.patient_number ? 'current-patient' : ''}>
                        <td>{patient.patient_number}</td>
                        <td>{patient.patient_name}</td>
                        <td>{patient.gender}</td>
                        <td>{patient.age}세</td>
                        <td>{patient.primary_doctor || '-'}</td>
                        <td>{patient.surgery_eye || '-'}</td>
                        <td>
                          <div className="status-cell">
                            <span 
                              className={`progress-badge ${getProgressColorClass(patient.progress.completion_rate)}`}
                              title={getProgressDescription(patient.progress).desc}
                            >
                              {getProgressDescription(patient.progress).stage}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="progress-cell">
                            <div className="progress-bar-container">
                              <div 
                                className="progress-bar-fill" 
                                style={{width: `${patient.progress.completion_rate}%`}}
                              ></div>
                              <span className="progress-text">{patient.progress.completion_rate}%</span>
                            </div>
                          </div>
                        </td>
                        <td>{patient.surgery_date || '-'}</td>
                        <td>{patient.created_at ? new Date(patient.created_at).toLocaleDateString('ko-KR') : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="no-data-message">
                {searchTerm ? '검색 결과가 없습니다.' : '등록된 환자가 없습니다.'}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StatisticsPage;
