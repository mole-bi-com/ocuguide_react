// src/pages/HomePage.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  return (
    <div className="home-page">
      <div className="hero-section">
        <h1 className="main-title">
          <span className="highlight">백내장 길라잡이</span> OcuGUIDE <span role="img" aria-label="eye">👁️</span>
        </h1>
        
        <div className="intro-text">
          <p>
            <strong>OcuGuide <span role="img" aria-label="eye in speech bubble">👁️‍🗨️</span>는 <span className="highlight-blue">세브란스</span> 안과 전문 의료진과 함께 백내장 수술에 대한 맞춤형 정보를 제공하여, 환자분들의 건강과 회복을 돕기 위한 서비스입니다.</strong>
          </p>
          <p>
            이곳에서 제공하는 자료와 맞춤형 정보로 백내장 수술을 준비하고, 궁금한 사항에 대해 자유롭게 문의하세요.
          </p>
        </div>
      </div>
      
      <div className="features-section">
        <h2>OcuGuide의 주요 기능</h2>
        <ul className="features-list">
          <li>
            <span className="feature-icon">✔️</span>
            <span className="feature-text"><strong>환자 맞춤형 정보</strong>: 초기 검사결과를 기반으로 환자 개개인에게 맞춤형 정보를 제공합니다.</span>
          </li>
          <li>
            <span className="feature-icon">ℹ️</span>
            <span className="feature-text"><strong>수술 안내 정보</strong>: 백내장 수술 과정과 주의사항에 대해 단계별로 안내합니다.</span>
          </li>
          <li>
            <span className="feature-icon">❔</span>
            <span className="feature-text"><strong>전문 의료진과의 소통</strong>: 챗봇을 통해 궁금한 사항에 대해 신속하게 답변을 받을 수 있습니다.</span>
          </li>
        </ul>
      </div>
      
      <div className="cta-section">
        <h2>백내장 수술 안내 시작하기</h2>
        <p>백내장 수술에 대한 맞춤형 정보를 받아보세요.</p>
        <div className="cta-buttons">
          <Link to="/patient-info" className="cta-button primary">
            환자 정보 등록하기
          </Link>
          <Link to="/surgery-info" className="cta-button secondary">
            백내장 수술 정보 보기
          </Link>
        </div>
      </div>
      
      <div className="trust-section">
        <h2>최고의 의료 지식과 경험</h2>
        <p>
          <a href="https://sev-eye.severance.healthcare/sev-eye/index.do" target="_blank" rel="noopener noreferrer">
            세브란스 안과병원
          </a>은 최신 의료 지식과 최고의 수술 경험을 바탕으로 환자들에게 신뢰할 수 있는 정보를 제공합니다.
        </p>
        <div className="logos">
          <img src="/assets/images/sev-eye_logo.png" alt="세브란스 안과병원 로고" className="hospital-logo" />
          <img src="/assets/images/ocuguide_logo.png" alt="OcuGuide 로고" className="app-logo" />
        </div>
      </div>
    </div>
  );
};

export default HomePage;