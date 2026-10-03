import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import { studentPortalApi, type CreateIssueDto } from '../api/student-portal.api';

// ── Orders ────────────────────────────────────────────────────────────────────

export function useMyOrders(params: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['student', 'orders', params],
    queryFn: () => studentPortalApi.listMyOrders(params),
  });
}

export function useMyOrder(id: string) {
  return useQuery({
    queryKey: ['student', 'orders', id],
    queryFn: () => studentPortalApi.getMyOrder(id),
    enabled: !!id,
  });
}

// ── Issues ────────────────────────────────────────────────────────────────────

export function useMyIssues(params: {
  status?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['student', 'issues', params],
    queryFn: () => studentPortalApi.listMyIssues(params),
  });
}

export function useMyIssue(id: string) {
  return useQuery({
    queryKey: ['student', 'issues', id],
    queryFn: () => studentPortalApi.getMyIssue(id),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateIssueDto) => studentPortalApi.createIssue(dto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['student', 'issues'] });
      void qc.invalidateQueries({ queryKey: ['student', 'orders'] });
    },
  });
}

export function useCancelIssue() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentPortalApi.cancelIssue(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['student', 'issues'] });
    },
  });
}
