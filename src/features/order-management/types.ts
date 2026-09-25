export type OrderStatus =
  | 'PENDING'
  | 'SHIPPED'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'FAILED'
  | 'RETURNED'
  | 'CANCELLED';

export interface OrderItem {
  bookId: string;
  title: string;
  author: string;
  coverImageUrl?: string;
  unitPrice: number;
  qty: number;
  lineTotal: number;
}

export interface Order {
  id: string;
  tenantId: string;
  orderNumber: string;
  studentId: string;
  studentName: string;
  courierPartnerId: string;
  courierPartnerName: string;
  shippingAddress: string;
  phone: string;
  items: OrderItem[];
  deliveryFee: number;
  shippingTier: 'STANDARD' | 'EXPRESS' | 'PRIORITY';
  deliveryInstructions?: string;
  trackingNumber?: string;
  status: OrderStatus;
  booksSubtotal: number;
  totalPayable: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderItemDto {
  bookId: string;
  qty: number;
}

export interface CreateOrderDto {
  studentId: string;
  studentName: string;
  courierPartnerId: string;
  courierPartnerName: string;
  shippingAddress: string;
  phone: string;
  items: CreateOrderItemDto[];
  deliveryFee: number;
  shippingTier: 'STANDARD' | 'EXPRESS' | 'PRIORITY';
  deliveryInstructions?: string;
  weight?: number;
  height?: number;
  width?: number;
  breadth?: number;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  trackingNumber?: string;
  courierPartnerId?: string;
  courierPartnerName?: string;
}

export interface ListOrdersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  createdAfter?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
