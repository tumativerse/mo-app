import { db } from '@/lib/db';
import { measurements } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';
import type { Measurement } from '../types';

/**
 * Gets measurements for a user, ordered by date descending (most recent first).
 * @param userId - User ID
 * @param limit - Number of measurements to return (default: 30)
 * @returns Array of measurements
 */
export async function getMeasurements(userId: string, limit: number = 30): Promise<Measurement[]> {
  return db
    .select()
    .from(measurements)
    .where(eq(measurements.userId, userId))
    .orderBy(desc(measurements.date))
    .limit(limit);
}
