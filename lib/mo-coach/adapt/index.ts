/**
 * MoAdapt - "I adjust your training"
 * Part of MO:COACH
 *
 * The adaptation vertical handles all training auto-regulation:
 * - MoFatigue: Fatigue calculation and monitoring
 * - MoProgress: Progression gates and readiness
 * - MoDeload: Deload detection and management
 * - MoSuggest: Weight and set recommendations
 */

// MoFatigue - "The Guardian"
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

// MoProgress - "The Challenger"
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

// MoDeload - "The Healer"
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

// MoSuggest - "The Advisor"
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
