/**
 * RBAC Access Control (BSS-5.6, AC-6)
 *
 * Implements role-based access control using Payload's native access functions.
 *
 * Roles:
 * - admin: read/write all collections
 * - editor: read/write Pages (draft status only)
 * - viewer: read published pages only
 */

import type { CMSRole, CMSUser } from '../types';

// ---------------------------------------------------------------------------
// Role hierarchy
// ---------------------------------------------------------------------------

const ROLE_HIERARCHY: Record<CMSRole, number> = {
  admin: 3,
  editor: 2,
  viewer: 1,
};

/**
 * Check if a user has at least the specified minimum role level.
 */
export function hasMinimumRole(user: CMSUser | undefined, minimumRole: CMSRole): boolean {
  if (!user) return false;
  return ROLE_HIERARCHY[user.role] >= ROLE_HIERARCHY[minimumRole];
}

// ---------------------------------------------------------------------------
// Payload access functions
// ---------------------------------------------------------------------------

interface AccessArgs {
  req: { user?: CMSUser };
}

interface AccessResult {
  [key: string]: unknown;
}

/**
 * Admin access — full read/write on all collections.
 */
export function adminAccess({ req }: AccessArgs): boolean {
  return hasMinimumRole(req.user, 'admin');
}

/**
 * Editor access for reading — can read all pages (draft and published).
 */
export function editorReadAccess({ req }: AccessArgs): boolean {
  return hasMinimumRole(req.user, 'editor');
}

/**
 * Editor access for writing — can only write pages in draft status.
 */
export function editorWriteAccess({ req }: AccessArgs): boolean | AccessResult {
  if (!req.user) return false;
  if (hasMinimumRole(req.user, 'admin')) return true;
  if (req.user.role === 'editor') {
    return { status: { equals: 'draft' } };
  }
  return false;
}

/**
 * Viewer access — can only read published pages.
 */
export function viewerAccess({ req }: AccessArgs): boolean | AccessResult {
  if (!req.user) return false;
  if (hasMinimumRole(req.user, 'admin')) return true;
  if (hasMinimumRole(req.user, 'editor')) return true;
  if (req.user.role === 'viewer') {
    return { status: { equals: 'published' } };
  }
  return false;
}

/**
 * Media access — admin and editor can upload; viewer can read.
 */
export function mediaReadAccess({ req }: AccessArgs): boolean {
  return hasMinimumRole(req.user, 'viewer');
}

export function mediaWriteAccess({ req }: AccessArgs): boolean {
  return hasMinimumRole(req.user, 'editor');
}
