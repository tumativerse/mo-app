/**
 * MoIdentity - "I know who you are"
 * Part of MO:SELF
 *
 * The identity vertical handles user authentication and profile:
 * - MoAuth: Authentication and user management
 * - MoProfile: User profile data
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

// MoProfile - "Your Foundation"
export {
  getProfile,
  getProfileByClerkId,
  updateProfile,
  calculateAge,
  type UserProfile,
  type UpdateProfileInput,
} from './profile';
