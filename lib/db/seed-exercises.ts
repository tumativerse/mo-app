import 'dotenv/config';
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

// Import static data
import muscleData from './seed-data/muscles.json';
import equipmentData from './seed-data/equipment.json';
import mappings from './seed-data/pattern-mappings.json';

// ============================================
// CONFIGURATION
// ============================================

const config = {
  // Use environment variable or default relative path
  exerciseLibraryPath: process.env.MO_DOCS_PATH
    ? path.join(process.env.MO_DOCS_PATH, 'docs/apply/training/exercise-library')
    : path.resolve(__dirname, '../../../mo-docs/docs/apply/training/exercise-library'),
  batchSize: 50,
  dryRun: process.argv.includes('--dry-run'),
  verbose: process.argv.includes('--verbose'),
};

// ============================================
// TYPES
// ============================================

interface ExerciseFrontmatter {
  title?: string;
  sidebar_label?: string;
  description?: string;
  patterns?: string[];
  primary_muscles?: string[];
  secondary_muscles?: string[];
  stabilizers?: string[];
  equipment?: string[];
  equipment_details?: string;
  body_position?: string[];
  grip?: string[];
  grip_width?: string[];
  stance?: string[];
  force_type?: string;
  plane?: string[];
  chain?: string;
  kinetic_chain?: string;
  movement_type?: string;
  bilateral?: boolean;
  exercise_type?: string[];
  difficulty?: string;
  priority?: string;
  typical_rep_ranges?: {
    strength?: string;
    hypertrophy?: string;
    endurance?: string;
  };
  typical_sets?: string;
  rest_period?: string;
  joints?: string[];
  variations?: string[];
  alternatives?: string[];
  progressions?: string[];
  regressions?: string[];
  injury_considerations?: string[];
  contraindications?: string[];
}

interface ParsedExercise {
  frontmatter: ExerciseFrontmatter;
  slug: string;
}

interface ExerciseRecord {
  name: string;
  slug: string;
  description: string | null;
  category: 'compound' | 'isolation' | 'cardio' | 'mobility';
  movementPattern: string | null;
  patterns: string[] | null;
  primaryMuscles: string[] | null;
  secondaryMuscles: string[] | null;
  stabilizers: string[] | null;
  equipment: string[] | null;
  equipmentDetails: string | null;
  bodyPositions: string[] | null;
  grips: string[] | null;
  gripWidths: string[] | null;
  stances: string[] | null;
  forceType: string | null;
  plane: string[] | null;
  chain: string | null;
  kineticChain: string | null;
  isBilateral: boolean;
  exerciseTypes: string[] | null;
  difficulty: string | null;
  priority: string;
  repRangeStrength: string | null;
  repRangeHypertrophy: string | null;
  repRangeEndurance: string | null;
  defaultSets: string | null;
  defaultRestSeconds: number | null;
  joints: string[] | null;
  injuryConsiderations: string[] | null;
  contraindications: string[] | null;
}

interface RelationshipRecord {
  exerciseSlug: string;
  relatedSlug: string;
  type: 'variation' | 'alternative' | 'progression' | 'regression';
}

interface SeedStats {
  muscles: number;
  equipment: number;
  exercises: number;
  relationships: { created: number; failed: number; failedSlugs: string[] };
  unmappedPatterns: Set<string>;
  unmappedDifficulties: Set<string>;
}

// ============================================
// DATABASE CONNECTION
// ============================================

const sqlClient = neon(process.env.DATABASE_URL!);
const db = drizzle(sqlClient, { schema });

// ============================================
// MAPPING FUNCTIONS
// ============================================

function mapWithFallback<T extends string>(
  value: string | undefined,
  mappingTable: Record<string, string>,
  validValues: readonly T[],
  unmappedSet?: Set<string>
): T | null {
  if (!value) return null;
  const normalized = value.toLowerCase().trim();

  // Direct match in mapping table
  const mapped = mappingTable[normalized];
  if (mapped && validValues.includes(mapped as T)) {
    return mapped as T;
  }

  // Direct match in valid values
  if (validValues.includes(normalized as T)) {
    return normalized as T;
  }

  // Track unmapped value
  if (unmappedSet) {
    unmappedSet.add(value);
  }

  return null;
}

/**
 * Infer movement pattern from exercise name.
 * Used as fallback when patterns field is missing, OR to override incorrect patterns.
 */
function inferPatternFromName(name: string): string | null {
  const lower = name.toLowerCase();

  // Isolation - Legs (check FIRST - these are often mislabeled in YAML)
  if (lower.includes('leg curl') || lower.includes('hamstring curl')) return 'isolation_legs';
  if (lower.includes('leg extension')) return 'isolation_legs';
  if (lower.includes('calf raise') || lower.includes('calf press') || lower.includes('donkey calf')) return 'isolation_legs';
  if (lower.includes('adduction') || lower.includes('adductor')) return 'isolation_legs';
  if (lower.includes('abduction') || lower.includes('abductor')) return 'isolation_legs';

  // Isolation - Pull (biceps) - exclude leg curl, nordic curl, jefferson curl
  if (lower.includes('curl') && !lower.includes('leg') && !lower.includes('nordic') && !lower.includes('jefferson') && !lower.includes('hamstring')) {
    return 'isolation_pull';
  }

  // Isolation - Push (triceps, chest fly, lateral raise)
  if (lower.includes('fly') || lower.includes('flye')) return 'isolation_push';
  if (lower.includes('tricep') || lower.includes('pushdown') || lower.includes('skull')) return 'isolation_push';
  if (lower.includes('lateral raise') || lower.includes('front raise')) return 'isolation_push';

  // Olympic lifts
  if (lower.includes('clean') || lower.includes('snatch') || lower.includes('jerk')) return 'olympic';

  // Squat variations
  if (lower.includes('squat') || lower.includes('pistol')) return 'squat';

  // Hinge variations
  if (lower.includes('deadlift') || lower.includes('rdl') || lower.includes('hip thrust')) return 'hinge';
  if (lower.includes('good morning') || lower.includes('back extension')) return 'hinge';
  if (lower.includes('rack pull')) return 'hinge';

  // Lunge variations
  if (lower.includes('lunge') || lower.includes('split squat') || lower.includes('step up') || lower.includes('step-up')) return 'lunge';

  // Push variations
  if (lower.includes('bench') || lower.includes('push-up') || lower.includes('pushup')) return 'horizontal_push';
  if (lower.includes('press') && (lower.includes('overhead') || lower.includes('shoulder') || lower.includes('military'))) return 'vertical_push';
  if (lower.includes('dip')) return 'horizontal_push';

  // Pull variations
  if (lower.includes('row')) return 'horizontal_pull';
  if (lower.includes('pull-up') || lower.includes('pullup') || lower.includes('chin-up') || lower.includes('chinup')) return 'vertical_pull';
  if (lower.includes('pulldown') || lower.includes('pull down')) return 'vertical_pull';

  // Core
  if (lower.includes('plank') || lower.includes('crunch') || lower.includes('sit-up') || lower.includes('ab ')) return 'core';
  if (lower.includes('mountain climber') || lower.includes('bear crawl') || lower.includes('spiderman')) return 'core';

  // Carry
  if (lower.includes('carry') || (lower.includes('walk') && lower.includes('farmer'))) return 'carry';

  // Plyometric
  if (lower.includes('jump') || lower.includes('box jump') || lower.includes('explosive')) return 'plyometric';

  return null;
}

function mapMovementPattern(
  patterns: string[] | undefined,
  name: string,
  unmappedSet?: Set<string>
): string | null {
  // FIRST: Check for commonly mislabeled exercises (isolation legs, isolation pull)
  // These are often marked as "hinge" or generic "isolation" in YAML but should be specific
  const nameInferred = inferPatternFromName(name);
  if (nameInferred && ['isolation_legs', 'isolation_pull'].includes(nameInferred)) {
    return nameInferred;
  }

  // SECOND: Try to map from patterns array
  if (patterns && patterns.length > 0) {
    for (const p of patterns) {
      const mapped = mappings.movementPatterns[p.toLowerCase() as keyof typeof mappings.movementPatterns];
      if (mapped) return mapped;
    }

    // Track first unmapped pattern
    if (unmappedSet) {
      unmappedSet.add(patterns[0]);
    }
  }

  // THIRD: Fallback to name inference for everything else
  return nameInferred;
}

function mapCategory(
  movementType: string | undefined,
  patterns: string[] | undefined
): 'compound' | 'isolation' | 'cardio' | 'mobility' {
  if (movementType) {
    const mapped = mappings.categories[movementType.toLowerCase() as keyof typeof mappings.categories];
    if (mapped) return mapped as 'compound' | 'isolation' | 'cardio' | 'mobility';
  }

  if (patterns) {
    if (patterns.some(p => p.toLowerCase() === 'cardio')) return 'cardio';
    if (patterns.some(p => ['mobility', 'flexibility', 'stretch'].includes(p.toLowerCase()))) return 'mobility';
  }

  return 'compound';
}

function parseRestPeriod(restPeriod: string | undefined): number | null {
  if (!restPeriod) return null;

  // Handle formats: "2-3 minutes", "90 seconds", "90s-2min", "30-60s"
  const match = restPeriod.match(/(\d+)(?:\s*-\s*(\d+))?\s*(min|sec|minutes|seconds|m|s)?/i);
  if (match) {
    const min = parseInt(match[1]);
    const max = match[2] ? parseInt(match[2]) : min;
    const avg = Math.round((min + max) / 2);
    const unit = (match[3] || 's').toLowerCase();

    if (unit.startsWith('min') || unit === 'm') {
      return avg * 60;
    }
    return avg;
  }
  return null;
}

function cleanArray(arr: string[] | undefined): string[] | null {
  if (!arr || arr.length === 0) return null;
  return arr
    .map(s => s.toLowerCase().replace(/-/g, ' ').trim())
    .filter(Boolean);
}

/**
 * Normalize array values using a mapping table.
 * Used for equipment and muscle normalization to consolidate synonyms.
 */
function normalizeArray(
  arr: string[] | undefined,
  normalizationMap: Record<string, string>
): string[] | null {
  if (!arr || arr.length === 0) return null;

  return arr
    .map(s => {
      const normalized = s.toLowerCase().trim();
      // Check if there's a normalization mapping
      const mapped = normalizationMap[normalized];
      if (mapped) return mapped;
      // Otherwise clean up the value
      return normalized.replace(/-/g, ' ');
    })
    .filter(Boolean)
    // Remove duplicates that might result from normalization
    .filter((value, index, self) => self.indexOf(value) === index);
}

// ============================================
// INFERENCE FUNCTIONS
// ============================================

/**
 * Infer priority when not explicitly set in frontmatter.
 */
function inferPriority(
  patterns: string[] | undefined,
  category: string,
  movementType: string | undefined
): 'essential' | 'common' | 'specialized' | 'niche' {
  const patternsLower = patterns?.map(p => p.toLowerCase()) || [];

  // Essential: Major compound movement patterns
  const essentialPatterns = [
    'hinge', 'hip-hinge', 'deadlift',
    'squat',
    'horizontal-push', 'push', 'bench', 'press',
    'vertical-pull', 'pull-up', 'chin-up',
    'vertical-push', 'overhead', 'overhead-press',
    'horizontal-pull', 'row',
  ];

  if (patternsLower.some(p => essentialPatterns.includes(p))) {
    const isMainLift = patternsLower.length <= 2;
    if (isMainLift && category === 'compound') {
      return 'essential';
    }
    return 'common';
  }

  // Common: Compound exercises, carries, core work
  const commonPatterns = [
    'lunge', 'split-squat', 'step-up',
    'carry', 'loaded-carry',
    'core', 'anti-extension', 'anti-rotation',
    'plyometric', 'plyo', 'jump',
  ];

  if (patternsLower.some(p => commonPatterns.includes(p))) {
    return 'common';
  }

  if (category === 'compound' || movementType?.toLowerCase() === 'compound') {
    return 'common';
  }

  if (category === 'isolation' || movementType?.toLowerCase() === 'isolation') {
    return 'specialized';
  }

  // Olympic lifts are specialized (technical)
  const olympicPatterns = ['olympic', 'clean', 'snatch', 'jerk', 'power'];
  if (patternsLower.some(p => olympicPatterns.includes(p))) {
    return 'specialized';
  }

  if (category === 'mobility' || patternsLower.includes('mobility')) {
    return 'niche';
  }

  if (category === 'cardio' || patternsLower.includes('cardio')) {
    return 'niche';
  }

  return 'common';
}

/**
 * Infer difficulty when not explicitly set in frontmatter.
 */
function inferDifficulty(
  patterns: string[] | undefined,
  category: string,
  equipment: string[] | undefined
): 'beginner' | 'intermediate' | 'advanced' | null {
  const patternsLower = patterns?.map(p => p.toLowerCase()) || [];
  const equipmentLower = equipment?.map(e => e.toLowerCase()) || [];

  // Advanced: Olympic lifts, plyometrics, single-leg work
  const advancedPatterns = ['olympic', 'clean', 'snatch', 'jerk', 'muscle-up'];
  if (patternsLower.some(p => advancedPatterns.includes(p))) {
    return 'advanced';
  }

  // Intermediate: Most compound movements
  const intermediatePatterns = [
    'hinge', 'squat', 'deadlift',
    'horizontal-push', 'vertical-push',
    'horizontal-pull', 'vertical-pull',
    'plyometric', 'plyo',
  ];
  if (patternsLower.some(p => intermediatePatterns.includes(p))) {
    return 'intermediate';
  }

  // Beginner: Bodyweight, machines, mobility
  if (equipmentLower.includes('bodyweight') || equipmentLower.includes('machine')) {
    return 'beginner';
  }

  if (category === 'mobility' || category === 'cardio') {
    return 'beginner';
  }

  if (category === 'isolation') {
    return 'beginner';
  }

  // Default based on category
  if (category === 'compound') {
    return 'intermediate';
  }

  return null;
}

// ============================================
// FILE PARSING
// ============================================

function parseExerciseFile(filePath: string): ParsedExercise | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;

    const frontmatter = yaml.parse(match[1]) as ExerciseFrontmatter;
    const slug = path.basename(filePath, '.md');

    if (slug.startsWith('_')) return null;

    return { frontmatter, slug };
  } catch (error) {
    console.error(`  ⚠️  Error parsing ${path.basename(filePath)}:`, error);
    return null;
  }
}

function buildExerciseRecord(
  parsed: ParsedExercise,
  stats: SeedStats
): ExerciseRecord | null {
  const { frontmatter, slug } = parsed;

  if (!frontmatter.title) return null;

  const category = mapCategory(frontmatter.movement_type, frontmatter.patterns);

  // Map or infer priority
  const explicitPriority = mapWithFallback(
    frontmatter.priority,
    mappings.priorities,
    ['essential', 'common', 'specialized', 'niche'] as const
  );
  const priority = explicitPriority || inferPriority(
    frontmatter.patterns,
    category,
    frontmatter.movement_type
  );

  // Map or infer difficulty
  const explicitDifficulty = mapWithFallback(
    frontmatter.difficulty,
    mappings.difficulties,
    ['beginner', 'intermediate', 'advanced', 'elite'] as const,
    stats.unmappedDifficulties
  );
  const difficulty = explicitDifficulty || inferDifficulty(
    frontmatter.patterns,
    category,
    frontmatter.equipment
  );

  return {
    name: frontmatter.title,
    slug,
    description: frontmatter.description || null,
    category,
    movementPattern: mapMovementPattern(frontmatter.patterns, frontmatter.title || '', stats.unmappedPatterns),
    patterns: cleanArray(frontmatter.patterns),
    primaryMuscles: normalizeArray(frontmatter.primary_muscles, mappings.muscleNormalization),
    secondaryMuscles: normalizeArray(frontmatter.secondary_muscles, mappings.muscleNormalization),
    stabilizers: normalizeArray(frontmatter.stabilizers, mappings.muscleNormalization),
    equipment: normalizeArray(frontmatter.equipment, mappings.equipmentNormalization),
    equipmentDetails: frontmatter.equipment_details || null,
    bodyPositions: cleanArray(frontmatter.body_position),
    grips: cleanArray(frontmatter.grip),
    gripWidths: cleanArray(frontmatter.grip_width),
    stances: cleanArray(frontmatter.stance),
    forceType: mapWithFallback(
      frontmatter.force_type,
      mappings.forceTypes,
      ['push', 'pull', 'static', 'dynamic'] as const
    ),
    plane: cleanArray(frontmatter.plane),
    chain: mapWithFallback(
      frontmatter.chain,
      mappings.chains,
      ['anterior', 'posterior', 'lateral'] as const
    ),
    kineticChain: mapWithFallback(
      frontmatter.kinetic_chain,
      mappings.kineticChains,
      ['open', 'closed'] as const
    ),
    isBilateral: frontmatter.bilateral !== false,
    exerciseTypes: cleanArray(frontmatter.exercise_type),
    difficulty,
    priority,
    repRangeStrength: frontmatter.typical_rep_ranges?.strength || null,
    repRangeHypertrophy: frontmatter.typical_rep_ranges?.hypertrophy || null,
    repRangeEndurance: frontmatter.typical_rep_ranges?.endurance || null,
    defaultSets: frontmatter.typical_sets || null,
    defaultRestSeconds: parseRestPeriod(frontmatter.rest_period),
    joints: cleanArray(frontmatter.joints),
    injuryConsiderations: cleanArray(frontmatter.injury_considerations),
    contraindications: cleanArray(frontmatter.contraindications),
  };
}

function collectRelationships(
  frontmatter: ExerciseFrontmatter,
  slug: string
): RelationshipRecord[] {
  const relationships: RelationshipRecord[] = [];

  const addRelationships = (
    items: string[] | undefined,
    type: RelationshipRecord['type']
  ) => {
    if (!items) return;
    for (const item of items) {
      relationships.push({ exerciseSlug: slug, relatedSlug: item, type });
    }
  };

  addRelationships(frontmatter.variations, 'variation');
  addRelationships(frontmatter.alternatives, 'alternative');
  addRelationships(frontmatter.progressions, 'progression');
  addRelationships(frontmatter.regressions, 'regression');

  return relationships;
}

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedMuscles(stats: SeedStats): Promise<void> {
  console.log('Seeding muscles...');

  if (config.dryRun) {
    console.log(`  [DRY RUN] Would insert ${muscleData.muscles.length} muscles`);
    stats.muscles = muscleData.muscles.length;
    return;
  }

  await db.delete(schema.muscles);
  await db.insert(schema.muscles).values(muscleData.muscles as unknown as typeof schema.muscles.$inferInsert[]);
  stats.muscles = muscleData.muscles.length;
  console.log(`  ✓ Seeded ${stats.muscles} muscles`);
}

async function seedEquipment(stats: SeedStats): Promise<void> {
  console.log('Seeding equipment...');

  if (config.dryRun) {
    console.log(`  [DRY RUN] Would insert ${equipmentData.equipment.length} equipment items`);
    stats.equipment = equipmentData.equipment.length;
    return;
  }

  await db.delete(schema.equipmentItems);
  await db.insert(schema.equipmentItems).values(equipmentData.equipment as unknown as typeof schema.equipmentItems.$inferInsert[]);
  stats.equipment = equipmentData.equipment.length;
  console.log(`  ✓ Seeded ${stats.equipment} equipment items`);
}

async function seedExercises(stats: SeedStats): Promise<void> {
  console.log('Reading exercises from mo-docs...');
  console.log(`  Path: ${config.exerciseLibraryPath}`);

  // Verify path exists
  if (!fs.existsSync(config.exerciseLibraryPath)) {
    throw new Error(`Exercise library path not found: ${config.exerciseLibraryPath}`);
  }

  const files = fs.readdirSync(config.exerciseLibraryPath)
    .filter(f => f.endsWith('.md') && !f.startsWith('_'));

  console.log(`  Found ${files.length} exercise files\n`);

  const exercises: ExerciseRecord[] = [];
  const relationships: RelationshipRecord[] = [];

  // Parse all files
  for (const file of files) {
    const filePath = path.join(config.exerciseLibraryPath, file);
    const parsed = parseExerciseFile(filePath);
    if (!parsed) continue;

    const exercise = buildExerciseRecord(parsed, stats);
    if (!exercise) continue;

    exercises.push(exercise);
    relationships.push(...collectRelationships(parsed.frontmatter, parsed.slug));
  }

  console.log(`Parsed ${exercises.length} exercises with ${relationships.length} relationships\n`);

  if (config.dryRun) {
    console.log('[DRY RUN] Would perform the following:');
    console.log(`  - Delete existing exercise data`);
    console.log(`  - Insert ${exercises.length} exercises`);
    console.log(`  - Create up to ${relationships.length} relationships`);
    stats.exercises = exercises.length;
    return;
  }

  // Clear existing data
  console.log('Clearing existing exercise data...');
  await db.delete(schema.exerciseRelationships);
  await db.delete(schema.workoutSets);
  await db.delete(schema.workouts);
  await db.delete(schema.userExerciseDefaults);
  await db.delete(schema.programExercises);
  await db.delete(schema.programDays);
  await db.delete(schema.userPrograms);
  await db.delete(schema.programs);
  await db.delete(schema.exercises);
  console.log('  ✓ Cleared existing data\n');

  // Insert exercises in batches
  console.log('Inserting exercises...');
  for (let i = 0; i < exercises.length; i += config.batchSize) {
    const batch = exercises.slice(i, i + config.batchSize);
    await db.insert(schema.exercises).values(batch as unknown as typeof schema.exercises.$inferInsert[]);
    if (config.verbose) {
      console.log(`  Inserted ${Math.min(i + config.batchSize, exercises.length)}/${exercises.length}`);
    }
  }
  stats.exercises = exercises.length;
  console.log(`  ✓ Inserted ${exercises.length} exercises\n`);

  // Create slug -> id map
  const allExercises = await db.query.exercises.findMany();
  const slugToId = new Map(allExercises.map(e => [e.slug, e.id]));

  // Insert relationships
  console.log('Creating exercise relationships...');
  const validRelationships: { exerciseId: string; relatedExerciseId: string; relationshipType: string }[] = [];

  for (const rel of relationships) {
    const exerciseId = slugToId.get(rel.exerciseSlug);
    const relatedId = slugToId.get(rel.relatedSlug);

    if (exerciseId && relatedId) {
      validRelationships.push({
        exerciseId,
        relatedExerciseId: relatedId,
        relationshipType: rel.type,
      });
    } else {
      stats.relationships.failed++;
      if (stats.relationships.failedSlugs.length < 20) {
        stats.relationships.failedSlugs.push(
          `${rel.exerciseSlug} -> ${rel.relatedSlug} (${rel.type})`
        );
      }
    }
  }

  // Insert in batches
  for (let i = 0; i < validRelationships.length; i += config.batchSize) {
    const batch = validRelationships.slice(i, i + config.batchSize);
    await db.insert(schema.exerciseRelationships).values(batch as unknown as typeof schema.exerciseRelationships.$inferInsert[]);
  }

  stats.relationships.created = validRelationships.length;
  console.log(`  ✓ Created ${validRelationships.length} relationships`);

  if (stats.relationships.failed > 0) {
    console.log(`  ⚠️  ${stats.relationships.failed} relationships failed (missing exercises)`);
  }
}

// ============================================
// MAIN
// ============================================

async function main(): Promise<void> {
  console.log('🏋️ Exercise Database Seeder\n');
  console.log('═'.repeat(60) + '\n');

  if (config.dryRun) {
    console.log('🔍 DRY RUN MODE - No data will be modified\n');
  }

  const stats: SeedStats = {
    muscles: 0,
    equipment: 0,
    exercises: 0,
    relationships: { created: 0, failed: 0, failedSlugs: [] },
    unmappedPatterns: new Set(),
    unmappedDifficulties: new Set(),
  };

  try {
    await seedMuscles(stats);
    await seedEquipment(stats);
    await seedExercises(stats);

    // Print summary
    console.log('\n' + '═'.repeat(60));
    console.log('\n✅ Seeding complete!\n');
    console.log('Summary:');
    console.log(`  Muscles:       ${stats.muscles}`);
    console.log(`  Equipment:     ${stats.equipment}`);
    console.log(`  Exercises:     ${stats.exercises}`);
    console.log(`  Relationships: ${stats.relationships.created} created, ${stats.relationships.failed} failed`);

    // Show warnings
    if (stats.unmappedPatterns.size > 0) {
      console.log(`\n⚠️  Unmapped patterns (${stats.unmappedPatterns.size}):`);
      for (const pattern of Array.from(stats.unmappedPatterns).slice(0, 10)) {
        console.log(`    - "${pattern}"`);
      }
      if (stats.unmappedPatterns.size > 10) {
        console.log(`    ... and ${stats.unmappedPatterns.size - 10} more`);
      }
    }

    if (stats.unmappedDifficulties.size > 0) {
      console.log(`\n⚠️  Unmapped difficulties (${stats.unmappedDifficulties.size}):`);
      for (const diff of stats.unmappedDifficulties) {
        console.log(`    - "${diff}"`);
      }
    }

    if (stats.relationships.failedSlugs.length > 0) {
      console.log(`\n⚠️  Sample failed relationships:`);
      for (const slug of stats.relationships.failedSlugs.slice(0, 10)) {
        console.log(`    - ${slug}`);
      }
      if (stats.relationships.failed > 10) {
        console.log(`    ... and ${stats.relationships.failed - 10} more`);
      }
    }

    console.log();
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  }
}

main().then(() => process.exit(0));
