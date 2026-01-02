/**
 * Auto-confirm schema push
 * This script pushes schema changes with automatic confirmation
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function pushSchema() {
  console.log('🔄 Pushing schema changes to database...\n');

  try {
    // Use drizzle-kit push with --force flag (if available) or programmatic approach
    const { stdout, stderr } = await execAsync('npx drizzle-kit push --force', {
      cwd: process.cwd(),
      env: process.env,
    });

    console.log(stdout);
    if (stderr) console.error(stderr);

    console.log('\n✅ Schema pushed successfully!');
  } catch (error: unknown) {
    // If --force doesn't work, try regular push
    console.log('⚠️  --force flag not supported, trying alternative method...\n');
    console.log('Please confirm the schema changes manually in the terminal.');
    console.log('Or, run this in your terminal:');
    console.log('\n  npm run db:push\n');
    console.log('And select "Yes, I want to execute all statements"\n');
    console.log(`Error: ${error instanceof Error ? error.message : String(error)}`);
  }
}

pushSchema();
