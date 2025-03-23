import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const SupabaseTestSimple = () => {
  const [status, setStatus] = useState('준비 중...');
  const [error, setError] = useState(null);
  const [tableData, setTableData] = useState([]);
  const [testPatient, setTestPatient] = useState(null);
  const [envVars, setEnvVars] = useState({});
  const [policies, setPolicies] = useState([]);
  
  useEffect(() => {
    checkEnvironmentVariables();
  }, []);
  
  const checkEnvironmentVariables = () => {
    const vars = {
      SUPABASE_URL: process.env.REACT_APP_SUPABASE_URL || '설정되지 않음',
      SUPABASE_KEY: process.env.REACT_APP_SUPABASE_ANON_KEY 
        ? `설정됨 (길이: ${process.env.REACT_APP_SUPABASE_ANON_KEY.length})` 
        : '설정되지 않음',
      API_URL: process.env.REACT_APP_API_URL || '설정되지 않음',
      NODE_ENV: process.env.NODE_ENV || '설정되지 않음'
    };
    
    setEnvVars(vars);
  };
  
  const testSupabaseConnection = async () => {
    try {
      setStatus('Supabase URL 및 키 확인 중...');
      const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
      const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        throw new Error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
      }
      
      setStatus('Supabase 클라이언트 생성 중...');
      const supabase = createClient(supabaseUrl, supabaseKey);
      
      // 세션 정보 확인
      const { data: session } = await supabase.auth.getSession();
      console.log('현재 세션 정보:', session);
      
      setStatus('테이블 목록 조회 중...');
      const { data: tableList, error: tableError } = await supabase
        .from('pg_catalog.pg_tables')
        .select('schemaname, tablename')
        .eq('schemaname', 'public');
        
      if (tableError) {
        setStatus('테이블 목록 조회 실패');
        console.error('Table list error:', tableError);
        
        // Try alternate method
        const { data: altList, error: altError } = await supabase.rpc('list_tables');
        if (altError) {
          console.error('Alternate method error:', altError);
          
          // Try basic table query
          const { data: basicData, error: basicError } = await supabase
            .from('patients')
            .select('count')
            .limit(1);
            
          console.log('기본 쿼리 결과:', basicData, basicError);
          
          if (basicError) {
            throw new Error(`테이블 조회 실패: ${tableError.message}, 대체 방법도 실패: ${altError.message}, 기본 쿼리도 실패: ${basicError.message}`);
          }
          
          setTableData([{ tablename: 'patients (count only)' }]);
        } else {
          setTableData(altList.map(name => ({ tablename: name })));
        }
      } else {
        setTableData(tableList);
      }
      
      // Policy 정보 조회 시도
      try {
        const { data: policyData, error: policyError } = await supabase
          .from('pg_catalog.pg_policies')
          .select('*');
          
        if (!policyError && policyData) {
          setPolicies(policyData);
        } else {
          console.log('정책 정보 조회 실패:', policyError);
        }
      } catch (policyErr) {
        console.error('정책 정보 조회 중 오류:', policyErr);
      }
      
      // Test inserting a test patient
      setStatus('테스트 환자 데이터 생성 중...');
      const testPatientData = {
        patient_number: `TEST-${Date.now()}`,
        patient_name: '테스트 환자',
        gender: '남성',
        birth_date: '2000-01-01',
        age: 23,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data: insertedPatient, error: insertError } = await supabase
        .from('patients')
        .upsert(testPatientData)
        .select();
        
      if (insertError) {
        setStatus('테스트 환자 생성 실패');
        console.error('Insert error details:', insertError);
        
        // 익명 정책 테스트
        const { data: anonTest, error: anonError } = await supabase
          .from('patients')
          .select('count');
          
        console.log('익명 접근 테스트 결과:', anonTest, anonError);
        
        throw new Error(`테스트 환자 생성 실패: ${insertError.message}`);
      }
      
      setTestPatient(insertedPatient?.[0]);
      setStatus('테스트 완료! 모든 기능이 정상 작동합니다.');
    } catch (err) {
      console.error('Supabase test error:', err);
      setError(err.message);
      setStatus('테스트 실패');
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Supabase 연결 테스트</h1>
      
      <div style={{ 
        padding: '15px', 
        backgroundColor: error ? '#f8d7da' : '#d4edda', 
        color: error ? '#721c24' : '#155724',
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>상태:</strong> {status}
        {error && (
          <div style={{ marginTop: '10px' }}>
            <strong>오류:</strong> {error}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>환경 변수 확인</h2>
        <div>
          {Object.entries(envVars).map(([key, value]) => (
            <div key={key}>
              <strong>REACT_APP_{key}:</strong> {value}
            </div>
          ))}
        </div>
      </div>
      
      {tableData.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>테이블 목록</h2>
          <ul>
            {tableData.map((table, index) => (
              <li key={index}>{table.tablename || table}</li>
            ))}
          </ul>
        </div>
      )}
      
      {policies.length > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <h2>RLS 정책 목록</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>테이블</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>정책명</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>역할</th>
                <th style={{ textAlign: 'left', padding: '8px', borderBottom: '1px solid #ddd' }}>명령</th>
              </tr>
            </thead>
            <tbody>
              {policies.map((policy, index) => (
                <tr key={index}>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{policy.tablename}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{policy.policyname}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{policy.roles?.join(', ')}</td>
                  <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{policy.cmd}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {testPatient && (
        <div>
          <h2>테스트 환자 생성 결과</h2>
          <pre style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '10px', 
            borderRadius: '5px',
            overflow: 'auto'
          }}>
            {JSON.stringify(testPatient, null, 2)}
          </pre>
        </div>
      )}
      
      <button 
        onClick={testSupabaseConnection} 
        style={{
          padding: '10px 15px',
          backgroundColor: '#4a90e2',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginTop: '20px'
        }}
      >
        테스트 다시 실행
      </button>
    </div>
  );
};

export default SupabaseTestSimple; 