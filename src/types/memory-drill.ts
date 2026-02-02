import type { MemoryDrillModeType } from "../constants";

export interface PenaltySettings {
  readonly enabled: boolean;
  readonly amount: number;
  readonly maxAmount: number;
}

export interface DrillState {
  readonly currentMode: MemoryDrillModeType | null;
  readonly successCount: number;
  readonly startTime: number | null;
  readonly responseTime: number | null;
  readonly instructionsRead: Readonly<Record<string, boolean>>;
  readonly penaltySettings: PenaltySettings;
  readonly learnedItems: Readonly<
    Record<MemoryDrillModeType, readonly number[]>
  >;
  readonly itemSuccessCounts: Readonly<
    Record<MemoryDrillModeType, Readonly<Record<number, number>>>
  >;
}

export interface Question {
  readonly type: MemoryDrillModeType;
  readonly question: string;
  readonly answer: string;
  readonly explanation: string;
  readonly itemId: string;
}

export interface Result {
  readonly success: boolean;
  readonly expected: string;
  readonly responseTime: number;
  readonly question: string;
  readonly explanation: string;
  readonly userAnswer: string;
  readonly itemId: string;
}

export interface MemoryDrillConfig {
  readonly modes: readonly MemoryDrillModeType[];
  readonly defaultPenaltySettings: PenaltySettings;
  readonly masteryThreshold: number;
  readonly batchSize: number;
}

export interface DrillProgress {
  readonly mode: MemoryDrillModeType;
  readonly totalItems: number;
  readonly masteredItems: number;
  readonly currentStreak: number;
  readonly bestStreak: number;
  readonly accuracy: number;
  readonly averageResponseTime: number;
}

// Memory Drill Component Types

export interface MemoryDrillGameProps {
  readonly category: string;
  readonly onAnswerSubmit: (category: string, isCorrect: boolean) => void;
}

export interface ModeSelectionCardProps {
  readonly mode: MemoryDrillModeType;
  readonly title: string;
  readonly description: string;
  readonly drillState: DrillState;
  readonly onChangeMode: (mode: MemoryDrillModeType) => void;
  readonly buttonColor: string;
  readonly selectedPrefixes?: number[];
}

export interface MemoryDrillModeSelectionProps {
  readonly drillState: DrillState;
  readonly penaltySettings: PenaltySettings;
  readonly onChangeMode: (mode: MemoryDrillModeType) => void;
  readonly onShowSettings: () => void;
}

export interface GameRulesProps {
  readonly penaltySettings: PenaltySettings;
  readonly isPrefixMode: boolean;
}

export interface MemoryDrillInstructionsProps {
  readonly mode: MemoryDrillModeType;
  readonly currentBatch: readonly number[];
  readonly learnedItems: readonly number[];
  readonly masteredItemsInCurrentBatch: number;
  readonly penaltySettings: PenaltySettings;
  readonly isPrefixMode: boolean;
  readonly currentBatchItems: readonly number[];
  readonly onStart: () => void;
  readonly onBack: () => void;
  readonly getModeDisplayName: (mode: MemoryDrillModeType) => string;
}

export interface GameHeaderProps {
  readonly batchName: string;
  readonly masteredItemsInCurrentBatch: number;
  readonly selectedPrefixes: number[];
  readonly isPrefixMode: boolean;
  readonly targetDescription: string;
  readonly penaltySettings: PenaltySettings;
  readonly modeDescription: string;
}

export interface QuestionDisplayProps {
  readonly currentQuestion: Question | null;
  readonly result: Result | null;
  readonly isPrefixMode: boolean;
  readonly mode?: MemoryDrillModeType | null;
}

export interface AnswerInputProps {
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly placeholder?: string;
  readonly mode?: MemoryDrillModeType | null;
  readonly disabled?: boolean;
  readonly onSubmit?: () => void;
  readonly onNext?: () => void;
  readonly result?: Result | null;
  readonly inputRef?: React.RefObject<HTMLInputElement | null>;
}

export interface ResultDisplayProps {
  readonly result: Result | null;
  readonly itemSuccessCounts: Record<number, number>;
  readonly penaltySettings: PenaltySettings;
}

export interface GameControlsProps {
  readonly result: Result | null;
  readonly input: string;
  readonly onSubmit: () => void;
  readonly onNext: () => void;
  readonly mode: MemoryDrillModeType | null;
  readonly onChangeMode: () => void;
  readonly getModeDisplayName: (mode: MemoryDrillModeType) => string;
  readonly onResetProgress: () => void;
  readonly onShowSettings?: () => void;
  readonly onShowPrefixSelection?: () => void;
  readonly isPrefixMode?: boolean;
}

export interface PrefixSelectionModalProps {
  readonly selectedPrefixes: number[];
  readonly onUpdate: (prefixes: number[]) => void;
  readonly onClose: () => void;
}

export interface BatchProgressProps {
  readonly show: boolean;
  readonly mode: MemoryDrillModeType | null;
  readonly currentBatch: readonly number[];
  readonly itemSuccessCounts: Record<number, number>;
}

export interface SettingsModalProps {
  readonly show: boolean;
  readonly onClose: () => void;
  readonly penaltySettings: PenaltySettings;
  readonly onUpdatePenalty: (enabled: boolean, amount: number) => void;
  readonly penaltyAmountInput: string;
  readonly onPenaltyAmountChange: (value: string) => void;
}

export interface ModeSelectorProps {
  readonly mode: MemoryDrillModeType | null;
  readonly onChangeMode: (mode: MemoryDrillModeType) => void;
  readonly getModeDisplayName: (mode: MemoryDrillModeType) => string;
}

export interface MemoryDrillGameInterfaceProps {
  readonly mode: MemoryDrillModeType | null;
  readonly selectedPrefixes: number[];
  readonly currentQuestion: Question | null;
  readonly result: Result | null;
  readonly input: string;
  readonly isPrefixMode: boolean;
  readonly batchName: string;
  readonly masteredItemsInCurrentBatch: number;
  readonly targetDescription: string;
  readonly penaltySettings: PenaltySettings;
  readonly showSettings: boolean;
  readonly penaltyAmountInput: string;
  readonly inputRef: React.RefObject<HTMLInputElement | null>;
  readonly onInputChange: (value: string) => void;
  readonly onSubmit: () => void;
  readonly onNext: () => void;
  readonly onResetProgress: () => void;
  readonly onChangeMode: (mode: MemoryDrillModeType | null) => void;
  readonly onUpdatePenalty: (enabled: boolean, amount: number) => void;
  readonly onPenaltyAmountChange: (value: string) => void;
  readonly onShowSettings: () => void;
  readonly onCloseSettings: () => void;
  readonly updateSelectedPrefixes: (prefixes: number[]) => void;
  readonly getInputPlaceholder: () => string;
  readonly getModeDisplayName: (mode: MemoryDrillModeType) => string;
  readonly getModeDescription: (mode: MemoryDrillModeType) => string;
}
