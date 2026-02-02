import React from 'react';
import { MemoryDrillMode } from '../constants/memoryDrillModes';

function AnswerInput({ value, onChange, onSubmit, placeholder, mode, disabled }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !disabled && value.trim()) {
      e.preventDefault();
      onSubmit();
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
        type="text"
        className="form-control form-control-lg font-monospace text-center"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        disabled={disabled}
        autoFocus
      />
      <div className="form-text">
        {getHelpText()}
        <br />
        <small className="text-muted">Press Enter to submit</small>
      </div>
    </div>
  );
}

export default AnswerInput;