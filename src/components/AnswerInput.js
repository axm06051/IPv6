import React from 'react';
import { MemoryDrillMode } from '../constants/memoryDrillModes';

function AnswerInput({ value, onChange, onSubmit, onNext, placeholder, mode, disabled, result, inputRef }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !disabled) {
      e.preventDefault();
      if (!result) {
        onSubmit();
      } else {
        onNext();
      }
    }
  };

  const getHelpText = () => {
    switch (mode) {
      case MemoryDrillMode.PREFIX_TO_HEXTET:
        return "Enter the integer result of dividing the prefix by 4 (0-31)";
      case MemoryDrillMode.HEX_TO_BINARY:
        return "Enter 4 binary digits (0s and 1s)";
      case MemoryDrillMode.BINARY_TO_DECIMAL:
        return "Enter decimal number (0-15)";
      case MemoryDrillMode.BINARY_TO_HEX:
        return "Enter hexadecimal digit (0-F)";
      case MemoryDrillMode.IPV4_BINARY_TO_DECIMAL:
        return "Enter decimal number (0-255)";
      default:
        return "Enter your answer";
    }
  };

  return (
    <div className="mb-3">
      <label className="form-label">Your Answer</label>
      <input
        ref={inputRef}
        type="text"
        className="form-control form-control-lg font-monospace text-center"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        disabled={disabled}
        autoFocus={!inputRef}
      />
      <div className="form-text">
        {getHelpText()}
        <br />
        <small className="text-muted">
          Press Enter to {result ? 'continue to next question' : 'submit your answer'}
        </small>
      </div>
    </div>
  );
}

export default AnswerInput;