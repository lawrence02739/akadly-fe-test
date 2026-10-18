export type UserStatus = 'active' | 'invited' | 'suspended';

export interface UserRole {
  id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  memberCount: number;
  isSystem?: boolean;
}

export interface UserItem {
  id: string;
  userId: string;
  name: string;
  email: string;
  isOwner: boolean;
  type: 'user' | 'instructor';
  instructorId?: string;
  roleIds: string[];
  roleNames: string[];
  status: UserStatus;
  joinedAt: string;
  invitationExpiresAt?: string | null;
  invitationExpired?: boolean;
  deliveryStatus?: 'sent' | 'failed';
  lastActiveAt?: string | null;
}

export interface PermissionGroup {
  resource: string;
  label: string;
  description: string;
  permissions: Array<{ key: string; label: string; description: string }>;
}

export type { ApiUser, AssignedRole, PaginatedResponse, ListUsersQuery } from './api/users.api';
