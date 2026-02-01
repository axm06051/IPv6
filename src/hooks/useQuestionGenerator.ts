import { useCallback } from "react";
import { MemoryDrillMode, type MemoryDrillModeType } from "../constants";
import type { DrillState, Question } from "../types";

const ALL_PREFIXES = Array.from({ length: 32 }, (_, i) => i + 1);

function generatePrefixQuestion(
  drillState: DrillState,
  selectedPrefixes: readonly number[]
): Question {
  const itemSuccessCounts =
    drillState.itemSuccessCounts?.[drillState.currentMode!] || {};

  let availablePrefixes = (
    selectedPrefixes?.length ? selectedPrefixes : ALL_PREFIXES
  ).filter(prefix => (itemSuccessCounts[prefix] || 0) < 14);

  if (availablePrefixes.length === 0) {
    availablePrefixes = selectedPrefixes?.length
      ? [...selectedPrefixes]
      : [...ALL_PREFIXES];
  }

  if (availablePrefixes.length === 0) {
    throw new Error("No prefixes available for question generation");
  }

  const prefix =
    availablePrefixes[Math.floor(Math.random() * availablePrefixes.length)]!;

  const hextetPosition = Math.floor(prefix / 4);
  const displayPosition = drillState.displaySettings?.zeroIndexed
    ? hextetPosition
    : hextetPosition + 1;
  const answer = displayPosition.toString();

  const indexingNote = drillState.displaySettings?.zeroIndexed
    ? "(0-indexed)"
    : "(1-indexed)";

  return {
    type: MemoryDrillMode.PREFIX_TO_HEXTET,
    question: `/${prefix}`,
    answer,
    explanation: `Prefix /${prefix} means look at hextet position ${displayPosition} ${indexingNote} (${prefix} ÷ 4 = ${hextetPosition}, then ${drillState.displaySettings?.zeroIndexed ? "use as-is" : "add 1 for 1-indexing"})`,
    itemId: prefix.toString(),
  } as const;
}

function generateHexToBinaryQuestion(): Question {
  const hexDigits = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
  ];
  const hex = hexDigits[Math.floor(Math.random() * hexDigits.length)]!;
  const binary = parseInt(hex, 16).toString(2).padStart(4, "0");

  return {
    type: MemoryDrillMode.HEX_TO_BINARY,
    question: `${hex} (hex)`,
    answer: binary,
    explanation: `${hex} in binary is ${binary} (${parseInt(hex, 16)} in decimal)`,
    itemId: hex,
  } as const;
}

function generateBinaryToDecimalQuestion(): Question {
  const decimal = Math.floor(Math.random() * 16);
  const binary = decimal.toString(2).padStart(4, "0");

  return {
    type: MemoryDrillMode.BINARY_TO_DECIMAL,
    question: binary,
    answer: decimal.toString(),
    explanation: `${binary} in decimal is ${decimal}`,
    itemId: binary,
  } as const;
}

function generateBinaryToHexQuestion(): Question {
  const decimal = Math.floor(Math.random() * 16);
  const binary = decimal.toString(2).padStart(4, "0");
  const hex = decimal.toString(16).toUpperCase();

  return {
    type: MemoryDrillMode.BINARY_TO_HEX,
    question: binary,
    answer: hex,
    explanation: `${binary} in hexadecimal is ${hex} (${decimal} in decimal)`,
    itemId: binary,
  } as const;
}

function generateIPv4BinaryToDecimalQuestion(): Question {
  const decimal = Math.floor(Math.random() * 256);
  const binary = decimal.toString(2).padStart(8, "0");

  return {
    type: MemoryDrillMode.IPV4_BINARY_TO_DECIMAL,
    question: binary,
    answer: decimal.toString(),
    explanation: `IPv4 octet ${binary} in decimal is ${decimal}`,
    itemId: binary,
  } as const;
}

export function useQuestionGenerator(
  currentMode: MemoryDrillModeType | null,
  drillState: DrillState,
  selectedPrefixes: readonly number[]
): () => Question {
  return useCallback((): Question => {
    if (!currentMode) {
      return generatePrefixQuestion(drillState, selectedPrefixes);
    }

    const generators: Record<MemoryDrillModeType, () => Question> = {
      [MemoryDrillMode.PREFIX_TO_HEXTET]: () =>
        generatePrefixQuestion(drillState, selectedPrefixes),
      [MemoryDrillMode.HEX_TO_BINARY]: generateHexToBinaryQuestion,
      [MemoryDrillMode.BINARY_TO_DECIMAL]: generateBinaryToDecimalQuestion,
      [MemoryDrillMode.BINARY_TO_HEX]: generateBinaryToHexQuestion,
      [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]:
        generateIPv4BinaryToDecimalQuestion,
    } as const;

    const generator = generators[currentMode];
    if (!generator) {
      throw new Error(`No generator found for mode: ${currentMode}`);
    }

    return generator();
  }, [currentMode, drillState, selectedPrefixes]);
}
