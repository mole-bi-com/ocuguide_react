import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PatientProvider } from './context/PatientContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginForm from './components/Auth/LoginForm';
import HomePage from './pages/HomePage';
import PatientInfoPage from './pages/PatientInfoPage';
import SurgeryInfoPage from './pages/SurgeryInfoPage';
import ChatbotPage from './pages/ChatbotPage';
import StatisticsPage from './pages/StatisticsPage';
import './styles/global.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <PatientProvider>
            <Routes>
              <Route path="/login" element={<LoginForm />} />
              <Route path="/" element={<Navigate to="/home" replace />} />
              <Route path="/home" element={
                <ProtectedRoute>
                  <Layout>
                    <HomePage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/patient-info" element={
                <ProtectedRoute>
                  <Layout>
                    <PatientInfoPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/surgery-info" element={
                <ProtectedRoute>
                  <Layout>
                    <SurgeryInfoPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/chatbot" element={
                <ProtectedRoute>
                  <Layout>
                    <ChatbotPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="/statistics" element={
                <ProtectedRoute>
                  <Layout>
                    <StatisticsPage />
                  </Layout>
                </ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
          </PatientProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;