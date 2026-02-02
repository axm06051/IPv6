import { useCallback } from 'react';
import { MemoryDrillMode } from '../constants/memoryDrillModes';

const ALL_PREFIXES = Array.from({ length: 32 }, (_, i) => i + 1);

function generatePrefixQuestion(drillState, selectedPrefixes) {
  const itemSuccessCounts =
    drillState.itemSuccessCounts?.[drillState.currentMode] || {};
  let availablePrefixes = selectedPrefixes || ALL_PREFIXES;
  availablePrefixes = availablePrefixes.filter(
    (prefix) => (itemSuccessCounts[prefix] || 0) < 14
  );
  if (availablePrefixes.length === 0) {
    availablePrefixes = selectedPrefixes || ALL_PREFIXES;
  }
  const prefix =
    availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)];
  return {
    type: MemoryDrillMode.PREFIX_TO_HEXTET,
    question: `/${prefix}`,
    answer: Math.floor(prefix / 4).toString(),
    explanation: `Prefix /${prefix} means look at hextet position ${Math.floor(
      prefix / 4
    )} (${prefix} ÷ 4)`,
    itemId: prefix.toString()
  };
}

function generateHexToBinaryQuestion() {
  const hexDigits = [
    '0', '1', '2', '3', '4', '5', '6', '7',
    '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'
  ];
  const hex = hexDigits[Math.floor(Math.random() * hexDigits.length)];
  const binary = parseInt(hex, 16).toString(2).padStart(4, '0');
  return {
    type: MemoryDrillMode.HEX_TO_BINARY,
    question: `${hex} (hex)`,
    answer: binary,
    explanation: `${hex} in binary is ${binary} (${parseInt(hex, 16)} in decimal)`,
    itemId: hex
  };
}

function generateBinaryToDecimalQuestion() {
  const decimal = Math.floor(Math.random() * 16);
  const binary = decimal.toString(2).padStart(4, '0');
  return {
    type: MemoryDrillMode.BINARY_TO_DECIMAL,
    question: binary,
    answer: decimal.toString(),
    explanation: `${binary} in decimal is ${decimal}`,
    itemId: binary
  };
}

function generateBinaryToHexQuestion() {
  const decimal = Math.floor(Math.random() * 16);
  const binary = decimal.toString(2).padStart(4, '0');
  const hex = decimal.toString(16).toUpperCase();
  return {
    type: MemoryDrillMode.BINARY_TO_HEX,
    question: binary,
    answer: hex,
    explanation: `${binary} in hexadecimal is ${hex} (${decimal} in decimal)`,
    itemId: binary
  };
}

function generateIPv4BinaryToDecimalQuestion() {
  const decimal = Math.floor(Math.random() * 256);
  const binary = decimal.toString(2).padStart(8, '0');
  return {
    type: MemoryDrillMode.IPV4_BINARY_TO_DECIMAL,
    question: binary,
    answer: decimal.toString(),
    explanation: `IPv4 octet ${binary} in decimal is ${decimal}`,
    itemId: binary
  };
}

export function useQuestionGenerator(currentMode, drillState, selectedPrefixes) {
  return useCallback(() => {
    const generators = {
      [MemoryDrillMode.PREFIX_TO_HEXTET]: () =>
        generatePrefixQuestion(drillState, selectedPrefixes),
      [MemoryDrillMode.HEX_TO_BINARY]: generateHexToBinaryQuestion,
      [MemoryDrillMode.BINARY_TO_DECIMAL]: generateBinaryToDecimalQuestion,
      [MemoryDrillMode.BINARY_TO_HEX]: generateBinaryToHexQuestion,
      [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: generateIPv4BinaryToDecimalQuestion
    };
    return generators[currentMode]
      ? generators[currentMode]()
      : generatePrefixQuestion(drillState, selectedPrefixes);
  }, [currentMode, drillState, selectedPrefixes]);
}