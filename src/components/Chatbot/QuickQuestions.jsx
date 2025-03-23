import React from 'react';
import './QuickQuestions.css';

const QuickQuestions = ({ onQuestionSelect }) => {
  const questions = [
    '백내장 수술은 얼마나 걸리나요?',
    '수술 후 일상생활은 언제부터 가능한가요?',
    '수술 후 주의사항은 무엇인가요?',
    '백내장 수술 비용은 얼마인가요?',
    '수술 후 회복기간은 얼마나 되나요?',
    '양쪽 눈을 동시에 수술할 수 있나요?'
  ];

  return (
    <div className="quick-questions-section">
      <h3 className="quick-questions-title">자주 묻는 질문</h3>
      <div className="quick-questions-container">
        {questions.map((question, index) => (
          <button
            key={index}
            className="quick-question-item"
            onClick={() => onQuestionSelect(question)}
          >
            <span className="material-icons" style={{ fontSize: '18px' }}>help_outline</span>
            {question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;
