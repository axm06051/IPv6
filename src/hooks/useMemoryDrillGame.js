import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useLocalStorageState } from './useLocalStorageState.js';
import { useBatchOperations } from './useBatchOperations.js';
import { useQuestionGenerator } from './useQuestionGenerator.js';
import { MemoryDrillMode } from '../constants/memoryDrillModes.js';

const ALL_PREFIXES = Array.from({ length: 32 }, (_, i) => i + 1);

function getCurrentBatch(drillState, selectedPrefixes) {
  if (!drillState.currentMode) return [];
  return selectedPrefixes || [];
}

function getMasteredItemsInCurrentBatch(drillState, selectedPrefixes) {
  if (!drillState.currentMode) return 0;
  const itemSuccessCounts =
    drillState.itemSuccessCounts[drillState.currentMode] || {};
  const currentBatchItems = selectedPrefixes || [];
  return currentBatchItems.filter(
    (itemId) => (itemSuccessCounts[itemId] || 0) >= 14
  ).length;
}

function getBatchName(drillState, selectedPrefixes) {
  if (!drillState.currentMode) return '';
  const isPrefixMode =
    drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET;
  if (isPrefixMode) {
    return `${selectedPrefixes.length} prefixes selected`;
  }
  return getModeDisplayName(drillState.currentMode);
}

function getTargetDescription(drillState) {
  if (!drillState.currentMode) return '';
  if (drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET) {
    return 'Practice converting prefix lengths to hextet positions';
  }
  return 'Practice rapid conversion skills';
}

function getModeDisplayName(mode) {
  const displayNames = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: 'Prefix → Hextet',
    [MemoryDrillMode.HEX_TO_BINARY]: 'Hex → Binary',
    [MemoryDrillMode.BINARY_TO_DECIMAL]: 'Binary → Decimal',
    [MemoryDrillMode.BINARY_TO_HEX]: 'Binary → Hex',
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: 'IPv4 Binary → Decimal'
  };
  return displayNames[mode] || 'Memory Drill';
}

function getModeDescription(mode) {
  const descriptions = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]:
      'Convert IPv6 prefix length to hextet position (÷4)',
    [MemoryDrillMode.HEX_TO_BINARY]:
      'Convert hexadecimal digit (0-F) to 4-bit binary',
    [MemoryDrillMode.BINARY_TO_DECIMAL]:
      'Convert 4-bit binary to decimal (0-15)',
    [MemoryDrillMode.BINARY_TO_HEX]:
      'Convert 4-bit binary to hexadecimal digit',
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]:
      'Convert 8-bit binary (IPv4 octet) to decimal (0-255)'
  };
  return descriptions[mode] || '';
}

function getInputPlaceholder(mode) {
  const placeholders = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: '0-31',
    [MemoryDrillMode.HEX_TO_BINARY]: 'e.g., 1010',
    [MemoryDrillMode.BINARY_TO_DECIMAL]: '0-15',
    [MemoryDrillMode.BINARY_TO_HEX]: '0-F',
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: '0-255'
  };
  return placeholders[mode] || '';
}

function getInputPattern(mode, value) {
  const patterns = {
    [MemoryDrillMode.PREFIX_TO_HEXTET]: () =>
      /^\d{1,2}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 31,
    [MemoryDrillMode.HEX_TO_BINARY]: () => /^[01]{4}$/.test(value),
    [MemoryDrillMode.BINARY_TO_DECIMAL]: () =>
      /^\d{1,2}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 15,
    [MemoryDrillMode.BINARY_TO_HEX]: () => /^[0-9A-F]$/i.test(value),
    [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: () =>
      /^\d{1,3}$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 255
  };
  return patterns[mode] ? patterns[mode]() : true;
}

export function useMemoryDrillGame(category, onAnswerSubmit) {
  const initialState = {
    currentMode: null,
    successCount: 0,
    startTime: null,
    responseTime: null,
    instructionsRead: {},
    penaltySettings: {
      enabled: true,
      amount: 1,
      maxAmount: 5
    },
    learnedItems: {
      [MemoryDrillMode.PREFIX_TO_HEXTET]: [],
      [MemoryDrillMode.HEX_TO_BINARY]: [],
      [MemoryDrillMode.BINARY_TO_DECIMAL]: [],
      [MemoryDrillMode.BINARY_TO_HEX]: [],
      [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: []
    },
    itemSuccessCounts: {
      [MemoryDrillMode.PREFIX_TO_HEXTET]: {},
      [MemoryDrillMode.HEX_TO_BINARY]: {},
      [MemoryDrillMode.BINARY_TO_DECIMAL]: {},
      [MemoryDrillMode.BINARY_TO_HEX]: {},
      [MemoryDrillMode.IPV4_BINARY_TO_DECIMAL]: {}
    }
  };

  const [drillState, setDrillState] = useLocalStorageState(
    `memory-drill-${category}`,
    initialState
  );
  
  const [selectedPrefixes, setSelectedPrefixes] = useState(() => {
    const saved = localStorage.getItem('memory-drill-selected-prefixes');
    return saved ? JSON.parse(saved) : ALL_PREFIXES.slice(0, 4);
  });
  
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [nextQuestion, setNextQuestion] = useState(null);
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [showModeInstructions, setShowModeInstructions] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPrefixSelection, setShowPrefixSelection] = useState(false);
  const [penaltyAmountInput, setPenaltyAmountInput] = useState(
    drillState.penaltySettings?.amount?.toString() || '1'
  );
  const inputRef = useRef(null);

  const selectors = useMemo(
    () => ({
      penaltySettings: drillState.penaltySettings,
      learnedItems: drillState.learnedItems?.[drillState.currentMode] || [],
      itemSuccessCounts:
        drillState.itemSuccessCounts?.[drillState.currentMode] || {},
      currentBatch: selectedPrefixes,
      isPrefixMode: drillState.currentMode === MemoryDrillMode.PREFIX_TO_HEXTET,
      isComplete: false,
      batchName: getBatchName(drillState, selectedPrefixes),
      masteredItemsInCurrentBatch: getMasteredItemsInCurrentBatch(
        drillState,
        selectedPrefixes
      ),
      targetDescription: getTargetDescription(drillState),
      currentBatchItems: selectedPrefixes
    }),
    [drillState, selectedPrefixes]
  );

  const generators = useMemo(
    () => ({
      getInputPlaceholder: () => getInputPlaceholder(drillState.currentMode),
      getModeDisplayName: (mode) => getModeDisplayName(mode),
      getModeDescription: (mode) => getModeDescription(mode)
    }),
    [drillState.currentMode]
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
    if (!input.trim() || !currentQuestion) return;
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
      itemId: submittedQuestion.itemId
    });
    onAnswerSubmit(category, isCorrect);
    if (isCorrect) {
      addLearnedItem(submittedQuestion.itemId);
      const newSuccessCount = drillState.successCount + 1;
      setDrillState((prev) => ({ ...prev, successCount: newSuccessCount }));
    } else {
      const penaltyAmount = drillState.penaltySettings.enabled
        ? drillState.penaltySettings.amount
        : 0;
      const newSuccessCount = Math.max(
        0,
        drillState.successCount - penaltyAmount
      );
      setDrillState((prev) => ({ ...prev, successCount: newSuccessCount }));
    }
    setInput('');
  }, [
    input,
    startTime,
    currentQuestion,
    category,
    onAnswerSubmit,
    drillState,
    addLearnedItem,
    setDrillState
  ]);

  const next = useCallback(() => {
    setCurrentQuestion(nextQuestion);
    setResult(null);
    setInput('');
    setStartTime(Date.now());
    const newNextQuestion = questionGenerator();
    setNextQuestion(newNextQuestion);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [nextQuestion, questionGenerator]);

  const handleInputChange = useCallback(
    (value) => {
      if (getInputPattern(drillState.currentMode, value) || value === '') {
        setInput(value);
      }
    },
    [drillState.currentMode]
  );

  const resetProgress = useCallback(() => {
    if (
      window.confirm(
        'Reset all progress? This will reset all modes to batch 1 and clear all learned items and success counts.'
      )
    ) {
      setDrillState({
        ...initialState,
        currentMode: drillState.currentMode
      });
      const question = questionGenerator();
      setCurrentQuestion(question);
      setResult(null);
      setInput('');
      setStartTime(Date.now());
      const nextQ = questionGenerator();
      setNextQuestion(nextQ);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [drillState.currentMode, questionGenerator, initialState, setDrillState]);

  const changeMode = useCallback(
    (newMode) => {
      setDrillState((prev) => ({
        ...prev,
        currentMode: newMode,
        successCount: 0
      }));
      setResult(null);
      setInput('');
      if (newMode && !drillState.instructionsRead?.[newMode]) {
        setShowModeInstructions(true);
      } else {
        const question = questionGenerator();
        setCurrentQuestion(question);
        setStartTime(Date.now());
        const nextQ = questionGenerator();
        setNextQuestion(nextQ);
        setTimeout(() => {
          inputRef.current?.focus();
        }, 10);
      }
    },
    [drillState.instructionsRead, questionGenerator, setDrillState]
  );

  const markModeInstructionsRead = useCallback(() => {
    setShowModeInstructions(false);
    setDrillState((prev) => ({
      ...prev,
      instructionsRead: {
        ...(prev.instructionsRead || {}),
        [drillState.currentMode]: true
      }
    }));
    const question = questionGenerator();
    setCurrentQuestion(question);
    setResult(null);
    setInput('');
    setStartTime(Date.now());
    const nextQ = questionGenerator();
    setNextQuestion(nextQ);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 10);
  }, [drillState.currentMode, questionGenerator, setDrillState]);

  const updatePenaltySettings = useCallback(
    (enabled, amount) => {
      const maxAmount = drillState.penaltySettings.maxAmount || 5;
      const penaltyAmount = Math.max(1, Math.min(amount, maxAmount));
      setDrillState((prev) => ({
        ...prev,
        penaltySettings: {
          ...prev.penaltySettings,
          enabled,
          amount: penaltyAmount,
          maxAmount
        }
      }));
      setPenaltyAmountInput(penaltyAmount.toString());
    },
    [drillState.penaltySettings.maxAmount, setDrillState]
  );

  const handlePenaltyAmountChange = useCallback(
    (value) => {
      setPenaltyAmountInput(value);
      if (value !== '') {
        const amount = parseInt(value, 10);
        const maxAmount = drillState.penaltySettings.maxAmount || 5;
        if (!isNaN(amount) && amount >= 1 && amount <= maxAmount) {
          updatePenaltySettings(true, amount);
        }
      }
    },
    [updatePenaltySettings, drillState.penaltySettings.maxAmount]
  );

  const updateSelectedPrefixes = useCallback((newPrefixes) => {
    setSelectedPrefixes(newPrefixes);
    localStorage.setItem(
      'memory-drill-selected-prefixes',
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
      selectedPrefixes
    },
    actions: {
      handleInputChange,
      submit,
      next,
      resetProgress,
      changeMode,
      markModeInstructionsRead,
      updatePenaltySettings,
      handlePenaltyAmountChange,
      setShowSettings,
      setShowPrefixSelection,
      updateSelectedPrefixes
    },
    selectors,
    generators
  };
}