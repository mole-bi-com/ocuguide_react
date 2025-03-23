import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePatientContext } from '../context/PatientContext';
import { useAppContext } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './StatisticsPage.css';

const StatisticsPage = () => {
  const { patientInfo } = usePatientContext();
  const { progress, stepDurations } = useAppContext();
  const navigate = useNavigate();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Redirect if no patient info exists
    if (!patientInfo) {
      navigate('/patient-info');
    }
    
    // Format step durations for chart
    if (Object.keys(stepDurations).length > 0) {
      const formattedData = Object.entries(stepDurations).map(([step, duration]) => ({
        step: `단계 ${step.replace('step', '')}`,
        duration: duration || 0,
      }));
      
      setChartData(formattedData);
    }
  }, [patientInfo, navigate, stepDurations]);

  if (!patientInfo) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="statistics-page">
      <h1 className="page-title">✨ OcuGUIDE 사용내역</h1>
      
      <section className="patient-info-section">
        <h2>현재 OcuGUIDE 접속 환자 정보</h2>
        
        <div className="info-card">
          <div className="info-section">
            <h3>환자 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">환자번호:</span>
                <span className="value">{patientInfo.patient_number}</span>
              </div>
              <div className="info-item">
                <span className="label">이름:</span>
                <span className="value">{patientInfo.patient_name}</span>
              </div>
              <div className="info-item">
                <span className="label">성별:</span>
                <span className="value">{patientInfo.gender}</span>
              </div>
              <div className="info-item">
                <span className="label">생년월일:</span>
                <span className="value">{patientInfo.birth_date}</span>
              </div>
              <div className="info-item">
                <span className="label">나이:</span>
                <span className="value">{patientInfo.age}세</span>
              </div>
            </div>
          </div>
          
          <div className="info-section">
            <h3>수술 정보</h3>
            <div className="info-grid">
              <div className="info-item">
                <span className="label">주치의:</span>
                <span className="value">{patientInfo.primary_doctor}</span>
              </div>
              <div className="info-item">
                <span className="label">수술부위:</span>
                <span className="value">{patientInfo.surgery_eye}</span>
              </div>
              <div className="info-item">
                <span className="label">수술날짜:</span>
                <span className="value">{patientInfo.surgery_date}</span>
              </div>
              <div className="info-item">
                <span className="label">수술 시간:</span>
                <span className="value">{patientInfo.surgery_time}</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <section className="progress-section">
        <h2>ℹ️ 백내장수술정보 진행 단계</h2>
        
        {progress < 1 ? (
          <div className="warning-message">
            ℹ️ 백내장수술정보에서 필요한 정보 확인을 시작하세요.
          </div>
        ) : progress < 7 ? (
          <div className="info-message">
            현재 {progress}까지 정보를 확인하였습니다.
          </div>
        ) : (
          <div className="success-message">
            모든 백내장수술정보를 확인하였습니다.
          </div>
        )}
        
        {progress >= 7 && chartData.length > 0 && (
          <div className="usage-stats">
            <h3>백내장 수술정보 단계별 체류시간(초)</h3>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis label={{ value: '시간 (초)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Bar dataKey="duration" name="체류시간(초)" fill="#3f83f8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="stats-details">
              {chartData.map((item, index) => (
                <div key={index} className={`stat-item step-${index + 1}`}>
                  <span className="step-label">{item.step}:</span>
                  <span className="step-value">{item.duration}초</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default StatisticsPage;
