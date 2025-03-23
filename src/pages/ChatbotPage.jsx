import React, { useState, useEffect, useRef } from 'react';
import { usePatientContext } from '../context/PatientContext';
import { useAppContext } from '../context/AppContext';
import ChatInterface from '../components/Chatbot/ChatInterface';
import QuickQuestions from '../components/Chatbot/QuickQuestions';
import AudioRecorder from '../components/Chatbot/AudioRecorder';
import { sendChatMessage, textToSpeech, speechToText } from '../services/api';
import './ChatbotPage.css';

const ChatbotPage = () => {
  const { patientInfo } = usePatientContext();
  const { speechMode } = useAppContext();
  const [messages, setMessages] = useState([]);
  const [isLoadingResponse, setIsLoadingResponse] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioPlayer = useRef(null);

  useEffect(() => {
    // Initialize chat with welcome message
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

    const newUserMessage = {
      role: 'user',
      content: message
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoadingResponse(true);

    try {
      const response = await sendChatMessage(newUserMessage.content, messages);
      
      const newAssistantMessage = {
        role: 'assistant',
        content: response
      };

      setMessages(prev => [...prev, newAssistantMessage]);

      // If speech mode is enabled, convert response to speech
      if (speechMode) {
        setIsSpeaking(true);
        const audioUrl = await textToSpeech(response);
        audioPlayer.current.src = audioUrl;
        audioPlayer.current.play();
      }
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: '죄송합니다. 메시지 전송 중 오류가 발생했습니다. 다시 시도해 주세요.'
        }
      ]);
    } finally {
      setIsLoadingResponse(false);
    }
  };

  const handleQuickQuestionSelect = (question, answer) => {
    // Add user question to messages
    setMessages(prev => [
      ...prev,
      {
        role: 'user',
        content: question
      }
    ]);

    // Add pre-defined answer
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: answer
        }
      ]);

      // If speech mode is enabled, read the answer
      if (speechMode) {
        setIsSpeaking(true);
        textToSpeech(answer).then(audioUrl => {
          audioPlayer.current.src = audioUrl;
          audioPlayer.current.play();
        });
      }
    }, 500);
  };

  const handleAudioRecorded = async (audioBlob) => {
    try {
      setIsLoadingResponse(true);
      
      // Convert speech to text
      const transcription = await speechToText(audioBlob);
      
      if (transcription) {
        // Add transcription as user message
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
          <p>- 오른쪽의 마이크를 누르면, 음성으로 질문할 수 있습니다.</p>
          <p>- 질문이 끝나신 후, 이제 곧 만나실 주치의에게 추가 설명을 들을 수 있습니다.</p>
        </div>
        
        <AudioRecorder onAudioRecorded={handleAudioRecorded} />
      </div>
      
      <QuickQuestions onQuestionSelect={handleQuickQuestionSelect} />
      
      <ChatInterface 
        messages={messages}
        onSendMessage={handleSendMessage}
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