import React, { useState, useRef, useEffect } from 'react';
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
      
      <form onSubmit={handleSubmit} className="chat-input-container">
        <input
          ref={inputRef}
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="메시지를 입력하세요..."
          className="chat-input"
          disabled={isLoadingResponse}
        />
        <button 
          type="submit" 
          className="send-button"
          disabled={!inputMessage.trim() || isLoadingResponse}
        >
          전송
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
