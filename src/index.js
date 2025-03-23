// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

console.log('React application starting...');
console.log('Environment:', process.env.NODE_ENV);
console.log('React version:', React.version);

try {
  console.log('Initializing React root...');
  const root = ReactDOM.createRoot(document.getElementById('root'));
  
  console.log('Rendering React application...');
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  console.log('React application rendered successfully');
} catch (error) {
  console.error('Failed to render React application:', error);
  document.getElementById('root').innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h1 style="color: #dc3545;">애플리케이션 로드 오류</h1>
      <p>앱을 로드하는 중 오류가 발생했습니다. 다음 오류 정보를 확인하세요:</p>
      <pre style="background: #f8f9fa; padding: 15px; text-align: left; border-radius: 5px; margin-top: 20px;">
        ${error.message}\n${error.stack}
      </pre>
    </div>
  `;
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();