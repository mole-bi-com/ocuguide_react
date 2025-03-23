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
    const { error } = await supabase
      .from('steps')
      .insert({
        session_id: sessionId,
        step_id: stepData.stepId,
        step_name: stepData.stepName,
        start_time: stepData.startTime,
        end_time: stepData.endTime,
        duration_seconds: stepData.durationSeconds,
        understanding_level: stepData.understandingLevel || 0
      });
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error tracking step progress:', error);
    throw error;
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
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching understanding statistics:', error);
    throw error;
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
    // This would actually call an API endpoint
    // For demo purposes, we're simulating a response
    
    // In a real app, you would send this to your backend
    // which would call OpenAI or a similar service
    const messages = [
      {
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
      },
      message
    ];
    
    // Simulate API call response
    // In a real app, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
    
    // Sample response - in a real app, this would be generated by the API
    const diagnosisText = createSampleDiagnosis(message.content);
    
    return diagnosisText;
  } catch (error) {
    console.error('Error getting diagnosis draft:', error);
    throw error;
  }
};

// Helper function to generate a sample diagnosis (for demo purposes)
function createSampleDiagnosis(messageContent) {
  // Extract patient name from the message
  const nameMatch = messageContent.match(/이름\s*:\s*([^,]+)/);
  const patientName = nameMatch ? nameMatch[1].trim() : "환자";
  
  // Check what diagnosis items are mentioned
  const hasCornealIssue = messageContent.includes("각막") && !messageContent.includes("각막\": []");
  const hasAnteriorIssue = messageContent.includes("전방") && !messageContent.includes("전방\": []");
  const hasLensIssue = messageContent.includes("수정체") && !messageContent.includes("수정체\": []");
  const hasRetinaIssue = messageContent.includes("망막") && !messageContent.includes("망막\": []");
  const hasNerveIssue = messageContent.includes("시신경") && !messageContent.includes("시신경\": []");
  const hasExteriorIssue = messageContent.includes("전안부") && !messageContent.includes("전안부\": []");
  
  let diagnosisText = "";
  
  // High risk issues (lens, anterior chamber, cornea)
  if (hasLensIssue || hasAnteriorIssue || hasCornealIssue) {
    diagnosisText += `${patientName}님은 일반적인 경우와 비교하여 위험요인을 추가로 가지고 있는 상태입니다.\n`;
    diagnosisText += `따라서 백내장 수술의 난이도가 높고, 수술의 범위가 커질 가능성이 있습니다.\n\n`;
    
    if (hasCornealIssue) {
      diagnosisText += `또한 현재 가지고 계신 각막질환으로 인하여, 백내장 수술 후에도 시력호전에 제한이 있을 수 있습니다.\n`;
      
      if (messageContent.includes("내피세포 이상")) {
        diagnosisText += `각막내피세포의 저하로 수술 이후 각막부종이 나타날 수 있으며, 이로 인한 시력저하가 지속될 시 각막이식술을 고려할 수 있습니다.\n\n`;
      }
    }
    
    if (hasRetinaIssue || hasNerveIssue) {
      diagnosisText += `이와 더불어 망막 또는 시신경 관련 질환으로 인해 수술 후 시력 회복에 추가적인 제한이 있을 수 있습니다.\n\n`;
    }
  } 
  // Medium risk issues (retina, nerve)
  else if (hasRetinaIssue || hasNerveIssue) {
    diagnosisText += `${patientName}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.\n`;
    diagnosisText += `하지만 백내장 수술 후에도 망막 또는 시신경 질환으로 인해 시력호전에 제한이 있을 수 있습니다.\n\n`;
  }
  // Low risk issues (exterior)
  else if (hasExteriorIssue) {
    diagnosisText += `${patientName}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.\n`;
    diagnosisText += `하지만 수술 후 건성안 증상이 악화될 수 있어서 이에 대한 지속적인 관리가 필요합니다.\n\n`;
  }
  // No issues
  else {
    diagnosisText += `${patientName}님께서는 백내장 수술의 위험성이 낮고, 합병증 발생 가능성이 높지 않은 상태입니다.\n\n`;
  }
  
  // Add surgery preparation information
  diagnosisText += `수술 전날에는 충분한 휴식을 취하시고, 음주는 피하시길 권장합니다. 수술 당일에는 가벼운 식사 후 수술 2시간 전에 내원하시면 됩니다.\n\n`;
  
  // Add recovery information 
  diagnosisText += `수술 후에는 1주일간 눈을 비비거나 물이 들어가지 않도록 주의하셔야 합니다. 처방된 안약은 정해진 시간에 맞춰 점안해주시고, 이상 증상 발생 시 바로 내원하셔야 합니다.\n\n`;
  
  // Add final message
  diagnosisText += `수술 시에는 불가항력적인 상황이 발생할 수 있지만, 저희 세브란스 안과 병원 의료진은 ${patientName}님께서 최고의 결과를 얻을 수 있도록 최선의 노력을 다하겠습니다.`;
  
  return diagnosisText;
}

// Chat functions
export const sendChatMessage = async (message, previousMessages = []) => {
  try {
    // Simulate API call to OpenAI or similar service
    // In a real app, this would call your backend
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate delay
    
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
    
    // Sample responses based on message contents
    let response;
    
    if (message.toLowerCase().includes('백내장')) {
      response = "백내장은 노화, 외상, 약물, 질병 등 다양한 원인으로 인해 눈의 수정체가 혼탁해지는 질환입니다. 주요 증상으로는 시력 저하, 빛 번짐, 색 구분 어려움 등이 있습니다. 초기에는 안경 도수 조정으로 개선할 수 있지만, 진행된 백내장은 수술을 통해 혼탁해진 수정체를 제거하고 인공수정체를 삽입하는 치료가 필요합니다. 수술은 대부분 국소마취로 30분 이내에 완료되며, 당일 퇴원이 가능합니다.";
    } 
    else if (message.toLowerCase().includes('수술')) {
      response = "백내장 수술은 혼탁해진 수정체를 제거하고 인공수정체를 삽입하는 과정입니다. 일반적으로 30분 이내에 완료되며, 국소마취로 진행됩니다. 수술 전에는 산동제를 점안하여 동공을 확대하고, 수술 중에는 초음파를 이용해 수정체를 분쇄하여 제거합니다(초음파유화술). 수술 후에는 약 1-2주 동안 안약을 사용하게 되며, 눈을 비비거나 물이 들어가지 않도록 주의해야 합니다. 대부분의 환자는 수술 다음날부터 일상생활이 가능하며, 시력은 점차 개선됩니다.";
    }
    else if (message.toLowerCase().includes('부작용') || message.toLowerCase().includes('합병증')) {
      response = "백내장 수술은 매우 안전한 수술이지만, 모든 수술과 마찬가지로 일부 위험성이 있습니다. 일반적인 부작용으로는 일시적인 안구 충혈, 이물감, 빛 번짐 등이 있으며 대부분 자연적으로 호전됩니다. 드물게 발생할 수 있는 합병증으로는 안내염(감염), 망막박리, 황반부종, 인공수정체 위치 이상, 안압 상승 등이 있습니다. 이러한 심각한 합병증의 발생률은 매우 낮으며(약 0.1% 미만), 적절한 치료를 통해 대부분 해결 가능합니다. 수술 후 심한 통증, 갑작스러운 시력 저하, 심한 충혈 등이 나타나면 즉시 병원을 방문하셔야 합니다.";
    }
    else if (message.toLowerCase().includes('회복') || message.toLowerCase().includes('주의사항')) {
      response = "백내장 수술 후 회복은 개인차가 있지만, 보통 1-2주 내에 일상생활이 가능합니다. 회복 기간 동안 다음 주의사항을 지켜주세요:\n\n1. 눈을 비비거나 만지지 마세요.\n2. 처방받은 안약을 정확한 시간에 점안하세요.\n3. 수술 후 1주일간은 세안, 샤워 시 눈에 물이 들어가지 않도록 주의하세요.\n4. 수영, 사우나, 목욕탕은 약 1개월간 피하세요.\n5. 심한 운동이나 무거운 물건 들기는 피하세요.\n6. 운전은 의사의 허락이 있을 때까지 삼가세요.\n7. 텔레비전 시청이나 독서는 적당히 하되 눈이 피로하면 충분히 쉬세요.\n\n수술 후 급격한 시력 저하, 심한 통증, 충혈 등의 증상이 있으면 즉시 병원에 내원하셔야 합니다.";
    }
    else {
      response = "안녕하세요, 백내장 수술에 관해 궁금하신 점이 있으시면 말씀해주세요. 백내장의 원인, 증상, 진단, 수술 과정, 회복 과정 등 다양한 정보를 제공해드릴 수 있습니다.";
    }
    
    return response;
  } catch (error) {
    console.error('Error sending chat message:', error);
    throw error;
  }
};

// Audio related functions
export const textToSpeech = async (text) => {
  try {
    // In a real app, this would call a text-to-speech API
    // For demo purposes, we'll return a static audio URL
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    
    // Return a demo audio URL - in a real app, this would be generated
    return '/assets/audio/sample_speech.mp3';
  } catch (error) {
    console.error('Error converting text to speech:', error);
    throw error;
  }
};

export const speechToText = async (audioBlob) => {
  try {
    // In a real app, this would send the audio to a speech-to-text API
    // For demo purposes, we'll return a simple text
    
    // Create a form data object to send the audio file
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return a simulated transcription
    // In a real app, this would be the result from the API
    return "백내장 수술 후 회복 기간은 어느 정도 걸리나요?";
  } catch (error) {
    console.error('Error converting speech to text:', error);
    throw error;
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
  getUnderstandingStats
};