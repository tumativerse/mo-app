import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

async function checkDataQuality() {
  console.log('📊 Exercise Data Quality Report\n');
  console.log('═'.repeat(60) + '\n');

  // Total counts
  const exercises = await db.query.exercises.findMany();
  const relationships = await db.query.exerciseRelationships.findMany();
  const muscles = await db.query.muscles.findMany();
  const equipment = await db.query.equipmentItems.findMany();

  console.log('TOTALS:');
  console.log(`  Exercises: ${exercises.length}`);
  console.log(`  Relationships: ${relationships.length}`);
  console.log(`  Muscles: ${muscles.length}`);
  console.log(`  Equipment: ${equipment.length}`);
  console.log();

  // ============================================
  // FIELD COMPLETENESS
  // ============================================
  console.log('═'.repeat(60));
  console.log('FIELD COMPLETENESS (null counts)\n');

  const fieldChecks = [
    { name: 'description', field: 'description' },
    { name: 'movementPattern', field: 'movement_pattern' },
    { name: 'primaryMuscles', field: 'primary_muscles' },
    { name: 'equipment', field: 'equipment' },
    { name: 'difficulty', field: 'difficulty' },
    { name: 'priority', field: 'priority' },
    { name: 'forceType', field: 'force_type' },
    { name: 'chain', field: 'chain' },
    { name: 'repRangeStrength', field: 'rep_range_strength' },
    { name: 'defaultSets', field: 'default_sets' },
    { name: 'defaultRestSeconds', field: 'default_rest_seconds' },
    { name: 'joints', field: 'joints' },
    { name: 'bodyPositions', field: 'body_positions' },
    { name: 'grips', field: 'grips' },
  ];

  const nullCounts: Record<string, number> = {};

  for (const ex of exercises) {
    for (const check of fieldChecks) {
      const value = (ex as Record<string, unknown>)[check.name];
      if (value === null || value === undefined || (Array.isArray(value) && value.length === 0)) {
        nullCounts[check.name] = (nullCounts[check.name] || 0) + 1;
      }
    }
  }

  console.log('| Field                | Null/Empty | Filled | % Complete |');
  console.log('|----------------------|------------|--------|------------|');
  for (const check of fieldChecks) {
    const nullCount = nullCounts[check.name] || 0;
    const filledCount = exercises.length - nullCount;
    const pct = ((filledCount / exercises.length) * 100).toFixed(1);
    console.log(`| ${check.name.padEnd(20)} | ${String(nullCount).padStart(10)} | ${String(filledCount).padStart(6)} | ${pct.padStart(9)}% |`);
  }
  console.log();

  // ============================================
  // ENUM DISTRIBUTIONS
  // ============================================
  console.log('═'.repeat(60));
  console.log('ENUM DISTRIBUTIONS\n');

  // Difficulty
  const difficultyDist: Record<string, number> = {};
  for (const ex of exercises) {
    const d = ex.difficulty || 'null';
    difficultyDist[d] = (difficultyDist[d] || 0) + 1;
  }
  console.log('Difficulty:');
  for (const [key, val] of Object.entries(difficultyDist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}: ${val} (${((val / exercises.length) * 100).toFixed(1)}%)`);
  }
  console.log();

  // Priority
  const priorityDist: Record<string, number> = {};
  for (const ex of exercises) {
    const p = ex.priority || 'null';
    priorityDist[p] = (priorityDist[p] || 0) + 1;
  }
  console.log('Priority:');
  for (const [key, val] of Object.entries(priorityDist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}: ${val} (${((val / exercises.length) * 100).toFixed(1)}%)`);
  }
  console.log();

  // Movement Pattern
  const patternDist: Record<string, number> = {};
  for (const ex of exercises) {
    const p = ex.movementPattern || 'null';
    patternDist[p] = (patternDist[p] || 0) + 1;
  }
  console.log('Movement Pattern:');
  for (const [key, val] of Object.entries(patternDist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}: ${val} (${((val / exercises.length) * 100).toFixed(1)}%)`);
  }
  console.log();

  // Category
  const categoryDist: Record<string, number> = {};
  for (const ex of exercises) {
    const c = ex.category || 'null';
    categoryDist[c] = (categoryDist[c] || 0) + 1;
  }
  console.log('Category:');
  for (const [key, val] of Object.entries(categoryDist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}: ${val} (${((val / exercises.length) * 100).toFixed(1)}%)`);
  }
  console.log();

  // ============================================
  // RELATIONSHIP ANALYSIS
  // ============================================
  console.log('═'.repeat(60));
  console.log('RELATIONSHIP ANALYSIS\n');

  const relTypeDist: Record<string, number> = {};
  for (const rel of relationships) {
    const t = rel.relationshipType;
    relTypeDist[t] = (relTypeDist[t] || 0) + 1;
  }
  console.log('Relationship Types:');
  for (const [key, val] of Object.entries(relTypeDist).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}: ${val}`);
  }
  console.log();

  // Exercises with most alternatives
  const alternativeCounts: Record<string, number> = {};
  for (const rel of relationships) {
    if (rel.relationshipType === 'alternative') {
      alternativeCounts[rel.exerciseId] = (alternativeCounts[rel.exerciseId] || 0) + 1;
    }
  }

  const sortedByAlternatives = Object.entries(alternativeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  console.log('Top 10 Exercises with Most Alternatives:');
  for (const [id, count] of sortedByAlternatives) {
    const ex = exercises.find(e => e.id === id);
    console.log(`  ${ex?.name || id}: ${count} alternatives`);
  }
  console.log();

  // ============================================
  // NAME LENGTH CHECK
  // ============================================
  console.log('═'.repeat(60));
  console.log('NAME LENGTH CHECK\n');

  const longNames = exercises.filter(e => e.name.length > 90);
  if (longNames.length > 0) {
    console.log(`⚠️  ${longNames.length} exercises have names > 90 chars (limit is 100):`);
    for (const ex of longNames) {
      console.log(`  - "${ex.name}" (${ex.name.length} chars)`);
    }
  } else {
    console.log('✓ All exercise names are within limits');
  }
  console.log();

  // ============================================
  // ESSENTIAL EXERCISES CHECK
  // ============================================
  console.log('═'.repeat(60));
  console.log('ESSENTIAL EXERCISES CHECK\n');

  const essentialExercises = [
    'bench-press', 'deadlift', 'squat', 'pull-up', 'row',
    'overhead-press', 'romanian-deadlift', 'lat-pulldown', 'leg-press',
    'bicep-curl', 'tricep-pushdown', 'plank', 'hip-thrust'
  ];

  const foundEssentials: string[] = [];
  const missingEssentials: string[] = [];

  for (const slug of essentialExercises) {
    const found = exercises.find(e => e.slug.includes(slug));
    if (found) {
      foundEssentials.push(`${slug} → ${found.name}`);
    } else {
      missingEssentials.push(slug);
    }
  }

  console.log(`Found ${foundEssentials.length}/${essentialExercises.length} essential exercises:`);
  for (const e of foundEssentials) {
    console.log(`  ✓ ${e}`);
  }
  if (missingEssentials.length > 0) {
    console.log(`\nMissing:`);
    for (const e of missingEssentials) {
      console.log(`  ✗ ${e}`);
    }
  }
  console.log();

  // ============================================
  // SAMPLE DATA
  // ============================================
  console.log('═'.repeat(60));
  console.log('SAMPLE EXERCISES (first 5 with full data)\n');

  const samplesWithFullData = exercises
    .filter(e => e.difficulty && e.priority && e.movementPattern && e.primaryMuscles?.length)
    .slice(0, 5);

  for (const ex of samplesWithFullData) {
    console.log(`${ex.name} (${ex.slug})`);
    console.log(`  Category: ${ex.category} | Pattern: ${ex.movementPattern}`);
    console.log(`  Difficulty: ${ex.difficulty} | Priority: ${ex.priority}`);
    console.log(`  Primary Muscles: ${ex.primaryMuscles?.join(', ')}`);
    console.log(`  Equipment: ${ex.equipment?.join(', ')}`);
    console.log(`  Rep Ranges: Str ${ex.repRangeStrength} | Hyp ${ex.repRangeHypertrophy}`);
    console.log();
  }

  console.log('═'.repeat(60));
  console.log('\n✅ Data quality check complete!\n');
}

checkDataQuality()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Error:', err);
    process.exit(1);
  });
