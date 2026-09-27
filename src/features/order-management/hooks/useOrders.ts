import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderManagementApi } from '../api/order-management.api';
import type { CreateOrderDto, ListOrdersParams, UpdateOrderStatusDto } from '../types';

export function useListOrders(params: ListOrdersParams) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => orderManagementApi.listOrders(params),
  });
}

export function useGetOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => orderManagementApi.getOrder(id),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateOrderDto) => orderManagementApi.createOrder(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      // Invalidate books since stock changed
      qc.invalidateQueries({ queryKey: ['books'] });
    },
  });
}

export function useUpdateOrderStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderStatusDto }) =>
      orderManagementApi.updateOrderStatus(id, dto),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: ['orders', id] });
      // Invalidate books since stock might have changed
      qc.invalidateQueries({ queryKey: ['books'] });
    },
  });
}
