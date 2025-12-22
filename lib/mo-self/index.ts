/**
 * MO:SELF - "This is you"
 * The Foundation Domain
 *
 * "I remember everything about you"
 *
 * MO:SELF is the foundation layer that stores user identity,
 * preferences, and history. All other domains reference MO:SELF
 * to understand context.
 *
 * Verticals:
 * - MoIdentity: Auth, profile, goals
 * - MoPrefs: Settings, equipment, notifications
 * - MoHistory: Records, badges, streaks
 */

// ============================================
// MoIdentity - Identity Vertical
// ============================================

export {
  auth,
  currentUser,
  getOrCreateUser,
  getUserByClerkId,
  requireAuth,
  getCurrentUser,
} from './identity';

// ============================================
// MoPrefs - Preferences Vertical
// ============================================

export {
  getPreferences,
  updatePreferences,
  getEquipmentLevel,
  getWeightUnit,
  shouldSkipWarmup,
  getAvailableEquipment,
  getTrainingGoals,
} from './preferences';

// ============================================
// MoHistory - History Vertical
// ============================================

export {
  // MoStreaks
  getStreak,
  updateStreakOnWorkout,
  getStreakStats,
  // MoRecords
  checkAndRecordPR,
  getAllPRs,
  getExercisePRHistory,
  getCurrentPR,
  getRecentPRs,
  calculateEstimated1RM,
} from './history';
