import api from '../../../shared/api/axios';
import type {
  CourierPartner,
  CourierPartnerOption,
  CreateCourierPartnerDto,
  ListCourierPartnersParams,
  PaginatedCourierPartnersResponse,
  UpdateCourierPartnerDto,
} from '../types';

export const listCourierPartners = async (
  params: ListCourierPartnersParams = {},
): Promise<PaginatedCourierPartnersResponse> => {
  const { data } = await api.get('/courier-partners', { params });
  return data.data ?? data;
};

export const listCourierPartnerOptions = async (search?: string): Promise<CourierPartnerOption[]> => {
  const { data } = await api.get('/courier-partners/options', { params: search ? { search } : {} });
  return data.data ?? data;
};

export const listCourierPartnerPerformance = async (status?: string): Promise<CourierPartner[]> => {
  const { data } = await api.get('/courier-partners/performance', { params: status ? { status } : {} });
  return data.data ?? data;
};

export const getCourierPartner = async (id: string): Promise<CourierPartner> => {
  const { data } = await api.get(`/courier-partners/${id}`);
  return data.data ?? data;
};

export const createCourierPartner = async (dto: CreateCourierPartnerDto): Promise<CourierPartner> => {
  const { data } = await api.post('/courier-partners', dto);
  return data.data ?? data;
};

export const updateCourierPartner = async (
  id: string,
  dto: UpdateCourierPartnerDto,
): Promise<CourierPartner> => {
  const { data } = await api.patch(`/courier-partners/${id}`, dto);
  return data.data ?? data;
};

export const deleteCourierPartner = async (id: string): Promise<void> => {
  await api.delete(`/courier-partners/${id}`);
};
