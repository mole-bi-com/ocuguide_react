import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import './Layout.css';

const Layout = ({ children }) => {
  const { isAuthenticated } = useAuthContext();
  const location = useLocation();
  const isSurgeryInfoPage = location.pathname === '/surgery-info';

  const [isSidebarVisible, setIsSidebarVisible] = useState(!isSurgeryInfoPage);
  const [userHasToggled, setUserHasToggled] = useState(false);

  console.log('Layout Render - Path:', location.pathname);
  console.log('Layout Render - isSurgeryInfoPage:', isSurgeryInfoPage);
  console.log('Layout Render - isSidebarVisible:', isSidebarVisible);
  console.log('Layout Render - userHasToggled:', userHasToggled);

  useEffect(() => {
    console.log('Layout Effect - Path:', location.pathname);
    if (isSurgeryInfoPage) {
      setIsSidebarVisible(userHasToggled);
      console.log('Layout Effect - Set isSidebarVisible (Surgery Page):', userHasToggled);
    } else {
      setIsSidebarVisible(true);
      setUserHasToggled(false);
      console.log('Layout Effect - Set isSidebarVisible (Other Page): true, Reset userHasToggled');
    }
  }, [location.pathname, isSurgeryInfoPage]);

  const handleShowSidebar = () => {
    setIsSidebarVisible(true);
    if (isSurgeryInfoPage) {
      setUserHasToggled(true);
    }
    console.log('handleShowSidebar - Set isSidebarVisible: true, User Has Toggled:', userHasToggled);
  };

  if (!isAuthenticated) {
    console.log('Layout Render - Not Authenticated, returning null');
    return null;
  }

  console.log('Layout Render - Rendering content, isSidebarVisible:', isSidebarVisible);

  return (
    <div className="layout">
      <Header />
      <div className="layout-content">
        {isSidebarVisible && <Sidebar />}
        <main className={`main-content ${!isSidebarVisible ? 'sidebar-hidden' : ''}`}>
          {!isSidebarVisible && (
            <button 
              onClick={handleShowSidebar} 
              className="show-sidebar-button" 
              aria-label="Show Sidebar"
            >
              ☰
            </button>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout; 