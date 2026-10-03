import axios from "axios";
import { API_BASE_URL } from "../../../shared/api/config";

export interface AdminProfile {
  id: string;
  email: string;
  displayName: string;
  isSuperAdmin: boolean;
  permissions: string[];
  roleIds: string[];
}

export interface AdminAcademyAdmin {
  userId: string;
  name: string;
  email: string;
  roleIds: string[];
  status: "active" | "invited" | "suspended" | "disabled";
  joinedAt: string;
}

export interface AdminTenant {
  id: string;
  name: string;
  slug: string;
  status: "active" | "suspended" | "archived";
  plan: string;
  planId: string | null;
  /** Optional until tenant subscription details are added to the admin API. */
  subscription?: AdminSubscription | null;
  billingDate: string | null;
  dueDate: string | null;
  paymentStatus: "due" | "paid" | "unpaid";
  paymentProofs: PaymentProof[];
  organizationCompliance: {
    organizationTypeCode?: string;
    organizationType?: {
      code: string;
      name: string;
      version: number;
      requiredDocuments: {
        documentTypeCode: string;
        isMandatory: boolean;
        order: number;
      }[];
    };
    gstin: string | null;
    pincode: string | null;
    documents: {
      documentTypeCode: string;
      fileName: string | null;
      fileUrl: string | null;
      status: string;
      rejectionReason: string | null;
      submittedAt: string | null;
    }[];
  };
  ownerInvitationStatus: "pending" | "accepted" | "revoked";
  owner: { name: string; email: string };
  ownerUserId: string | null;
  members: Array<{
    userId: string;
    type: "owner" | "user";
    status: "active" | "pending" | "invited" | "suspended" | "disabled";
    joinedAt: string;
  }>;
  usage?: {
    members: number;
    courses: number;
    students: number | null;
    contentBytes: number | null;
  };
  teamMembers?: Array<{
    userId: string;
    name: string;
    email: string;
    roleIds: string[];
    status: "active" | "invited" | "suspended" | "disabled";
    joinedAt: string;
  }>;
  settings: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export type TenantDocumentConfig = {
  type: string;
  name: string;
  enabled: boolean;
  docs: Array<{
    code: string;
    name: string;
    enabled: boolean;
    required: boolean;
    fileType: "PDF" | "PNG" | "JPG";
  }>;
};
interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}
interface Envelope<T> {
  data: T;
  message: string;
  meta?: { pagination?: Pagination };
}
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface AdminFeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: "submitted" | "under_review" | "planned" | "in_progress" | "released" | "declined";
  plannedRelease: string | null;
  adminNote: string | null;
  upvoteCount: number;
  commentCount: number;
  comments: Array<{ id: string; body: string; authorType: "tenant" | "admin"; createdAt: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTicket {
  id: string;
  _id?: string;
  ticketNumber: string;
  tenantId: string;
  raisedByUserId: string;
  title: string;
  description: string;
  referenceUrl?: string | null;
  tags?: string[];
  module: string;
  category: string;
  issueType: string;
  priority: "low" | "medium" | "high" | "critical" | "urgent";
  status:
    | "open"
    | "assigned"
    | "in_progress"
    | "waiting_for_user"
    | "pending"
    | "escalated"
    | "resolved"
    | "closed";
  assignedAdminUserId: string | null;
  assignedAt: string | null;
  acknowledgedAt?: string | null;
  acknowledgedByAdminUserId?: string | null;
  firstResponseDueAt?: string | null;
  firstRespondedAt?: string | null;
  resolutionDueAt?: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  closedReason?: string | null;
  escalatedAt?: string | null;
  escalationNote?: string | null;
  resolutionNote: string | null;
  resolutionEmailStatus: "pending" | "sent" | "failed";
  resolutionEmailSentAt: string | null;
  resolutionEmailError: string | null;
  satisfactionRating?: number | null;
  satisfactionComment?: string | null;
  satisfactionSubmittedAt?: string | null;
  attachments?: Array<{
    fileName: string;
    fileUrl: string;
    mimeType: string;
    sizeBytes: number;
  }>;
  activityHistory: Array<{
    type: string;
    actorType: string;
    message: string | null;
    createdAt: string;
  }>;
  requesterProfile?: {
    name: string;
    email: string | null;
    memberStatus: string | null;
    joinedAt: string | null;
    organizationName: string | null;
    organizationType: string | null;
    courseTitle: string | null;
    courseLanguage: string | null;
    cohort: string | null;
  };
  tenantPlan?: {
    tenantName: string | null;
    tenantStatus: string | null;
    paymentStatus: string | null;
    plan: {
      name: string;
      code: string | null;
      interval: "monthly" | "yearly" | null;
      allowedModules: string[];
      limits: {
        users: number | null;
        students: number | null;
        courses: number | null;
        contentBytes: number | null;
      };
    } | null;
    usage: {
      users: number;
      courses: number;
      students: null;
      contentBytes: null;
    };
  };
  relatedTickets?: Array<{
    _id: string;
    ticketNumber: string;
    title: string;
    status: AdminTicket["status"];
    priority: AdminTicket["priority"];
    updatedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
export interface AdminTicketDashboard {
  total: number;
  statuses: Record<string, number>;
  priorities: Record<string, number>;
  daily: Array<{ _id: string; total: number; resolved: number }>;
  categories: Array<{ _id: string; total: number; open: number }>;
  myQueue: AdminTicket[];
  metrics: {
    open: number;
    active: number;
    pendingResponse: number;
    resolvedThisWeek: number;
    escalated: number;
    unassigned: number;
    assignedToMe: number;
    overdue: number;
    averageFirstResponseMinutes: number | null;
    satisfaction: {
      resolvedTickets: number;
      ratedTickets: number;
      averageRating: number | null;
      distribution: Record<1 | 2 | 3 | 4 | 5, number>;
    };
  };
}
export interface TicketAssignee {
  id: string;
  _id?: string;
  displayName: string;
  email: string;
  isSuperAdmin: boolean;
}
export interface TicketAttachment {
  fileName: string;
  fileUrl: string;
  fileKey?: string;
  mimeType: string;
  sizeBytes: number;
}
export interface TicketMessage {
  id: string;
  _id?: string;
  ticketId: string;
  authorUserId: string | null;
  authorType: "tenant" | "admin" | "system";
  messageType: "reply" | "internal_note" | "system";
  body: string;
  isInternal: boolean;
  attachments?: TicketAttachment[];
  createdAt: string;
}
export interface TenantQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}
export interface PaymentProof {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt?: string;
}
export interface TenantPayload {
  fullName: string;
  email: string;
  organizationName: string;
  organizationAddress: string;
  description?: string;
  planId?: string;
  billingDate: string;
  dueDate: string;
  paymentStatus?: "due" | "paid" | "unpaid";
  paymentProofs?: PaymentProof[];
}
export interface TenantUpdate {
  name?: string;
  ownerName?: string;
  plan?: string;
  planId?: string | null;
  billingDate?: string | null;
  dueDate?: string | null;
  paymentStatus?: "due" | "paid" | "unpaid";
  paymentProofs?: PaymentProof[];
  settings?: Record<string, unknown>;
}
export interface AdminSubscription {
  id: string;
  name: string;
  code: string;
  description: string;
  price: number;
  currency: "INR" | "USD";
  interval: "monthly" | "yearly";
  status: "active" | "inactive";
  isPopular: boolean;
  allowedModules: string[];
  userLimit: number | null;
  studentLimit: number | null;
  contentLimit: number | null;
  courseLimit: number | null;
  createdAt: string;
  updatedAt: string;
}
export interface AdminPlanModule {
  key: string;
  group: string;
  label: string;
  description: string;
  permissions: string[];
}
export type SubscriptionPayload = Omit<
  AdminSubscription,
  "id" | "createdAt" | "updatedAt"
>;
export interface SubscriptionQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: AdminSubscription["status"];
  interval?: AdminSubscription["interval"];
  sortBy?: "name" | "createdAt" | "updatedAt" | "price";
  sortOrder?: "asc" | "desc";
}
export interface AdminAccessRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AdminTeam {
  id: string;
  name: string;
  code: string;
  description: string;
  status: "active" | "inactive";
  memberCount?: number;
  createdAt: string;
  updatedAt: string;
}
export interface AdminTeamMember {
  id: string;
  userId: string;
  displayName: string;
  email: string;
  roleIds: Array<string | AdminAccessRole>;
  status: "active" | "suspended" | "disabled";
  createdAt: string;
}
export interface AdminTenantInvitation {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  status: "pending" | "revoked";
  expiresAt: string | null;
  createdAt: string;
}
export interface AdminTeamInvitationPreview {
  name: string;
  email: string;
  roleName: string;
}
export interface TeamManagementQuery {
  page: number;
  pageSize: number;
  search?: string;
  status?: string;
  teamId?: string;
  roleId?: string;
}
const withId = <T>(item: T): T => {
  if (typeof item !== "object" || item === null) return item;
  const record = item as T & {
    id?: string;
    _id?: { toString(): string } | string;
  };
  return record.id || !record._id
    ? item
    : ({ ...record, id: String(record._id) } as T);
};
const pageResult = <T>(
  data: Envelope<T[]>,
  params: { page: number; pageSize: number },
) => ({
  items: data.data.map(withId),
  pagination: data.meta?.pagination ?? {
    page: params.page,
    pageSize: params.pageSize,
    total: data.data.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
});

const TOKEN_KEY = "akadly_admin_session";
let tokens: Tokens | null = null;
try {
  const stored = sessionStorage.getItem(TOKEN_KEY);
  tokens = stored ? (JSON.parse(stored) as Tokens) : null;
} catch {
  sessionStorage.removeItem(TOKEN_KEY);
}

export const hasAdminSession = () => Boolean(tokens?.refreshToken);
export const clearAdminSession = () => {
  tokens = null;
  sessionStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new Event("admin-session-ended"));
};
const saveTokens = (next: Tokens) => {
  tokens = next;
  sessionStorage.setItem(TOKEN_KEY, JSON.stringify(next));
};

const baseURL = `${API_BASE_URL.replace(/\/v1$/, "")}/admin`;
const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});
let refreshing: Promise<void> | null = null;
client.interceptors.request.use((config) => {
  if (tokens?.accessToken)
    config.headers.Authorization = `Bearer ${tokens.accessToken}`;
  return config;
});
client.interceptors.response.use(undefined, async (error) => {
  const original = error.config;
  if (
    error.response?.status !== 401 ||
    !original ||
    original._retried ||
    !tokens?.refreshToken ||
    /\/auth\/(login|refresh)/.test(original.url || "")
  ) {
    return Promise.reject(error);
  }
  original._retried = true;
  try {
    refreshing ??= axios
      .post<Envelope<Tokens>>(`${baseURL}/auth/refresh`, {
        refreshToken: tokens.refreshToken,
      })
      .then(({ data }) => {
        saveTokens(data.data);
      })
      .finally(() => {
        refreshing = null;
      });
    await refreshing;
    original.headers.Authorization = `Bearer ${tokens?.accessToken}`;
    return client(original);
  } catch (refreshError) {
    clearAdminSession();
    return Promise.reject(refreshError);
  }
});

export const adminApi = {
  async featureRequests(params: Record<string, string | undefined> = {}) {
    const { data } = await client.get<Envelope<AdminFeatureRequest[]>>("/feature-requests", { params });
    return data.data;
  },
  async featureRequest(id: string) {
    const { data } = await client.get<Envelope<AdminFeatureRequest>>(`/feature-requests/${encodeURIComponent(id)}`);
    return data.data;
  },
  async updateFeatureRequest(id: string, payload: Partial<Pick<AdminFeatureRequest, "status" | "category" | "plannedRelease" | "adminNote">> & { notifyAudience?: boolean }) {
    const { data } = await client.patch<Envelope<AdminFeatureRequest>>(`/feature-requests/${encodeURIComponent(id)}`, payload);
    return data.data;
  },
  async addFeatureRequestComment(id: string, body: string) {
    const { data } = await client.post<Envelope<AdminFeatureRequest>>(`/feature-requests/${encodeURIComponent(id)}/comments`, { body });
    return data.data;
  },
  async featureRequestCategories() {
    const { data } = await client.get<Envelope<Array<{ id: string; slug: string; name: string; color: string; enabled: boolean; order: number }>>>("/feature-requests/categories");
    return data.data;
  },
  async featureRequestCategoryStats() {
    const { data } = await client.get<Envelope<Array<{ id: string; slug: string; name: string; color: string; enabled: boolean; order: number; count: number }>>>("/feature-requests/category-stats");
    return data.data;
  },
  async createFeatureRequestCategory(payload: { name: string; slug: string; color?: string; order?: number }) {
    const { data } = await client.post<Envelope<unknown>>("/feature-requests/categories", payload);
    return data.data;
  },
  async updateFeatureRequestCategory(id: string, payload: { name?: string; color?: string; enabled?: boolean; order?: number }) {
    const { data } = await client.patch<Envelope<unknown>>(`/feature-requests/categories/${id}`, payload);
    return data.data;
  },
  async deleteFeatureRequestCategory(id: string) { await client.delete(`/feature-requests/categories/${id}`); },
  async mergeFeatureRequest(id: string, targetId: string) {
    const { data } = await client.post<Envelope<AdminFeatureRequest>>(`/feature-requests/${id}/merge`, { targetId });
    return data.data;
  },
  async featureRequestDemand(id: string) {
    const { data } = await client.get<Envelope<{ totalWorkspaces: number; workspaces: Array<{ id: string; name: string }> }>>(`/feature-requests/${id}/demand`);
    return data.data;
  },
  async deleteFeatureRequest(id: string, reason?: string) { await client.delete(`/feature-requests/${id}`, { data: { reason } }); },
  async login(email: string, password: string) {
    const { data } = await client.post<Envelope<Tokens>>("/auth/login", {
      email,
      password,
    });
    saveTokens(data.data);
  },
  async profile() {
    const { data } = await client.get<Envelope<AdminProfile>>("/auth/me");
    return data.data;
  },
  async ticketDashboard() {
    const { data } =
      await client.get<Envelope<AdminTicketDashboard>>("/tickets/dashboard");
    return data.data;
  },
  async logout() {
    const refreshToken = tokens?.refreshToken;
    try {
      if (refreshToken) await client.post("/auth/logout", { refreshToken });
    } finally {
      clearAdminSession();
    }
  },
  async tenants(params: TenantQuery) {
    const { data } = await client.get<Envelope<AdminTenant[]>>("/tenants", {
      params,
    });
    return {
      items: data.data,
      pagination: data.meta?.pagination ?? {
        page: params.page,
        pageSize: params.pageSize,
        total: data.data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },
  async tenant(id: string) {
    const { data } = await client.get<Envelope<AdminTenant>>(
      `/tenants/${encodeURIComponent(id)}`,
    );
    return data.data;
  },
  async academyAdmins(id: string) {
    const { data } = await client.get<Envelope<{ items: AdminAcademyAdmin[]; total: number }>>(`/tenants/${encodeURIComponent(id)}/academy-admins`);
    return data.data;
  },
  async tenantDocumentConfig() {
    const { data } = await client.get<
      Envelope<{ configs: TenantDocumentConfig[] }>
    >("/tenants/document-config");
    return data.data.configs;
  },
  async saveTenantDocumentConfig(configs: TenantDocumentConfig[]) {
    const { data } = await client.patch<
      Envelope<{ configs: TenantDocumentConfig[] }>
    >("/tenants/document-config", { configs });
    return data.data.configs;
  },
  async createTenant(payload: TenantPayload) {
    const { data } = await client.post<Envelope<AdminTenant>>(
      "/tenants",
      payload,
    );
    return data.data;
  },
  async uploadTenantPaymentProof(file: File): Promise<PaymentProof> {
    const { data } = await client.post<
      Envelope<PaymentProof & { uploadUrl: string }>
    >("/tenants/payment-proofs/presign", {
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });
    const upload = data.data;
    const response = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok)
      throw new Error("Payment proof could not be uploaded to storage");
    return {
      fileName: upload.fileName,
      fileUrl: upload.fileUrl,
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
    };
  },
  async updateTenant(id: string, payload: TenantUpdate) {
    const { data } = await client.patch<Envelope<AdminTenant>>(
      `/tenants/${encodeURIComponent(id)}`,
      payload,
    );
    return data.data;
  },
  async reviewOrganizationDocument(
    id: string,
    documentTypeCode: string,
    status: "APPROVED" | "REJECTED",
    rejectionReason?: string,
  ) {
    const { data } = await client.patch<Envelope<AdminTenant>>(
      "/tenants/" +
        encodeURIComponent(id) +
        "/organization-documents/" +
        encodeURIComponent(documentTypeCode) +
        "/review",
      { status, rejectionReason },
    );
    return data.data;
  },
  async setTenantStatus(id: string, action: "activate" | "suspend") {
    const { data } = await client.post<Envelope<AdminTenant>>(
      `/tenants/${encodeURIComponent(id)}/${action}`,
    );
    return data.data;
  },
  async revokeTenantOwnerInvitation(id: string) {
    await client.delete(`/tenants/${encodeURIComponent(id)}/owner-invitation`);
  },
  async subscriptions(params: SubscriptionQuery) {
    const { data } = await client.get<Envelope<AdminSubscription[]>>(
      "/subscriptions",
      { params },
    );
    return {
      items: data.data,
      pagination: data.meta?.pagination ?? {
        page: params.page,
        pageSize: params.pageSize,
        total: data.data.length,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    };
  },
  async subscription(id: string) {
    const { data } = await client.get<Envelope<AdminSubscription>>(
      `/subscriptions/${encodeURIComponent(id)}`,
    );
    return data.data;
  },
  async subscriptionModules() {
    const { data } = await client.get<Envelope<AdminPlanModule[]>>(
      "/subscriptions/modules",
    );
    return data.data;
  },
  async createSubscription(payload: SubscriptionPayload) {
    const { data } = await client.post<Envelope<AdminSubscription>>(
      "/subscriptions",
      payload,
    );
    return data.data;
  },
  async updateSubscription(id: string, payload: SubscriptionPayload) {
    const { data } = await client.patch<Envelope<AdminSubscription>>(
      `/subscriptions/${encodeURIComponent(id)}`,
      payload,
    );
    return data.data;
  },
  async deleteSubscription(id: string) {
    const { data } = await client.delete<Envelope<AdminSubscription>>(
      `/subscriptions/${encodeURIComponent(id)}`,
    );
    return data.data;
  },
  async setSubscriptionStatus(id: string, status: AdminSubscription["status"]) {
    const { data } = await client.post<Envelope<AdminSubscription>>(
      `/subscriptions/${encodeURIComponent(id)}/${status === "active" ? "activate" : "deactivate"}`,
    );
    return data.data;
  },
  async teamPermissions() {
    const { data } = await client.get<
      Envelope<{ permissions: unknown[]; all: string[] }>
    >("/team-management/permissions");
    return data.data;
  },
  async accessRoles(params: TeamManagementQuery) {
    const { data } = await client.get<Envelope<AdminAccessRole[]>>(
      "/team-management/roles",
      { params },
    );
    return pageResult(data, params);
  },
  async accessRole(id: string) {
    const { data } = await client.get<Envelope<AdminAccessRole>>(
      `/team-management/roles/${id}`,
    );
    return data.data;
  },
  async createAccessRole(payload: {
    name: string;
    description?: string;
    permissions: string[];
  }) {
    const { data } = await client.post<Envelope<AdminAccessRole>>(
      "/team-management/roles",
      payload,
    );
    return data.data;
  },
  async updateAccessRole(
    id: string,
    payload: { name?: string; description?: string; permissions?: string[] },
  ) {
    const { data } = await client.patch<Envelope<AdminAccessRole>>(
      `/team-management/roles/${id}`,
      payload,
    );
    return data.data;
  },
  async deleteAccessRole(id: string) {
    await client.delete(`/team-management/roles/${id}`);
  },
  async teams(params: TeamManagementQuery) {
    const { data } = await client.get<Envelope<AdminTeam[]>>(
      "/team-management/teams",
      { params },
    );
    return pageResult(data, params);
  },
  async team(id: string) {
    const { data } = await client.get<Envelope<AdminTeam>>(
      `/team-management/teams/${id}`,
    );
    return data.data;
  },
  async createTeam(payload: {
    name: string;
    code: string;
    description?: string;
    status?: AdminTeam["status"];
  }) {
    const { data } = await client.post<Envelope<AdminTeam>>(
      "/team-management/teams",
      payload,
    );
    return data.data;
  },
  async updateTeam(
    id: string,
    payload: Partial<{
      name: string;
      code: string;
      description: string;
      status: AdminTeam["status"];
    }>,
  ) {
    const { data } = await client.patch<Envelope<AdminTeam>>(
      `/team-management/teams/${id}`,
      payload,
    );
    return data.data;
  },
  async deleteTeam(id: string) {
    await client.delete(`/team-management/teams/${id}`);
  },
  async teamMembers(params: TeamManagementQuery) {
    const { data } = await client.get<Envelope<AdminTeamMember[]>>(
      "/team-management/members",
      { params },
    );
    return pageResult(data, params);
  },
  async teamMember(id: string) {
    const { data } = await client.get<Envelope<AdminTeamMember>>(
      `/team-management/members/${id}`,
    );
    return data.data;
  },
  async updateTeamMember(
    id: string,
    payload: Partial<{
      roleId: string;
      status: "active" | "suspended" | "disabled";
    }>,
  ) {
    const { data } = await client.patch<Envelope<AdminTeamMember>>(
      `/team-management/members/${id}`,
      payload,
    );
    return data.data;
  },
  async deleteTeamMember(id: string) {
    await client.delete(`/team-management/members/${id}`);
  },
  async invitations(params: TeamManagementQuery) {
    const { data } = await client.get<Envelope<AdminTenantInvitation[]>>(
      "/team-management/invitations",
      { params },
    );
    return pageResult(data, params);
  },
  async createInvitation(payload: {
    name: string;
    email: string;
    roleId: string;
  }) {
    const { data } = await client.post<Envelope<AdminTenantInvitation>>(
      "/team-management/invitations",
      payload,
    );
    return data.data;
  },
  async updateInvitation() {
    throw new Error(
      "Admin invitation roles are assigned before invitation delivery.",
    );
  },
  async resendInvitation(id: string) {
    const { data } = await client.post<Envelope<AdminTenantInvitation>>(
      `/team-management/invitations/${id}/resend`,
    );
    return data.data;
  },
  async revokeInvitation(id: string) {
    await client.delete(`/team-management/invitations/${id}`);
  },
  async previewTeamInvitation(token: string) {
    const { data } = await client.post<Envelope<AdminTeamInvitationPreview>>(
      "/team-management/invitations/preview",
      { token },
    );
    return data.data;
  },
  async acceptTeamInvitation(
    token: string,
    password: string,
    confirmPassword: string,
  ) {
    const { data } = await client.post<
      Envelope<{ accepted: boolean; adminUserId: string }>
    >("/team-management/invitations/accept", {
      token,
      password,
      confirmPassword,
    });
    return data.data;
  },
  async tickets(params: {
    page: number;
    pageSize: number;
    search?: string;
    status?: string;
    priority?: string;
    assignedToMe?: boolean;
  }) {
    const { data } = await client.get<Envelope<AdminTicket[]>>("/tickets", {
      params,
    });
    return pageResult(data, params);
  },
  async ticket(id: string) {
    const { data } = await client.get<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}`,
    );
    return withId(data.data);
  },
  async ticketAssignees() {
    const { data } =
      await client.get<Envelope<TicketAssignee[]>>("/tickets/assignees");
    return data.data.map(withId);
  },
  async assignTicket(id: string, adminUserId: string) {
    const { data } = await client.patch<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/assign`,
      { adminUserId },
    );
    return withId(data.data);
  },
  async acknowledgeTicket(id: string) {
    const { data } = await client.post<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/acknowledge`,
    );
    return withId(data.data);
  },
  async updateTicketStatus(id: string, status: AdminTicket["status"]) {
    const { data } = await client.patch<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/status`,
      { status },
    );
    return withId(data.data);
  },
  async updateTicketDetails(
    id: string,
    payload: {
      category?: string;
      priority?: AdminTicket["priority"];
      issueType?: string;
      firstResponseDueAt?: string;
      resolutionDueAt?: string;
      tags?: string[];
    },
  ) {
    const { data } = await client.patch<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/details`,
      payload,
    );
    return withId(data.data);
  },
  async escalateTicket(id: string, note: string) {
    const { data } = await client.post<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/escalate`,
      { note },
    );
    return withId(data.data);
  },
  async resolveTicket(
    id: string,
    payload: { resolutionNote: string; sendResolutionEmail: boolean },
  ) {
    const { data } = await client.post<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/resolve`,
      payload,
    );
    return withId(data.data);
  },
  async reopenTicket(id: string) {
    const { data } = await client.post<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/reopen`,
    );
    return withId(data.data);
  },
  async closeTicket(id: string, reason: string) {
    const { data } = await client.post<Envelope<AdminTicket>>(
      `/tickets/${encodeURIComponent(id)}/close`,
      { reason },
    );
    return withId(data.data);
  },
  async ticketMessages(id: string, params = { page: 1, pageSize: 50 }) {
    const { data } = await client.get<Envelope<TicketMessage[]>>(
      `/tickets/${encodeURIComponent(id)}/messages`,
      { params },
    );
    return pageResult(data, params);
  },
  async uploadTicketAttachment(file: File) {
    const { data } = await client.post<
      Envelope<{ uploadUrl: string; fileUrl: string; fileKey: string }>
    >("/tickets/uploads/presign", {
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    });
    const upload = data.data;
    const response = await fetch(upload.uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!response.ok) throw new Error("File could not be uploaded to storage");
    return {
      fileName: file.name,
      fileUrl: upload.fileUrl,
      fileKey: upload.fileKey,
      mimeType: file.type,
      sizeBytes: file.size,
    };
  },
  async addTicketMessage(
    id: string,
    payload: {
      body: string;
      isInternal: boolean;
      attachments?: TicketAttachment[];
    },
  ) {
    const { data } = await client.post<Envelope<TicketMessage>>(
      `/tickets/${encodeURIComponent(id)}/messages`,
      payload,
    );
    return withId(data.data);
  },
};

export const adminError = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    const details: unknown = error.response?.data?.error?.details;
    if (Array.isArray(details)) {
      const messages = details
        .map((detail) =>
          detail && typeof detail.message === "string" ? detail.message : null,
        )
        .filter((message): message is string => Boolean(message));
      if (messages.length) return messages.join(" ");
    }
    const message = error.response?.data?.message;
    return Array.isArray(message)
      ? message.join(", ")
      : typeof message === "string"
        ? message
        : "Request failed. Please try again.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
};
