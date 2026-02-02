import React, { useState, useCallback, useEffect, useRef } from 'react';
import Card from './Card';
import ResultFeedback from './ResultFeedback';
import { validateAnswer } from '../utils/validation';
import { renderIPv6Question } from '../utils/ipv6Utils';

function Exercise({ title, generator, category, onAnswerSubmit }) {
  const [ex, setEx] = useState(generator());
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  const submit = useCallback(() => {
    if (!input.trim() || isSubmitting) return;
    
    setIsSubmitting(true);
    const isCorrect = validateAnswer(input, ex.answer, ex.type);
    const userFormattedInput = input.trim().toUpperCase();
    
    setResult({
      success: isCorrect,
      message: isCorrect ? 'Correct!' : `Incorrect. Expected: ${ex.answer}`,
      userInput: userFormattedInput,
      expected: ex.answer
    });
    
    onAnswerSubmit(category, isCorrect);
    setTimeout(() => setIsSubmitting(false), 300);
  }, [input, isSubmitting, ex, category, onAnswerSubmit]);

  const next = useCallback(() => {
    setEx(generator());
    setInput('');
    setResult(null);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [generator]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !isSubmitting && input.trim()) {
      e.preventDefault();
      submit();
    }
  };

  useEffect(() => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [ex]);

  return (
    <Card title={title}>
      <div className="mb-3">
        <div className="p-3 bg-body-secondary border rounded">
          <div className="ipv6-display font-monospace fs-5">
            {renderIPv6Question(ex.question)}
          </div>
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label">Your Answer</label>
        <input
          ref={inputRef}
          type="text"
          className="form-control form-control-lg font-monospace"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isSubmitting}
          autoComplete="off"
          spellCheck="false"
          placeholder="Type your answer and press Enter"
        />
        <div className="form-text">
          <small className="text-muted">Press Enter to submit your answer</small>
        </div>
      </div>

      {result && (
        <ResultFeedback
          isCorrect={result.success}
          message={result.message}
          details={null}
        />
      )}

      <div className="d-grid">
        {!result ? (
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={isSubmitting || !input.trim()}
          >
            {isSubmitting ? 'Checking...' : 'Submit Answer'}
          </button>
        ) : (
          <button className="btn btn-success" onClick={next}>
            Next Question
          </button>
        )}
      </div>
    </Card>
  );
}

export default Exercise;