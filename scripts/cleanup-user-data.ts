/**
 * Clean up all user-related data from database
 * Run this to start fresh with new Clerk app
 */

import { db } from '../lib/db';
import {
  users,
  userPreferences,
  streaks,
  personalRecords,
  workoutSessions,
  sessionExercises,
  sessionSets,
  weightEntries
} from '../lib/db/schema';

async function cleanupUserData() {
  console.log('🧹 Starting database cleanup...\n');

  try {
    // Delete in correct order (due to foreign keys)
    
    console.log('Deleting session sets...');
    await db.delete(sessionSets);
    
    console.log('Deleting session exercises...');
    await db.delete(sessionExercises);
    
    console.log('Deleting workout sessions...');
    await db.delete(workoutSessions);
    
    console.log('Deleting weight entries...');
    await db.delete(weightEntries);
    
    console.log('Deleting personal records...');
    await db.delete(personalRecords);
    
    console.log('Deleting user streaks...');
    await db.delete(streaks);
    
    console.log('Deleting user preferences...');
    await db.delete(userPreferences);
    
    console.log('Deleting users...');
    await db.delete(users);

    console.log('\n✅ Database cleanup complete!');
    console.log('All user data has been removed.');
    console.log('\nYou can now sign up with your new Clerk account.');
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    throw error;
  }
}

cleanupUserData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
