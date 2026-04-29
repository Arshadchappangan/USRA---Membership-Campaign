
/*

 * Small helper that returns whether the currently logged-in user
 * is allowed to EDIT a given member's profile.
 *
 * Rules:
 *  - Admin  → can edit anyone
 *  - Member → can only edit their own profile (matched by _id)
 *  - Guest  → cannot edit anyone

 */


import { useAuth } from "../context/AuthContext";

export function useCanEdit(memberId) {
  const { user, isAdmin } = useAuth();
  if (!user) return false;
  if (isAdmin) return true;
  return user._id === memberId || user.memberId === memberId;
}

