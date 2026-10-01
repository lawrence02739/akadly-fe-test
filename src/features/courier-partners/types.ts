export interface CourierPartner {
  id: string;
  tenantId: string;
  name: string;
  code: string;
  status: 'ACTIVE' | 'INACTIVE';
  standardRate: number;
  expressRate?: number;
  priorityRate?: number;
  avgDeliveryDays: number;
  maxPayloadWeightKg?: number;
  country: string;
  hubs: string[];
  accountManagerName?: string;
  accountManagerPhone?: string;
  rating?: number;
  isDeleted: boolean;
  createdAt?: string;
  updatedAt?: string;
  // Derived stats
  totalShipments?: number;
  delivered?: number;
  failed?: number;
  successRate?: number;
  costPerShipment?: number;
  avgDays?: number;
}

export interface CourierPartnerOption {
  id: string;
  name: string;
  code: string;
  standardRate: number;
  expressRate?: number;
  priorityRate?: number;
  avgDeliveryDays: number;
}

export interface CreateCourierPartnerDto {
  name: string;
  code: string;
  status?: 'ACTIVE' | 'INACTIVE';
  standardRate: number;
  expressRate?: number;
  priorityRate?: number;
  avgDeliveryDays: number;
  maxPayloadWeightKg?: number;
  country?: string;
  hubs?: string[];
  accountManagerName?: string;
  accountManagerPhone?: string;
  rating?: number;
}

export type UpdateCourierPartnerDto = Partial<CreateCourierPartnerDto>;

export interface ListCourierPartnersParams {
  search?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  page?: number;
  limit?: number;
}

export interface PaginatedCourierPartnersResponse {
  items: CourierPartner[];
  total: number;
  page: number;
  limit: number;
}
