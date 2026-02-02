import React from 'react';
import { renderWithKaTeX } from '../utils/ipv6Utils.js';

function formatCorrectMessage() {
  return 'Correct!';
}

function formatIncorrectMessage(expectedAnswer) {
  return <>Incorrect. Expected: {renderWithKaTeX(expectedAnswer)}</>;
}

function formatResultMessage(message) {
  if (message.includes('Correct!')) {
    return formatCorrectMessage();
  }
  if (message.includes('Incorrect')) {
    return formatIncorrectMessage(message.replace('Incorrect. Expected: ', ''));
  }
  return message;
}

function ResultFeedback({ isCorrect, message, details }) {
  return (
    <div className={`alert ${isCorrect ? 'alert-success' : 'alert-danger'} mb-3`}>
      <div className={`mb-2 ${isCorrect ? 'valid-feedback d-block' : 'invalid-feedback d-block'}`}>
        <span className="fw-bold">{formatResultMessage(message)}</span>
      </div>
      {!isCorrect && details}
    </div>
  );
}

export default ResultFeedback;