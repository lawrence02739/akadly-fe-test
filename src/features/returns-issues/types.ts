export interface StudentTicketRow {
  id: string;
  ticketNumber: string;
  type: string;
  category: string;
  issueType: string;
  priority: string;
  title: string;
  description: string;
  order: {
    orderId: string;
    orderNumber: string;
    status: string;
    deliveredAt?: string;
    trackingNumber?: string;
    courierPartnerId: string;
    courierPartnerName: string;
    shippingAddress: string;
  };
  item: {
    bookId: string;
    title: string;
    author: string;
    isbn?: string;
    coverImageUrl?: string;
    qty: number;
    unitPrice: number;
  };
  student: {
    studentId: string;
    studentCode: string;
    fullName: string;
    email: string;
    phone: string;
  };
  returnPreference: string;
  attachments: Attachment[];
  status: TicketStatus;
  isActive: boolean;
  dueAt: string;
  return: ReturnInfo;
  resolution?: Resolution;
  timeline: TimelineEntry[];
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus =
  | 'OPEN'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'RETURN_SHIPPED'
  | 'RESOLVED'
  | 'CANCELLED';

export interface Attachment {
  fileKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
}

export interface ReturnInfo {
  status: 'NONE' | 'PENDING' | 'IN_TRANSIT' | 'RECEIVED';
  courierPartnerId?: string;
  courierPartnerName?: string;
  trackingNumber?: string;
  initiatedAt?: string;
  receivedAt?: string;
}

export interface Resolution {
  type: 'REPLACED' | 'REFUNDED' | 'REJECTED';
  notes?: string;
  resolvedAt: string;
  resolvedBy: { userId: string; name: string };
}

export interface TimelineEntry {
  at: string;
  actor: { kind: string; id: string; name: string };
  action: string;
  fromStatus?: string;
  toStatus?: string;
  note?: string;
  visibility: 'PUBLIC' | 'INTERNAL';
}

export interface TicketSummary {
  openIssues: number;
  pendingReturns: number;
  resolvedThisMonth: number;
  returnRate: number;
  tabCounts: {
    all: number;
    pendingReturns: number;
    inTransitReturns: number;
    resolved: number;
  };
}

export interface PaginatedTickets {
  items: StudentTicketRow[];
  total: number;
  page: number;
  limit: number;
}
