import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { Pool } from '@neondatabase/serverless';
import { eq } from 'drizzle-orm';
import * as schema from './schema';
import { programs, programDays } from './schema';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

// ============================================
// PPL PROGRAM DATA
// ============================================

const PPL_PROGRAM = {
  name: 'PPL Recomp (6-day)',
  slug: 'ppl-recomp-6',
  description:
    'Push/Pull/Legs split with A/B variations for body recomposition. 6 days per week with one rest day.',
  durationWeeks: null,
  experience: 'intermediate' as const,
  goal: 'recomp' as const,
  daysPerWeek: 6,
  isActive: true,
};

const PROGRAM_DAYS = [
  { dayNumber: 1, name: 'Push A', workoutType: 'push' as const, isRestDay: false },
  { dayNumber: 2, name: 'Pull A', workoutType: 'pull' as const, isRestDay: false },
  { dayNumber: 3, name: 'Legs A', workoutType: 'legs' as const, isRestDay: false },
  { dayNumber: 4, name: 'Push B', workoutType: 'push' as const, isRestDay: false },
  { dayNumber: 5, name: 'Pull B', workoutType: 'pull' as const, isRestDay: false },
  { dayNumber: 6, name: 'Legs B', workoutType: 'legs' as const, isRestDay: false },
  { dayNumber: 7, name: 'Rest', workoutType: null, isRestDay: true },
];

// ============================================
// SEED FUNCTION
// ============================================

async function seed() {
  console.log('🌱 Mo Database Seeder\n');
  console.log('═'.repeat(60) + '\n');

  try {
    // Check if program already exists
    const [existing] = await db
      .select()
      .from(programs)
      .where(eq(programs.slug, PPL_PROGRAM.slug))
      .limit(1);

    if (existing) {
      console.log(`  ✓ Program already exists: ${existing.name} (${existing.id})\n`);
      console.log('\n✅ Database already seeded!\n');
      return;
    }

    // 1. Insert program
    console.log('Creating PPL program...');
    const [program] = await db
      .insert(programs)
      .values(PPL_PROGRAM)
      .returning();

    console.log(`  ✓ Created program: ${program.name} (${program.id})\n`);

    // 2. Insert program days
    console.log('Creating program days...');
    for (const day of PROGRAM_DAYS) {
      const [insertedDay] = await db
        .insert(programDays)
        .values({
          programId: program.id,
          ...day,
        })
        .returning();

      console.log(`  ✓ ${day.name} (Day ${day.dayNumber})`);
    }

    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Database seeding complete!\n');
    console.log('Summary:');
    console.log(`  Program: 1`);
    console.log(`  Days: ${PROGRAM_DAYS.length}`);

  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Run the seed
seed()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
