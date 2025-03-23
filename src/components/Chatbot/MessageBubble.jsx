import React from 'react';
import ReactMarkdown from 'react-markdown';
import './MessageBubble.css';

const MessageBubble = ({ role, content }) => {
  const isUser = role === 'user';

  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-content">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  );
};

export default MessageBubble;
