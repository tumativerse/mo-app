/**
 * Main database seed script
 *
 * This script seeds the core data needed for the Mo workout system.
 *
 * Run with: npm run db:seed
 *
 * IMPORTANT: The exercises seed must be run separately:
 *   MO_DOCS_PATH=/path/to/mo-docs npx tsx lib/db/seed-exercises.ts
 *
 * Seed order:
 * 1. PPL Template (this file) - Creates program structure
 * 2. Exercises (seed-exercises.ts) - Imports exercise library from mo-docs
 * 3. Warmup exercises (seed-warmup-exercises.ts) - Optional warmup data
 */

// Run the PPL template seeder
import './seed-ppl-template';
