import React from 'react';

function ResultFeedback({ isCorrect, message, details }) {
  return (
    <div className={`alert ${isCorrect ? 'alert-success' : 'alert-danger'} mb-3`}>
      <div className={`mb-2 ${isCorrect ? 'valid-feedback d-block' : 'invalid-feedback d-block'}`}>
        <span className="fw-bold">{message}</span>
      </div>
      {!isCorrect && details}
    </div>
  );
}

export default ResultFeedback;