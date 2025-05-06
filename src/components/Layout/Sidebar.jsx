import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { useAppContext } from '../../context/AppContext';
import './Sidebar.css';

const Sidebar = () => {
  const { logout } = useAuthContext();
  const { toggleSpeechMode, isSpeechModeEnabled } = useAppContext();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleToggleSpeechMode = () => {
    toggleSpeechMode();
  };

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        <NavLink to="/home" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span role="img" aria-label="home">🏠</span>
          홈
        </NavLink>
        <NavLink to="/patient-info" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span role="img" aria-label="patient">👨‍⚕️</span>
          환자 정보
        </NavLink>
        <NavLink to="/surgery-info" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span role="img" aria-label="surgery">🏥</span>
          수술 정보
        </NavLink>
        <NavLink to="/post-surgery" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span role="img" aria-label="post-surgery">🗓️</span>
          수술 후 주의사항
        </NavLink>
        <NavLink to="/chatbot" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span role="img" aria-label="chatbot">💬</span>
          챗봇 상담
        </NavLink>
        <NavLink to="/statistics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span role="img" aria-label="statistics">📊</span>
          통계
        </NavLink>
      </nav>
      
      <div className="sidebar-footer">
        <button
          className={`speech-mode-toggle ${isSpeechModeEnabled ? 'active' : ''}`}
          onClick={handleToggleSpeechMode}
        >
          <span role="img" aria-label="speech">
            {isSpeechModeEnabled ? '🔊' : '🔈'}
          </span>
          {isSpeechModeEnabled ? '음성 모드 켜짐' : '음성 모드 꺼짐'}
        </button>
        <button className="logout-button" onClick={handleLogout}>
          <span role="img" aria-label="logout">🚪</span>
          로그아웃
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
