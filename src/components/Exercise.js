import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Card, ComparisonCard } from './Card.js';
import ResultFeedback from './ResultFeedback.js';
import { 
  validateAnswer, 
  computeShortestFormFromUserInput, 
  createResultState,
  isValidIPv6String
} from '../utils/validation.js';
import { renderIPv6Question, renderWithKaTeX } from '../utils/ipv6Utils.js';
import ipaddr from 'ipaddr.js';

function renderFullToAbbrevDetails(result) {
  if (!result.shortestForm || result.shortestForm === result.userInput) {
    return null;
  }
  return (
    <div className="mt-2 p-2 bg-body-tertiary border rounded">
      <small className="d-block mb-2 fw-semibold">
        Your input would be abbreviated as:
      </small>
      <ComparisonCard label="Your Input" value={result.userInput} />
      <ComparisonCard
        label="Shortest Form"
        value={result.shortestForm}
        variant="success"
      />
      <div className="mt-2 text-muted small">
        <strong>Tip:</strong>
        <ul className="mb-0 mt-1">
          <li>
            Use <code>::</code> for the longest run of consecutive zeros.
          </li>
        </ul>
      </div>
    </div>
  );
}

function renderAbbrevToFullDetails() {
  return (
    <div className="mt-2 p-2 bg-body-tertiary border rounded">
      <div className="text-muted small">
        <strong className="fw-semibold">Important:</strong>
        <p className="mb-0 mt-1">
          You must use the full address format:
          <br />• Exactly 8 hextets with 4 hex digits each
          <br />• Include leading zeros (e.g., <code>0001</code> not{' '}
          <code>1</code>)
        </p>
      </div>
    </div>
  );
}

function extractShortestFromPrefixInput(userInput) {
  const match = userInput.match(/^(.+?)\s*\/\s*(\d+)$/);
  if (!match) return null;
  const [, addrPart] = match;
  if (!isValidIPv6String(addrPart)) return null;
  try {
    const addr = ipaddr.parse(addrPart);
    return addr.toString().toUpperCase();
  } catch {
    return null;
  }
}

function renderPrefixDetails(result) {
  const shortest = extractShortestFromPrefixInput(result.userInput);
  return (
    <div className="mt-2 p-2 bg-body-tertiary border rounded">
      <div className="text-muted small">
        <strong className="fw-semibold">Important:</strong>
        <p className="mb-1 mt-1">
          For prefix exercises:
          <br />• Use shortest abbreviated form
          <br />• Prefix length must match exactly
          <br />• Space before slash is optional
        </p>
      </div>
      {shortest && (
        <div className="mt-2">
          <small className="d-block mb-1 fw-semibold">
            Your address shortens to:
          </small>
          <ComparisonCard
            label="Shortest Form"
            value={shortest}
            variant="success"
          />
        </div>
      )}
    </div>
  );
}

function extractPrefixValueFromQuestion(question) {
  return parseInt(question.match(/\\frac\{(\d+)\}/)?.[1] || '0', 10);
}

function calculateDifference(userNum, expectedNum) {
  return Math.abs(userNum - expectedNum);
}

function formatDifferenceMessage(userNum, expectedNum) {
  const difference = calculateDifference(userNum, expectedNum);
  if (userNum < expectedNum) {
    return (
      <>
        Too small by {renderWithKaTeX(difference.toString())}
      </>
    );
  }
  if (userNum > expectedNum) {
    return (
      <>
        Too large by {renderWithKaTeX(difference.toString())}
      </>
    );
  }
  return null;
}

function renderMathDetails(result, question, expectedAnswer) {
  const userNum = parseInt(result.userInput, 10);
  const expectedNum = parseInt(expectedAnswer, 10);
  const prefixValue = extractPrefixValueFromQuestion(question);
  
  if (isNaN(userNum)) {
    return (
      <div className="mt-2 p-2 bg-body-tertiary border rounded">
        <div className="text-muted small">
          <strong className="fw-semibold">Invalid input:</strong>
          <p className="mb-0 mt-1">Please enter a valid number.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 p-2 bg-body-tertiary border rounded">
      <div className="text-muted small">
        <strong className="fw-semibold">Math Details:</strong>
        <p className="mb-1 mt-1">
          {prefixValue} ÷ 4 = {expectedAnswer}
          <br />
          Your answer: {userNum}
          <br />
          {formatDifferenceMessage(userNum, expectedNum)}
        </p>
      </div>
    </div>
  );
}

function isInvalidIPv6Format(result, exerciseType) {
  return !isValidIPv6String(result.userInput) && exerciseType !== 'math';
}

function getInvalidFormatExplanation(exerciseType) {
  const explanations = {
    'full-to-abbrev': (
      <>
        <strong>Expected format:</strong> Shortest valid IPv6 abbreviation
        <ul className="mb-0 mt-1">
          <li>
            Remove leading zeros from each hextet (e.g., <code>0001</code> →{' '}
            <code>1</code>)
          </li>
          <li>
            Replace the longest run of consecutive zero hextets with{' '}
            <code>::</code>
          </li>
          <li>
            Use <code>::</code> only once in the address
          </li>
          <li>
            Example: <code>2001:0DB8:0000:0000:0000:0000:0000:0001</code> →{' '}
            <code>2001:DB8::1</code>
          </li>
        </ul>
      </>
    ),
    'abbrev-to-full': (
      <>
        <strong>Expected format:</strong> Full IPv6 address (uncompressed)
        <ul className="mb-0 mt-1">
          <li>Exactly 8 hextets separated by colons</li>
          <li>Each hextet must have exactly 4 hexadecimal digits (0-9, A-F)</li>
          <li>
            Include all leading zeros (e.g., <code>1</code> → <code>0001</code>)
          </li>
          <li>
            No <code>::</code> compression allowed
          </li>
          <li>
            Example: <code>2001:DB8::1</code> →{' '}
            <code>2001:0DB8:0000:0000:0000:0000:0000:0001</code>
          </li>
        </ul>
      </>
    ),
    prefix: (
      <>
        <strong>Expected format:</strong> Shortest IPv6 abbreviation with prefix
        length
        <ul className="mb-0 mt-1">
          <li>Network address in shortest abbreviated form</li>
          <li>Forward slash followed by prefix length (0-128)</li>
          <li>
            Example: <code>2001:DB8::/32</code> or{' '}
            <code>2001:DB8:0:0::/64</code>
          </li>
          <li>
            Space before slash is optional: <code>2001:DB8:: /32</code> works
            too
          </li>
        </ul>
      </>
    )
  };
  return (
    explanations[exerciseType] || (
      <>
        <strong>Please check your input format.</strong>
        <p className="mb-0 mt-1">
          Make sure you're entering a valid IPv6 address.
        </p>
      </>
    )
  );
}

function renderInvalidFormatWarning(exerciseType) {
  return (
    <div className="alert alert-warning mt-2">
      <strong>Invalid IPv6 address format</strong>
      <div className="mt-2 small">
        {getInvalidFormatExplanation(exerciseType)}
      </div>
    </div>
  );
}

function getExerciseSpecificDetails(result, ex) {
  if (!result || result.success) return null;
  const detailRenderers = {
    'full-to-abbrev': () => renderFullToAbbrevDetails(result),
    'abbrev-to-full': renderAbbrevToFullDetails,
    prefix: () => renderPrefixDetails(result),
    math: () => renderMathDetails(result, ex.question, ex.answer)
  };
  const renderer = detailRenderers[ex.type];
  return renderer ? renderer() : null;
}

function shouldShowInvalidFormatWarning(result, exerciseType) {
  return isInvalidIPv6Format(result, exerciseType);
}

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
    const shortestForm =
      ex.type === 'full-to-abbrev' && !isCorrect
        ? computeShortestFormFromUserInput(userFormattedInput)
        : null;
    setResult(
      createResultState(isCorrect, ex, userFormattedInput, shortestForm)
    );
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
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (!result) {
                submit();
              } else {
                next();
              }
            }
          }}
          disabled={isSubmitting}
          autoComplete="off"
          spellCheck="false"
        />
      </div>
      {result && (
        <div>
          <ResultFeedback
            isCorrect={result.success}
            message={result.message}
            details={
              <>
                {getExerciseSpecificDetails(result, ex)}
                {isInvalidIPv6Format(result, ex.type) &&
                  renderInvalidFormatWarning(ex.type)}
              </>
            }
          />
        </div>
      )}
      <div className="d-grid">
        {!result ? (
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={isSubmitting}
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