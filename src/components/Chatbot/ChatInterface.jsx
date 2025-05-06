import React, { useState, useRef, useEffect } from 'react';
import AudioRecorder from './AudioRecorder';
import './ChatInterface.css';

const ChatInterface = ({ messages, onSendMessage, isLoadingResponse }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoadingResponse) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };

  const handleAudioRecorded = async (audioBlob) => {
    // This function will be implemented in the parent component
    if (typeof onAudioRecorded === 'function') {
      onAudioRecorded(audioBlob);
    }
  };

  const renderMessageAvatar = (role) => {
    return (
      <div className={`message-avatar ${role}`}>
        {role === 'assistant' ? '🤖' : '👤'}
      </div>
    );
  };

  return (
    <div className="chat-interface">
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.role}`}>
            {renderMessageAvatar(message.role)}
            <div className="message-content">
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="chat-input-container">
        <AudioRecorder 
          onAudioRecorded={handleAudioRecorded} 
          disabled={isLoadingResponse}
        />
        
        <form onSubmit={handleSubmit} className="text-input-container">
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputMessage.trim() || isLoadingResponse}
          >
            전송
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
