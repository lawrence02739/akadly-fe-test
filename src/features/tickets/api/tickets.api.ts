import api from "../../../shared/api/axios";
import { adminError } from "../../admin/api/admin.api";

export type TicketStatus =
  | "open"
  | "assigned"
  | "in_progress"
  | "waiting_for_user"
  | "pending"
  | "escalated"
  | "resolved"
  | "closed";
export type TicketPriority = "low" | "medium" | "high" | "critical" | "urgent";
export type TicketModule = "courses" | "forms" | "payments" | "account";
export type TicketCategory =
  | "course_access"
  | "login"
  | "technical"
  | "certificate"
  | "payment"
  | "content"
  | "whatsapp_integration"
  | "other";

export interface TicketActivity {
  type: string;
  actorType: "tenant" | "admin" | "system";
  message: string | null;
  previousValue: string | null;
  newValue: string | null;
  createdAt: string;
}
export interface TicketAttachment {
  fileName: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
}
export interface TenantPlanContext {
  tenantName: string | null;
  tenantStatus: string | null;
  paymentStatus: string | null;
  plan: {
    name: string;
    code: string | null;
    interval: "monthly" | "yearly" | null;
    allowedModules: string[];
    limits: { users: number | null; students: number | null; courses: number | null; contentBytes: number | null };
  } | null;
  usage: { users: number; courses: number; students: null; contentBytes: null };
}
export interface TicketRecord {
  id: string;
  _id?: string;
  ticketNumber: string;
  tenantId: string;
  raisedByUserId: string;
  title: string;
  description: string;
  referenceUrl?: string | null;
  tags?: string[];
  module: TicketModule;
  category: TicketCategory;
  issueType: string;
  relatedEntityType?: string | null;
  relatedEntityId?: string | null;
  attachments?: TicketAttachment[];
  priority: TicketPriority;
  status: TicketStatus;
  assignedAdminUserId: string | null;
  assignedAdminName?: string | null;
  assignedAt: string | null;
  firstResponseDueAt?: string | null;
  resolutionDueAt?: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  resolutionNote: string | null;
  resolutionEmailStatus: "pending" | "sent" | "failed";
  resolutionEmailSentAt: string | null;
  resolutionEmailError: string | null;
  tenantPlan?: TenantPlanContext;
  satisfactionRating?: number | null;
  satisfactionComment?: string | null;
  satisfactionSubmittedAt?: string | null;
  activityHistory: TicketActivity[];
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
}
export interface TenantTicketDashboard {
  total: number;
  statuses: Partial<Record<TicketStatus, number>>;
  priorities: Partial<Record<TicketPriority, number>>;
  metrics: {
    active: number;
    waitingForYou: number;
    inProgress: number;
    resolved: number;
  };
  recentTickets: TicketRecord[];
}
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}
interface Envelope<T> {
  data: T;
  meta?: { pagination?: Pagination };
}
const asId = <T extends { _id?: unknown; id?: string }>(
  item: T,
): T & { id: string } => ({ ...item, id: item.id ?? String(item._id) });
const paged = <T extends { _id?: unknown; id?: string }>(
  response: Envelope<T[]>,
  fallback: { page: number; pageSize: number },
) => ({
  items: response.data.map(asId),
  pagination: response.meta?.pagination ?? {
    ...fallback,
    total: response.data.length,
    totalPages: 1,
    hasNext: false,
    hasPrev: false,
  },
});

export const ticketsApi = {
  async dashboard() {
    const { data } = await api.get<Envelope<TenantTicketDashboard>>(
      "/tickets/dashboard",
    );
    return {
      ...data.data,
      recentTickets: data.data.recentTickets.map(asId),
    };
  },
  async context() {
    const { data } = await api.get<Envelope<TenantPlanContext>>("/tickets/context");
    return data.data;
  },
  async list(params: Record<string, unknown>) {
    const { data } = await api.get<Envelope<TicketRecord[]>>("/tickets", {
      params,
    });
    return paged(data, {
      page: Number(params.page ?? 1),
      pageSize: Number(params.pageSize ?? 20),
    });
  },
  async get(id: string) {
    const { data } = await api.get<Envelope<TicketRecord>>(
      `/tickets/${encodeURIComponent(id)}`,
    );
    return asId(data.data);
  },
  async create(payload: {
    title: string;
    description: string;
    module: TicketModule;
    category: TicketCategory;
    issueType: string;
    priority: TicketPriority;
    relatedEntityType?: string;
    referenceUrl?: string;
    attachments?: TicketAttachment[];
  }) {
    const { data } = await api.post<Envelope<TicketRecord>>(
      "/tickets",
      payload,
    );
    return asId(data.data);
  },
  async presignAttachment(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<Envelope<TicketAttachment>>(
      "/tickets/uploads",
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    );
    return data.data;
  },
  async update(
    id: string,
    payload: Partial<
      Pick<TicketRecord, "title" | "description" | "priority" | "tags">
      | Pick<
          TicketRecord,
          | "module"
          | "category"
          | "issueType"
          | "relatedEntityType"
          | "referenceUrl"
          | "attachments"
        >
    >,
  ) {
    const { data } = await api.patch<Envelope<TicketRecord>>(
      `/tickets/${encodeURIComponent(id)}`,
      payload,
    );
    return asId(data.data);
  },
  async close(id: string) {
    const { data } = await api.delete<Envelope<TicketRecord>>(
      `/tickets/${encodeURIComponent(id)}`,
    );
    return asId(data.data);
  },
  async rate(id: string, payload: { rating: number; comment?: string }) {
    const { data } = await api.post<Envelope<TicketRecord>>(
      `/tickets/${encodeURIComponent(id)}/rating`,
      payload,
    );
    return asId(data.data);
  },
  async reopen(id: string) {
    const { data } = await api.post<Envelope<TicketRecord>>(
      `/tickets/${encodeURIComponent(id)}/reopen`,
    );
    return asId(data.data);
  },
  async messages(id: string, params = { page: 1, pageSize: 50 }) {
    const { data } = await api.get<Envelope<TicketMessage[]>>(
      `/tickets/${encodeURIComponent(id)}/messages`,
      { params },
    );
    return paged(data, params);
  },
  async reply(id: string, body: string) {
    const { data } = await api.post<Envelope<TicketMessage>>(
      `/tickets/${encodeURIComponent(id)}/messages`,
      { body },
    );
    return asId(data.data);
  },
};

export { adminError };
