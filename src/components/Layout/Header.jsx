import React from 'react';
import { useAuthContext } from '../../context/AuthContext';
import './Header.css';

const Header = () => {
  const { user } = useAuthContext();

  return (
    <header className="header">
      <div className="header-title">
        <h1>백내장 길라잡이 OcuGUIDE 👁️</h1>
      </div>
      <div className="user-info">
        {user && (
          <span>환영합니다, {user.name}님</span>
        )}
      </div>
    </header>
  );
};

export default Header;
