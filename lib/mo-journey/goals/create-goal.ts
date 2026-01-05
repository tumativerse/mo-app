import { db } from '@/lib/db';
import { goals } from '@/lib/db/schema';
import type { NewGoal, Goal } from '../types';

/**
 * Creates a new goal for a user.
 * @param userId - User ID
 * @param data - Goal creation data
 * @returns Created goal
 */
export async function createGoal(
  userId: string,
  data: Omit<NewGoal, 'userId' | 'id' | 'createdAt' | 'updatedAt'>
): Promise<Goal> {
  const [goal] = await db
    .insert(goals)
    .values({
      userId,
      ...data,
      status: 'active',
    })
    .returning();

  return goal;
}
