import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import type { Goal } from '../types';

/**
 * Updates a goal.
 * @param goalId - Goal ID
 * @param data - Partial goal data to update
 * @returns Updated goal
 */
export async function updateGoal(
  goalId: string,
  data: Partial<Omit<Goal, 'id' | 'userId' | 'createdAt'>>
): Promise<Goal> {
  const [updated] = await db
    .update(goals)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(goals.id, goalId))
    .returning();

  return updated;
}
