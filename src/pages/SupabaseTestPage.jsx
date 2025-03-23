import React, { useState, useEffect } from 'react';
import { testConnection, checkTableStructure, listAllTables, createRequiredTables } from '../utils/supabaseTest';

const SupabaseTestPage = () => {
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [tableStructure, setTableStructure] = useState(null);
  const [allTables, setAllTables] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [createTableResult, setCreateTableResult] = useState(null);
  const [isCreatingTables, setIsCreatingTables] = useState(false);

  useEffect(() => {
    const runTests = async () => {
      try {
        // Test connection
        const connResult = await testConnection();
        setConnectionStatus(connResult);
        
        // Check table structure
        const structResult = await checkTableStructure();
        setTableStructure(structResult);
        
        // List all tables
        const tablesResult = await listAllTables();
        setAllTables(tablesResult);
      } catch (err) {
        console.error('Test failed:', err);
        setError(err.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };
    
    runTests();
  }, []);
  
  const handleCreateTables = async () => {
    setIsCreatingTables(true);
    try {
      const result = await createRequiredTables();
      setCreateTableResult(result);
      
      // Refresh table structure
      const structResult = await checkTableStructure();
      setTableStructure(structResult);
      
      // Refresh table list
      const tablesResult = await listAllTables();
      setAllTables(tablesResult);
    } catch (err) {
      console.error('Failed to create tables:', err);
      setCreateTableResult({
        success: false,
        error: err.message || 'Unknown error occurred'
      });
    } finally {
      setIsCreatingTables(false);
    }
  };
  
  // SQL template for creating tables
  const patientsTableSql = `
CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_number TEXT UNIQUE NOT NULL,
  patient_name TEXT NOT NULL,
  gender TEXT,
  birth_date TEXT,
  age INTEGER,
  primary_doctor TEXT,
  surgery_eye TEXT,
  surgery_date TEXT,
  surgery_time TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  emergency_contact TEXT,
  emergency_phone TEXT,
  medical_history TEXT,
  allergies TEXT,
  medications TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`;

  const sessionsTableSql = `
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  patient_number TEXT REFERENCES patients(patient_number),
  start_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN DEFAULT false
);`;

  const stepsTableSql = `
CREATE TABLE IF NOT EXISTS steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID REFERENCES sessions(id),
  step_id INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_seconds INTEGER NOT NULL
);`;

  const doctorsTableSql = `
CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  specialty TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);`;
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Supabase 상태 확인</h1>
      
      {loading ? (
        <div>테스트 실행 중...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>
          <h2>오류 발생</h2>
          <p>{error}</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: '30px' }}>
            <h2>연결 상태</h2>
            <div style={{ 
              padding: '15px', 
              backgroundColor: connectionStatus?.success ? '#d4edda' : '#f8d7da',
              color: connectionStatus?.success ? '#155724' : '#721c24',
              borderRadius: '5px'
            }}>
              {connectionStatus?.success 
                ? '✅ Supabase에 성공적으로 연결되었습니다.' 
                : `❌ Supabase 연결 실패: ${connectionStatus?.error}`}
            </div>
            {connectionStatus?.data && (
              <div style={{ marginTop: '10px' }}>
                <h3>샘플 데이터:</h3>
                <pre style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '10px', 
                  borderRadius: '5px',
                  overflow: 'auto'
                }}>
                  {JSON.stringify(connectionStatus.data, null, 2)}
                </pre>
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <h2>테이블 구조</h2>
            {tableStructure && Object.entries(tableStructure).map(([tableName, info]) => (
              <div key={tableName} style={{ marginBottom: '20px' }}>
                <h3>{tableName}</h3>
                <div style={{ 
                  padding: '15px', 
                  backgroundColor: info.exists ? '#d4edda' : '#f8d7da',
                  color: info.exists ? '#155724' : '#721c24',
                  borderRadius: '5px',
                  marginBottom: '10px'
                }}>
                  {info.exists 
                    ? `✅ ${tableName} 테이블이 존재합니다.` 
                    : `❌ ${tableName} 테이블이 존재하지 않습니다: ${info.error}`}
                </div>
                {info.sample && info.sample.length > 0 && (
                  <div>
                    <h4>샘플 데이터:</h4>
                    <pre style={{ 
                      backgroundColor: '#f8f9fa', 
                      padding: '10px', 
                      borderRadius: '5px',
                      overflow: 'auto'
                    }}>
                      {JSON.stringify(info.sample, null, 2)}
                    </pre>
                  </div>
                )}
                {info.sample && info.sample.length > 0 && (
                  <div>
                    <h4>스키마:</h4>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse', 
                      marginTop: '10px',
                      border: '1px solid #dee2e6'
                    }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8f9fa' }}>
                          <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>필드</th>
                          <th style={{ border: '1px solid #dee2e6', padding: '8px', textAlign: 'left' }}>타입</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(info.sample[0] || {}).map(([field, value]) => (
                          <tr key={field}>
                            <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>{field}</td>
                            <td style={{ border: '1px solid #dee2e6', padding: '8px' }}>{typeof value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <h2>모든 테이블 목록</h2>
            {allTables?.success ? (
              <ul style={{ listStyleType: 'none', padding: 0 }}>
                {allTables.tables && allTables.tables.map((table, index) => (
                  <li key={index} style={{ 
                    padding: '10px',
                    marginBottom: '5px',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '5px'
                  }}>
                    {table}
                  </li>
                ))}
              </ul>
            ) : (
              <div style={{ color: 'red' }}>
                테이블 목록을 가져오는데 실패했습니다: {allTables?.error}
              </div>
            )}
          </div>
          
          <div style={{ marginBottom: '30px' }}>
            <h2>필요한 테이블 생성</h2>
            <button 
              onClick={handleCreateTables} 
              disabled={isCreatingTables}
              style={{
                padding: '10px 15px',
                backgroundColor: '#4a90e2',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isCreatingTables ? 'not-allowed' : 'pointer',
                opacity: isCreatingTables ? 0.7 : 1
              }}
            >
              {isCreatingTables ? '테이블 생성 중...' : '필요한 테이블 생성'}
            </button>
            
            {createTableResult && (
              <div style={{ 
                marginTop: '10px', 
                padding: '15px', 
                backgroundColor: createTableResult.success ? '#d4edda' : '#f8d7da',
                color: createTableResult.success ? '#155724' : '#721c24',
                borderRadius: '5px'
              }}>
                {createTableResult.success 
                  ? '✅ 테이블이 성공적으로 생성되었습니다.' 
                  : `❌ 테이블 생성 실패: ${createTableResult.error}`}
                {createTableResult.results && (
                  <pre style={{ 
                    backgroundColor: '#f8f9fa', 
                    padding: '10px', 
                    borderRadius: '5px',
                    marginTop: '10px',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(createTableResult.results, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
          
          <div>
            <h2>SQL 테이블 생성 코드</h2>
            <div style={{ marginBottom: '20px' }}>
              <h3>patients 테이블</h3>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto'
              }}>
                {patientsTableSql}
              </pre>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>sessions 테이블</h3>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto'
              }}>
                {sessionsTableSql}
              </pre>
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <h3>steps 테이블</h3>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto'
              }}>
                {stepsTableSql}
              </pre>
            </div>
            
            <div>
              <h3>doctors 테이블</h3>
              <pre style={{ 
                backgroundColor: '#f8f9fa', 
                padding: '10px', 
                borderRadius: '5px',
                overflow: 'auto'
              }}>
                {doctorsTableSql}
              </pre>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SupabaseTestPage; 