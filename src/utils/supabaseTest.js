import { createClient } from '@supabase/supabase-js';

// Environment variables
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Test Supabase connection
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('patients').select('*').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
    
    return {
      success: true,
      message: 'Successfully connected to Supabase',
      data
    };
  } catch (err) {
    console.error('Supabase connection test exception:', err);
    return {
      success: false,
      error: err.message,
      details: err
    };
  }
};

// Check table structure
export const checkTableStructure = async () => {
  try {
    const results = {};
    
    // Check patients table
    const { data: patientsData, error: patientsError } = await supabase
      .from('patients')
      .select('*')
      .limit(1);
      
    results.patients = {
      exists: !patientsError,
      error: patientsError?.message,
      sample: patientsData
    };
    
    // Check sessions table
    const { data: sessionsData, error: sessionsError } = await supabase
      .from('sessions')
      .select('*')
      .limit(1);
      
    results.sessions = {
      exists: !sessionsError,
      error: sessionsError?.message,
      sample: sessionsData
    };
    
    // Check steps table
    const { data: stepsData, error: stepsError } = await supabase
      .from('steps')
      .select('*')
      .limit(1);
      
    results.steps = {
      exists: !stepsError,
      error: stepsError?.message,
      sample: stepsData
    };
    
    // Check doctors table
    const { data: doctorsData, error: doctorsError } = await supabase
      .from('doctors')
      .select('*')
      .limit(1);
      
    results.doctors = {
      exists: !doctorsError,
      error: doctorsError?.message,
      sample: doctorsData
    };
    
    return results;
  } catch (err) {
    console.error('Table structure check failed:', err);
    return {
      success: false,
      error: err.message
    };
  }
};

// Get the list of all tables
export const listAllTables = async () => {
  try {
    // Direct SQL query to get table names
    const { data, error } = await supabase.rpc('list_tables');
    
    if (error) {
      // If RPC fails, try alternative query
      const { data: altData, error: altError } = await supabase
        .from('_supabase_schema_tables')
        .select('name');
      
      if (altError) {
        return {
          success: false,
          error: `${error.message}, Alternative query also failed: ${altError.message}`
        };
      }
      
      return {
        success: true,
        tables: altData.map(table => table.name)
      };
    }

    return {
      success: true,
      tables: data
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};

// Function to create required tables if they don't exist
export const createRequiredTables = async () => {
  try {
    const results = {};
    
    // Create patients table if it doesn't exist
    const { error: patientsError } = await supabase.rpc('create_patients_table');
    results.patients = {
      success: !patientsError,
      error: patientsError?.message
    };
    
    // Create sessions table if it doesn't exist
    const { error: sessionsError } = await supabase.rpc('create_sessions_table');
    results.sessions = {
      success: !sessionsError,
      error: sessionsError?.message
    };
    
    // Create steps table if it doesn't exist
    const { error: stepsError } = await supabase.rpc('create_steps_table');
    results.steps = {
      success: !stepsError,
      error: stepsError?.message
    };
    
    // Create doctors table if it doesn't exist
    const { error: doctorsError } = await supabase.rpc('create_doctors_table');
    results.doctors = {
      success: !doctorsError,
      error: doctorsError?.message
    };
    
    return {
      success: true,
      results
    };
  } catch (err) {
    return {
      success: false,
      error: err.message
    };
  }
};

// 테이블 리스트 가져오기
export const getTablesList = async () => {
  try {
    const { data, error } = await supabase.rpc('list_tables');
    
    if (error) {
      console.error('테이블 목록 조회 실패:', error);
      
      // 대체 방법: patients 테이블 구조 확인
      const { data: tableData, error: tableError } = await supabase
        .from('patients')
        .select('*')
        .limit(1);
        
      if (!tableError) {
        return { success: true, tables: ['patients 테이블 확인됨'], structure: tableData && tableData.length > 0 ? Object.keys(tableData[0]) : [] };
      }
      
      // sessions 테이블 확인
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select('*')
        .limit(1);
        
      if (!sessionsError) {
        return { success: true, tables: ['sessions 테이블 확인됨'], structure: sessionsData && sessionsData.length > 0 ? Object.keys(sessionsData[0]) : [] };
      }
      
      // steps 테이블 확인
      const { data: stepsData, error: stepsError } = await supabase
        .from('steps')
        .select('*')
        .limit(1);
        
      if (!stepsError) {
        return { success: true, tables: ['steps 테이블 확인됨'], structure: stepsData && stepsData.length > 0 ? Object.keys(stepsData[0]) : [] };
      }
      
      return { success: false, message: error.message };
    }
    
    return { success: true, tables: data };
  } catch (error) {
    console.error('Supabase 연결 오류:', error);
    return { success: false, message: error.message };
  }
};

// 테이블 구조 가져오기
export const getTableStructure = async (tableName) => {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    if (error) {
      return { success: false, message: error.message };
    }
    
    // 첫 번째 레코드의 키를 통해 테이블 구조 파악
    const structure = data && data.length > 0 ? Object.keys(data[0]) : [];
    
    return { success: true, structure };
  } catch (error) {
    console.error(`${tableName} 테이블 구조 조회 오류:`, error);
    return { success: false, message: error.message };
  }
};

// Supabase 연결 테스트
export const testSupabaseConnection = async () => {
  try {
    // 간단한 쿼리 실행
    const { data, error } = await supabase
      .from('patients')
      .select('count')
      .limit(1);
    
    if (error) {
      // 다른 테이블 시도
      const { error: sessionsError } = await supabase
        .from('sessions')
        .select('count')
        .limit(1);
      
      if (sessionsError) {
        // 또 다른 테이블 시도
        const { error: stepsError } = await supabase
          .from('steps')
          .select('count')
          .limit(1);
        
        if (stepsError) {
          return { success: false, message: '연결은 성공했으나 모든 테이블에 접근할 수 없습니다.' };
        }
      }
    }
    
    return { success: true, message: 'Supabase 연결 성공!' };
  } catch (error) {
    console.error('Supabase 연결 테스트 오류:', error);
    return { success: false, message: error.message };
  }
};

export default {
  testConnection,
  checkTableStructure,
  listAllTables,
  createRequiredTables,
  getTablesList,
  getTableStructure,
  testSupabaseConnection
}; 