import api from '../../../shared/api/axios';
import type {
  PaginatedTickets,
  StudentTicketRow,
  TicketSummary,
} from '../types';

function unwrap<T>(res: { data: { data?: T } | T }): T {
  const d = res.data as { data?: T };
  return d.data ?? (res.data as T);
}

export const returnsIssuesApi = {
  getSummary: async (): Promise<TicketSummary> => {
    const res = await api.get('/student-tickets/summary');
    return unwrap(res);
  },

  listTickets: async (params: {
    tab?: string;
    status?: string;
    issueType?: string;
    priority?: string;
    search?: string;
    orderId?: string;
    page?: number;
    limit?: number;
  }): Promise<PaginatedTickets> => {
    const res = await api.get('/student-tickets', { params });
    return unwrap(res);
  },

  getTicket: async (id: string): Promise<StudentTicketRow> => {
    const res = await api.get(`/student-tickets/${id}`);
    return unwrap(res);
  },

  updateStatus: async (
    id: string,
    status: 'OPEN' | 'IN_PROGRESS' | 'PENDING',
  ): Promise<StudentTicketRow> => {
    const res = await api.patch(`/student-tickets/${id}/status`, { status });
    return unwrap(res);
  },

  addNote: async (
    id: string,
    note: string,
    visibleToStudent = false,
  ): Promise<StudentTicketRow> => {
    const res = await api.post(`/student-tickets/${id}/notes`, {
      note,
      visibleToStudent,
    });
    return unwrap(res);
  },

  initiateReversePickup: async (
    id: string,
    payload: { courierPartnerId?: string; trackingNumber: string; notes?: string },
  ): Promise<StudentTicketRow> => {
    const res = await api.post(
      `/student-tickets/${id}/reverse-pickup`,
      payload,
    );
    return unwrap(res);
  },

  markReturnReceived: async (id: string): Promise<StudentTicketRow> => {
    const res = await api.post(`/student-tickets/${id}/return-received`);
    return unwrap(res);
  },

  resolve: async (
    id: string,
    resolution: 'REPLACED' | 'REFUNDED' | 'REJECTED',
    notes?: string,
  ): Promise<StudentTicketRow> => {
    const res = await api.post(`/student-tickets/${id}/resolve`, {
      resolution,
      notes,
    });
    return unwrap(res);
  },
};
