/**
 * Helper to determine whether the authenticated user has instructor status across
 * various backend and frontend response structures (auth/me memberType, access.memberType,
 * instructor object, roles, or redux user state).
 */
export function isInstructorUser(
  authData?: {
    memberType?: string;
    access?: { memberType?: string; instructor?: unknown; roles?: unknown[] };
    instructor?: unknown;
    roles?: unknown[];
    user?: { roles?: unknown[] };
  } | null,
  reduxUser?: { roles?: unknown[] } | null,
  instructorProfile?: unknown,
): boolean {
  if (authData?.memberType === 'instructor' || authData?.access?.memberType === 'instructor') {
    return true;
  }
  if (Boolean(authData?.instructor) || Boolean(authData?.access?.instructor)) {
    return true;
  }
  if (Boolean(instructorProfile)) {
    return true;
  }

  const hasInstructorRole = (roles?: unknown[]): boolean => {
    if (!Array.isArray(roles)) return false;
    return roles.some((r) => {
      if (typeof r === 'string') return r.toLowerCase() === 'instructor';
      if (r && typeof r === 'object') {
        const item = r as Record<string, unknown>;
        const val = String(item.key || item.systemKey || item.name || '').toLowerCase();
        return val === 'instructor';
      }
      return false;
    });
  };

  if (hasInstructorRole(authData?.roles)) return true;
  if (hasInstructorRole(authData?.access?.roles)) return true;
  if (hasInstructorRole(authData?.user?.roles)) return true;
  if (hasInstructorRole(reduxUser?.roles)) return true;

  return false;
}
