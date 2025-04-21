import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PatientProvider } from './context/PatientContext';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import LoginForm from './components/Auth/LoginForm';
import './styles/global.css';

// 지연 로딩을 위한 컴포넌트 설정
const HomePage = lazy(() => import('./pages/HomePage'));
const PatientInfoPage = lazy(() => import('./pages/PatientInfoPage'));
const ChatbotPage = lazy(() => import('./pages/ChatbotPage'));
const StatisticsPage = lazy(() => import('./pages/StatisticsPage'));
const SupabaseTestPage = lazy(() => import('./pages/SupabaseTestPage'));
const SupabaseAdminPage = lazy(() => import('./pages/SupabaseAdminPage'));
const SupabaseTestSimple = lazy(() => import('./pages/SupabaseTestSimple'));
const SurgeryInfoPage = lazy(() => import('./pages/SurgeryInfoPage'));

// 로딩 컴포넌트
const LoadingFallback = () => (
  <div className="loading-container">
    <div className="loading-spinner"></div>
    <p>페이지를 불러오는 중...</p>
  </div>
);

function App() {
  console.log('App component rendering...');
  
  return (
    <Router>
      <AuthProvider>
        <AppProvider>
          <PatientProvider>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                <Route path="/login" element={<LoginForm />} />
                <Route path="/" element={<LoginForm />} />
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
                <Route path="/supabase-test" element={
                  <ProtectedRoute>
                    <Layout>
                      <SupabaseTestPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/supabase-admin" element={
                  <ProtectedRoute>
                    <Layout>
                      <SupabaseAdminPage />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="/supabase-simple" element={<SupabaseTestSimple />} />
                <Route path="/supabase-simple-protected" element={
                  <ProtectedRoute>
                    <Layout>
                      <SupabaseTestSimple />
                    </Layout>
                  </ProtectedRoute>
                } />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </Routes>
            </Suspense>
          </PatientProvider>
        </AppProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;