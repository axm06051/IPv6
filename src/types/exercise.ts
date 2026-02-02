import type { PrefixModeType } from "../constants";

export type ExerciseType =
  | "full-to-abbrev"
  | "abbrev-to-full"
  | "prefix"
  | "math";

export interface BaseExercise {
  readonly question: string;
  readonly answer: string;
  readonly type: ExerciseType;
}

export interface Exercise {
  question: string;
  answer: string;
  fullAnswer?: string;
  abbrevAnswer?: string;
  type: ExerciseType;
}

export interface GeneratedExercise {
  question: string;
  answer: string;
  fullAnswer?: string;
  abbrevAnswer?: string;
  type: ExerciseType;
}

export interface IPv6Exercise extends BaseExercise {
  readonly fullAnswer?: string;
  readonly abbrevAnswer?: string;
}

export interface ExerciseResult {
  readonly success: boolean;
  readonly message: string;
  readonly formattedExpectedAnswer: string;
  readonly userInput: string;
  readonly shortestForm: string | null;
  readonly responseTime?: number;
}

export interface ExerciseGenerator<T extends BaseExercise = BaseExercise> {
  (): T;
}

export interface ExerciseProps {
  readonly title: string;
  readonly generator: ExerciseGenerator;
  readonly category: string;
  readonly onAnswerSubmit: (category: string, isCorrect: boolean) => void;
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

export interface ParsedPrefixInput {
  readonly addr: any; // ipaddr.js type
  readonly prefix: number;
}

export interface ResultState {
  readonly message: string;
  readonly success: boolean;
  readonly formattedExpectedAnswer: string;
  readonly userInput: string;
  readonly shortestForm: string | null;
}

export interface FeedbackDetails {
  readonly type: string;
  readonly message: string;
  readonly suggestions: readonly string[];
}

export interface DetailedFeedback {
  readonly type: "success" | "error";
  readonly message: string;
  details: FeedbackDetails | null;
}

export interface ExerciseConfig {
  readonly type: ExerciseType;
  readonly title: string;
  readonly description: string;
  readonly category: string;
  readonly difficulty: "beginner" | "intermediate" | "advanced";
  readonly estimatedTime: number; // in minutes
}

// Exercise Tab Types
export interface BaseExerciseConfig {
  readonly title: string;
  readonly category: string;
}

export interface RegularExercise extends BaseExerciseConfig {
  readonly type: ExerciseType;
  readonly mode?: PrefixModeType;
}

export interface MemoryDrillExercise extends BaseExerciseConfig {
  readonly type: "memory-drill";
}

export type ExerciseTabConfig = RegularExercise | MemoryDrillExercise;

export interface ExerciseTabsProps {
  readonly recordAnswer: (category: string, isCorrect: boolean) => void;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  exercises: ExerciseTabConfig[];
}
