import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { recoveryLogs } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc, gte, lte } from 'drizzle-orm';
import { z } from 'zod';

// Schema for recovery log
const recoveryLogSchema = z.object({
  date: z.string().optional(), // ISO date string, defaults to today
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: z.number().min(1).max(5).optional(),
  energyLevel: z.number().min(1).max(5).optional(),
  overallSoreness: z.number().min(1).max(5).optional(),
  sorenessAreas: z.array(z.string()).optional(),
  stressLevel: z.number().min(1).max(5).optional(),
  notes: z.string().optional(),
});

// GET /api/recovery - Get recovery logs
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7');
    const date = searchParams.get('date');

    if (date) {
      // Get specific date
      const targetDate = new Date(date);
      targetDate.setHours(0, 0, 0, 0);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      const log = await db.query.recoveryLogs.findFirst({
        where: and(
          eq(recoveryLogs.userId, user.id),
          gte(recoveryLogs.date, targetDate),
          lte(recoveryLogs.date, nextDay)
        ),
      });

      return NextResponse.json({ log });
    }

    // Get last N days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const logs = await db.query.recoveryLogs.findMany({
      where: and(
        eq(recoveryLogs.userId, user.id),
        gte(recoveryLogs.date, startDate)
      ),
      orderBy: [desc(recoveryLogs.date)],
    });

    // Calculate averages
    const validLogs = logs.filter((l) => l.sleepQuality || l.energyLevel);
    const avgSleepHours =
      validLogs.reduce((sum, l) => sum + (Number(l.sleepHours) || 0), 0) /
      (validLogs.length || 1);
    const avgSleepQuality =
      validLogs.reduce((sum, l) => sum + (l.sleepQuality || 0), 0) /
      (validLogs.length || 1);
    const avgEnergy =
      validLogs.reduce((sum, l) => sum + (l.energyLevel || 0), 0) /
      (validLogs.length || 1);
    const avgSoreness =
      validLogs.reduce((sum, l) => sum + (l.overallSoreness || 0), 0) /
      (validLogs.length || 1);
    const avgStress =
      validLogs.reduce((sum, l) => sum + (l.stressLevel || 0), 0) /
      (validLogs.length || 1);

    return NextResponse.json({
      logs,
      summary: {
        days: validLogs.length,
        avgSleepHours: Math.round(avgSleepHours * 10) / 10,
        avgSleepQuality: Math.round(avgSleepQuality * 10) / 10,
        avgEnergy: Math.round(avgEnergy * 10) / 10,
        avgSoreness: Math.round(avgSoreness * 10) / 10,
        avgStress: Math.round(avgStress * 10) / 10,
      },
    });
  } catch (error) {
    console.error('Error fetching recovery logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recovery logs' },
      { status: 500 }
    );
  }
}

// POST /api/recovery - Log recovery data
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = recoveryLogSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid data', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      date,
      sleepHours,
      sleepQuality,
      energyLevel,
      overallSoreness,
      sorenessAreas,
      stressLevel,
      notes,
    } = parsed.data;

    const logDate = date ? new Date(date) : new Date();
    logDate.setHours(12, 0, 0, 0); // Set to noon to avoid timezone issues

    // Check for existing log today
    const startOfDay = new Date(logDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(logDate);
    endOfDay.setHours(23, 59, 59, 999);

    const existingLog = await db.query.recoveryLogs.findFirst({
      where: and(
        eq(recoveryLogs.userId, user.id),
        gte(recoveryLogs.date, startOfDay),
        lte(recoveryLogs.date, endOfDay)
      ),
    });

    let log;
    if (existingLog) {
      // Update existing log
      [log] = await db
        .update(recoveryLogs)
        .set({
          sleepHours: sleepHours ? String(sleepHours) : existingLog.sleepHours,
          sleepQuality: sleepQuality ?? existingLog.sleepQuality,
          energyLevel: energyLevel ?? existingLog.energyLevel,
          overallSoreness: overallSoreness ?? existingLog.overallSoreness,
          sorenessAreas: sorenessAreas ?? existingLog.sorenessAreas,
          stressLevel: stressLevel ?? existingLog.stressLevel,
          notes: notes ?? existingLog.notes,
        })
        .where(eq(recoveryLogs.id, existingLog.id))
        .returning();
    } else {
      // Create new log
      [log] = await db
        .insert(recoveryLogs)
        .values({
          userId: user.id,
          date: logDate,
          sleepHours: sleepHours ? String(sleepHours) : null,
          sleepQuality,
          energyLevel,
          overallSoreness,
          sorenessAreas,
          stressLevel,
          notes,
        })
        .returning();
    }

    return NextResponse.json({ log }, { status: existingLog ? 200 : 201 });
  } catch (error) {
    console.error('Error logging recovery:', error);
    return NextResponse.json(
      { error: 'Failed to log recovery' },
      { status: 500 }
    );
  }
}
