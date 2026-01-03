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
  // Handle race condition: webhook might create user while we're checking
  try {
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
  } catch (error: unknown) {
    // If duplicate key error (webhook created user while we were checking)
    // Check multiple possible error structures
    const dbError = error as {
      code?: string;
      constraint?: string;
      cause?: { code?: string; constraint?: string; detail?: string };
      detail?: string;
    };

    const errorCode = dbError?.code || dbError?.cause?.code;
    const errorConstraint = dbError?.constraint || dbError?.cause?.constraint;
    const errorDetail = dbError?.detail || dbError?.cause?.detail;

    // Check if this is a duplicate key error
    const isDuplicateError =
      errorCode === '23505' ||
      errorDetail?.includes('already exists') ||
      errorDetail?.includes('duplicate key');

    const isUserConstraint =
      errorConstraint === 'users_clerk_id_unique' ||
      errorConstraint === 'users_email_unique' ||
      errorDetail?.includes('clerk_id') ||
      errorDetail?.includes('email');

    if (isDuplicateError && isUserConstraint) {
      // If email constraint was violated, query by email and update clerkId
      // This handles the case where user deleted Clerk account and re-registered with same email
      if (errorConstraint === 'users_email_unique' || errorDetail?.includes('email')) {
        const existingEmail = clerkUser.emailAddresses[0]?.emailAddress;
        if (existingEmail) {
          const existingUser = await db.query.users.findFirst({
            where: eq(users.email, existingEmail),
          });

          if (existingUser) {
            // Update clerkId to match current Clerk session (Clerk is source of truth)
            const [updatedUser] = await db
              .update(users)
              .set({ clerkId: userId, updatedAt: new Date() })
              .where(eq(users.id, existingUser.id))
              .returning();

            return updatedUser;
          }
        }
      }

      // Otherwise query by clerkId (handles clerk_id constraint violation)
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, userId),
      });

      if (user) {
        return user;
      }
    }

    // Re-throw any other error
    console.error('Rethrowing error:', error);
    throw error;
  }
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

/**
 * Check if current user has completed onboarding
 * Returns true if onboarding is completed, false if not
 * Returns null if user is not authenticated
 */
export async function hasCompletedOnboarding(): Promise<boolean | null> {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return user.onboardingCompleted ?? false;
}
