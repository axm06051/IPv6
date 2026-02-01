import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MemoryDrillMode, MemoryDrillModeType } from "../constants";
import { DrillState, Question, Result } from "../types";
import {
  useBatchOperations,
  useLocalStorageState,
  useQuestionGenerator,
} from "./";

const ALL_PREFIXES = Array.from({ length: 32 }, (_, i) => i + 1);

function getMasteredItemsInCurrentBatch(
  drillState: DrillState,
  selectedPrefixes: number[]
): number {
  if (!drillState.currentMode) return 0;
  const itemSuccessCounts =
    drillState.itemSuccessCounts[drillState.currentMode] || {};
  const currentBatchItems = selectedPrefixes || [];
  return currentBatchItems.filter(
    itemId => (itemSuccessCounts[itemId] || 0) >= 14
  ).length;
}

function getBatchName(
  drillState: DrillState,
  selectedPrefixes: number[]
): string {
  if (!drillState.currentMode) return "";
  const isPrefixMode =
    drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET;
  if (isPrefixMode) {
    return `${selectedPrefixes.length} prefixes selected`;
  }
  return getModeDisplayName(drillState.currentMode);
}

function getTargetDescription(drillState: DrillState): string {
  if (!drillState.currentMode) return "";
  if (drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET) {
    return "Practice converting prefix lengths to hextet positions";
  }
  return "Practice rapid conversion skills";
}

function getModeDisplayName(mode: MemoryDrillModeType): string {
  const displayNames: Record<MemoryDrillModeType, string> = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: "Prefix → Hextet",
    [MemoryDrillMode.HEX_TO_BINARY]: "Hex → Binary",
    [MemoryDrillMode.BINARY_TO_DECIMAL]: "Binary → Decimal",
    [MemoryDrillMode.BINARY_TO_HEX]: "Binary → Hex",
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "IPv4 Binary → Decimal",
  };
  return displayNames[mode] || "Memory Drill";
}

function getModeDescription(mode: MemoryDrillModeType): string {
  const descriptions: Record<MemoryDrillModeType, string> = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]:
      "Convert IPv6 prefix length to hextet position (÷4)",
    [MemoryDrillMode.HEX_TO_BINARY]:
      "Convert hexadecimal digit (0-F) to 4-bit binary",
    [MemoryDrillMode.BINARY_TO_DECIMAL]:
      "Convert 4-bit binary to decimal (0-15)",
    [MemoryDrillMode.BINARY_TO_HEX]:
      "Convert 4-bit binary to hexadecimal digit",
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]:
      "Convert 8-bit binary (IPv4 octet) to decimal (0-255)",
  };
  return descriptions[mode] || "";
}

function getInputPlaceholder(
  mode: MemoryDrillModeType | null,
  zeroIndexed: boolean = false
): string {
  if (!mode) return "";
  const placeholders: Record<MemoryDrillModeType, string> = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: zeroIndexed ? "0-31" : "1-32",
    [MemoryDrillMode.HEX_TO_BINARY]: "e.g., 1010",
    [MemoryDrillMode.BINARY_TO_DECIMAL]: "0-15",
    [MemoryDrillMode.BINARY_TO_HEX]: "0-F",
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: "0-255",
  };
  return placeholders[mode] || "";
}

function getInputPattern(
  mode: MemoryDrillModeType | null,
  value: string,
  zeroIndexed: boolean = false
): boolean {
  if (!mode) return true;
  const patterns: Record<MemoryDrillModeType, () => boolean> = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: () => {
      const num = parseInt(value);
      const min = zeroIndexed ? 0 : 1;
      const max = zeroIndexed ? 31 : 32;
      return /^\d{1,2}$/.test(value) && num >= min && num <= max;
    },
    [MemoryDrillMode.HEX_TO_BINARY]: () => /^[01]{1,4}$/.test(value),
    [MemoryDrillMode.BINARY_TO_DECIMAL]: () =>
      /^\d{1,2}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 15,
    [MemoryDrillMode.BINARY_TO_HEX]: () => /^[0-9A-F]$/i.test(value),
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: () =>
      /^\d{1,3}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 255,
  };
  return patterns[mode] ? patterns[mode]() : true;
}

export function useMemoryDrillGame(
  category: string,
  onAnswerSubmit: (category: string, isCorrect: boolean) => void
) {
  // Memoize initial state to prevent unnecessary re-renders and dependency issues
  const memoryDrillInitialState: DrillState = useMemo(
    () => ({
      currentMode: null,
      successCount: 0,
      startTime: null,
      responseTime: null,
      instructionsRead: {},
      penaltySettings: {
        enabled: true,
        amount: 1,
        maxAmount: 5,
      },
      displaySettings: {
        zeroIndexed: false,
      },
      learnedItems: {
        [MemoryDrillMode.PREFIX_TO_HEXTET]: [],
        [MemoryDrillMode.HEX_TO_BINARY]: [],
        [MemoryDrillMode.BINARY_TO_DECIMAL]: [],
        [MemoryDrillMode.BINARY_TO_HEX]: [],
        [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: [],
      },
      itemSuccessCounts: {
        [MemoryDrillMode.PREFIX_TO_HEXTET]: {},
        [MemoryDrillMode.HEX_TO_BINARY]: {},
        [MemoryDrillMode.BINARY_TO_DECIMAL]: {},
        [MemoryDrillMode.BINARY_TO_HEX]: {},
        [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: {},
      },
    }),
    []
  );

  const [drillState, setDrillState] = useLocalStorageState<DrillState>(
    `memory-drill-${category}`,
    memoryDrillInitialState
  );

  const [selectedPrefixes, setSelectedPrefixes] = useState<number[]>(() => {
    const saved = localStorage.getItem("memory-drill-selected-prefixes");
    return saved ? JSON.parse(saved) : ALL_PREFIXES.slice(0, 4);
  });

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [nextQuestion, setNextQuestion] = useState<Question | null>(null);
  const [input, setInput] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [showModeInstructions, setShowModeInstructions] =
    useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showPrefixSelection, setShowPrefixSelection] =
    useState<boolean>(false);
  const [penaltyAmountInput, setPenaltyAmountInput] = useState<string>(
    drillState.penaltySettings?.amount?.toString() || "1"
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const selectors = useMemo(
    () => ({
      penaltySettings: drillState.penaltySettings,
      learnedItems: drillState.currentMode
        ? drillState.learnedItems[drillState.currentMode] || []
        : [],
      itemSuccessCounts: drillState.currentMode
        ? drillState.itemSuccessCounts[drillState.currentMode] || {}
        : {},
      currentBatch: selectedPrefixes,
      isPrefixMode: drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET,
      batchName: getBatchName(drillState, selectedPrefixes),
      masteredItemsInCurrentBatch: getMasteredItemsInCurrentBatch(
        drillState,
        selectedPrefixes
      ),
      targetDescription: getTargetDescription(drillState),
      currentBatchItems: selectedPrefixes,
    }),
    [drillState, selectedPrefixes]
  );

  const generators = useMemo(
    () => ({
      getInputPlaceholder: () =>
        getInputPlaceholder(
          drillState.currentMode,
          drillState.displaySettings?.zeroIndexed
        ),
      getModeDisplayName: (mode: MemoryDrillModeType) =>
        getModeDisplayName(mode),
      getModeDescription: (mode: MemoryDrillModeType) =>
        getModeDescription(mode),
    }),
    [drillState.currentMode, drillState.displaySettings?.zeroIndexed]
  );

  const questionGenerator = useQuestionGenerator(
    drillState.currentMode,
    drillState,
    selectedPrefixes
  );

  const { addLearnedItem } = useBatchOperations(drillState, setDrillState);

  useEffect(() => {
    if (drillState.currentMode) {
      const question = questionGenerator();
      setCurrentQuestion(question);
      setStartTime(Date.now());
      const nextQ = questionGenerator();
      setNextQuestion(nextQ);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [drillState.currentMode, questionGenerator]);

  const submit = useCallback(() => {
    if (!input.trim() || !currentQuestion || startTime === null) return;
    const responseTime = Date.now() - startTime;
    const userAnswer = input.trim().toUpperCase();
    const isCorrect = userAnswer === currentQuestion.answer.toUpperCase();
    const submittedQuestion = currentQuestion;
    setResult({
      success: isCorrect,
      expected: submittedQuestion.answer,
      responseTime,
      question: submittedQuestion.question,
      explanation: submittedQuestion.explanation,
      userAnswer,
      itemId: submittedQuestion.itemId,
    });
    onAnswerSubmit(category, isCorrect);
    if (isCorrect) {
      addLearnedItem(parseInt(submittedQuestion.itemId));
      const newSuccessCount = drillState.successCount + 1;
      setDrillState(prev => ({ ...prev, successCount: newSuccessCount }));
    } else {
      const penaltyAmount = drillState.penaltySettings.enabled
        ? drillState.penaltySettings.amount
        : 0;
      const newSuccessCount = Math.max(
        0,
        drillState.successCount - penaltyAmount
      );
      setDrillState(prev => ({ ...prev, successCount: newSuccessCount }));
    }
    setInput("");
  }, [
    input,
    startTime,
    currentQuestion,
    category,
    onAnswerSubmit,
    drillState,
    addLearnedItem,
    setDrillState,
  ]);

  const next = useCallback(() => {
    setCurrentQuestion(nextQuestion);
    setResult(null);
    setInput("");
    setStartTime(Date.now());
    const newNextQuestion = questionGenerator();
    setNextQuestion(newNextQuestion);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [nextQuestion, questionGenerator]);

  const handleInputChange = useCallback(
    (value: string) => {
      if (
        getInputPattern(
          drillState.currentMode,
          value,
          drillState.displaySettings?.zeroIndexed
        ) ||
        value === ""
      ) {
        setInput(value);
      }
    },
    [drillState.currentMode, drillState.displaySettings?.zeroIndexed]
  );

  const resetProgress = useCallback(() => {
    if (
      window.confirm(
        "Reset all progress? This will reset all modes to batch 1 and clear all learned items and success counts."
      )
    ) {
      setDrillState({
        ...memoryDrillInitialState,
        currentMode: drillState.currentMode,
      });
      const question = questionGenerator();
      setCurrentQuestion(question);
      setResult(null);
      setInput("");
      setStartTime(Date.now());
      const nextQ = questionGenerator();
      setNextQuestion(nextQ);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [
    drillState.currentMode,
    questionGenerator,
    memoryDrillInitialState,
    setDrillState,
  ]);

  const changeMode = useCallback(
    (newMode: MemoryDrillModeType | null) => {
      setDrillState(prev => ({
        ...prev,
        currentMode: newMode,
        successCount: 0,
      }));
      setResult(null);
      setInput("");
      if (newMode && !drillState.instructionsRead?.[newMode]) {
        setShowModeInstructions(true);
      } else if (newMode) {
        const question = questionGenerator();
        setCurrentQuestion(question);
        setStartTime(Date.now());
        const nextQ = questionGenerator();
        setNextQuestion(nextQ);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 10);
      } else {
        setCurrentQuestion(null);
        setNextQuestion(null);
        setStartTime(null);
      }
    },
    [drillState.instructionsRead, questionGenerator, setDrillState]
  );

  const markModeInstructionsRead = useCallback(() => {
    setShowModeInstructions(false);
    setDrillState(prev => ({
      ...prev,
      instructionsRead: {
        ...(prev.instructionsRead || {}),
        [drillState.currentMode!]: true,
      },
    }));
    const question = questionGenerator();
    setCurrentQuestion(question);
    setResult(null);
    setInput("");
    setStartTime(Date.now());
    const nextQ = questionGenerator();
    setNextQuestion(nextQ);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [drillState.currentMode, questionGenerator, setDrillState]);

  const updatePenaltySettings = useCallback(
    (enabled: boolean, amount: number) => {
      const maxAmount = drillState.penaltySettings.maxAmount || 5;
      const penaltyAmount = Math.max(1, Math.min(amount, maxAmount));
      setDrillState(prev => ({
        ...prev,
        penaltySettings: {
          ...prev.penaltySettings,
          enabled,
          amount: penaltyAmount,
          maxAmount,
        },
      }));
      setPenaltyAmountInput(penaltyAmount.toString());
    },
    [drillState.penaltySettings.maxAmount, setDrillState]
  );

  const handlePenaltyAmountChange = useCallback(
    (value: string) => {
      setPenaltyAmountInput(value);
      if (value !== "") {
        const amount = parseInt(value, 10);
        const maxAmount = drillState.penaltySettings.maxAmount || 5;
        if (!isNaN(amount) && amount >= 1 && amount <= maxAmount) {
          updatePenaltySettings(true, amount);
        }
      }
    },
    [updatePenaltySettings, drillState.penaltySettings.maxAmount]
  );

  const updateDisplaySettings = useCallback(
    (settings: { zeroIndexed: boolean }) => {
      setDrillState(prev => ({
        ...prev,
        displaySettings: {
          ...prev.displaySettings,
          ...settings,
        },
      }));
    },
    [setDrillState]
  );

  const updateSelectedPrefixes = useCallback((newPrefixes: number[]) => {
    setSelectedPrefixes(newPrefixes);
    localStorage.setItem(
      "memory-drill-selected-prefixes",
      JSON.stringify(newPrefixes)
    );
  }, []);

  return {
    state: {
      drillState,
      input,
      result,
      currentQuestion,
      showModeInstructions,
      showSettings,
      showPrefixSelection,
      penaltyAmountInput,
      selectedPrefixes,
      inputRef,
    },
    actions: {
      handleInputChange,
      submit,
      next,
      resetProgress,
      changeMode,
      markModeInstructionsRead,
      updatePenaltySettings,
      updateDisplaySettings,
      handlePenaltyAmountChange,
      setShowSettings,
      setShowPrefixSelection,
      updateSelectedPrefixes,
    },
    selectors,
    generators,
  };
}
