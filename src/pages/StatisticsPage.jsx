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
        // Test connectivity first
        console.log('Attempting to fetch statistics...');
        
        // Try to fetch each data source individually with error handling
        let patients = [];
        let steps = [];
        let understanding = [];
        let progress = [];
        
        try {
          patients = await getPatientStats();
          console.log('Patient stats fetched successfully:', patients?.length || 0, 'patients');
        } catch (patientError) {
          console.error('Error fetching patient stats:', patientError);
          patients = [];
        }
        
        try {
          steps = await getStepStats();
          console.log('Step stats fetched successfully:', steps?.length || 0, 'steps');
        } catch (stepError) {
          console.error('Error fetching step stats:', stepError);
          steps = [];
        }
        
        try {
          understanding = await getUnderstandingStats();
          console.log('Understanding stats fetched successfully:', understanding?.length || 0, 'records');
        } catch (understandingError) {
          console.error('Error fetching understanding stats:', understandingError);
          understanding = [];
        }
        
        try {
          progress = await getPatientProgress();
          console.log('Patient progress fetched successfully:', progress?.length || 0, 'records');
        } catch (progressError) {
          console.error('Error fetching patient progress:', progressError);
          progress = [];
        }
        
        setPatientStats(patients || []);
        setStepStats(steps || []);
        setUnderstandingStats(understanding || []);
        setPatientProgress(progress || []);
        
        // Set current patient if available
        if (patients && patients.length > 0) {
          setCurrentPatient(patients[0]);
        }
        
        // Only show error if ALL requests failed
        if (!patients.length && !steps.length && !understanding.length && !progress.length) {
          setError('데이터베이스에 연결할 수 없습니다. 네트워크 연결을 확인하고 다시 시도해주세요.');
        } else {
          setError(null); // Clear any previous errors
        }
        
      } catch (err) {
        console.error('Error fetching statistics:', err);
        setError('통계 데이터를 불러오는 중 오류가 발생했습니다. 새로고침 후 다시 시도해주세요.');
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

  // Load demo data function
  const loadDemoData = () => {
    const demoPatients = [
      {
        patient_number: "DEMO001",
        patient_name: "김영희",
        gender: "여성",
        age: 65,
        birth_date: "1959-03-15",
        primary_doctor: "이안과",
        surgery_eye: "우안",
        surgery_date: "2024-12-15",
        surgery_time: "14:00",
        created_at: "2024-05-20"
      },
      {
        patient_number: "DEMO002", 
        patient_name: "박철수",
        gender: "남성",
        age: 72,
        birth_date: "1952-08-22",
        primary_doctor: "김안과",
        surgery_eye: "좌안",
        surgery_date: "2024-12-20",
        surgery_time: "10:30",
        created_at: "2024-05-21"
      }
    ];

    const demoSteps = [
      {
        step_id: 0,
        step_name: "정보 개요",
        duration_seconds: 120,
        session_id: "demo_session_1"
      },
      {
        step_id: 1,
        step_name: "백내장의 정의, 수술 과정",
        duration_seconds: 180,
        session_id: "demo_session_1"
      }
    ];

    const demoProgress = [
      {
        patient_number: "DEMO001",
        completed_steps: 3,
        total_steps: 6,
        completion_rate: 50,
        current_step: "3단계 진행 중",
        is_completed: false
      },
      {
        patient_number: "DEMO002",
        completed_steps: 6,
        total_steps: 6,
        completion_rate: 100,
        current_step: "모든 단계 완료",
        is_completed: true
      }
    ];

    setPatientStats(demoPatients);
    setStepStats(demoSteps);
    setUnderstandingStats([]);
    setPatientProgress(demoProgress);
    setCurrentPatient(demoPatients[0]);
    setError(null);
    setLoading(false);
  };

  return (
    <div className="statistics-page">
      <h1 className="page-title">✨ OcuGUIDE 사용내역</h1>
      
      {loading ? (
        <div className="loading-message">통계 데이터를 불러오는 중입니다...</div>
      ) : error ? (
        <div className="error-container">
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            <div className="error-text">
              <h3>데이터 로딩 오류</h3>
              <p>{error}</p>
            </div>
            <button 
              className="retry-button" 
              onClick={() => window.location.reload()}
            >
              🔄 새로고침
            </button>
          </div>
          
          {/* Show fallback content */}
          <div className="fallback-content">
            <h2>🔧 대안 옵션</h2>
            <div className="fallback-options">
              <div className="fallback-option">
                <h3>📊 데모 데이터 보기</h3>
                <p>샘플 통계 데이터로 시스템 기능을 확인할 수 있습니다.</p>
                <button 
                  className="demo-button"
                  onClick={() => loadDemoData()}
                >
                  데모 데이터 로드
                </button>
              </div>
              
              <div className="fallback-option">
                <h3>🏠 홈으로 돌아가기</h3>
                <p>환자 정보 페이지로 돌아가서 다시 시작할 수 있습니다.</p>
                <button 
                  className="home-button"
                  onClick={() => window.location.href = '/'}
                >
                  홈으로 이동
                </button>
              </div>
            </div>
          </div>
        </div>
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
                        <td className="status-cell">
                          <div title={`현재 단계: ${patient.progress.current_step}`}>
                            <span className={`progress-badge ${getProgressColorClass(patient.progress.completion_rate)}`}>
                              {getProgressDescription(patient.progress)}
                            </span>
                          </div>
                        </td>
                        <td className="progress-cell">
                          <div className="progress-bar-container">
                            <div 
                              className="progress-bar-fill" 
                              style={{width: `${patient.progress.completion_rate}%`}}
                            ></div>
                            <span className="progress-text">{patient.progress.completion_rate}%</span>
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

// 진행 상태에 따른 색상 클래스 지정
const getProgressColorClass = (completionRate) => {
  if (completionRate === 0) return 'progress-not-started';
  if (completionRate < 40) return 'progress-started';
  if (completionRate < 80) return 'progress-ongoing';
  return 'progress-completed';
};

// 진행 상태에 따른 설명 텍스트 반환
const getProgressDescription = (progress) => {
  const { completion_rate, current_step } = progress;
  
  if (completion_rate === 0) return '⏳ 시작 전';
  if (completion_rate < 40) return `🚀 ${current_step}`;
  if (completion_rate < 80) return `🔄 ${current_step}`;
  return '✅ 완료됨';
};

export default StatisticsPage;
