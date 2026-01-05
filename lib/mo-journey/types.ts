import { goals, measurements } from '@/lib/db/schema';

/**
 * Goal type inferred from database schema
 */
export type Goal = typeof goals.$inferSelect;

/**
 * New goal type for inserts
 */
export type NewGoal = typeof goals.$inferInsert;

/**
 * Measurement type inferred from database schema
 */
export type Measurement = typeof measurements.$inferSelect;

/**
 * New measurement type for inserts
 */
export type NewMeasurement = typeof measurements.$inferInsert;

/**
 * Goal progress calculation result with embedded intelligence
 */
export interface GoalProgress {
  goalId: string;
  percentComplete: number;
  currentWeight: number;
  targetWeight: number;
  startingWeight: number;
  daysElapsed: number;
  daysRemaining: number;
  expectedWeight: number; // Where you should be based on linear progress
  status: 'ahead' | 'on_track' | 'behind';
  recommendations: string[];
  trend: 'improving' | 'stable' | 'declining';
}
