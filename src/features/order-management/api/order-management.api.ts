import api from '../../../shared/api/axios';
import type { CreateOrderDto, ListOrdersParams, Order, PaginatedResponse, UpdateOrderStatusDto } from '../types';

export const orderManagementApi = {
  createOrder: async (dto: CreateOrderDto): Promise<Order> => {
    const res = await api.post('/orders', dto);
    return res.data.data ?? res.data;
  },

  listOrders: async (params: ListOrdersParams): Promise<PaginatedResponse<Order>> => {
    const res = await api.get('/orders', { params });
    return res.data.data ?? res.data;
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

