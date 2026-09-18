export type MemberStatus = "ACTIVE" | "INVITED" | "SUSPENDED";

export interface TeamRole {
  id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  memberCount: number;
  isSystem?: boolean;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  roleId: string;
  status: MemberStatus;
  joinedAt: string;
  lastActive: string;
}

export interface TeamInvitation {
  id: string;
  name: string;
  email: string;
  roleId: string;
  permissions?: string[];
  status: "PENDING" | "ACCEPTED" | "EXPIRED" | "REVOKED";
  sentAt: string;
  expiresAt: string;
}

export interface PermissionGroup {
  resource: string;
  label: string;
  description: string;
  permissions: Array<{ key: string; label: string; description: string }>;
}
