/**
 * MoIdentity - "I know who you are"
 * Part of MO:SELF
 *
 * The identity vertical handles user authentication and profile:
 * - MoAuth: Authentication and user management
 * - MoProfile: User profile data (future)
 * - MoGoals: User training goals (future)
 */

// MoAuth - "The Gatekeeper"
export {
  auth,
  currentUser,
  getOrCreateUser,
  getUserByClerkId,
  requireAuth,
  getCurrentUser,
} from './auth';
