import api from '../../../shared/api/axios';
import type { CreateOrderDto, ListOrdersParams, Order, PaginatedResponse, UpdateOrderStatusDto } from '../types';

export const orderManagementApi = {
  createOrder: async (dto: CreateOrderDto): Promise<Order> => {
    const res = await api.post('/orders', dto);
    return res.data.data ?? res.data;
  },

  listOrders: async (params: ListOrdersParams): Promise<PaginatedResponse<Order>> => {
    const res = await api.get('/orders', { params });
    const data = res.data;
    const items: Order[] = Array.isArray(data.data) ? data.data : (data.data?.items ?? []);
    const pagination = data.pagination;
    return {
      items,
      pagination,
      total: pagination?.total ?? items.length,
      page: pagination?.page ?? (params.page || 1),
      limit: pagination?.pageSize ?? pagination?.limit ?? (params.limit || 20),
    };
  },

  getOrder: async (id: string): Promise<Order> => {
    const res = await api.get(`/orders/${id}`);
    return res.data.data ?? res.data;
  },

  updateOrderStatus: async (id: string, dto: UpdateOrderStatusDto): Promise<Order> => {
    const res = await api.patch(`/orders/${id}/status`, dto);
    return res.data.data ?? res.data;
  },
};

