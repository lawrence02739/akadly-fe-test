import { studentApi } from './student-api.client';

export interface StudentOrder {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  deliveredAt?: string;
  courierPartnerName: string;
  trackingNumber?: string;
  shippingAddress: string;
  items: Array<{
    bookId: string;
    title: string;
    author: string;
    coverImageUrl?: string;
    unitPrice: number;
    qty: number;
    lineTotal: number;
  }>;
  booksSubtotal: number;
  deliveryFee: number;
  totalPayable: number;
  openIssueCount: number;
  issueEligibility: {
    eligible: boolean;
    eligibleUntil?: string;
    reason?: string;
  };
}

export interface StudentOrderDetail extends StudentOrder {
  deliveryInstructions?: string;
  issues: Array<{
    id: string;
    ticketNumber: string;
    status: string;
    issueType: string;
    itemTitle: string;
  }>;
}

export interface StudentTicketAttachment {
  fileKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  url?: string;
}

export interface StudentIssue {
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
    trackingNumber?: string;
    courierPartnerName: string;
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
    fullName: string;
    email: string;
  };
  returnPreference: string;
  attachments: StudentTicketAttachment[];
  status: string;
  isActive: boolean;
  return: {
    status: string;
    trackingNumber?: string;
  };
  resolution?: {
    type: string;
    notes?: string;
    resolvedAt: string;
  };
  timeline: Array<{
    at: string;
    actor: { kind: string; name: string };
    action: string;
    note?: string;
    visibility: 'PUBLIC' | 'INTERNAL';
  }>;
  createdAt: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export interface PresignResponse {
  uploadUrl: string;
  fileKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface CreateIssueDto {
  orderId: string;
  bookId: string;
  category: string;
  issueType: string;
  priority: string;
  title: string;
  description: string;
  returnPreference: string;
  attachments?: Array<{
    fileKey: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
  }>;
}

function unwrap<T>(res: { data: { data?: T } | T }): T {
  const d = res.data as { data?: T };
  return d.data ?? (res.data as T);
}

export const studentPortalApi = {
  // Orders
  listMyOrders: async (params: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<StudentOrder>> => {
    const res = await studentApi.get('/student/orders', { params });
    return unwrap(res);
  },

  getMyOrder: async (id: string): Promise<StudentOrderDetail> => {
    const res = await studentApi.get(`/student/orders/${id}`);
    return unwrap(res);
  },

  // Issues
  presignAttachment: async (input: {
    fileName: string;
    contentType: string;
    sizeBytes: number;
  }): Promise<PresignResponse> => {
    const res = await studentApi.post(
      '/student/issues/uploads/presign',
      input,
    );
    return unwrap(res);
  },

  createIssue: async (dto: CreateIssueDto): Promise<StudentIssue> => {
    const res = await studentApi.post('/student/issues', dto);
    return unwrap(res);
  },

  listMyIssues: async (params: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponse<StudentIssue>> => {
    const res = await studentApi.get('/student/issues', { params });
    return unwrap(res);
  },

  getMyIssue: async (id: string): Promise<StudentIssue> => {
    const res = await studentApi.get(`/student/issues/${id}`);
    return unwrap(res);
  },

  cancelIssue: async (id: string): Promise<StudentIssue> => {
    const res = await studentApi.patch(`/student/issues/${id}/cancel`);
    return unwrap(res);
  },
};
