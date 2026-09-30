import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createCourierPartner,
  deleteCourierPartner,
  getCourierPartner,
  listCourierPartnerOptions,
  listCourierPartnerPerformance,
  listCourierPartners,
  updateCourierPartner,
} from '../api/courier-partners.api';
import type {
  CreateCourierPartnerDto,
  ListCourierPartnersParams,
  UpdateCourierPartnerDto,
} from '../types';

export const COURIER_PARTNERS_KEY = 'courier-partners';

export const useListCourierPartners = (params: ListCourierPartnersParams = {}) =>
  useQuery({
    queryKey: [COURIER_PARTNERS_KEY, params],
    queryFn: () => listCourierPartners(params),
  });

export const useListCourierPartnerOptions = (search?: string) =>
  useQuery({
    queryKey: [COURIER_PARTNERS_KEY, 'options', search],
    queryFn: () => listCourierPartnerOptions(search),
  });

export const useListCourierPartnerPerformance = (status?: string) =>
  useQuery({
    queryKey: [COURIER_PARTNERS_KEY, 'performance', status],
    queryFn: () => listCourierPartnerPerformance(status),
  });

export const useGetCourierPartner = (id?: string) =>
  useQuery({
    queryKey: [COURIER_PARTNERS_KEY, id],
    queryFn: () => getCourierPartner(id!),
    enabled: !!id,
  });

export const useCreateCourierPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateCourierPartnerDto) => createCourierPartner(dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COURIER_PARTNERS_KEY] }),
  });
};

export const useUpdateCourierPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateCourierPartnerDto }) =>
      updateCourierPartner(id, dto),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COURIER_PARTNERS_KEY] }),
  });
};

export const useDeleteCourierPartner = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCourierPartner(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: [COURIER_PARTNERS_KEY] }),
  });
};
