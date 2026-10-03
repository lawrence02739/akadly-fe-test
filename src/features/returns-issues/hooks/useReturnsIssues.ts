import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { returnsIssuesApi } from '../api/returns-issues.api';

const KEYS = {
  all: ['student-tickets'] as const,
  summary: () => [...KEYS.all, 'summary'] as const,
  list: (params: object) => [...KEYS.all, 'list', params] as const,
  detail: (id: string) => [...KEYS.all, id] as const,
};

export function useTicketSummary() {
  return useQuery({
    queryKey: KEYS.summary(),
    queryFn: () => returnsIssuesApi.getSummary(),
    staleTime: 30_000,
  });
}

export function useTicketList(params: {
  tab?: string;
  status?: string;
  issueType?: string;
  priority?: string;
  search?: string;
  orderId?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => returnsIssuesApi.listTickets(params),
  });
}

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => returnsIssuesApi.getTicket(id),
    enabled: !!id,
  });
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => {
    void qc.invalidateQueries({ queryKey: KEYS.all });
  };
}

export function useUpdateTicketStatus() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: 'OPEN' | 'IN_PROGRESS' | 'PENDING';
    }) => returnsIssuesApi.updateStatus(id, status),
    onSuccess: invalidate,
  });
}

export function useAddTicketNote() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      note,
      visibleToStudent,
    }: {
      id: string;
      note: string;
      visibleToStudent?: boolean;
    }) => returnsIssuesApi.addNote(id, note, visibleToStudent),
    onSuccess: invalidate,
  });
}

export function useInitiateReversePickup() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { courierPartnerId?: string; trackingNumber: string; notes?: string };
    }) => returnsIssuesApi.initiateReversePickup(id, payload),
    onSuccess: invalidate,
  });
}

export function useMarkReturnReceived() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (id: string) => returnsIssuesApi.markReturnReceived(id),
    onSuccess: invalidate,
  });
}

export function useResolveTicket() {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: ({
      id,
      resolution,
      notes,
    }: {
      id: string;
      resolution: 'REPLACED' | 'REFUNDED' | 'REJECTED';
      notes?: string;
    }) => returnsIssuesApi.resolve(id, resolution, notes),
    onSuccess: invalidate,
  });
}
