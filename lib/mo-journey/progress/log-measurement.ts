import { db } from '@/lib/db';
import { measurements } from '@/lib/db/schema';
import type { NewMeasurement, Measurement } from '../types';

/**
 * Logs a new measurement for a user.
 * @param userId - User ID
 * @param data - Measurement data
 * @returns Created measurement
 */
export async function logMeasurement(
  userId: string,
  data: Omit<NewMeasurement, 'userId' | 'id' | 'createdAt' | 'updatedAt'>
): Promise<Measurement> {
  const [measurement] = await db
    .insert(measurements)
    .values({
      userId,
      date: data.date || new Date(),
      weight: data.weight,
      notes: data.notes,
      goalId: data.goalId,
    })
    .returning();

  return measurement;
}
