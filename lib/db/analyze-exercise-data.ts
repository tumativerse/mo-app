import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'yaml';

const EXERCISE_LIBRARY_PATH = process.env.MO_DOCS_PATH
  ? path.join(process.env.MO_DOCS_PATH, 'docs/apply/training/exercise-library')
  : path.resolve(__dirname, '../../../mo-docs/docs/apply/training/exercise-library');

interface FieldAnalysis {
  field: string;
  totalFiles: number;
  filesWithValue: number;
  uniqueValues: Map<string, number>;
  sampleValues: string[];
}

function parseExerciseFile(filePath: string): Record<string, unknown> | null {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const match = content.match(/^---\n([\s\S]*?)\n---/);
    if (!match) return null;
    return yaml.parse(match[1]);
  } catch {
    return null;
  }
}

function analyzeField(
  exercises: Record<string, unknown>[],
  fieldPath: string,
  isArray: boolean = false
): FieldAnalysis {
  const uniqueValues = new Map<string, number>();
  let filesWithValue = 0;

  for (const ex of exercises) {
    // Handle nested fields like "typical_rep_ranges.strength"
    const parts = fieldPath.split('.');
    let value: unknown = ex;
    for (const part of parts) {
      value = (value as Record<string, unknown>)?.[part];
    }

    if (value !== undefined && value !== null) {
      filesWithValue++;

      if (isArray && Array.isArray(value)) {
        for (const v of value) {
          const str = String(v).toLowerCase().trim();
          uniqueValues.set(str, (uniqueValues.get(str) || 0) + 1);
        }
      } else {
        const str = String(value).toLowerCase().trim();
        uniqueValues.set(str, (uniqueValues.get(str) || 0) + 1);
      }
    }
  }

  // Sort by frequency
  const sorted = Array.from(uniqueValues.entries()).sort((a, b) => b[1] - a[1]);

  return {
    field: fieldPath,
    totalFiles: exercises.length,
    filesWithValue,
    uniqueValues,
    sampleValues: sorted.slice(0, 20).map(([v, c]) => `${v} (${c})`),
  };
}

async function main() {
  console.log('📊 Exercise Data Analysis - Raw Values\n');
  console.log('═'.repeat(70) + '\n');

  // Read all files
  const files = fs
    .readdirSync(EXERCISE_LIBRARY_PATH)
    .filter((f) => f.endsWith('.md') && !f.startsWith('_'));

  console.log(`Analyzing ${files.length} exercise files...\n`);

  const exercises: Record<string, unknown>[] = [];
  for (const file of files) {
    const filePath = path.join(EXERCISE_LIBRARY_PATH, file);
    const data = parseExerciseFile(filePath);
    if (data) {
      exercises.push({ ...data, _filename: file });
    }
  }

  // Define fields to analyze
  const fieldsToAnalyze: { field: string; isArray: boolean }[] = [
    // Categorization
    { field: 'patterns', isArray: true },
    { field: 'movement_type', isArray: false },

    // Muscles
    { field: 'primary_muscles', isArray: true },
    { field: 'secondary_muscles', isArray: true },
    { field: 'stabilizers', isArray: true },

    // Equipment
    { field: 'equipment', isArray: true },

    // Setup
    { field: 'body_position', isArray: true },
    { field: 'grip', isArray: true },
    { field: 'grip_width', isArray: true },
    { field: 'stance', isArray: true },

    // Movement characteristics
    { field: 'force_type', isArray: false },
    { field: 'plane', isArray: true },
    { field: 'chain', isArray: false },
    { field: 'kinetic_chain', isArray: false },
    { field: 'bilateral', isArray: false },

    // Classification
    { field: 'exercise_type', isArray: true },
    { field: 'difficulty', isArray: false },
    { field: 'priority', isArray: false },

    // Programming
    { field: 'typical_rep_ranges.strength', isArray: false },
    { field: 'typical_rep_ranges.hypertrophy', isArray: false },
    { field: 'typical_rep_ranges.endurance', isArray: false },
    { field: 'typical_sets', isArray: false },
    { field: 'rest_period', isArray: false },

    // Anatomy
    { field: 'joints', isArray: true },

    // Safety
    { field: 'injury_considerations', isArray: true },
    { field: 'contraindications', isArray: true },
  ];

  // Analyze each field
  for (const { field, isArray } of fieldsToAnalyze) {
    const analysis = analyzeField(exercises, field, isArray);

    console.log('─'.repeat(70));
    console.log(`\n📌 ${field.toUpperCase()}`);
    console.log(
      `   Files with value: ${analysis.filesWithValue}/${analysis.totalFiles} (${((analysis.filesWithValue / analysis.totalFiles) * 100).toFixed(1)}%)`
    );
    console.log(`   Unique values: ${analysis.uniqueValues.size}`);
    console.log('\n   Top values:');

    for (const val of analysis.sampleValues) {
      console.log(`     • ${val}`);
    }

    // Show remaining if more than 20
    if (analysis.uniqueValues.size > 20) {
      console.log(`     ... and ${analysis.uniqueValues.size - 20} more`);
    }
    console.log();
  }

  // Analyze filename patterns
  console.log('─'.repeat(70));
  console.log('\n📌 FILENAME PATTERNS\n');

  const filenameParts = new Map<string, number>();
  for (const file of files) {
    const slug = file.replace('.md', '');
    const parts = slug.split('-');
    for (const part of parts) {
      if (part.length > 2 && !/^\d+$/.test(part)) {
        filenameParts.set(part, (filenameParts.get(part) || 0) + 1);
      }
    }
  }

  const topParts = Array.from(filenameParts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30);

  console.log('   Most common filename components:');
  for (const [part, count] of topParts) {
    console.log(`     • ${part}: ${count}`);
  }

  // Show files without patterns
  console.log('\n─'.repeat(70));
  console.log('\n⚠️  FILES WITHOUT PATTERNS\n');

  const filesWithoutPatterns = exercises
    .filter((ex) => !ex.patterns || ex.patterns.length === 0)
    .map((ex) => ex._filename);

  console.log(`   ${filesWithoutPatterns.length} files without patterns:`);
  for (const file of filesWithoutPatterns.slice(0, 20)) {
    console.log(`     • ${file}`);
  }
  if (filesWithoutPatterns.length > 20) {
    console.log(`     ... and ${filesWithoutPatterns.length - 20} more`);
  }

  console.log('\n' + '═'.repeat(70));
  console.log('\n✅ Analysis complete!\n');
}

main();
