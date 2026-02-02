import React, { useState } from 'react';
import { Card } from '../Card.js';
import { MemoryDrillMode } from '../../constants/memoryDrillModes.js';

const ALL_PREFIXES = Array.from({ length: 32 }, (_, i) => i + 1);

function GameHeader({
  batchName,
  masteredItemsInCurrentBatch,
  selectedPrefixes,
  isPrefixMode,
  targetDescription,
  penaltySettings,
  modeDescription
}) {
  return (
    <div className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <span className="badge bg-primary">{batchName}</span>
        <span className="badge bg-info">
          Progress: {masteredItemsInCurrentBatch}/
          {isPrefixMode ? selectedPrefixes.length : 'N/A'} mastered
        </span>
      </div>
      {isPrefixMode && (
        <>
          <div className="progress mb-2" style={{ height: '8px' }}>
            <div
              className="progress-bar bg-success"
              style={{
                width: `${
                  selectedPrefixes.length > 0
                    ? (masteredItemsInCurrentBatch / selectedPrefixes.length) *
                      100
                    : 0
                }%`
              }}
            />
          </div>
          <div className="d-flex justify-content-between small text-muted mb-2">
            <span>Prefixes: {selectedPrefixes.length}</span>
            <span>
              To practice:{' '}
              {selectedPrefixes.length - masteredItemsInCurrentBatch}
            </span>
          </div>
        </>
      )}
      <small className="text-muted">{targetDescription}</small>
      <div className="mt-2">
        <small className="text-muted">{modeDescription}</small>
        {penaltySettings.enabled && (
          <small className="text-danger ms-2">
            Penalty: {penaltySettings.amount} success points
          </small>
        )}
      </div>
    </div>
  );
}

function QuestionDisplay({ currentQuestion, result, mode }) {
  const displayQuestion = result?.question || currentQuestion?.question;
  return (
    <div className="mb-3">
      <div className="p-4 bg-body-secondary border rounded text-center">
        <div className="mb-2 text-muted small">Question:</div>
        <div className="display-4 font-monospace">{displayQuestion}</div>
        <div className="mt-2 text-muted small">
          {mode === MemoryDrillMode.PREFIX_TO_HEXTET
            ? 'Which hextet position? (÷4 = ?)'
            : 'Your answer:'}
          {result && !result.success && (
            <div className="mt-2">
              <small className="text-danger">
                You answered: {result.userAnswer}
              </small>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AnswerInput({ value, onChange, placeholder, mode, disabled }) {
  return (
    <div className="mb-3">
      <label className="form-label">Your Answer</label>
      <input
        type="text"
        className="form-control form-control-lg font-monospace text-center"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
        spellCheck="false"
        disabled={disabled}
      />
      <div className="form-text">
        {mode === MemoryDrillMode.PREFIX_TO_HEXTET
          ? 'Enter the integer result of dividing the prefix by 4 (0-31)'
          : mode === MemoryDrillMode.HEX_TO_BINARY
          ? 'Enter 4 binary digits (0s and 1s)'
          : mode === MemoryDrillMode.BINARY_TO_DECIMAL
          ? 'Enter decimal number (0-15)'
          : mode === MemoryDrillMode.BINARY_TO_HEX
          ? 'Enter hexadecimal digit (0-F)'
          : 'Enter decimal number (0-255)'}
      </div>
    </div>
  );
}

function ResultDisplay({ result, itemSuccessCounts, penaltySettings }) {
  return (
    <div
      className={`alert ${
        result.success ? 'alert-success' : 'alert-danger'
      } mb-3`}
    >
      <div className="fw-bold mb-1">
        {result.success ? 'Correct!' : 'Incorrect'}
      </div>
      <div className="small">
        {result.explanation}
        {result.success ? (
          <div className="mt-1">
            Response time: {(result.responseTime / 1000).toFixed(2)}s
            <div className="mt-1">
              <small className="text-success">
                Success count for this item:{' '}
                {itemSuccessCounts[result.itemId] || 1}/14
              </small>
            </div>
          </div>
        ) : (
          <div className="mt-1">
            <strong>
              Penalty applied: Success count reduced by {penaltySettings.amount}
            </strong>
          </div>
        )}
      </div>
    </div>
  );
}

function ActionButtons({ result, input, onSubmit, onNext }) {
  return (
    <div className="d-grid gap-2 mb-3">
      {!result ? (
        <button
          className="btn btn-primary"
          onClick={onSubmit}
          disabled={!input.trim()}
        >
          Submit Answer
        </button>
      ) : (
        <button className="btn btn-success" onClick={onNext}>
          Next Question
        </button>
      )}
    </div>
  );
}

function ModeSelector({ mode, onChangeMode, getModeDisplayName }) {
  const modes = [
    MemoryDrillMode.PREFIX_TO_HEXTET,
    MemoryDrillMode.HEX_TO_BINARY,
    MemoryDrillMode.BINARY_TO_DECIMAL,
    MemoryDrillMode.BINARY_TO_HEX,
    MemoryDrillMode.IPV4_BINARY_TO_DECIMAL
  ];
  return (
    <div className="mb-3">
      <small className="fw-semibold d-block mb-2">Game Mode:</small>
      <div className="btn-group d-flex flex-wrap" role="group">
        {modes.map((gameMode) => (
          <button
            key={gameMode}
            type="button"
            className={`btn btn-sm ${
              mode === gameMode ? 'btn-primary' : 'btn-outline-primary'
            }`}
            onClick={() => onChangeMode(gameMode)}
          >
            {getModeDisplayName(gameMode)}
          </button>
        ))}
      </div>
    </div>
  );
}

function GameControls({
  onResetProgress,
  onChangeMode,
  onShowSettings,
  onShowPrefixSelection,
  isPrefixMode
}) {
  return (
    <div className="d-grid gap-2">
      {isPrefixMode && (
        <button
          className="btn btn-outline-info btn-sm"
          onClick={onShowPrefixSelection}
        >
          Change Prefix Selection
        </button>
      )}
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={onResetProgress}
      >
        Reset All Progress
      </button>
      <button className="btn btn-outline-info btn-sm" onClick={onChangeMode}>
        Change Mode
      </button>
      <button
        className="btn btn-outline-warning btn-sm"
        onClick={onShowSettings}
      >
        Penalty Settings
      </button>
    </div>
  );
}

function PrefixSelectionModal({ selectedPrefixes, onUpdate, onClose }) {
  const [localSelection, setLocalSelection] = useState([...selectedPrefixes]);
  
  const togglePrefix = (prefix) => {
    setLocalSelection((prev) =>
      prev.includes(prefix)
        ? prev.filter((p) => p !== prefix)
        : [...prev, prefix]
    );
  };
  
  const selectAll = () => {
    setLocalSelection([...ALL_PREFIXES]);
  };
  
  const clearSelection = () => {
    setLocalSelection([]);
  };
  
  const saveAndClose = () => {
    onUpdate(localSelection);
    onClose();
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050
      }}
      tabIndex="-1"
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Select Prefixes to Practice</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="mb-3">
              <button
                className="btn btn-sm btn-outline-primary me-2"
                onClick={selectAll}
              >
                Select All (1-32)
              </button>
              <button
                className="btn btn-sm btn-outline-secondary me-2"
                onClick={clearSelection}
              >
                Clear All
              </button>
              <small className="text-muted">
                Selected: {localSelection.length} prefixes
              </small>
            </div>
            <div className="row g-2">
              {ALL_PREFIXES.map((prefix) => (
                <div key={prefix} className="col-3 col-sm-2 col-md-1">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={localSelection.includes(prefix)}
                      onChange={() => togglePrefix(prefix)}
                      id={`modal-prefix-${prefix}`}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor={`modal-prefix-${prefix}`}
                    >
                      /{prefix}
                    </label>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <small className="text-muted">
                Tip: Select prefixes you want to focus on. The game will
                randomly choose from your selection.
              </small>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={saveAndClose}
            >
              Save Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickReference({ show, mode, currentBatch, itemSuccessCounts }) {
  if (!show) return null;
  const referenceComponents = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: () => (
      <PrefixQuickReference
        currentBatch={currentBatch}
        itemSuccessCounts={itemSuccessCounts}
      />
    ),
    [MemoryDrillMode.HEX_TO_BINARY]: () => <HexToBinaryQuickReference />,
    [MemoryDrillMode.BINARY_TO_DECIMAL]: () => (
      <BinaryToDecimalQuickReference />
    ),
    [MemoryDrillMode.BINARY_TO_HEX]: () => <BinaryToHexQuickReference />,
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: () => (
      <IPv4BinaryToDecimalQuickReference />
    )
  };
  const ReferenceComponent = referenceComponents[mode];
  return ReferenceComponent ? <ReferenceComponent /> : null;
}

function PrefixQuickReference({ currentBatch, itemSuccessCounts }) {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {currentBatch.map((p) => {
          const count = itemSuccessCounts[p] || 0;
          return (
            <div key={p} className="col-3 col-sm-2">
              /{p} → {Math.floor(p / 4)} ({count}/14)
            </div>
          );
        })}
      </div>
    </div>
  );
}

function HexToBinaryQuickReference() {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {[
          '0', '1', '2', '3', '4', '5', '6', '7',
          '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'
        ].map((hex) => (
          <div key={hex} className="col-3 col-sm-2">
            {hex} → {parseInt(hex, 16).toString(2).padStart(4, '0')}
          </div>
        ))}
      </div>
    </div>
  );
}

function BinaryToDecimalQuickReference() {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {Array.from({ length: 16 }, (_, i) => i).map((decimal) => (
          <div key={decimal} className="col-3 col-sm-2">
            {decimal.toString(2).padStart(4, '0')} → {decimal}
          </div>
        ))}
      </div>
    </div>
  );
}

function BinaryToHexQuickReference() {
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Quick Reference (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {Array.from({ length: 16 }, (_, i) => i).map((decimal) => (
          <div key={decimal} className="col-3 col-sm-2">
            {decimal.toString(2).padStart(4, '0')} →{' '}
            {decimal.toString(16).toUpperCase()}
          </div>
        ))}
      </div>
    </div>
  );
}

function IPv4BinaryToDecimalQuickReference() {
  const commonOctets = [
    { binary: '00000000', decimal: '0' },
    { binary: '10000000', decimal: '128' },
    { binary: '11000000', decimal: '192' },
    { binary: '11100000', decimal: '224' },
    { binary: '11110000', decimal: '240' },
    { binary: '11111000', decimal: '248' },
    { binary: '11111100', decimal: '252' },
    { binary: '11111110', decimal: '254' },
    { binary: '11111111', decimal: '255' },
    { binary: '10101010', decimal: '170' },
    { binary: '01010101', decimal: '85' },
    { binary: '00111100', decimal: '60' }
  ];
  return (
    <div className="mt-4 p-3 bg-body-tertiary border rounded">
      <small className="fw-semibold d-block mb-2">
        Common IPv4 Octets (shown because answer was incorrect):
      </small>
      <div className="row g-2 small font-monospace">
        {commonOctets.map((item, idx) => (
          <div key={idx} className="col-4 col-sm-3">
            {item.binary} → {item.decimal}
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsModal({
  show,
  onClose,
  penaltySettings,
  onUpdatePenalty,
  penaltyAmountInput,
  onPenaltyAmountChange
}) {
  if (!show) return null;
  
  const handlePenaltyAmountChange = (value) => {
    onPenaltyAmountChange(value);
    if (value !== '') {
      const amount = parseInt(value, 10);
      const maxAmount = penaltySettings.maxAmount || 5;
      if (!isNaN(amount) && amount >= 1 && amount <= maxAmount) {
        onUpdatePenalty(true, amount);
      }
    }
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="modal fade show"
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050
      }}
      tabIndex="-1"
      onClick={handleBackdropClick}
    >
      <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Memory Drill Settings</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            />
          </div>
          <div className="modal-body">
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Penalty Settings</h6>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  checked={penaltySettings?.enabled || false}
                  onChange={(e) =>
                    onUpdatePenalty(e.target.checked, penaltySettings?.amount || 1)
                  }
                  id="penaltyEnabled"
                  style={{ width: '3em', height: '1.5em' }}
                />
                <label
                  className="form-check-label ms-2"
                  htmlFor="penaltyEnabled"
                >
                  Enable penalty for incorrect answers
                </label>
              </div>
              <div className="mb-3">
                <label className="form-label mb-2">Penalty Amount</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control form-control-lg"
                    min="1"
                    max={penaltySettings?.maxAmount || 5}
                    value={penaltyAmountInput || '1'}
                    onChange={(e) => handlePenaltyAmountChange(e.target.value)}
                    disabled={!penaltySettings?.enabled}
                  />
                  <span className="input-group-text">success points</span>
                </div>
                <div className="form-text mt-2">
                  <small>
                    Set how many success points are lost per incorrect answer.
                    <br />
                    Range: 1 to {penaltySettings?.maxAmount || 5} (higher = more
                    difficult)
                  </small>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <h6 className="fw-bold mb-3">Learning Settings</h6>
              <div className="alert alert-info">
                <small>
                  <strong>Cumulative Learning:</strong> When you answer
                  correctly, items are added to your "learned items" list and
                  stay in practice even after batch progression.
                </small>
              </div>
            </div>
            <div className="alert alert-warning mb-0">
              <div className="d-flex align-items-center">
                <div className="me-2">⚙️</div>
                <div>
                  <small>
                    <strong>Current penalty:</strong>{' '}
                    {penaltySettings?.enabled ? penaltySettings?.amount || 0 : 0}{' '}
                    success points per incorrect answer
                  </small>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-primary" onClick={onClose}>
              Save & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MemoryDrillGameInterface({
  mode,
  selectedPrefixes,
  currentQuestion,
  result,
  input,
  isPrefixMode,
  batchName,
  masteredItemsInCurrentBatch,
  targetDescription,
  penaltySettings,
  showSettings,
  penaltyAmountInput,
  onInputChange,
  onSubmit,
  onNext,
  onResetProgress,
  onChangeMode,
  onUpdatePenalty,
  onPenaltyAmountChange,
  onShowSettings,
  onCloseSettings,
  updateSelectedPrefixes,
  getInputPlaceholder,
  getModeDisplayName,
  getModeDescription
}) {
  const [showPrefixSelection, setShowPrefixSelection] = useState(false);

  return (
    <>
      <Card title={`Memory Drill - ${getModeDisplayName(mode)}`}>
        <GameHeader
          batchName={batchName}
          masteredItemsInCurrentBatch={masteredItemsInCurrentBatch}
          selectedPrefixes={selectedPrefixes}
          isPrefixMode={isPrefixMode}
          targetDescription={targetDescription}
          penaltySettings={penaltySettings}
          modeDescription={getModeDescription(mode)}
        />
        <QuestionDisplay
          currentQuestion={currentQuestion}
          result={result}
          mode={mode}
        />
        <AnswerInput
          value={input}
          onChange={onInputChange}
          placeholder={getInputPlaceholder()}
          mode={mode}
          disabled={!!result}
        />
        {result && (
          <ResultDisplay
            result={result}
            itemSuccessCounts={{}}
            penaltySettings={penaltySettings}
          />
        )}
        <ActionButtons
          result={result}
          input={input}
          onSubmit={onSubmit}
          onNext={onNext}
        />
        <ModeSelector
          mode={mode}
          onChangeMode={onChangeMode}
          getModeDisplayName={getModeDisplayName}
        />
        <GameControls
          onResetProgress={onResetProgress}
          onChangeMode={() => onChangeMode(null)}
          onShowSettings={onShowSettings}
          onShowPrefixSelection={() => setShowPrefixSelection(true)}
          isPrefixMode={isPrefixMode}
        />
        <QuickReference
          show={result && !result.success}
          mode={mode}
          currentBatch={selectedPrefixes}
          itemSuccessCounts={{}}
        />
        <SettingsModal
          show={showSettings}
          onClose={onCloseSettings}
          penaltySettings={penaltySettings}
          onUpdatePenalty={onUpdatePenalty}
          penaltyAmountInput={penaltyAmountInput}
          onPenaltyAmountChange={onPenaltyAmountChange}
        />
      </Card>
      {showPrefixSelection && (
        <PrefixSelectionModal
          selectedPrefixes={selectedPrefixes}
          onUpdate={updateSelectedPrefixes}
          onClose={() => setShowPrefixSelection(false)}
        />
      )}
    </>
  );
}

export default MemoryDrillGameInterface;