import type {
  PermissionGroup,
  TeamInvitation,
  TeamMember,
  TeamRole,
} from "../types";

export const permissionGroups: PermissionGroup[] = [
  {
    resource: "course",
    label: "Courses",
    description: "Course catalogue and publishing access",
    permissions: [
      {
        key: "course:read",
        label: "View courses",
        description: "See course details and catalogue.",
      },
      {
        key: "course:manage",
        label: "Manage courses",
        description: "Create, edit, publish, and archive courses.",
      },
      {
        key: "curriculum:manage",
        label: "Manage curriculum",
        description: "Build modules, lessons, quizzes, and files.",
      },
    ],
  },
  {
    resource: "member",
    label: "Users & access",
    description: "Workspace users, invitations, and roles",
    permissions: [
      {
        key: "member:read",
        label: "View users",
        description: "See members, status, and assigned roles.",
      },
      {
        key: "member:manage",
        label: "Manage users",
        description: "Invite, update, suspend, or remove users.",
      },
      {
        key: "role:manage",
        label: "Manage roles",
        description: "Create roles and change their permissions.",
      },
    ],
  },
  {
    resource: "account",
    label: "Workspace",
    description: "Workspace configuration and reporting",
    permissions: [
      {
        key: "account:manage",
        label: "Manage account",
        description: "Update workspace identity and billing details.",
      },
      {
        key: "settings:manage",
        label: "Manage settings",
        description: "Change workspace-wide configuration.",
      },
    ],
  },
  {
    resource: "conversation",
    label: "Communication",
    description: "Messages and learner conversations",
    permissions: [
      {
        key: "conversation:read",
        label: "View conversations",
        description: "Read learner conversations.",
      },
      {
        key: "conversation:write",
        label: "Reply to conversations",
        description: "Send replies and internal notes.",
      },
      {
        key: "conversation:assign",
        label: "Assign conversations",
        description: "Route conversations to other users.",
      },
    ],
  },
];

export const initialRoles: TeamRole[] = [
  {
    id: "role-owner",
    name: "Owner",
    key: "owner",
    description: "Full workspace access. This role cannot be restricted.",
    permissions: ["*"],
    memberCount: 1,
    isSystem: true,
  },
  {
    id: "role-admin",
    name: "Administrator",
    key: "administrator",
    description: "Manages courses, users, roles, and workspace settings.",
    permissions: permissionGroups.flatMap((group) =>
      group.permissions.map((item) => item.key),
    ),
    memberCount: 2,
  },
  {
    id: "role-instructor",
    name: "Instructor",
    key: "instructor",
    description: "Creates courses and manages learning content.",
    permissions: [
      "course:read",
      "course:manage",
      "curriculum:manage",
      "member:read",
    ],
    memberCount: 8,
  },
  {
    id: "role-support",
    name: "Learner Support",
    key: "learner-support",
    description: "Supports learners and handles conversations.",
    permissions: [
      "course:read",
      "member:read",
      "conversation:read",
      "conversation:write",
    ],
    memberCount: 4,
  },
];

export const initialMembers: TeamMember[] = [
  {
    id: "member-1",
    name: "Aarav Sharma",
    email: "aarav@akadly.com",
    roleId: "role-owner",
    status: "ACTIVE",
    joinedAt: "12 Jan 2026",
    lastActive: "Online now",
  },
  {
    id: "member-2",
    name: "Meera Kapoor",
    email: "meera@akadly.com",
    roleId: "role-admin",
    status: "ACTIVE",
    joinedAt: "04 Feb 2026",
    lastActive: "12 minutes ago",
  },
  {
    id: "member-3",
    name: "Rohan Verma",
    email: "rohan@akadly.com",
    roleId: "role-instructor",
    status: "ACTIVE",
    joinedAt: "18 Mar 2026",
    lastActive: "Yesterday",
  },
  {
    id: "member-4",
    name: "Nisha Patel",
    email: "nisha@akadly.com",
    roleId: "role-instructor",
    status: "ACTIVE",
    joinedAt: "02 Apr 2026",
    lastActive: "3 days ago",
  },
  {
    id: "member-5",
    name: "Kabir Singh",
    email: "kabir@akadly.com",
    roleId: "role-support",
    status: "SUSPENDED",
    joinedAt: "24 Apr 2026",
    lastActive: "21 Aug 2026",
  },
];

export const initialInvitations: TeamInvitation[] = [
  {
    id: "invite-1",
    name: "Ananya Rao",
    email: "ananya@example.com",
    roleId: "role-instructor",
    status: "PENDING",
    sentAt: "16 Sep 2026",
    expiresAt: "23 Sep 2026",
  },
  {
    id: "invite-2",
    name: "Dev Malhotra",
    email: "dev@example.com",
    roleId: "role-support",
    status: "PENDING",
    sentAt: "14 Sep 2026",
    expiresAt: "21 Sep 2026",
  },
  {
    id: "invite-3",
    name: "Sara Khan",
    email: "sara@example.com",
    roleId: "role-admin",
    status: "ACCEPTED",
    sentAt: "02 Sep 2026",
    expiresAt: "09 Sep 2026",
  },
];
