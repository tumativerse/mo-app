import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import type { Goal } from '../types';

/**
 * Gets the active goal for a user.
 * @param userId - User ID
 * @returns Active goal or null
 */
export async function getActiveGoal(userId: string): Promise<Goal | null> {
  const [goal] = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, userId), eq(goals.status, 'active')))
    .limit(1);

  return goal || null;
}

/**
 * Gets a goal by ID.
 * @param goalId - Goal ID
 * @returns Goal or null
 */
export async function getGoalById(goalId: string): Promise<Goal | null> {
  const [goal] = await db.select().from(goals).where(eq(goals.id, goalId)).limit(1);

  return goal || null;
}
