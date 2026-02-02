import React from 'react';
import { Card } from '../Card.js';
import { MemoryDrillMode } from '../../constants/memoryDrillModes.js';

function getModeSpecificInstructions(mode) {
  const instructions = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: {
      title: 'Prefix → Hextet Position',
      keyFormula: 'Hextet Position = Prefix Length ÷ 4',
      example: '/64 → 64 ÷ 4 = 16 (16th hextet position, 0-based index)',
      description:
        'This helps you quickly identify which hextet position in an IPv6 address is affected by a given prefix length.'
    },
    [MemoryDrillMode.HEX_TO_BINARY]: {
      title: 'Hexadecimal → Binary (4-bit)',
      keyFormula: 'Each hex digit (0-F) = 4 binary bits',
      example: 'A (hex) → 1010 (binary)',
      description:
        'Practice converting single hex digits to their 4-bit binary representation.'
    },
    [MemoryDrillMode.BINARY_TO_DECIMAL]: {
      title: 'Binary → Decimal (4-bit)',
      keyFormula: '4-bit binary = 0-15 decimal',
      example: '1101 (binary) → 13 (decimal)',
      description: 'Practice converting 4-bit binary numbers to decimal values.'
    },
    [MemoryDrillMode.BINARY_TO_HEX]: {
      title: 'Binary → Hexadecimal (4-bit)',
      keyFormula: 'Each 4-bit binary = 1 hex digit',
      example: '0111 (binary) → 7 (hex)',
      description:
        'Practice converting 4-bit binary numbers to single hex digits.'
    },
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: {
      title: 'IPv4 Binary → Decimal (8-bit)',
      keyFormula: '8-bit binary = 0-255 decimal',
      example: '11000000 (binary) → 192 (decimal)',
      description: 'Practice converting IPv4 octet binary values to decimal.'
    }
  };
  const instruction = instructions[mode];
  if (!instruction) return null;
  return (
    <>
      <h5>{instruction.title}</h5>
      <div className="alert alert-info">
        <strong>Key Formula:</strong> {instruction.keyFormula}
        <br />
        <small>Example: {instruction.example}</small>
      </div>
      <p>{instruction.description}</p>
    </>
  );
}

function GameRules({ penaltySettings, isPrefixMode }) {
  return (
    <>
      <h6>Rules:</h6>
      <ul>
        <li>Answer quickly and accurately</li>
        <li>Each correct answer increases your success count</li>
        <li>
          <strong className="text-danger">Penalty:</strong> Each incorrect
          answer reduces success count by{' '}
          {penaltySettings.enabled ? penaltySettings.amount : 0}
        </li>
        <li>
          <strong>Cumulative Learning:</strong> Items stay in practice as you
          master them
        </li>
        {isPrefixMode && <li>Items are mastered after 14 correct answers</li>}
        <li>Quick reference is only shown after incorrect answers</li>
      </ul>
    </>
  );
}

function MemoryDrillInstructions({
  mode,
  currentBatch,
  learnedItems,
  masteredItemsInCurrentBatch,
  penaltySettings,
  isPrefixMode,
  currentBatchItems,
  onStart,
  onBack,
  getModeDisplayName
}) {
  const modeSpecificInstructions = getModeSpecificInstructions(mode);
  return (
    <Card title={`Memory Drill - ${getModeDisplayName(mode)}`}>
      <div className="mb-4">
        {modeSpecificInstructions}
        <GameRules
          penaltySettings={penaltySettings}
          isPrefixMode={isPrefixMode}
        />
        {isPrefixMode && (
          <>
            <div className="alert alert-info">
              <strong>Selected Prefixes:</strong> {currentBatch.length} prefixes
              to practice ({masteredItemsInCurrentBatch} mastered)
              <br />
              <strong>Total Learned Items:</strong> {learnedItems.length} out of{' '}
              {currentBatchItems.length} prefixes
            </div>
          </>
        )}
      </div>
      <div className="d-grid gap-2">
        <button className="btn btn-primary" onClick={onStart}>
          {isPrefixMode
            ? `Start Practice with ${currentBatch.length} Prefixes`
            : 'Start Practice'}
        </button>
        <button className="btn btn-outline-secondary" onClick={onBack}>
          Back to Mode Selection
        </button>
      </div>
    </Card>
  );
}

export default MemoryDrillInstructions;