/**
 * MO:PULSE - "Your daily rhythm"
 * The Tracking Domain
 *
 * "I see everything you do"
 *
 * MO:PULSE captures all user activity and health data.
 * It's the primary input layer that feeds MO:COACH with data.
 *
 * Verticals:
 * - MoMove: Strength, cardio, mobility, sessions
 * - MoBody: Weight, measurements, composition
 * - MoRecover: Sleep, energy, soreness, strain
 * - MoFuel: Meals, macros, hydration
 */

// ============================================
// MoMove - Activity Vertical
// ============================================

export {
  // MoWarmup
  getWarmupTemplate,
  startWarmup,
  updateWarmupProgress,
  completeWarmup,
  skipWarmup,
  getWarmupLog,
} from './move';

// ============================================
// MoBody - Body Metrics Vertical
// ============================================

// Currently implemented in API routes
// Future: Move weight/measurement logic here

// ============================================
// MoRecover - Recovery Vertical
// ============================================

// Currently implemented in API routes
// Future: Move recovery logic here

// ============================================
// MoFuel - Nutrition Vertical (Future)
// ============================================

// export { ... } from './fuel';
