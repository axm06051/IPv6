export interface BaseStats {
  readonly total: number;
  readonly correct: number;
}

export interface CategoryStats extends BaseStats {
  readonly category: string;
  readonly lastUpdated: Date;
}

export interface SessionStats extends BaseStats {
  readonly byCategory?: Readonly<Record<string, BaseStats>>;
  readonly sessionStart: Date;
  readonly sessionDuration: number; // in milliseconds
}

export interface StatsItem {
  readonly value: number | string;
  readonly label: string;
  readonly color:
    | "primary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "secondary";
  readonly trend?: "up" | "down" | "stable";
}

export interface StatisticsDisplayProps {
  readonly stats: SessionStats;
  readonly showDetails?: boolean;
  readonly onReset?: () => void;
}

export interface StatsModalProps {
  readonly show: boolean;
  readonly onClose: () => void;
  readonly stats: SessionStats;
}

export interface PerformanceMetrics {
  readonly accuracy: number;
  readonly averageResponseTime: number;
  readonly totalQuestions: number;
  readonly streakCurrent: number;
  readonly streakBest: number;
  readonly timeSpent: number; // in milliseconds
}

export interface StatsExport {
  readonly version: string;
  readonly exportDate: Date;
  readonly stats: SessionStats;
  readonly metrics: PerformanceMetrics;
}

export interface ExtendedStatsModalProps extends StatsModalProps {
  onReset: () => void;
}
