/**
 * MoAuth - "The Gatekeeper"
 * Part of MO:SELF / MoIdentity
 *
 * "I know who you are"
 *
 * Handles authentication, user creation, and identity management
 * using Clerk as the auth provider.
 */

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// Re-export Clerk auth functions
export { auth, currentUser };

/**
 * Get or create user in database from Clerk auth
 */
export async function getOrCreateUser() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  // Check if user exists in our database
  const existingUser = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
  });

  if (existingUser) {
    // If email is missing, sync from Clerk
    if (!existingUser.email) {
      const clerkUser = await currentUser();
      if (clerkUser?.emailAddresses[0]?.emailAddress) {
        const [updatedUser] = await db
          .update(users)
          .set({
            email: clerkUser.emailAddresses[0].emailAddress,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existingUser.id))
          .returning();
        return updatedUser;
      }
    }
    return existingUser;
  }

  // Get user details from Clerk
  const clerkUser = await currentUser();

  if (!clerkUser) {
    return null;
  }

  // Create user in our database
  const [newUser] = await db
    .insert(users)
    .values({
      clerkId: userId,
      email: clerkUser.emailAddresses[0]?.emailAddress ?? '',
      // Note: fullName and other encrypted fields are set later via profile completion
      // where they'll be properly encrypted
    })
    .returning();

  return newUser;
}

/**
 * Get user by Clerk ID
 */
export async function getUserByClerkId(clerkId: string) {
  return db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
}

/**
 * Check if user is authenticated
 */
export async function requireAuth() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error('Unauthorized');
  }

  return userId;
}

/**
 * Get current user with full database record
 */
export async function getCurrentUser() {
  const user = await getOrCreateUser();

  if (!user) {
    return null;
  }

  return user;
}
