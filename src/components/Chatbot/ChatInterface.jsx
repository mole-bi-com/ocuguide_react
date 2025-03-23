import React, { useState, useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble';
import './ChatInterface.css';

const ChatInterface = ({ messages, onSendMessage, isLoadingResponse }) => {
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef(null);
  
  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputMessage.trim() && !isLoadingResponse) {
      onSendMessage(inputMessage);
      setInputMessage('');
    }
  };
  
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  return (
    <div className="chat-interface">
      <div className="messages-container">
        {messages.map((message, index) => (
          <MessageBubble
            key={index}
            role={message.role}
            content={message.content}
          />
        ))}
        
        {isLoadingResponse && (
          <div className="loading-indicator">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      <form className="message-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMessage}
          onChange={handleInputChange}
          placeholder="궁금한 사항을 물어봐주세요."
          disabled={isLoadingResponse}
          className="message-input"
        />
        <button 
          type="submit" 
          disabled={!inputMessage.trim() || isLoadingResponse}
          className="send-button"
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
