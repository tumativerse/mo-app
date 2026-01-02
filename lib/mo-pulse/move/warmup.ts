/**
 * MoWarmup - "The Preparer"
 * Part of MO:PULSE / MoMove
 *
 * "I get you ready to perform"
 *
 * Tracks warmup execution before workouts.
 * Integrates with warmup templates and logs completion.
 */

import { db } from "@/lib/db";
import {
  warmupLogs,
  warmupTemplates,
  workoutSessions,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export interface WarmupTemplate {
  id: string;
  name: string;
  dayType: string;
  durationMinutes: number;
  phases: WarmupPhase[];
}

export interface WarmupPhase {
  id: string;
  name: string;
  phaseType: "general" | "dynamic" | "movement_prep";
  durationSeconds: number | null;
  exercises: WarmupExercise[];
}

export interface WarmupExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number | null;
  durationSeconds: number | null;
  notes: string | null;
}

export interface WarmupLog {
  id: string;
  sessionId: string;
  templateId: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  phasesCompleted: number;
  skipped: boolean;
  notes: string | null;
}

/**
 * Get warmup template for a day type
 */
export async function getWarmupTemplate(
  dayType: "push" | "pull" | "legs" | "upper" | "lower" | "full_body"
): Promise<WarmupTemplate | null> {
  const template = await db.query.warmupTemplates.findFirst({
    where: and(
      eq(warmupTemplates.dayType, dayType),
      eq(warmupTemplates.isActive, true)
    ),
    with: {
      phases: {
        orderBy: (p, { asc }) => [asc(p.phaseOrder)],
        with: {
          exercises: {
            orderBy: (e, { asc }) => [asc(e.exerciseOrder)],
          },
        },
      },
    },
  });

  if (!template) return null;

  // Get exercise names
  const exerciseIds = template.phases.flatMap((p) =>
    p.exercises.map((e) => e.exerciseId)
  );

  const exerciseList = exerciseIds.length > 0
    ? await db.query.exercises.findMany({
        where: (ex, { inArray }) => inArray(ex.id, exerciseIds),
      })
    : [];

  const exerciseMap = new Map(exerciseList.map((e) => [e.id, e.name]));

  return {
    id: template.id,
    name: template.name,
    dayType: template.dayType,
    durationMinutes: template.durationMinutes!,
    phases: template.phases.map((phase) => ({
      id: phase.id,
      name: phase.name,
      phaseType: phase.phaseType as WarmupPhase["phaseType"],
      durationSeconds: phase.durationSeconds,
      exercises: phase.exercises.map((ex) => ({
        id: ex.id,
        exerciseId: ex.exerciseId,
        exerciseName: exerciseMap.get(ex.exerciseId) || "",
        sets: ex.sets!,
        reps: ex.reps,
        durationSeconds: ex.durationSeconds,
        notes: ex.notes,
      })),
    })),
  };
}

/**
 * Start warmup for a session
 */
export async function startWarmup(
  sessionId: string,
  templateId?: string
): Promise<WarmupLog> {
  // Check if warmup log already exists
  const existing = await db.query.warmupLogs.findFirst({
    where: eq(warmupLogs.sessionId, sessionId),
  });

  if (existing) {
    // Update start time if not already started
    if (!existing.startedAt) {
      const [updated] = await db
        .update(warmupLogs)
        .set({ startedAt: new Date() })
        .where(eq(warmupLogs.id, existing.id))
        .returning();
      return formatWarmupLog(updated);
    }
    return formatWarmupLog(existing);
  }

  // Create new warmup log
  const [log] = await db
    .insert(warmupLogs)
    .values({
      sessionId,
      templateId: templateId || null,
      startedAt: new Date(),
      phasesCompleted: 0,
      skipped: false,
    })
    .returning();

  return formatWarmupLog(log);
}

/**
 * Update warmup progress (complete a phase)
 */
export async function updateWarmupProgress(
  sessionId: string,
  phasesCompleted: number
): Promise<WarmupLog> {
  const existing = await db.query.warmupLogs.findFirst({
    where: eq(warmupLogs.sessionId, sessionId),
  });

  if (!existing) {
    throw new Error("Warmup log not found");
  }

  const [updated] = await db
    .update(warmupLogs)
    .set({ phasesCompleted })
    .where(eq(warmupLogs.id, existing.id))
    .returning();

  return formatWarmupLog(updated);
}

/**
 * Complete warmup
 */
export async function completeWarmup(
  sessionId: string,
  notes?: string
): Promise<WarmupLog> {
  const existing = await db.query.warmupLogs.findFirst({
    where: eq(warmupLogs.sessionId, sessionId),
  });

  if (!existing) {
    throw new Error("Warmup log not found");
  }

  const [updated] = await db
    .update(warmupLogs)
    .set({
      completedAt: new Date(),
      notes: notes || null,
    })
    .where(eq(warmupLogs.id, existing.id))
    .returning();

  // Update session status to in_progress if it was in warmup
  await db
    .update(workoutSessions)
    .set({ status: "in_progress" })
    .where(
      and(
        eq(workoutSessions.id, sessionId),
        eq(workoutSessions.status, "warmup")
      )
    );

  return formatWarmupLog(updated);
}

/**
 * Skip warmup
 */
export async function skipWarmup(sessionId: string): Promise<WarmupLog> {
  const existing = await db.query.warmupLogs.findFirst({
    where: eq(warmupLogs.sessionId, sessionId),
  });

  if (existing) {
    const [updated] = await db
      .update(warmupLogs)
      .set({ skipped: true, completedAt: new Date() })
      .where(eq(warmupLogs.id, existing.id))
      .returning();
    return formatWarmupLog(updated);
  }

  // Create skipped warmup log
  const [log] = await db
    .insert(warmupLogs)
    .values({
      sessionId,
      skipped: true,
      completedAt: new Date(),
      phasesCompleted: 0,
    })
    .returning();

  // Update session status
  await db
    .update(workoutSessions)
    .set({ status: "in_progress" })
    .where(eq(workoutSessions.id, sessionId));

  return formatWarmupLog(log);
}

/**
 * Get warmup log for a session
 */
export async function getWarmupLog(sessionId: string): Promise<WarmupLog | null> {
  const log = await db.query.warmupLogs.findFirst({
    where: eq(warmupLogs.sessionId, sessionId),
  });

  return log ? formatWarmupLog(log) : null;
}

function formatWarmupLog(log: typeof warmupLogs.$inferSelect): WarmupLog {
  return {
    id: log.id,
    sessionId: log.sessionId,
    templateId: log.templateId,
    startedAt: log.startedAt ? new Date(log.startedAt) : null,
    completedAt: log.completedAt ? new Date(log.completedAt) : null,
    phasesCompleted: log.phasesCompleted!,
    skipped: log.skipped!,
    notes: log.notes,
  };
}
