// src/services/api.js
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Environment variables with fallbacks
const API_URL = process.env.REACT_APP_API_URL || 'https://api.example.com';
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || '';
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://rktuabhlsbfjgvrroqxw.supabase.co';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJrdHVhYmhsc2Jmamd2cnJvcXh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI3MTczMjYsImV4cCI6MjA1ODI5MzMyNn0.4Hr0f3FvhpCjx-QWExVws7TIqsYdgEyl5MdM_T6qOlE';

console.log('API Configuration:');
console.log('- SUPABASE_URL:', SUPABASE_URL ? SUPABASE_URL.substring(0, 15) + '...' : 'undefined');
console.log('- SUPABASE_KEY length:', SUPABASE_KEY ? SUPABASE_KEY.length : 'undefined');

// Initialize Supabase client
let supabase;

try {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Failed to initialize Supabase client:', error);
  // Fallback mock client
  supabase = {
    from: (table) => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      eq: () => ({ single: () => Promise.resolve({ data: null, error: null }) })
    }),
    auth: {
      getSession: () => Promise.resolve({ data: { session: null }, error: null })
    },
    rpc: () => Promise.resolve({ data: [], error: null })
  };
}

// General API request function
const apiRequest = async (method, endpoint, data = null, headers = {}) => {
  try {
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      data,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
    
    return response.data;
  } catch (error) {
    console.error(`API request failed: ${error.message}`);
    throw error;
  }
};

// Patient information
export const savePatientInfo = async (patientData) => {
  try {
    console.log('Saving patient data:', patientData);
    console.log('Supabase URL:', SUPABASE_URL);
    console.log('Supabase key length:', SUPABASE_KEY ? SUPABASE_KEY.length : 'undefined');
    
    // Validate required fields
    if (!patientData.patient_number) {
      throw new Error('환자번호는 필수입니다.');
    }
    
    if (!patientData.patient_name) {
      throw new Error('환자 이름은 필수입니다.');
    }
    
    // Upsert patient data
    console.log('Attempting to upsert patient data...');
    const { data, error } = await supabase
      .from('patients')
      .upsert(
        {
          ...patientData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { 
          onConflict: 'patient_number',
          returning: 'minimal' // 데이터 반환 최소화
        }
      );
      
    if (error) {
      console.error('Supabase error details:', JSON.stringify(error));
      
      // RLS 정책 오류 처리
      if (error.message && error.message.includes('row-level security policy')) {
        console.error('RLS 정책 오류 - 사용자 인증 상태 확인:', await supabase.auth.getSession());
        
        // anonymous 사용자로 public 접근 시도
        const { data: publicData, error: publicError } = await supabase
          .from('patients')
          .select('count')
          .limit(1);
          
        console.log('Public 접근 테스트 결과:', publicData, publicError);
        
        throw new Error('데이터 저장 권한이 없습니다. 관리자에게 문의하세요.');
      }
      
      throw error;
    }
    
    console.log('Patient data saved successfully:', data);
    return data;
  } catch (error) {
    console.error('Error saving patient data:', error);
    console.error('Error message:', error.message);
    console.error('Error details:', JSON.stringify(error, null, 2));
    throw error;
  }
};

export const getPatientInfo = async (patientNumber) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patient_number', patientNumber)
      .single();
      
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  } catch (error) {
    console.error('Error fetching patient data:', error);
    throw error;
  }
};

// Session tracking
export const startSession = async (patientNumber) => {
  try {
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        patient_number: patientNumber,
        start_time: new Date().toISOString(),
        is_completed: false
      })
      .select();
      
    if (error) throw error;
    return data?.[0]?.id;
  } catch (error) {
    console.error('Error starting session:', error);
    throw error;
  }
};

export const completeSession = async (sessionId) => {
  try {
    const { error } = await supabase
      .from('sessions')
      .update({
        end_time: new Date().toISOString(),
        is_completed: true
      })
      .eq('id', sessionId);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error completing session:', error);
    throw error;
  }
};

// Step tracking
export const trackStepProgress = async (sessionId, stepData) => {
  try {
    // 먼저 steps 테이블 구조 확인
    const { data: tableInfo, error: tableError } = await supabase
      .from('steps')
      .select('*')
      .limit(1);
    
    // steps 테이블에 understanding_level 필드가 있는지 확인
    let hasUnderstandingLevel = false;
    
    if (!tableError && tableInfo && tableInfo.length > 0) {
      hasUnderstandingLevel = 'understanding_level' in tableInfo[0];
    }
    
    // 테이블 구조에 따라 삽입할 데이터 구성
    const insertData = {
      session_id: sessionId,
      step_id: stepData.stepId,
      step_name: stepData.stepName,
      start_time: stepData.startTime,
      end_time: stepData.endTime,
      duration_seconds: stepData.durationSeconds
    };
    
    // understanding_level 필드가 있는 경우만 추가
    if (hasUnderstandingLevel) {
      insertData.understanding_level = stepData.understandingLevel || 0;
    }
    
    const { error } = await supabase
      .from('steps')
      .insert(insertData);
      
    if (error) {
      console.error('Steps 데이터 삽입 중 오류:', error);
      
      // 오류가 컬럼 관련이면 understanding_level을 제외하고 다시 시도
      if (error.message && error.message.includes('understanding_level')) {
        const { retryError } = await supabase
          .from('steps')
          .insert({
            session_id: sessionId,
            step_id: stepData.stepId,
            step_name: stepData.stepName,
            start_time: stepData.startTime,
            end_time: stepData.endTime,
            duration_seconds: stepData.durationSeconds
          });
          
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error tracking step progress:', error);
    // 오류가 발생해도 앱 실행에 영향을 주지 않도록 true 반환
    return true;
  }
};

// Statistics
export const getPatientStats = async () => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching patient statistics:', error);
    throw error;
  }
};

export const getStepStats = async () => {
  try {
    const { data, error } = await supabase
      .from('steps')
      .select(`
        *,
        sessions:session_id (
          patient_number
        )
      `);
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching step statistics:', error);
    throw error;
  }
};

// Get understanding level statistics
export const getUnderstandingStats = async () => {
  try {
    const { data, error } = await supabase
      .rpc('get_understanding_level_stats');
      
    if (error) {
      console.error('이해도 통계 가져오기 오류:', error);
      return []; // 오류 발생시 빈 배열 반환
    }
    
    // 응답 형식 처리: 배열 안에 객체로 래핑된 배열이 있는 형태
    if (Array.isArray(data) && data.length > 0 && data[0].get_understanding_level_stats) {
      return data[0].get_understanding_level_stats;
    }
    
    // 다른 형식이거나 빈 응답인 경우
    return [];
  } catch (error) {
    console.error('Error fetching understanding statistics:', error);
    return []; // 오류 발생시 빈 배열 반환
  }
};

// Doctor information
export const getDoctorsList = async () => {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*');
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error;
  }
};

// Patient diagnosis
export const getDiagnosisDraft = async (message) => {
  try {
    // 시스템 메시지 설정
    const systemMessage = {
      role: "system",
      content: `당신은 백내장 수술 경험이 많은 안과 전문의 입니다.
      지금부터 환자의 최초 검진결과로부터 환자의 상태를 진단하고, 이에 대한 종합소견을 밝힙니다.
      최초 검진은 다음 여섯개의 항목으로 분류됩니다.
      #1.전안부, #2.각막, #3.전방, #4. 수정체, #5.망막, #6.시신경

      지금부터 아래의 지시사항에 따라서, 답변을 생성합니다.
      #지시사항(instructions)
      1. 환자가 불안하지 않도록 친절하게 답변합니다.
      2. 위험한 항목이 검진되었음에도, 위험성을 낮게 진단해서는 절대 안됩니다. 중복된 내용 중 세부사항은 최대한 포함합니다.
      3. 함께 제공된 환자정보에서 나이와 수술 부위에 대한 당신의 생각을 덧붙여주세요. 특히, 나이에 따른 회복정도, 주의사항 등을 추가합니다.
      4. 현재와 수술 날짜까지의 기간을 밝힙니다. 이 때,[한달전, 일주일전, 당일]로 구간을 나눈 후, 해당되는 기간이 있을 경우, 각각의 기간에 주의사항 및 수술을 위해 준비할 사항을 추가합니다.`
    };
    
    // 메시지 포맷
    const messages = [
      systemMessage,
      { role: 'user', content: message.content }
    ];
    
    // OpenAI API 호출
    const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        model: 'gpt-4o-mini', // 또는 다른 모델
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // 응답 텍스트 반환
    return response.data.choices[0].message.content;
    
  } catch (error) {
    console.error('Error generating diagnosis:', error);
    // API 호출 실패 시 대체 응답
    if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
      return '죄송합니다. OpenAI API 키가 설정되지 않았습니다. 환경 설정을 확인해주세요.';
    }
    return '죄송합니다. 진단을 생성하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

// Chat functions
export const sendChatMessage = async (message, previousMessages = []) => {
  try {
    // Format system message
    const systemMessage = {
      role: "system", 
      content: `당신은 백내장 수술 경험이 많은 안과 전문의 입니다.
      지금부터 당신은 백내장 수술에 관한 환자의 질문에 대답합니다.
      이 때, 반드시 아래의 지시사항에 따라서 답변을 생성합니다.
      #지시사항(instructions)
      1. 답변은 반드시 의학적 사실에 기반을 두어야하고, 근거가 없는 사실을 만들어내서는 안됩니다.
      2. 답변은 정확하고 핵심이 분명하면서도, 환자들이 불안하지 않도록 친절하게 답변합니다.
      3. 우선, 당신만의 답변을 만들 후에, 일반인이 이해할 수 있는 수준으로 대답을 정리합니다. 이 때, 어려운 용어는 설명을 짧게 덧붙입니다.
      4. 백내장 수술이나 안과와 관련이 없는 질문에는 대답할 수 없다고 말합니다.`
    };
    
    // Create message array for API
    const formattedMessages = [
      systemMessage, 
      ...previousMessages.filter(m => m.role === 'user' || m.role === 'assistant'),
      { role: 'user', content: message }
    ];
    
    // API 호출을 위한 기본 설정
    const OPENAI_API_ENDPOINT = 'https://api.openai.com/v1/chat/completions';
    
    // OpenAI API 호출
    const response = await axios.post(
      OPENAI_API_ENDPOINT,
      {
        model: 'gpt-4o-mini', // 또는 다른 모델 (gpt-3.5-turbo, gpt-4)
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );
    
    // 응답 텍스트 반환
    return response.data.choices[0].message.content;
    
  } catch (error) {
    console.error('Error sending chat message:', error);
    // API 호출 실패 시 대체 응답
    if (!OPENAI_API_KEY || OPENAI_API_KEY === '') {
      return '죄송합니다. OpenAI API 키가 설정되지 않았습니다. 환경 설정을 확인해주세요.';
    }
    return '죄송합니다. 응답을 생성하는 중에 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
  }
};

// Audio related functions
export const textToSpeech = async (text) => {
  try {
    // OpenAI Text-to-Speech API 호출
    const OPENAI_TTS_ENDPOINT = 'https://api.openai.com/v1/audio/speech';
    
    const response = await axios.post(
      OPENAI_TTS_ENDPOINT,
      {
        model: 'tts-1', // 또는 tts-1-hd
        input: text,
        voice: 'alloy', // 또는 echo, fable, onyx, nova, shimmer
        response_format: 'mp3'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        responseType: 'arraybuffer'
      }
    );
    
    // Convert the ArrayBuffer response to a Blob
    const audioBlob = new Blob([response.data], { type: 'audio/mp3' });
    
    // Create a Data URL from the Blob
    const audioUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
    
    return audioUrl;
  } catch (error) {
    console.error('Error converting text to speech:', error);
    // 오류 발생 시 대체 오디오 URL 반환
    return '/assets/audio/sample_speech.mp3';
  }
};

export const speechToText = async (audioBlob) => {
  try {
    // OpenAI Speech-to-Text API 호출
    const OPENAI_STT_ENDPOINT = 'https://api.openai.com/v1/audio/transcriptions';
    
    // FormData 객체 생성
    const formData = new FormData();
    formData.append('file', audioBlob, 'recording.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'ko'); // 한국어 지정
    
    const response = await axios.post(
      OPENAI_STT_ENDPOINT,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'multipart/form-data'
        }
      }
    );
    
    // 변환된 텍스트 반환
    return response.data.text;
  } catch (error) {
    console.error('Error converting speech to text:', error);
    // API 호출 실패 시 
    if (error.response && error.response.status === 400) {
      return "음성이 인식되지 않았습니다. 다시 시도해주세요.";
    }
    return "음성 인식 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
  }
};

// 환자별 진행 상태 가져오기
export const getPatientProgress = async () => {
  try {
    // 환자별로 마지막 진행 단계와 완료율을 계산하는 쿼리
    const { data, error } = await supabase
      .from('sessions')
      .select(`
        id,
        patient_number,
        is_completed,
        steps:steps (
          step_id,
          step_name,
          end_time
        )
      `)
      .order('start_time', { ascending: false });
      
    if (error) {
      console.error('환자 진행 상태 가져오기 오류:', error);
      return [];
    }
    
    // 환자별 진행 상태 처리
    const patientProgressMap = {};
    
    // 각 세션의 데이터 처리
    data.forEach(session => {
      const patientNumber = session.patient_number;
      const steps = session.steps || [];
      const completedSteps = steps.filter(step => step.end_time);
      const completionRate = steps.length > 0 ? Math.round((completedSteps.length / 6) * 100) : 0; // 총 6단계 가정
      
      // 진행 중인 단계 (마지막으로 완료된 단계의 다음 단계)
      let lastCompletedStepId = -1;
      let currentStepName = '시작 전';
      
      if (completedSteps.length > 0) {
        // 완료된 단계를 단계 ID 기준으로 정렬
        const sortedSteps = [...completedSteps].sort((a, b) => {
          const stepIdA = parseInt(a.step_id);
          const stepIdB = parseInt(b.step_id);
          return stepIdA - stepIdB;
        });
        
        const lastStep = sortedSteps[sortedSteps.length - 1];
        lastCompletedStepId = parseInt(lastStep.step_id);
        
        if (lastCompletedStepId < 5) { // 0부터 5까지 6단계
          currentStepName = `${lastCompletedStepId + 1}단계 진행 중`;
        } else {
          currentStepName = '모든 단계 완료';
        }
      }
      
      // 환자별 최신 데이터만 유지
      if (!patientProgressMap[patientNumber] || 
          new Date(session.start_time) > new Date(patientProgressMap[patientNumber].last_session_time)) {
        patientProgressMap[patientNumber] = {
          patient_number: patientNumber,
          completed_steps: completedSteps.length,
          total_steps: 6, // 총 6단계 가정
          completion_rate: completionRate,
          current_step: currentStepName,
          is_completed: session.is_completed,
          last_session_time: session.start_time
        };
      }
    });
    
    return Object.values(patientProgressMap);
  } catch (error) {
    console.error('환자 진행 상태 가져오기 오류:', error);
    return [];
  }
};

// Export all functions as a single default export
export default {
  getDoctorsList,
  getDiagnosisDraft,
  sendChatMessage,
  textToSpeech,
  speechToText,
  savePatientInfo,
  getPatientInfo,
  startSession,
  completeSession,
  trackStepProgress,
  getPatientStats,
  getStepStats,
  getUnderstandingStats,
  getPatientProgress
};