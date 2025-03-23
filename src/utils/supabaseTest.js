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

export default {
  testConnection,
  checkTableStructure,
  listAllTables,
  createRequiredTables
}; 