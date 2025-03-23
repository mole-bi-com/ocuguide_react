import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ALL_SQL_FUNCTIONS } from '../utils/supabaseTableCreation';

const SupabaseAdminPage = () => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [sqlQuery, setSqlQuery] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  
  // Supabase 클라이언트 생성
  const supabase = createClient(
    process.env.REACT_APP_SUPABASE_URL,
    process.env.REACT_APP_SUPABASE_ANON_KEY
  );
  
  // SQL 함수 실행
  const executeSqlFunction = async (name, sql) => {
    setLoading(true);
    try {
      // RPC 함수를 만들기 위한 SQL 실행
      const { error: createFunctionError } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (createFunctionError) {
        return {
          success: false,
          error: createFunctionError.message
        };
      }
      
      // 만들어진 함수 호출
      const { data, error: callFunctionError } = await supabase.rpc(name);
      
      if (callFunctionError) {
        return {
          success: false,
          error: callFunctionError.message
        };
      }
      
      return {
        success: true,
        data
      };
    } catch (err) {
      console.error(`Failed to execute SQL function ${name}:`, err);
      return {
        success: false,
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };
  
  // SQL 함수를 생성하고 실행하는 함수
  const handleCreateFunction = async (name, sql) => {
    const result = await executeSqlFunction(name, sql);
    setResults(prev => ({
      ...prev,
      [name]: result
    }));
  };
  
  // 모든 SQL 함수 실행
  const handleCreateAllFunctions = async () => {
    setLoading(true);
    const newResults = {};
    
    // exec_sql 함수가 없으면 먼저 생성
    const createExecSqlResult = await createExecSqlFunction();
    newResults.exec_sql = createExecSqlResult;
    
    if (!createExecSqlResult.success) {
      setResults(newResults);
      setLoading(false);
      return;
    }
    
    // 각 함수 순차적으로 생성 및 실행
    for (const { name, sql } of ALL_SQL_FUNCTIONS) {
      const result = await executeSqlFunction(name, sql);
      newResults[name] = result;
    }
    
    setResults(newResults);
    setLoading(false);
  };
  
  // exec_sql 함수 생성
  const createExecSqlFunction = async () => {
    try {
      // exec_sql 함수 정의
      const exec_sql_function = `
        CREATE OR REPLACE FUNCTION exec_sql(sql_query text)
        RETURNS void
        LANGUAGE plpgsql
        SECURITY DEFINER
        AS $$
        BEGIN
          EXECUTE sql_query;
        END;
        $$;
      `;
      
      // SQL 함수 생성
      const { error } = await supabase.rpc('exec_sql', { sql_query: exec_sql_function });
      
      if (error) {
        // 함수가 없을 경우 직접 생성
        const { error: rawError } = await supabase.from('_temp').select('*').limit(1);
        
        if (rawError && rawError.message.includes('permission denied')) {
          return {
            success: false,
            error: 'exec_sql 함수를 생성할 권한이 없습니다. Supabase 대시보드에서 직접 SQL 에디터를 통해 함수를 생성해주세요.'
          };
        }
        
        return {
          success: false,
          error: error.message
        };
      }
      
      return {
        success: true,
        message: 'exec_sql 함수가 성공적으로 생성되었습니다.'
      };
    } catch (err) {
      return {
        success: false,
        error: err.message
      };
    }
  };
  
  // 사용자 정의 SQL 쿼리 실행
  const handleExecuteCustomQuery = async () => {
    if (!sqlQuery.trim()) {
      alert('SQL 쿼리를 입력해주세요.');
      return;
    }
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: sqlQuery });
      
      if (error) {
        setQueryResult({
          success: false,
          error: error.message
        });
      } else {
        setQueryResult({
          success: true,
          data: data || '쿼리가 성공적으로 실행되었습니다.'
        });
      }
    } catch (err) {
      setQueryResult({
        success: false,
        error: err.message
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Supabase 관리</h1>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>필수 함수 생성</h2>
        <p>
          필요한 SQL 함수와 테이블을 생성합니다. 이 작업은 Supabase 데이터베이스 관리자만 수행할 수 있습니다.
        </p>
        <button
          onClick={handleCreateAllFunctions}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#4a90e2',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '처리 중...' : '모든 SQL 함수 생성'}
        </button>
        
        {Object.entries(results).length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <h3>결과</h3>
            {Object.entries(results).map(([name, result]) => (
              <div 
                key={name}
                style={{ 
                  marginBottom: '10px',
                  padding: '10px',
                  backgroundColor: result.success ? '#d4edda' : '#f8d7da',
                  color: result.success ? '#155724' : '#721c24',
                  borderRadius: '5px'
                }}
              >
                <strong>{name}</strong>: {result.success ? '성공' : `실패 - ${result.error}`}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <h2>사용자 정의 SQL 실행</h2>
        <p>
          직접 SQL 쿼리를 실행합니다. 주의: 이 기능은 관리자 계정에서만 사용해야 합니다.
        </p>
        <textarea
          value={sqlQuery}
          onChange={(e) => setSqlQuery(e.target.value)}
          placeholder="실행할 SQL 쿼리를 입력하세요..."
          style={{
            width: '100%',
            minHeight: '150px',
            padding: '10px',
            marginBottom: '10px',
            fontFamily: 'monospace',
            borderRadius: '5px',
            border: '1px solid #ced4da'
          }}
        />
        <button
          onClick={handleExecuteCustomQuery}
          disabled={loading}
          style={{
            padding: '10px 15px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1
          }}
        >
          {loading ? '실행 중...' : 'SQL 실행'}
        </button>
        
        {queryResult && (
          <div 
            style={{ 
              marginTop: '10px',
              padding: '10px',
              backgroundColor: queryResult.success ? '#d4edda' : '#f8d7da',
              color: queryResult.success ? '#155724' : '#721c24',
              borderRadius: '5px'
            }}
          >
            <h3>실행 결과</h3>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '5px',
              overflow: 'auto'
            }}>
              {queryResult.success 
                ? JSON.stringify(queryResult.data, null, 2) 
                : queryResult.error}
            </pre>
          </div>
        )}
      </div>
      
      <div>
        <h2>함수 정의</h2>
        <p>
          아래 SQL 코드를 Supabase SQL 에디터에서 직접 실행하여 필요한 함수를 생성할 수 있습니다.
        </p>
        {ALL_SQL_FUNCTIONS.map(({ name, sql }) => (
          <div key={name} style={{ marginBottom: '20px' }}>
            <h3>{name}</h3>
            <pre style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              borderRadius: '5px',
              overflow: 'auto'
            }}>
              {sql}
            </pre>
            <button
              onClick={() => handleCreateFunction(name, sql)}
              disabled={loading}
              style={{
                padding: '5px 10px',
                backgroundColor: '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '처리 중...' : '이 함수 생성'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SupabaseAdminPage; 