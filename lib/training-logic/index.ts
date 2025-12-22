// ============================================
// TRAINING LOGIC LIBRARY
// Phase 5: Auto-Regulation & Intelligent Training
// ============================================

// Fatigue calculation and tracking
export {
  calculateFatigue,
  getFatigueStatus,
  logFatigue,
  getFatigueHistory,
  type FatigueLevel,
  type FatigueFactors,
  type FatigueStatus,
  type FatigueResult,
} from './fatigue';

// Progression gates and recommendations
export {
  checkProgressionGates,
  getProgressionRecommendation,
  getPlateauStrategies,
  getExercisesReadyToProgress,
  getPlateauedExercises,
  type ProgressionGate,
  type ProgressionRecommendation,
  type ExercisePerformance,
  type ProgressionRule,
} from './progression';

// Deload detection and management
export {
  checkDeloadNeeded,
  startDeload,
  endDeload,
  getActiveDeload,
  getDeloadHistory,
  applyDeloadModifiers,
  type DeloadType,
  type DeloadDecision,
  type ActiveDeload,
} from './deload';

// Weight and set suggestions
export {
  suggestWeight,
  getSuggestionAfterSet,
  getWarmupProgression,
  getWarmupSets,
  getRestTimerConfig,
  getRestTimerFromSlot,
  type WeightSuggestion,
  type SetSuggestion,
  type WarmupSuggestion,
  type RestTimerConfig,
} from './suggestions';
