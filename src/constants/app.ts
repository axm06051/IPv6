export const APP_CONFIG = {
  name: "IPv6 Practice Exercises",
  version: "2.0.0",
  description: "Learn IPv6 addressing and prefix calculations",
  author: "IPv6 Practice Team",
  repository: "https://github.com/example/ipv6-practice",
} as const;

export const STORAGE_KEYS = {
  theme: "theme",
  statistics: "ipv6-practice-stats",
  memoryDrill: "memory-drill",
  selectedPrefixes: "memory-drill-selected-prefixes",
  userPreferences: "user-preferences",
} as const;

export const API_ENDPOINTS = {
  base: process.env.REACT_APP_API_BASE_URL || "https://api.example.com",
  exercises: "/exercises",
  statistics: "/statistics",
  feedback: "/feedback",
} as const;

export const PERFORMANCE_THRESHOLDS = {
  excellent: 95,
  good: 80,
  fair: 60,
  poor: 0,
} as const;

export const TIMING_CONSTANTS = {
  debounceDelay: 300,
  animationDuration: 200,
  toastDuration: 5000,
  autoSaveInterval: 30000,
} as const;
