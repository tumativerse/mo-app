/**
 * MO:JOURNEY - Strategic Domain
 *
 * Orchestrates goal-setting, progress tracking, and milestone management.
 * Phase 1: Embedded intelligence (simple recommendations)
 * Phase 2: Extract to MO:MIND Journey Agent
 */

// Goals vertical
export { createGoal, getActiveGoal, getGoalById, updateGoal } from './goals';

// Progress vertical
export { getGoalProgress, logMeasurement, getMeasurements } from './progress';

// Types
export type { Goal, NewGoal, Measurement, NewMeasurement, GoalProgress } from './types';
