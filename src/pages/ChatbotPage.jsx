import React, { useState, useEffect, useRef } from 'react';
import { usePatientContext } from '../context/PatientContext';
import { useAppContext } from '../context/AppContext';
import ChatInterface from '../components/Chatbot/ChatInterface';
import QuickQuestions from '../components/Chatbot/QuickQuestions';
import { sendChatMessage, textToSpeech, speechToText } from '../services/api';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const { patientInfo } = usePatientContext();
  const { speechMode } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioPlayer = useRef(null);

  const quickQuestionsData = {
    '백내장 수술은 얼마나 걸리나요?': '백내장 수술은 보통 15-20분 정도 소요됩니다. 하지만 수술 전 준비와 수술 후 회복 시간을 포함하면 병원에서 약 2-3시간 정도 머무르게 됩니다.',
    '수술 후 일상생활은 언제부터 가능한가요?': '대부분의 환자는 수술 다음 날부터 일상적인 활동이 가능합니다. 다만, 격렬한 운동이나 수영 등은 의사와 상담 후 결정하시는 것이 좋습니다.',
    '수술 후 주의사항은 무엇인가요?': '1. 눈을 비비거나 만지지 않기\n2. 처방된 안약 정시에 점안하기\n3. 먼지가 많은 곳 피하기\n4. 수영장, 사우나 등은 2-3주간 피하기\n5. 정기적인 경과 관찰 꼭 받기',
    '백내장 수술 비용은 얼마인가요?': '백내장 수술 비용은 보험 적용 시 본인부담금이 약 20-30만원 정도입니다. 다만, 고급 렌즈 선택 시 추가 비용이 발생할 수 있으며, 이는 의료진과 상담 후 결정하시면 됩니다.',
    '수술 후 회복기간은 얼마나 되나요?': '일반적으로 수술 후 1-2주 정도면 일상생활이 가능한 수준으로 회복됩니다. 완전한 회복은 1-2개월 정도 소요되며, 이 기간 동안 정기적인 경과 관찰이 필요합니다.',
    '양쪽 눈을 동시에 수술할 수 있나요?': '일반적으로는 한쪽 눈을 수술하고 회복을 지켜본 후 반대쪽 눈을 수술합니다. 하지만 환자의 상태와 의료진의 판단에 따라 양안 동시 수술도 가능할 수 있습니다.'
  };

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: '안녕하세요. 백내장의 모든것 OcuGUIDE 입니다.'
        }
      ]);
    }
  }, [messages]);

  const handleSendMessage = async (message) => {
    if (!message.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: message }]);
    setIsLoadingResponse(true);

    try {
      // Add assistant message
      const response = quickQuestionsData[message] || await sendChatMessage(message);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);

      // Keep the following block for Text-to-Speech
      const audioUrl = await textToSpeech(response);
      if (audioPlayer.current) {
        audioPlayer.current.src = audioUrl;
        audioPlayer.current.play();
        setIsSpeaking(true);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '죄송합니다. 오류가 발생했습니다. 다시 시도해 주세요.'
        }
      ]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleQuickQuestionSelect = (question) => {
    handleSendMessage(question);
  };

  const handleAudioRecorded = async (audioBlob) => {
    try {
      setIsLoadingResponse(true);
      const transcription = await speechToText(audioBlob);
      
      if (transcription) {
        handleSendMessage(transcription);
      } else {
        throw new Error('Failed to transcribe audio');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: '죄송합니다. 음성 처리 중 오류가 발생했습니다. 다시 시도해 주세요.'
        }
      ]);
      setIsLoadingResponse(false);
    }
  };

  const handleAudioEnded = () => {
    setIsSpeaking(false);
  };

  return (
    <div className="chatbot-page">
      <h1 className="page-title">❔ Q&A 챗봇</h1>
      
      <div className="chatbot-intro">
        <div className="intro-text">
          <p>- <span className="highlight">OcuGUIDE</span>에서 궁금했던 내용을 무엇이든 물어보세요.</p>
          <p>- ℹ️ 백내장수술정보에서 어려웠던 내용을 챗봇이 성심껏 답변드립니다.</p>
          <p>- 아래 마이크 버튼을 누르면, 음성으로 질문할 수 있습니다.</p>
          <p>- 질문이 끝나신 후, 이제 곧 만나실 주치의에게 추가 설명을 들을 수 있습니다.</p>
        </div>
      </div>
      
      <QuickQuestions onQuestionSelect={handleQuickQuestionSelect} />
      
      <ChatInterface 
        messages={messages}
        onSendMessage={handleSendMessage}
        onAudioRecorded={handleAudioRecorded}
        isLoadingResponse={isLoadingResponse}
      />
      
      <audio 
        ref={audioPlayer}
        onEnded={handleAudioEnded}
        style={{ display: 'none' }}
      />
    </div>
  );
};

export default ChatbotPage; 