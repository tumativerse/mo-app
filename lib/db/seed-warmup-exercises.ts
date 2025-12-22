import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq, and, ilike, or } from 'drizzle-orm';
import * as schema from './schema';
import {
  exercises,
  warmupTemplates,
  warmupPhases,
  warmupPhaseExercises,
} from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// Exercise slugs for each warmup phase
// These should match exercises in the database
const WARMUP_EXERCISES: Record<string, Record<string, Array<{
  slug: string;
  fallbackName: string; // Used to search if slug not found
  sets: number;
  reps?: number;
  durationSeconds?: number;
  notes?: string;
}>>> = {
  push: {
    general: [
      { slug: 'jumping-jacks', fallbackName: 'jumping jack', sets: 1, durationSeconds: 120, notes: 'Get heart rate up' },
      { slug: 'arm-circles', fallbackName: 'arm circle', sets: 1, reps: 20, notes: 'Both directions' },
    ],
    dynamic: [
      { slug: 'band-pull-apart', fallbackName: 'band pull', sets: 1, reps: 15, notes: 'Focus on rear delts' },
      { slug: 'wall-slide', fallbackName: 'wall slide', sets: 1, reps: 10, notes: 'Slow and controlled' },
      { slug: 'push-up', fallbackName: 'push-up', sets: 1, reps: 10, notes: 'Light warmup set' },
    ],
    movement_prep: [
      { slug: 'push-up', fallbackName: 'push-up', sets: 1, reps: 10, notes: 'Movement prep' },
      { slug: 'dumbbell-shoulder-press', fallbackName: 'shoulder press', sets: 1, reps: 10, notes: 'Very light weight' },
    ],
  },
  pull: {
    general: [
      { slug: 'jumping-jacks', fallbackName: 'jumping jack', sets: 1, durationSeconds: 120, notes: 'Get heart rate up' },
      { slug: 'arm-circles', fallbackName: 'arm circle', sets: 1, reps: 20, notes: 'Both directions' },
    ],
    dynamic: [
      { slug: 'cat-cow', fallbackName: 'cat cow', sets: 1, reps: 10, notes: 'Spine mobility' },
      { slug: 'band-pull-apart', fallbackName: 'band pull', sets: 1, reps: 15, notes: 'Upper back activation' },
      { slug: 'face-pull', fallbackName: 'face pull', sets: 1, reps: 15, notes: 'Light band or cable' },
    ],
    movement_prep: [
      { slug: 'dead-hang', fallbackName: 'dead hang', sets: 1, durationSeconds: 30, notes: 'Decompress spine' },
      { slug: 'scapular-pull-up', fallbackName: 'scapular pull', sets: 1, reps: 10, notes: 'Scapular activation' },
    ],
  },
  legs: {
    general: [
      { slug: 'jumping-jacks', fallbackName: 'jumping jack', sets: 1, durationSeconds: 120, notes: 'Get heart rate up' },
      { slug: 'high-knees', fallbackName: 'high knee', sets: 1, durationSeconds: 30, notes: 'Dynamic warmup' },
    ],
    dynamic: [
      { slug: 'leg-swing', fallbackName: 'leg swing', sets: 1, reps: 15, notes: 'Front to back, each leg' },
      { slug: 'walking-lunge', fallbackName: 'walking lunge', sets: 1, reps: 10, notes: 'Bodyweight only' },
      { slug: 'glute-bridge', fallbackName: 'glute bridge', sets: 1, reps: 15, notes: 'Glute activation' },
      { slug: 'hip-circle', fallbackName: 'hip circle', sets: 1, reps: 10, notes: 'Each direction' },
    ],
    movement_prep: [
      { slug: 'bodyweight-squat', fallbackName: 'bodyweight squat', sets: 1, reps: 15, notes: 'Full depth' },
      { slug: 'goblet-squat', fallbackName: 'goblet squat', sets: 1, reps: 10, notes: 'Light weight' },
    ],
  },
};

async function findExercise(slug: string, fallbackName: string) {
  // Try exact slug match first
  let exercise = await db.query.exercises.findFirst({
    where: eq(exercises.slug, slug),
  });

  if (exercise) return exercise;

  // Try case-insensitive name search
  exercise = await db.query.exercises.findFirst({
    where: ilike(exercises.name, `%${fallbackName}%`),
  });

  return exercise;
}

async function seedWarmupExercises() {
  console.log('🏃 Warmup Exercises Seeder\n');
  console.log('═'.repeat(60) + '\n');

  try {
    // Get all warmup templates with phases
    const templates = await db.query.warmupTemplates.findMany({
      with: {
        phases: true,
      },
    });

    if (templates.length === 0) {
      console.log('⚠️  No warmup templates found. Run seed-ppl-template.ts first.');
      return;
    }

    let totalExercises = 0;
    let notFound: string[] = [];

    for (const template of templates) {
      console.log(`Processing: ${template.name}`);
      const dayType = template.dayType;
      const exercisesByPhase = WARMUP_EXERCISES[dayType];

      if (!exercisesByPhase) {
        console.log(`  ⚠️  No exercises defined for ${dayType}`);
        continue;
      }

      for (const phase of template.phases) {
        const phaseExercises = exercisesByPhase[phase.phaseType];

        if (!phaseExercises) {
          console.log(`  ⚠️  No exercises for phase ${phase.phaseType}`);
          continue;
        }

        // Get existing exercises for this phase to determine next order
        const existingPhaseExercises = await db.query.warmupPhaseExercises.findMany({
          where: eq(warmupPhaseExercises.phaseId, phase.id),
        });

        const existingExerciseIds = new Set(existingPhaseExercises.map(e => e.exerciseId));
        const maxOrder = existingPhaseExercises.reduce((max, e) => Math.max(max, e.exerciseOrder), 0);
        let exerciseOrder = maxOrder + 1;
        let addedCount = 0;

        for (const ex of phaseExercises) {
          const exercise = await findExercise(ex.slug, ex.fallbackName);

          if (!exercise) {
            notFound.push(`${ex.slug} (${ex.fallbackName})`);
            continue;
          }

          // Check if already exists
          if (existingExerciseIds.has(exercise.id)) continue;

          await db.insert(warmupPhaseExercises).values({
            phaseId: phase.id,
            exerciseId: exercise.id,
            exerciseOrder,
            sets: ex.sets,
            reps: ex.reps,
            durationSeconds: ex.durationSeconds,
            notes: ex.notes,
          });

          exerciseOrder++;
          addedCount++;
          totalExercises++;
        }
        console.log(`  ✓ ${phase.name}: ${existingPhaseExercises.length} existing, ${addedCount} added`);
      }
      console.log('');
    }

    console.log('═'.repeat(60));
    console.log('\n✅ Warmup exercises seeding complete!\n');
    console.log(`Summary:`);
    console.log(`  Total exercises linked: ${totalExercises}`);

    if (notFound.length > 0) {
      console.log(`\n⚠️  Exercises not found (${notFound.length}):`);
      [...new Set(notFound)].forEach(name => console.log(`    - ${name}`));
      console.log('\n  These exercises may need to be added to the exercise library.');
    }
  } catch (error) {
    console.error('\n❌ Error seeding warmup exercises:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedWarmupExercises()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
