import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import {
  programTemplates,
  templateDays,
  templateSlots,
  warmupTemplates,
  warmupPhases,
} from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ============================================
// PPL TEMPLATE DATA
// ============================================

const PPL_TEMPLATE = {
  name: 'PPL Recomp (6-day)',
  slug: 'ppl-recomp-6',
  description:
    'Push/Pull/Legs split with A/B variations for body recomposition. Uses movement pattern slots for flexible exercise selection based on available equipment.',
  daysPerWeek: 6,
  goal: 'recomp',
  experienceLevel: 'intermediate',
};

const TEMPLATE_DAYS = [
  {
    name: 'Push A',
    dayOrder: 1,
    dayType: 'push' as const,
    variation: 'A',
    estimatedDuration: 75,
    targetMuscles: ['chest', 'shoulders', 'triceps'],
  },
  {
    name: 'Pull A',
    dayOrder: 2,
    dayType: 'pull' as const,
    variation: 'A',
    estimatedDuration: 75,
    targetMuscles: ['back', 'biceps', 'rear-delts'],
  },
  {
    name: 'Legs A',
    dayOrder: 3,
    dayType: 'legs' as const,
    variation: 'A',
    estimatedDuration: 80,
    targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
  },
  {
    name: 'Push B',
    dayOrder: 4,
    dayType: 'push' as const,
    variation: 'B',
    estimatedDuration: 75,
    targetMuscles: ['chest', 'shoulders', 'triceps'],
  },
  {
    name: 'Pull B',
    dayOrder: 5,
    dayType: 'pull' as const,
    variation: 'B',
    estimatedDuration: 75,
    targetMuscles: ['back', 'biceps', 'rear-delts'],
  },
  {
    name: 'Legs B',
    dayOrder: 6,
    dayType: 'legs' as const,
    variation: 'B',
    estimatedDuration: 80,
    targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
  },
];

// Slot definitions per day type and variation
const SLOTS_BY_DAY: Record<
  string,
  Array<{
    slotOrder: number;
    slotType: 'primary' | 'secondary' | 'accessory' | 'optional';
    movementPattern: string;
    targetMuscles: string[];
    sets: number;
    repRangeMin: number;
    repRangeMax: number;
    rpeTarget: string;
    restSeconds: number;
    isOptional: boolean;
    notes?: string;
  }>
> = {
  'Push A': [
    {
      slotOrder: 1,
      slotType: 'primary',
      movementPattern: 'horizontal_push',
      targetMuscles: ['chest', 'front-delts', 'triceps'],
      sets: 4,
      repRangeMin: 5,
      repRangeMax: 8,
      rpeTarget: '8',
      restSeconds: 180,
      isOptional: false,
      notes: 'Main chest compound - barbell or dumbbell bench',
    },
    {
      slotOrder: 2,
      slotType: 'primary',
      movementPattern: 'vertical_push',
      targetMuscles: ['shoulders', 'triceps'],
      sets: 3,
      repRangeMin: 6,
      repRangeMax: 10,
      rpeTarget: '8',
      restSeconds: 150,
      isOptional: false,
      notes: 'Overhead press variation',
    },
    {
      slotOrder: 3,
      slotType: 'secondary',
      movementPattern: 'horizontal_push',
      targetMuscles: ['chest'],
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      rpeTarget: '7.5',
      restSeconds: 90,
      isOptional: false,
      notes: 'Incline or fly variation',
    },
    {
      slotOrder: 4,
      slotType: 'accessory',
      movementPattern: 'isolation_push',
      targetMuscles: ['triceps'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Tricep isolation - pushdowns or extensions',
    },
    {
      slotOrder: 5,
      slotType: 'accessory',
      movementPattern: 'isolation_push',
      targetMuscles: ['side-delts'],
      sets: 3,
      repRangeMin: 12,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Lateral raises',
    },
    {
      slotOrder: 6,
      slotType: 'optional',
      movementPattern: 'isolation_push',
      targetMuscles: ['triceps'],
      sets: 2,
      repRangeMin: 15,
      repRangeMax: 20,
      rpeTarget: '6',
      restSeconds: 45,
      isOptional: true,
      notes: 'Extra tricep volume if time allows',
    },
  ],
  'Push B': [
    {
      slotOrder: 1,
      slotType: 'primary',
      movementPattern: 'horizontal_push',
      targetMuscles: ['chest', 'front-delts', 'triceps'],
      sets: 4,
      repRangeMin: 6,
      repRangeMax: 10,
      rpeTarget: '8',
      restSeconds: 150,
      isOptional: false,
      notes: 'Incline focus - incline press variation',
    },
    {
      slotOrder: 2,
      slotType: 'primary',
      movementPattern: 'vertical_push',
      targetMuscles: ['shoulders', 'triceps'],
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      rpeTarget: '8',
      restSeconds: 120,
      isOptional: false,
      notes: 'Different overhead variation from Push A',
    },
    {
      slotOrder: 3,
      slotType: 'secondary',
      movementPattern: 'horizontal_push',
      targetMuscles: ['chest'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 12,
      rpeTarget: '7.5',
      restSeconds: 90,
      isOptional: false,
      notes: 'Cable crossover or pec deck',
    },
    {
      slotOrder: 4,
      slotType: 'accessory',
      movementPattern: 'isolation_push',
      targetMuscles: ['triceps'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Overhead tricep extension',
    },
    {
      slotOrder: 5,
      slotType: 'accessory',
      movementPattern: 'isolation_push',
      targetMuscles: ['side-delts'],
      sets: 3,
      repRangeMin: 12,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Cable or dumbbell lateral raises',
    },
    {
      slotOrder: 6,
      slotType: 'optional',
      movementPattern: 'isolation_push',
      targetMuscles: ['rear-delts'],
      sets: 2,
      repRangeMin: 15,
      repRangeMax: 20,
      rpeTarget: '6',
      restSeconds: 45,
      isOptional: true,
      notes: 'Rear delt flyes if time allows',
    },
  ],
  'Pull A': [
    {
      slotOrder: 1,
      slotType: 'primary',
      movementPattern: 'horizontal_pull',
      targetMuscles: ['lats', 'upper-back'],
      sets: 4,
      repRangeMin: 5,
      repRangeMax: 8,
      rpeTarget: '8',
      restSeconds: 180,
      isOptional: false,
      notes: 'Barbell or dumbbell row',
    },
    {
      slotOrder: 2,
      slotType: 'primary',
      movementPattern: 'vertical_pull',
      targetMuscles: ['lats'],
      sets: 3,
      repRangeMin: 6,
      repRangeMax: 10,
      rpeTarget: '8',
      restSeconds: 150,
      isOptional: false,
      notes: 'Pull-up or lat pulldown',
    },
    {
      slotOrder: 3,
      slotType: 'secondary',
      movementPattern: 'horizontal_pull',
      targetMuscles: ['upper-back', 'rear-delts'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 12,
      rpeTarget: '7.5',
      restSeconds: 90,
      isOptional: false,
      notes: 'Cable row or chest-supported row',
    },
    {
      slotOrder: 4,
      slotType: 'accessory',
      movementPattern: 'horizontal_pull',
      targetMuscles: ['rear-delts'],
      sets: 3,
      repRangeMin: 15,
      repRangeMax: 20,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Face pulls or reverse flyes',
    },
    {
      slotOrder: 5,
      slotType: 'accessory',
      movementPattern: 'isolation_pull',
      targetMuscles: ['biceps'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 12,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Barbell or dumbbell curls',
    },
    {
      slotOrder: 6,
      slotType: 'optional',
      movementPattern: 'isolation_pull',
      targetMuscles: ['biceps'],
      sets: 2,
      repRangeMin: 12,
      repRangeMax: 15,
      rpeTarget: '6',
      restSeconds: 45,
      isOptional: true,
      notes: 'Hammer curls if time allows',
    },
  ],
  'Pull B': [
    {
      slotOrder: 1,
      slotType: 'primary',
      movementPattern: 'vertical_pull',
      targetMuscles: ['lats'],
      sets: 4,
      repRangeMin: 6,
      repRangeMax: 10,
      rpeTarget: '8',
      restSeconds: 150,
      isOptional: false,
      notes: 'Weighted pull-ups or close-grip pulldown',
    },
    {
      slotOrder: 2,
      slotType: 'primary',
      movementPattern: 'horizontal_pull',
      targetMuscles: ['upper-back'],
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      rpeTarget: '8',
      restSeconds: 120,
      isOptional: false,
      notes: 'T-bar row or seal row',
    },
    {
      slotOrder: 3,
      slotType: 'secondary',
      movementPattern: 'horizontal_pull',
      targetMuscles: ['lats', 'rhomboids'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 12,
      rpeTarget: '7.5',
      restSeconds: 90,
      isOptional: false,
      notes: 'Single-arm row or meadows row',
    },
    {
      slotOrder: 4,
      slotType: 'accessory',
      movementPattern: 'horizontal_pull',
      targetMuscles: ['rear-delts'],
      sets: 3,
      repRangeMin: 15,
      repRangeMax: 20,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Rear delt machine or cable pulls',
    },
    {
      slotOrder: 5,
      slotType: 'accessory',
      movementPattern: 'isolation_pull',
      targetMuscles: ['biceps'],
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Incline or preacher curls',
    },
    {
      slotOrder: 6,
      slotType: 'optional',
      movementPattern: 'isolation_pull',
      targetMuscles: ['forearms'],
      sets: 2,
      repRangeMin: 15,
      repRangeMax: 20,
      rpeTarget: '6',
      restSeconds: 45,
      isOptional: true,
      notes: 'Wrist curls if time allows',
    },
  ],
  'Legs A': [
    {
      slotOrder: 1,
      slotType: 'primary',
      movementPattern: 'squat',
      targetMuscles: ['quads', 'glutes'],
      sets: 4,
      repRangeMin: 5,
      repRangeMax: 8,
      rpeTarget: '8',
      restSeconds: 180,
      isOptional: false,
      notes: 'Barbell back squat or leg press',
    },
    {
      slotOrder: 2,
      slotType: 'primary',
      movementPattern: 'hinge',
      targetMuscles: ['hamstrings', 'glutes'],
      sets: 3,
      repRangeMin: 6,
      repRangeMax: 10,
      rpeTarget: '8',
      restSeconds: 150,
      isOptional: false,
      notes: 'Romanian deadlift or stiff-leg deadlift',
    },
    {
      slotOrder: 3,
      slotType: 'secondary',
      movementPattern: 'lunge',
      targetMuscles: ['quads', 'glutes'],
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      rpeTarget: '7.5',
      restSeconds: 90,
      isOptional: false,
      notes: 'Walking lunges or split squats',
    },
    {
      slotOrder: 4,
      slotType: 'accessory',
      movementPattern: 'isolation_legs',
      targetMuscles: ['hamstrings'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Leg curls',
    },
    {
      slotOrder: 5,
      slotType: 'accessory',
      movementPattern: 'isolation_legs',
      targetMuscles: ['calves'],
      sets: 4,
      repRangeMin: 12,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Standing or seated calf raises',
    },
    {
      slotOrder: 6,
      slotType: 'optional',
      movementPattern: 'core',
      targetMuscles: ['abs'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 15,
      rpeTarget: '6',
      restSeconds: 45,
      isOptional: true,
      notes: 'Hanging leg raises or cable crunches',
    },
  ],
  'Legs B': [
    {
      slotOrder: 1,
      slotType: 'primary',
      movementPattern: 'hinge',
      targetMuscles: ['hamstrings', 'glutes', 'back'],
      sets: 4,
      repRangeMin: 5,
      repRangeMax: 8,
      rpeTarget: '8',
      restSeconds: 180,
      isOptional: false,
      notes: 'Conventional or sumo deadlift',
    },
    {
      slotOrder: 2,
      slotType: 'primary',
      movementPattern: 'squat',
      targetMuscles: ['quads'],
      sets: 3,
      repRangeMin: 8,
      repRangeMax: 12,
      rpeTarget: '8',
      restSeconds: 150,
      isOptional: false,
      notes: 'Front squat or hack squat',
    },
    {
      slotOrder: 3,
      slotType: 'secondary',
      movementPattern: 'lunge',
      targetMuscles: ['quads', 'glutes'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 12,
      rpeTarget: '7.5',
      restSeconds: 90,
      isOptional: false,
      notes: 'Bulgarian split squats or reverse lunges',
    },
    {
      slotOrder: 4,
      slotType: 'accessory',
      movementPattern: 'isolation_legs',
      targetMuscles: ['quads'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Leg extensions',
    },
    {
      slotOrder: 5,
      slotType: 'accessory',
      movementPattern: 'isolation_legs',
      targetMuscles: ['calves'],
      sets: 4,
      repRangeMin: 12,
      repRangeMax: 15,
      rpeTarget: '7',
      restSeconds: 60,
      isOptional: false,
      notes: 'Different calf variation from Legs A',
    },
    {
      slotOrder: 6,
      slotType: 'optional',
      movementPattern: 'core',
      targetMuscles: ['obliques'],
      sets: 3,
      repRangeMin: 10,
      repRangeMax: 15,
      rpeTarget: '6',
      restSeconds: 45,
      isOptional: true,
      notes: 'Side planks or wood chops',
    },
  ],
};

// Warmup templates
const WARMUP_TEMPLATES = [
  {
    name: 'Push Day Warmup',
    dayType: 'push' as const,
    targetMuscles: ['chest', 'shoulders', 'triceps'],
    durationMinutes: 10,
  },
  {
    name: 'Pull Day Warmup',
    dayType: 'pull' as const,
    targetMuscles: ['back', 'biceps', 'rear-delts'],
    durationMinutes: 10,
  },
  {
    name: 'Legs Day Warmup',
    dayType: 'legs' as const,
    targetMuscles: ['quads', 'hamstrings', 'glutes', 'calves'],
    durationMinutes: 12,
  },
];

const WARMUP_PHASES_BY_TYPE: Record<
  string,
  Array<{
    phaseOrder: number;
    name: string;
    phaseType: 'general' | 'dynamic' | 'movement_prep';
    durationSeconds: number;
  }>
> = {
  push: [
    { phaseOrder: 1, name: 'General Warmup', phaseType: 'general', durationSeconds: 180 },
    { phaseOrder: 2, name: 'Dynamic Stretching', phaseType: 'dynamic', durationSeconds: 240 },
    { phaseOrder: 3, name: 'Movement Prep', phaseType: 'movement_prep', durationSeconds: 180 },
  ],
  pull: [
    { phaseOrder: 1, name: 'General Warmup', phaseType: 'general', durationSeconds: 180 },
    { phaseOrder: 2, name: 'Dynamic Stretching', phaseType: 'dynamic', durationSeconds: 240 },
    { phaseOrder: 3, name: 'Movement Prep', phaseType: 'movement_prep', durationSeconds: 180 },
  ],
  legs: [
    { phaseOrder: 1, name: 'General Warmup', phaseType: 'general', durationSeconds: 180 },
    { phaseOrder: 2, name: 'Dynamic Stretching', phaseType: 'dynamic', durationSeconds: 300 },
    { phaseOrder: 3, name: 'Movement Prep', phaseType: 'movement_prep', durationSeconds: 240 },
  ],
};

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedPPLTemplate() {
  console.log('🏋️ PPL Template Seeder\n');
  console.log('═'.repeat(60) + '\n');

  try {
    // 1. Insert program template
    console.log('Creating PPL program template...');
    const [template] = await db
      .insert(programTemplates)
      .values(PPL_TEMPLATE)
      .onConflictDoNothing()
      .returning();

    if (!template) {
      console.log('  ⚠️  Template already exists, fetching...');
      const [existing] = await db
        .select()
        .from(programTemplates)
        .where(eq(programTemplates.slug, PPL_TEMPLATE.slug))
        .limit(1);
      if (!existing) {
        throw new Error('Could not find or create template');
      }
      console.log(`  ✓ Using existing template: ${existing.name} (${existing.id})\n`);
      return existing.id;
    }

    console.log(`  ✓ Created template: ${template.name} (${template.id})\n`);

    // 2. Insert template days
    console.log('Creating template days...');
    const dayIds: Record<string, string> = {};

    for (const day of TEMPLATE_DAYS) {
      const [insertedDay] = await db
        .insert(templateDays)
        .values({
          templateId: template.id,
          ...day,
        })
        .returning();

      dayIds[day.name] = insertedDay.id;
      console.log(`  ✓ ${day.name} (${insertedDay.id})`);
    }
    console.log('');

    // 3. Insert template slots
    console.log('Creating template slots...');
    let totalSlots = 0;

    for (const [dayName, slots] of Object.entries(SLOTS_BY_DAY)) {
      const dayId = dayIds[dayName];
      if (!dayId) continue;

      for (const slot of slots) {
        await db.insert(templateSlots).values({
          dayId,
          ...slot,
        });
        totalSlots++;
      }
      console.log(`  ✓ ${dayName}: ${slots.length} slots`);
    }
    console.log(`\n  Total slots created: ${totalSlots}\n`);

    // 4. Insert warmup templates
    console.log('Creating warmup templates...');
    const warmupIds: Record<string, string> = {};

    for (const warmup of WARMUP_TEMPLATES) {
      const [insertedWarmup] = await db
        .insert(warmupTemplates)
        .values(warmup)
        .onConflictDoNothing()
        .returning();

      if (insertedWarmup) {
        warmupIds[warmup.dayType] = insertedWarmup.id;
        console.log(`  ✓ ${warmup.name} (${insertedWarmup.id})`);
      }
    }
    console.log('');

    // 5. Insert warmup phases
    console.log('Creating warmup phases...');
    for (const [dayType, phases] of Object.entries(WARMUP_PHASES_BY_TYPE)) {
      const warmupId = warmupIds[dayType];
      if (!warmupId) continue;

      for (const phase of phases) {
        await db.insert(warmupPhases).values({
          templateId: warmupId,
          ...phase,
        });
      }
      console.log(`  ✓ ${dayType}: ${phases.length} phases`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ PPL Template seeding complete!\n');
    console.log('Summary:');
    console.log(`  Program Template: 1`);
    console.log(`  Template Days:    ${TEMPLATE_DAYS.length}`);
    console.log(`  Template Slots:   ${totalSlots}`);
    console.log(`  Warmup Templates: ${WARMUP_TEMPLATES.length}`);
    console.log(`  Warmup Phases:    ${Object.values(WARMUP_PHASES_BY_TYPE).flat().length}`);

    return template.id;
  } catch (error) {
    console.error('\n❌ Error seeding PPL template:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed
seedPPLTemplate()
  .then((templateId) => {
    console.log(`\nTemplate ID: ${templateId}`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
