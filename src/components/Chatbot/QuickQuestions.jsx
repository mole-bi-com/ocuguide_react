import React from 'react';
import './QuickQuestions.css';

const questions = [
  {
    question: '백내장 수술은 얼마나 걸리나요?',
    answer: '백내장 수술은 보통 15-20분 정도 소요됩니다. 하지만 수술 전 준비와 수술 후 회복 시간을 포함하면 병원에서 약 2-3시간 정도 머무르게 됩니다.'
  },
  {
    question: '수술 후 일상생활은 언제부터 가능한가요?',
    answer: '대부분의 환자는 수술 다음 날부터 일상적인 활동이 가능합니다. 다만, 격렬한 운동이나 수영 등은 의사와 상담 후 결정하시는 것이 좋습니다.'
  },
  {
    question: '수술 후 주의사항은 무엇인가요?',
    answer: '1. 눈을 비비거나 만지지 않기\n2. 처방된 안약 정시에 점안하기\n3. 먼지가 많은 곳 피하기\n4. 수영장, 사우나 등은 2-3주간 피하기\n5. 정기적인 경과 관찰 꼭 받기'
  }
];

const QuickQuestions = ({ onQuestionSelect }) => {
  return (
    <div className="quick-questions">
      <h3>자주 묻는 질문</h3>
      <div className="questions-grid">
        {questions.map((item, index) => (
          <button
            key={index}
            className="question-button"
            onClick={() => onQuestionSelect(item.question, item.answer)}
          >
            {item.question}
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickQuestions;
