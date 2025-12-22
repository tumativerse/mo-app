/**
 * MO:COACH - "Your smart trainer"
 * The Intelligence Domain
 *
 * "I think so you don't have to"
 *
 * MO:COACH analyzes data from MO:PULSE, applies training science,
 * and provides personalized guidance for optimal training.
 *
 * Verticals:
 * - MoInsight: Trends, reports, pattern recognition
 * - MoAdapt: Fatigue, progression, deload, suggestions
 * - MoChat: AI coach interface (future)
 */

// ============================================
// MoAdapt - Adaptation Vertical
// ============================================

export {
  // MoFatigue
  calculateFatigue,
  getFatigueStatus,
  logFatigue,
  getFatigueHistory,
  type FatigueLevel,
  type FatigueFactors,
  type FatigueStatus,
  type FatigueResult,

  // MoProgress
  checkProgressionGates,
  getProgressionRecommendation,
  getPlateauStrategies,
  getExercisesReadyToProgress,
  getPlateauedExercises,
  type ProgressionGate,
  type ProgressionRecommendation,
  type ExercisePerformance,
  type ProgressionRule,

  // MoDeload
  checkDeloadNeeded,
  startDeload,
  endDeload,
  getActiveDeload,
  getDeloadHistory,
  applyDeloadModifiers,
  type DeloadType,
  type DeloadDecision,
  type ActiveDeload,

  // MoSuggest
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
} from './adapt';

// ============================================
// MoInsight - Analytics Vertical (Future)
// ============================================

// export { ... } from './insight';

// ============================================
// MoChat - AI Coach Vertical (Future)
// ============================================

// export { ... } from './chat';
